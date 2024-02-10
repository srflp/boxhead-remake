import { Canvas } from "./Canvas";
import { Player } from "./Player";
import { clamp } from "./utils";

export class Arena {
  width: number;
  height: number;
  entities: Player[];
  player: Player;
  canvas: Canvas;
  constructor(canvas: Canvas, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.entities = [];
    this.player = new Player(this, 48, 48, 48, 48);
    this.canvas = canvas;
    this.update();
  }
  update = () => {
    this.canvas.clear();
    this.draw();
    requestAnimationFrame(this.update);
  };
  addEntity(entity: Player) {
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
  fillRect(x: number, y: number, width: number, height: number) {
    this.canvas.ctx.fillRect(...this.mapToCanvas(x, y), width, height);
  }
  draw() {
    this.canvas.ctx.fillStyle = "black";

    // borders
    this.fillRect(0, 0, this.width, 48); // top
    this.fillRect(0, this.height - 48, this.width, 48); // bottom
    this.fillRect(0, 0, 48, this.height); // left
    this.fillRect(this.width - 48, 0, 48, this.height); // right

    this.fillRect(1000, 1000, 48, 48); // left

    for (let i = 0; i < this.width; i += 48) {
      this.fillRect(i, 0, 1, this.height);
    }
    for (let i = 0; i < this.height; i += 48) {
      this.fillRect(0, i, this.width, 1);
    }

    this.player.draw(this.canvas.ctx);
    // for (const entity of this.entities) {
    //   entity.draw(ctx);
    // }
  }
}
