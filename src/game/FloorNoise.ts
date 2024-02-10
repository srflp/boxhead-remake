import { colors } from "./colors";

export class RandomPolygon {
  x: number;
  y: number;
  sides: number;
  angles: number[];
  radius: number;

  constructor(mapWidth: number, mapHeight: number) {
    this.x = Math.random() * mapWidth;
    this.y = Math.random() * mapHeight;
    this.sides = 20 + Math.floor(Math.random() * 10);
    this.radius = 40 + Math.random() * 100;
    this.angles = [];

    for (let i = 0; i < this.sides; i++) {
      this.angles.push(Math.random() * 2 * Math.PI);
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    mapToCanvas: (x: number, y: number) => readonly [number, number],
  ) {
    ctx.fillStyle = colors.bgFloorNoise;
    this.angles.sort((a, b) => a - b);

    ctx.beginPath();
    ctx.moveTo(
      ...mapToCanvas(
        this.x + this.radius * Math.cos(this.angles[0]),
        this.y + this.radius * Math.sin(this.angles[0]),
      ),
    );

    for (let i = 1; i < this.sides; i++) {
      ctx.lineTo(
        ...mapToCanvas(
          this.x + this.radius * Math.cos(this.angles[i]),
          this.y + this.radius * Math.sin(this.angles[i]),
        ),
      );
    }

    ctx.closePath();
    ctx.fill();
  }
}
