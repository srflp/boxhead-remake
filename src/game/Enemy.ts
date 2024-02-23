import type { Arena } from "./Arena";
import type { Canvas } from "./Canvas";
import { Drawable } from "./Drawable";
import { colors } from "./colors";
import { Vector2 } from "./primitives/Vector2";
import { clamp } from "./utils";

export class Enemy extends Drawable {
  arena: Arena;
  position: Vector2;
  velocity: Vector2;
  orientation: Vector2;
  size: number;

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
  update(delta: number) {
    const speed = 0.05;

    const playerVector = new Vector2(
      this.arena.player.cx,
      this.arena.player.cy,
    );
    const enemyVector = new Vector2(this.cx, this.cy);
    this.orientation = playerVector.subtract(enemyVector).normalize();

    this.velocity = this.orientation.clone().multiplyScalar(speed * delta);

    let potentialC = this.position.clone().add(this.velocity).addScalar(this.r);

    // tile the enemy is currently on (was, on the previous frame)
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

    // handle enemy collisions with walls
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
    for (let enemy of [...this.arena.enemies, this.arena.player]) {
      if (enemy === this) continue;
      const enemyVector = new Vector2(enemy.cx, enemy.cy);
      const delta = enemyVector.subtract(potentialC);
      const dist = delta.length();
      const overlap = 2 * this.r - dist;
      if (overlap > 0) {
        potentialC.subtract(delta.normalize().multiplyScalar(overlap / 2));
        this.position = potentialC.clone().subtractScalar(this.r);
      }
    }
  }
  draw(canvas: Canvas) {
    canvas.fillCircle(this.x, this.y, this.r, colors.enemy);
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
