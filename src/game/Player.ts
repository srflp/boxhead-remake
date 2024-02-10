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
  draw() {
    if (this.vx && this.vy) {
      this.x = this.x + this.vx / Math.sqrt(2);
      this.y = this.y + this.vy / Math.sqrt(2);
    } else {
      this.x = this.x + this.vx;
      this.y = this.y + this.vy;
    }

    this.arena.fillRect(this.x, this.y, this.width, this.height, "red");
    this.arena.fillText(
      Math.round(this.x) + " " + Math.round(this.y),
      this.x,
      this.y + 10,
      "white",
    );
  }
}
