import { Canvas } from "./Canvas";
import type { Entity } from "./Entity";
import { Player } from "./Player";
import { Wall } from "./Wall";
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
########################################
#                                      #
#                                      #
#                                      #
#                                      #
#      p                               #
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
########################################
`,
};

const gridSize = 48;

export class Arena {
  width: number;
  height: number;
  entities: Entity[];
  player!: Player;
  canvas: Canvas;
  constructor(canvas: Canvas, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.entities = [];
    this.parseLayout(defaultConfig.layout);

    this.canvas = canvas;
    this.repaint();
  }
  repaint = () => {
    this.canvas.clear();
    this.draw();
    requestAnimationFrame(this.repaint);
  };
  parseLayout(layout: string) {
    const lines = defaultConfig.layout.trim().split("\n");
    for (let y = 0; y < lines.length; y++) {
      const line = lines[y];
      for (let x = 0; x < line.length; x++) {
        const char = line[x];
        if (char === "#") {
          this.addEntity(
            new Wall(x * gridSize, y * gridSize, gridSize, gridSize),
          );
        }
        if (char === "p") {
          this.player = new Player(
            this,
            x * gridSize,
            y * gridSize,
            gridSize,
            gridSize,
          );
        }
      }
    }
  }
  addEntity(entity: Entity) {
    this.entities.push(entity);
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
    color = "black",
  ) {
    this.canvas.ctx.fillStyle = color;
    this.canvas.ctx.fillRect(...this.mapToCanvas(x, y), width, height);
  }
  fillCircle(x: number, y: number, radius: number, color = "black") {
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
  draw() {
    for (const entity of this.entities) {
      entity.draw(this);
    }
    this.player.draw();
  }
}
