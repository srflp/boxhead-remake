import { Arena } from "./Arena";
import { Entity } from "./Entity";

export class Wall extends Entity {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
  }
  draw(arena: Arena) {
    arena.fillRect(this.x, this.y, this.width, this.height, "black");
  }
}
