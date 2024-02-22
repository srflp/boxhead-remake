import { Arena } from "./Arena";
import { Entity } from "./Entity";
import { colors } from "./colors";

export class Wall extends Entity {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
  }
  draw(arena: Arena) {
    arena.canvas.ctx.beginPath();
    arena.canvas.ctx.strokeStyle = "black";
    arena.roundRect(this.x, this.y, this.width, this.height, 4, colors.wall);
  }
}
