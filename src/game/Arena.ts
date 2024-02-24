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

export class Arena {
  width: number;
  height: number;
  size: Vector2;
  entities: Entity[] = [];
  enemies: Enemy[] = [];
  bulletPaths: BulletPath[] = [];
  bloodStains: Blood[] = [];
  player!: Player;
  canvas: Canvas;
  floorNoisePolygons: RandomPolygon[] = [];
  gridSize: number = 48;
  layout: string[] = defaultConfig.layout.trim().split("\n");
  soundNames = ["weapon-pistol-fire"] as const;
  sounds: Record<string, AudioBuffer> = {};
  score: number = 0;

  maxFPS = 60;
  lastFrameTimeMs = 0;
  delta = 0;
  timestep = 1000 / this.maxFPS;

  constructor(canvas: Canvas, width: number, height: number) {
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
    requestAnimationFrame(this.repaint);
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
    if (timestamp < this.lastFrameTimeMs + 1000 / this.maxFPS) {
      requestAnimationFrame(this.repaint);
      return;
    }
    this.delta += timestamp - this.lastFrameTimeMs;
    this.lastFrameTimeMs = timestamp;

    let numUpdateSteps = 0;
    while (this.delta >= this.timestep) {
      this.update(this.timestep);
      this.delta -= this.timestep;
      if (++numUpdateSteps >= 240) {
        this.delta = 0;
        break;
      }
    }
    this.draw();
    requestAnimationFrame(this.repaint);
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
    }

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
