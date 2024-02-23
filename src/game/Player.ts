import type { Arena } from "./Arena";
import { clamp, getRandomIntInclusive, throttle } from "./utils";
import { colors } from "./colors";
import { bresenham } from "./bresenham";
import { lineRayIntersectionPoint } from "./line";
import { Vector2 } from "./primitives/Vector2";
import { BulletPath } from "./BulletPath";
import { Drawable } from "./Drawable";
import type { Canvas } from "./Canvas";

export class Player extends Drawable {
  arena: Arena;
  position: Vector2;
  velocity: Vector2;
  orientation: Vector2;
  size: number;
  tryToShoot = throttle(this.shoot, () => getRandomIntInclusive(250, 350));

  constructor(arena: Arena, x: number, y: number, size: number) {
    super();
    this.arena = arena;
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.orientation = new Vector2(0, 1);
    this.size = size;
  }
  get x() {
    return this.position.x;
  }
  get y() {
    return this.position.y;
  }
  get r() {
    return this.size / 2;
  }
  get cx() {
    return this.x + this.r;
  }
  get cy() {
    return this.y + this.r;
  }
  set x(x: number) {
    this.position.x = Math.max(0, Math.min(x, this.arena.width - this.size));
  }
  set y(y: number) {
    this.position.y = Math.max(0, Math.min(y, this.arena.height - this.size));
  }
  set cx(cx: number) {
    this.x = cx - this.r;
  }
  set cy(cy: number) {
    this.y = cy - this.r;
  }
  updateVelocity(delta: number) {
    const { keysPressed } = this.arena.canvas;
    const speed = 0.2;
    this.velocity.set(0, 0);
    let anyPressed = false;
    const left = keysPressed.has("a") || keysPressed.has("ArrowLeft");
    const right = keysPressed.has("d") || keysPressed.has("ArrowRight");
    const up = keysPressed.has("w") || keysPressed.has("ArrowUp");
    const down = keysPressed.has("s") || keysPressed.has("ArrowDown");
    if (left && !right) {
      this.velocity.x = -speed;
      anyPressed = true;
    }
    if (right && !left) {
      this.velocity.x = speed;
      anyPressed = true;
    }
    if (up && !down) {
      this.velocity.y = -speed;
      anyPressed = true;
    }
    if (down && !up) {
      this.velocity.y = speed;
      anyPressed = true;
    }
    if (anyPressed) {
      this.orientation.set(
        this.velocity.x / (Math.abs(this.velocity.x) || 1),
        this.velocity.y / (Math.abs(this.velocity.y) || 1),
      );
    }
    if (this.velocity.x && this.velocity.y) {
      this.velocity.divideScalar(Math.sqrt(2));
    }
    this.velocity.multiplyScalar(delta);
  }
  shoot() {
    let shotEdgeIntersection = null;
    for (const edge of this.arena.edges) {
      let intersection = lineRayIntersectionPoint(
        new Vector2(this.cx, this.cy),
        this.orientation,
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
    const orientationNormalized = this.orientation.clone().normalize();
    this.arena.addBulletPath(
      new BulletPath(
        new Vector2(
          this.cx + this.r * orientationNormalized.x,
          this.cy + this.r * orientationNormalized.y,
        ),
        new Vector2(
          (shotEnd ?? shotEdgeIntersection)?.x || 0,
          (shotEnd ?? shotEdgeIntersection)?.y || 0,
        ),
        "red",
        50,
      ),
    );
    this.arena.playSound("weapon-pistol-fire");
  }
  update(delta: number) {
    this.updateVelocity(delta);

    let potentialC = this.position.clone().add(this.velocity).addScalar(this.r);

    // tile the player is currently on (was, on the previous frame)
    const tilePrev = this.position
      .clone()
      .addScalar(this.r)
      .divideScalar(this.arena.gridSize)
      .floor();

    this.position
      .add(this.velocity)
      .clamp(
        new Vector2(0, 0),
        this.arena.size.clone().subtractScalar(this.size),
      );

    // handle player collisions with walls
    const cell = new Vector2(0, 0);
    const cellTL = tilePrev.clone().subtractScalar(1).maxScalar(0);
    const cellBR = tilePrev.clone().addScalar(1).min(this.arena.size);
    for (cell.y = cellTL.y; cell.y <= cellBR.y; cell.y++) {
      const line = this.arena.layout[cell.y];
      for (cell.x = cellTL.x; cell.x <= cellBR.x; cell.x++) {
        if (line[cell.x] === "#") {
          const cellCoords = cell.clone().multiplyScalar(this.arena.gridSize);
          const nearest = potentialC
            .clone()
            .clamp(
              cellCoords,
              cellCoords.clone().addScalar(this.arena.gridSize),
            );
          const delta = nearest.subtract(potentialC);
          const dist = delta.length();
          const overlap = this.r - dist;
          if (overlap > 0) {
            potentialC.subtract(delta.normalize().multiplyScalar(overlap));
            // correcting the player's position in case of collision
            this.position = potentialC.clone().subtractScalar(this.r);
          }
        }
      }
    }
    if (this.arena.canvas.keysPressed.has(" ")) this.tryToShoot();
  }
  draw(canvas: Canvas) {
    // player's circle
    canvas.fillCircle(this.x, this.y, this.r, colors.player);

    // orientation indicator
    const orientationNormalized = this.orientation
      .clone()
      .normalize()
      .multiplyScalar(this.r - 4);
    const indicator = this.position
      .clone()
      .addScalar(this.r)
      .add(orientationNormalized)
      .subtractScalar(4);
    canvas.fillCircle(indicator.x, indicator.y, 4, "white");
  }
}
