import type { Arena } from "./Arena";
import { clamp, throttle } from "./utils";
import { colors } from "./colors";

export class Player {
  arena: Arena;
  #x: number;
  #y: number;
  width: number;
  height: number;
  vx: number = 0;
  vy: number = 0;
  orientationX: number = 1;
  orientationY: number = 0;
  tryToShoot = throttle(this.shoot, 500);

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
  set cx(cx: number) {
    this.x = cx - this.width / 2;
  }
  set cy(cy: number) {
    this.y = cy - this.height / 2;
  }
  updateVelocity() {
    const { keysPressed } = this.arena.canvas;
    const speed = 4;
    this.vx = 0;
    this.vy = 0;
    let anyPressed = false;
    if (keysPressed.has("a") || keysPressed.has("ArrowLeft")) {
      this.vx = -speed;
      anyPressed = true;
    }
    if (keysPressed.has("d") || keysPressed.has("ArrowRight")) {
      this.vx = speed;
      anyPressed = true;
    }
    if (keysPressed.has("w") || keysPressed.has("ArrowUp")) {
      this.vy = -speed;
      anyPressed = true;
    }
    if (keysPressed.has("s") || keysPressed.has("ArrowDown")) {
      this.vy = speed;
      anyPressed = true;
    }
    if (anyPressed) {
      this.orientationX = this.vx / (Math.abs(this.vx) || 1);
      this.orientationY = this.vy / (Math.abs(this.vy) || 1);
    }
    const sqrt2 = Math.sqrt(2);
    if (this.vx && this.vy) {
      this.vx = this.vx / sqrt2;
      this.vy = this.vy / sqrt2;
    }
    if (keysPressed.has(" ")) {
      this.tryToShoot();
    }
  }
  shoot() {
    console.log("shot");
    this.arena.fillRect(this.x, this.y, 48 * 3, 48 * 3, "rgba(0,0,0,0.5)");
  }
  draw() {
    this.updateVelocity();

    let potentialCx = this.x + this.vx + this.width / 2;
    let potentialCy = this.y + this.vy + this.width / 2;

    this.x = this.x + this.vx;
    this.y = this.y + this.vy;

    // handle collisions with walls
    const startX = Math.floor(this.cx / this.arena.gridSize);
    const startY = Math.floor(this.cy / this.arena.gridSize);
    const checkDepth = 1;
    for (
      let y = Math.max(0, startY - checkDepth);
      y <= Math.min(startY + checkDepth, this.arena.layout.length - 1);
      y++
    ) {
      const line = this.arena.layout[y];
      for (
        let x = Math.max(0, startX - checkDepth);
        x <= Math.min(startX + checkDepth, line.length - 1);
        x++
      ) {
        const char = line[x];
        if (char === "#") {
          const realX = x * this.arena.gridSize;
          const realY = y * this.arena.gridSize;

          const nearestX = clamp(
            potentialCx,
            realX,
            realX + this.arena.gridSize,
          );
          const nearestY = clamp(
            potentialCy,
            realY,
            realY + this.arena.gridSize,
          );

          const deltaX = nearestX - potentialCx;
          const deltaY = nearestY - potentialCy;

          const dist = Math.hypot(deltaX, deltaY);
          const overlap = this.width / 2 - dist;

          if (overlap > 0) {
            potentialCx = potentialCx - (deltaX / dist) * overlap;
            potentialCy = potentialCy - (deltaY / dist) * overlap;

            // correcting the player's position in case of collision
            this.cx = potentialCx;
            this.cy = potentialCy;
          }

          // this.arena.fillCircle(nearestX - 4, nearestY - 4, 4, "blue");
        }
      }
    }

    // this.arena.fillRect(
    //   (startX - 1) * this.arena.gridSize,
    //   (startY - 1) * this.arena.gridSize,
    //   48 * 3,
    //   48 * 3,
    //   "rgba(0,0,0,0.5)",
    // );

    this.arena.fillCircle(this.x, this.y, this.width / 2, colors.player);

    // debug - velocity indicator
    // this.arena.fillText(
    //   Math.round(this.vx).toString(),
    //   this.x + 5,
    //   this.y + 20,
    //   "white",
    // );
    // this.arena.fillText(
    //   Math.round(this.vy).toString(),
    //   this.x + 5,
    //   this.y + 30,
    //   "white",
    // );

    // orientation indicator
    const normalPart = 1 / Math.hypot(this.orientationX, this.orientationY);
    this.arena.fillCircle(
      this.cx + (this.width / 2 - 4) * this.orientationX * normalPart - 4,
      this.cy + (this.width / 2 - 4) * this.orientationY * normalPart - 4,
      4,
      "white",
    );
  }
}
