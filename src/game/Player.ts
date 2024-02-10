import type { Arena } from "./Arena";
import { colors } from "./colors";

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
  updateVelocity() {
    const { keysPressed } = this.arena.canvas;
    const speed = 24;
    this.vx = 0;
    this.vy = 0;
    if (keysPressed.has("a")) this.vx = -speed;
    if (keysPressed.has("d")) this.vx = speed;
    if (keysPressed.has("w")) this.vy = -speed;
    if (keysPressed.has("s")) this.vy = speed;
    const sqrt2 = Math.sqrt(2);
    if (this.vx && this.vy) {
      this.vx = Math.round(this.vx / sqrt2);
      this.vy = Math.round(this.vy / sqrt2);
    }
  }
  draw() {
    this.updateVelocity();
    this.x = this.x + this.vx;
    this.y = this.y + this.vy;

    this.arena.fillCircle(this.x, this.y, this.width / 2, colors.player);
    // this.arena.fillText(
    //   Math.round(this.x).toString(),
    //   this.x + 5,
    //   this.y + 20,
    //   "white",
    // );
    // this.arena.fillText(
    //   Math.round(this.y).toString(),
    //   this.x + 5,
    //   this.y + 30,
    //   "white",
    // );
  }
}
