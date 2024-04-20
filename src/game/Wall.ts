import type { Canvas } from "./Canvas";
import { Entity } from "./Entity";
import { colors } from "./colors";

export class Wall extends Entity {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
  }
  draw(canvas: Canvas) {
    canvas.ctx.strokeStyle = "black";
    canvas.roundRect(this.x, this.y, this.width, this.height, 4, colors.wall);
  }
}

export class DisappearingWall extends Wall {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    public duration: number,
    public launchedAt: Date = new Date(),
  ) {
    super(x, y, width, height);
  }
  hasExpired() {
    return new Date().getTime() - this.launchedAt.getTime() > this.duration;
  }
  draw(canvas: Canvas) {
    canvas.ctx.strokeStyle = "black";
    canvas.roundRect(this.x, this.y, this.width, this.height, 4, colors.wall);
  }
}
