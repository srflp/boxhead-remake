import type { Arena } from "./Arena";
import type { Vector2 } from "./primitives/Vector2";

export class BulletPath {
  constructor(
    public start: Vector2,
    public end: Vector2,
    public color: string,
    public duration: number,
    public launchedAt: Date = new Date(),
  ) {}
  hasExpired() {
    return new Date().getTime() - this.launchedAt.getTime() > this.duration;
  }
  draw(arena: Arena) {
    arena.drawLine(this.start.x, this.start.y, this.end.x, this.end.y, "red");
  }
}
