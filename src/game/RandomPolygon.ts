import type { Arena } from "./Arena";
import { Drawable } from "./Drawable";
import { colors } from "./colors";
import { Vector2 } from "./primitives/Vector2";

export class RandomPolygon extends Drawable {
  points: Vector2[] = [];

  constructor(mapWidth: number, mapHeight: number) {
    super();
    const x = Math.random() * mapWidth;
    const y = Math.random() * mapHeight;
    const sides = 20 + Math.floor(Math.random() * 10);
    const radius = 40 + Math.random() * 100;
    const angles = [];

    for (let i = 0; i < sides; i++) {
      angles.push(Math.random() * 2 * Math.PI);
    }

    angles.sort((a, b) => a - b);
    for (let i = 0; i < sides; i++) {
      this.points.push(
        new Vector2(
          x + radius * Math.cos(angles[i]),
          y + radius * Math.sin(angles[i]),
        ),
      );
    }
  }

  draw(arena: Arena) {
    arena.drawPolygon(this.points, colors.bgFloorNoise);
  }
}
