import { Drawable } from "./Drawable";

export abstract class Entity extends Drawable {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;

  constructor(x: number, y: number, width: number, height: number) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
  }
}
