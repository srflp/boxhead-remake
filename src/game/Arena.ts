import type { BulletPath } from "./BulletPath";
import { Canvas } from "./Canvas";
import type { Entity } from "./Entity";
import { RandomPolygon } from "./FloorNoise";
import { Player } from "./Player";
import { Wall } from "./Wall";
import { colors } from "./colors";
import { Vector2 } from "./primitives/Vector2";
import { loadSound, playSound } from "./sound";
import { clamp } from "./utils";

// 1920 x 1920
interface ArenaConfig {
  width: number;
  height: number;
  layout: string;
}

const defaultConfig: ArenaConfig = {
  width: 1920,
  height: 1920,
  layout: `
##################   ###################
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
#                      ###             #
#             #                        #
#              ##       ##             #
#                                      #
#                                      #
#                  p                   #
#                                      #
#                                      #
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
  entities: Entity[];
  bulletPaths: BulletPath[] = [];
  player!: Player;
  canvas: Canvas;
  floorNoisePolygons: RandomPolygon[] = [];
  gridSize: number = 48;
  layout: string[] = defaultConfig.layout.trim().split("\n");
  soundNames = ["weapon-pistol-fire"] as const;
  sounds: Record<string, AudioBuffer> = {};

  maxFPS = 60;
  lastFrameTimeMs = 0;
  delta = 0;
  timestep = 1000 / this.maxFPS;

  constructor(canvas: Canvas, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.entities = [];
    this.parseLayout();
    this.loadSounds();

    this.canvas = canvas;
    for (let i = 0; i < 100; i++) {
      this.floorNoisePolygons.push(new RandomPolygon(width, height));
    }
    requestAnimationFrame(this.repaint);
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
            this.gridSize,
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
  mapToCanvas(x: number, y: number) {
    let viewportX = this.player.x - (this.canvas.width - this.player.width) / 2;
    let viewportY =
      this.player.y - (this.canvas.height - this.player.height) / 2;
    viewportX = clamp(viewportX, 0, this.width - this.canvas.width);
    viewportY = clamp(viewportY, 0, this.height - this.canvas.height);
    let canvasX = x - viewportX;
    let canvasY = y - viewportY;
    return [canvasX, canvasY] as const;
  }
  fillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color = colors.defaultColor,
  ) {
    this.canvas.ctx.fillStyle = color;
    this.canvas.ctx.fillRect(...this.mapToCanvas(x, y), width, height);
  }
  roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color = colors.defaultColor,
  ) {
    this.canvas.ctx.fillStyle = color;
    this.canvas.ctx.beginPath();
    this.canvas.ctx.roundRect(...this.mapToCanvas(x, y), width, height, radius);
    this.canvas.ctx.fill();
    this.canvas.ctx.stroke();
  }
  fillCircle(
    x: number,
    y: number,
    radius: number,
    color = colors.defaultColor,
  ) {
    this.canvas.ctx.beginPath();
    this.canvas.ctx.fillStyle = color;
    this.canvas.ctx.arc(
      ...this.mapToCanvas(x + radius, y + radius),
      radius,
      0,
      Math.PI * 2,
    );
    this.canvas.ctx.fill();
  }
  fillText(text: string, x: number, y: number, color = "black") {
    this.canvas.ctx.fillStyle = color;
    this.canvas.ctx.fillText(text, ...this.mapToCanvas(x, y));
  }
  drawLine(x1: number, y1: number, x2: number, y2: number, color = "black") {
    this.canvas.ctx.strokeStyle = color;
    this.canvas.ctx.beginPath();
    this.canvas.ctx.moveTo(...this.mapToCanvas(x1, y1));
    this.canvas.ctx.lineTo(...this.mapToCanvas(x2, y2));
    this.canvas.ctx.stroke();
  }
  update(delta: number) {
    this.player.updatePosition(delta);
  }
  draw() {
    this.canvas.clear();

    for (const polygon of this.floorNoisePolygons) {
      polygon.draw(this.canvas.ctx, this.mapToCanvas.bind(this));
    }

    for (const entity of this.entities) {
      entity.draw(this);
    }

    for (const bulletPath of this.bulletPaths) {
      if (bulletPath.hasExpired()) {
        this.bulletPaths.splice(this.bulletPaths.indexOf(bulletPath), 1);
        continue;
      }
      bulletPath.draw(this);
    }

    this.player.draw();
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
