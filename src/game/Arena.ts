import { ViewManager } from "./ViewManager";
import type { BulletPath } from "./BulletPath";
import { Canvas } from "./Canvas";
import type { Entity } from "./Entity";
import { RandomPolygon } from "./RandomPolygon";
import { Player } from "./Player";
import { Wall } from "./Wall";
import { Vector2 } from "./primitives/Vector2";
import { loadSound, playSound } from "./sound";
import { clamp } from "./utils";
import { Enemy } from "./Enemy";
import type { Blood } from "./Blood";
import { View } from "./View";
import { WelcomeView } from "./WelcomeView";

// 1920 x 1920
interface ArenaConfig {
  width: number;
  height: number;
  layout: string;
}

const waves = [
  { enemies: 5 },
  { enemies: 10 },
  { enemies: 15 },
  { enemies: 20 },
  { enemies: 25 },
  { enemies: 30 },
  { enemies: 35 },
  { enemies: 40 },
  { enemies: 45 },
  { enemies: 50 },
];

const defaultConfig: ArenaConfig = {
  width: 1920,
  height: 1920,
  layout: `
##################   ###################
#                 e e e                #
#                                      #
#                  p                   #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                      ###             #
#             #                        #
#              ##       ##             #
#                                      #
#                                      #
#                                      #
#                                      #
#                 ###                  #
#              ##      ##              #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
#                                      #
##################   ###################
`,
};

export class Arena extends View {
  width: number;
  height: number;
  size: Vector2;
  entities: Entity[] = [];
  enemies: Enemy[] = [];
  bulletPaths: BulletPath[] = [];
  bloodStains: Blood[] = [];
  player!: Player;
  floorNoisePolygons: RandomPolygon[] = [];
  gridSize: number = 48;
  layout: string[] = defaultConfig.layout.trim().split("\n");
  soundNames = [
    "weapon-pistol-fire",
    "player-scream-1",
    "player-scream-2",
  ] as const;
  sounds: Record<string, AudioBuffer> = {};
  score: number = 0;
  requestAnimationFrameId: number;
  listenersAbortController = new AbortController();
  paused = false;

  maxFPS = 60;
  lastFrameTimeMs = 0;
  delta = 0;
  timestep = 1000 / this.maxFPS;

  constructor(
    viewManager: ViewManager,
    canvas: Canvas,
    width: number,
    height: number,
  ) {
    super(viewManager, canvas);
    this.width = width;
    this.height = height;
    this.size = new Vector2(width, height);
    this.parseLayout();
    this.loadSounds();
    this.canvas = canvas;
    this.useArenaCoordsMapper();
    for (let i = 0; i < 100; i++) {
      this.floorNoisePolygons.push(new RandomPolygon(width, height));
    }
    this.requestAnimationFrameId = requestAnimationFrame(this.repaint);

    this.canvas.canvas.addEventListener(
      "click",
      () => {
        if (this.player.hp > 0) return;
        // play button
        const playText = "Retry";
        let fontWeight = "normal";
        this.canvas.ctx.font = `${fontWeight} 40px Arial`;
        const { width: playWidth } = this.canvas.ctx.measureText(playText);
        if (
          this.canvas.mouseX > this.canvas.width / 2 - playWidth / 2 &&
          this.canvas.mouseX < this.canvas.width / 2 + playWidth / 2 &&
          this.canvas.mouseY > 400 &&
          this.canvas.mouseY < 460
        ) {
          this.viewManager.view = new Arena(
            this.viewManager,
            canvas,
            1920,
            1920,
          );
        }

        // retry button
        const mainMenuText = "Main menu";
        this.canvas.ctx.font = `normal 40px Arial`;
        const { width: mainMenuWidth } = this.canvas.ctx.measureText(playText);
        if (
          this.canvas.mouseX > this.canvas.width / 2 - mainMenuWidth / 2 &&
          this.canvas.mouseX < this.canvas.width / 2 + mainMenuWidth / 2 &&
          this.canvas.mouseY > 460 &&
          this.canvas.mouseY < 520
        ) {
          this.viewManager.view = new WelcomeView(this.viewManager, canvas);
        }
      },
      { signal: this.listenersAbortController.signal },
    );

    this.canvas.canvas.addEventListener(
      "keydown",
      (e) => {
        if (
          !e.repeat &&
          (e.key === "p" || e.key === "P") &&
          this.player.hp > 0
        ) {
          this.paused = !this.paused;
        }
      },
      { signal: this.listenersAbortController.signal },
    );
  }
  destroy() {
    cancelAnimationFrame(this.requestAnimationFrameId);
    this.canvas.canvas.style.cursor = "auto";
    this.listenersAbortController.abort();
  }
  useArenaCoordsMapper() {
    this.canvas.coordsMapper = this.mapToCanvas.bind(this);
  }
  useDefaultCoordsMapper() {
    this.canvas.useDefaultCoordsMapper();
  }
  async loadSounds() {
    const fetchedSounds = await Promise.all(
      this.soundNames.map(
        async (soundName) => await loadSound(`/sounds/${soundName}.mp3`),
      ),
    );
    for (let i = 0; i < this.soundNames.length; i++) {
      this.sounds[this.soundNames[i]] = fetchedSounds[i];
    }
  }
  playSound(soundName: (typeof this.soundNames)[number]) {
    playSound(this.sounds[soundName]);
  }
  repaint = (timestamp: DOMHighResTimeStamp = 0) => {
    // if (this.player.hp <= 0) return;

    if (timestamp < this.lastFrameTimeMs + 1000 / this.maxFPS) {
      this.requestAnimationFrameId = requestAnimationFrame(this.repaint);
      return;
    }
    if (!this.paused) {
      this.delta += timestamp - this.lastFrameTimeMs;
      this.lastFrameTimeMs = timestamp;

      let numUpdateSteps = 0;
      while (this.delta >= this.timestep) {
        this.update(this.timestep);
        this.delta -= this.timestep;
        if (++numUpdateSteps >= 5) {
          this.delta = 0;
          break;
        }
      }
    }
    this.draw();

    this.requestAnimationFrameId = requestAnimationFrame(this.repaint);
  };
  parseLayout() {
    for (let y = 0; y < this.layout.length; y++) {
      const line = this.layout[y];
      for (let x = 0; x < line.length; x++) {
        const char = line[x];
        if (char === "#") {
          this.addEntity(
            new Wall(
              x * this.gridSize,
              y * this.gridSize,
              this.gridSize,
              this.gridSize,
            ),
          );
        }
        if (char === "p") {
          this.player = new Player(
            this,
            x * this.gridSize,
            y * this.gridSize,
            this.gridSize,
          );
        }
        if (char === "e") {
          this.enemies.push(
            new Enemy(
              this,
              x * this.gridSize,
              y * this.gridSize,
              this.gridSize,
            ),
          );
        }
      }
    }
  }
  addEntity(entity: Entity) {
    this.entities.push(entity);
  }
  addBulletPath(bulletPath: BulletPath) {
    this.bulletPaths.push(bulletPath);
  }
  mapToCanvas = (x: number, y: number): [number, number] => {
    let viewportX = this.player.x - (this.canvas.width - this.player.size) / 2;
    let viewportY = this.player.y - (this.canvas.height - this.player.size) / 2;
    viewportX = clamp(viewportX, 0, this.width - this.canvas.width);
    viewportY = clamp(viewportY, 0, this.height - this.canvas.height);
    let canvasX = x - viewportX;
    let canvasY = y - viewportY;
    return [canvasX, canvasY];
  };
  update(delta: number) {
    this.player.update(delta);
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0) {
        this.enemies.splice(this.enemies.indexOf(enemy), 1);
        this.score += 200;
        continue;
      }
      enemy.update(delta);
    }
    if (this.enemies.length === 0) {
      // respawn enemies
      for (let i = 0; i < 5; i++) {
        this.enemies.push(
          new Enemy(
            this,
            Math.random() * this.width,
            Math.random() * this.height,
            this.gridSize,
          ),
        );
      }
    }
    for (const bulletPath of this.bulletPaths) {
      if (bulletPath.hasExpired()) {
        this.bulletPaths.splice(this.bulletPaths.indexOf(bulletPath), 1);
        continue;
      }
    }
  }
  draw() {
    this.canvas.clear();
    this.useArenaCoordsMapper();
    for (const polygon of this.floorNoisePolygons) polygon.draw(this.canvas);
    for (const blood of this.bloodStains) blood.draw(this.canvas);
    for (const entity of this.entities) entity.draw(this.canvas);
    for (const enemy of this.enemies) enemy.draw(this.canvas);
    for (const bulletPath of this.bulletPaths) bulletPath.draw(this.canvas);
    this.player.draw(this.canvas);

    this.useDefaultCoordsMapper();

    if (this.paused) {
      this.canvas.fillRect(
        0,
        0,
        this.canvas.width,
        this.canvas.height,
        "rgba(0, 0, 0, 0.35)",
      );
      this.canvas.fillStyle = "white";
      this.canvas.font = "48px serif";
      this.canvas.fillText(
        "Paused",
        this.canvas.width / 2,
        this.canvas.height / 2,
      );
    }

    if (this.player.hp === 0) {
      this.canvas.fillRect(
        0,
        0,
        this.canvas.width,
        this.canvas.height,
        "rgba(0, 0, 0, 0.35)",
      );
      this.canvas.fillStyle = "white";
      this.canvas.font = "48px serif";
      this.canvas.fillText(
        "Game over",
        this.canvas.width / 2,
        this.canvas.height / 2,
      );

      // retry button
      this.canvas.canvas.style.cursor = "auto";
      const retryText = "Retry";
      let retryFontWeight = "normal";
      this.canvas.ctx.font = `${retryFontWeight} 40px Arial`;
      const { width: retryWidth } = this.canvas.ctx.measureText(retryText);
      if (
        this.canvas.mouseX > this.canvas.width / 2 - retryWidth / 2 &&
        this.canvas.mouseX < this.canvas.width / 2 + retryWidth / 2 &&
        this.canvas.mouseY > 400 &&
        this.canvas.mouseY < 460
      ) {
        retryFontWeight = "bold";
        this.canvas.canvas.style.cursor = "pointer";
      }
      this.canvas.ctx.textAlign = "center";
      this.canvas.ctx.font = `${retryFontWeight} 40px Arial`;
      this.canvas.fillText(retryText, this.canvas.width / 2, 440, "black");

      // main menu button
      const mainMenuButton = "Main menu";
      let mainMenuFontWeight = "normal";
      this.canvas.ctx.font = `${mainMenuFontWeight} 40px Arial`;
      const { width: mainMenuWidth } =
        this.canvas.ctx.measureText(mainMenuButton);
      if (
        this.canvas.mouseX > this.canvas.width / 2 - mainMenuWidth / 2 &&
        this.canvas.mouseX < this.canvas.width / 2 + mainMenuWidth / 2 &&
        this.canvas.mouseY > 460 &&
        this.canvas.mouseY < 520
      ) {
        mainMenuFontWeight = "bold";
        this.canvas.canvas.style.cursor = "pointer";
      }
      this.canvas.ctx.textAlign = "center";
      this.canvas.ctx.font = `${mainMenuFontWeight} 40px Arial`;
      this.canvas.fillText(mainMenuButton, this.canvas.width / 2, 500, "black");
    }

    // score
    this.canvas.ctx.shadowColor = "#000";
    this.canvas.ctx.shadowOffsetX = 0;
    this.canvas.ctx.shadowOffsetY = 0;
    this.canvas.ctx.shadowBlur = 10;
    this.canvas.ctx.textAlign = "center";
    this.canvas.ctx.font = "bold 30px Arial";
    this.canvas.fillText(
      "Score: " + this.score.toString().padStart(12, "0"),
      this.canvas.width / 2,
      35,
      "white",
    );
    this.canvas.ctx.shadowBlur = 0;
  }
  get edges(): [Vector2, Vector2][] {
    return [
      [new Vector2(0, 0), new Vector2(this.width, 0)],
      [new Vector2(this.width, 0), new Vector2(this.width, this.height)],
      [new Vector2(0, this.height), new Vector2(this.width, this.height)],
      [new Vector2(0, 0), new Vector2(0, this.height)],
    ];
  }
}
