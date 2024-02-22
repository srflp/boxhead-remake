import type { Arena } from "./Arena";
import { clamp, throttle } from "./utils";
import { colors } from "./colors";
import { bresenham } from "./bresenham";
import { lineRayIntersectionPoint } from "./line";
import { Vector2 } from "./primitives/Vector2";
import { BulletPath } from "./BulletPath";

export class Player {
  arena: Arena;
  #x: number;
  #y: number;
  width: number;
  height: number;
  vx: number = 0;
  vy: number = 0;

  orientationX: number = 1; // -1 | 0 | 1
  orientationY: number = 0; // -1 | 0 | 1
  tryToShoot = throttle(this.shoot, 180);

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
  updateVelocity(delta: number) {
    const { keysPressed } = this.arena.canvas;
    const speed = 0.2;
    this.vx = 0;
    this.vy = 0;
    let anyPressed = false;
    const left = keysPressed.has("a") || keysPressed.has("ArrowLeft");
    const right = keysPressed.has("d") || keysPressed.has("ArrowRight");
    const up = keysPressed.has("w") || keysPressed.has("ArrowUp");
    const down = keysPressed.has("s") || keysPressed.has("ArrowDown");
    if (left && !right) {
      this.vx = -speed;
      anyPressed = true;
    }
    if (right && !left) {
      this.vx = speed;
      anyPressed = true;
    }
    if (up && !down) {
      this.vy = -speed;
      anyPressed = true;
    }
    if (down && !up) {
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
    this.vx *= delta;
    this.vy *= delta;
  }
  shoot() {
    let shotEdgeIntersection = null;
    for (const edge of this.arena.edges) {
      let intersection = lineRayIntersectionPoint(
        new Vector2(this.cx, this.cy),
        new Vector2(this.orientationX, this.orientationY),
        edge[0],
        edge[1],
      );
      if (intersection) {
        shotEdgeIntersection = intersection;
        break;
      }
    }
    let shotEnd: Vector2 | null = null;
    bresenham(
      this.cx,
      this.cy,
      shotEdgeIntersection!.x,
      shotEdgeIntersection!.y,
      (x, y) => {
        const cellX = Math.floor(
          clamp(x - 1, 0, this.arena.width) / this.arena.gridSize,
        );
        const cellY = Math.floor(
          clamp(y - 1, 0, this.arena.height) / this.arena.gridSize,
        );
        if (this.arena.layout[cellY][cellX] === "#") {
          shotEnd = new Vector2(x, y);
          return true;
        }
      },
    );
    const normalPart = 1 / Math.hypot(this.orientationX, this.orientationY);
    this.arena.addBulletPath(
      new BulletPath(
        new Vector2(
          this.cx + (this.width / 2) * this.orientationX * normalPart,
          this.cy + (this.width / 2) * this.orientationY * normalPart,
        ),
        new Vector2(
          (shotEnd ?? shotEdgeIntersection)?.x || 0,
          (shotEnd ?? shotEdgeIntersection)?.y || 0,
        ),
        "red",
        50,
      ),
    );
  }
  updatePosition(delta: number) {
    this.updateVelocity(delta);

    let potentialCx = this.x + this.vx + this.width / 2;
    let potentialCy = this.y + this.vy + this.width / 2;

    // tile the player is currently on (was, one the previous frame)
    const tileXPrev = Math.floor(this.cx / this.arena.gridSize);
    const tileYPrev = Math.floor(this.cy / this.arena.gridSize);

    this.x = this.x + this.vx;
    this.y = this.y + this.vy;

    // handle player collisions with walls
    const checkDepth = 1;
    for (
      let y = Math.max(0, tileYPrev - checkDepth);
      y <= Math.min(tileYPrev + checkDepth, this.arena.layout.length - 1);
      y++
    ) {
      const line = this.arena.layout[y];
      for (
        let x = Math.max(0, tileXPrev - checkDepth);
        x <= Math.min(tileXPrev + checkDepth, line.length - 1);
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
        }
      }
    }
  }
  draw() {
    // player's circle
    this.arena.fillCircle(this.x, this.y, this.width / 2, colors.player);

    // debug: velocity indicator
    // this.arena.fillText(
    //   Math.round(this.vx * 100).toString(),
    //   this.x + 5,
    //   this.y + 20,
    //   "white",
    // );
    // this.arena.fillText(
    //   Math.round(this.vy * 100).toString(),
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

    // debug: shooting line
    if (this.arena.canvas.keysPressed.has(" ")) {
      this.tryToShoot();
    }
  }
}
