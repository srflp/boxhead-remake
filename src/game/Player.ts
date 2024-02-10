import type { Arena } from "./Arena";

export class Player {
  arena: Arena;
  #x: number;
  #y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  constructor(
    arena: Arena,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    this.arena = arena;
    this.#x = x;
    this.#y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
  }
  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }
  get cx() {
    return this.x + this.width / 2;
  }
  get cy() {
    return this.y + this.height / 2;
  }
  set x(x: number) {
    this.#x = Math.max(0, Math.min(x, this.arena.width - this.width));
  }
  set y(y: number) {
    this.#y = Math.max(0, Math.min(y, this.arena.height - this.height));
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    if (this.vx && this.vy) {
      this.x = this.x + this.vx / Math.sqrt(2);
      this.y = this.y + this.vy / Math.sqrt(2);
    } else {
      this.x = this.x + this.vx;
      this.y = this.y + this.vy;
    }

    const [canvasX, canvasY] = this.arena.mapToCanvas(this.x, this.y);

    ctx.fillRect(canvasX, canvasY, this.width, this.height);
    ctx.fillStyle = "white";

    ctx.fillText(
      Math.round(this.x) + " " + Math.round(this.y),
      canvasX,
      canvasY + 10,
    );
  }
}
