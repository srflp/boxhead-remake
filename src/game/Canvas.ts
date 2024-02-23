import { colors } from "./colors";
import type { Vector2 } from "./primitives/Vector2";

export class Canvas {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  keysPressed: Set<string> = new Set();
  keysObserved: Set<string> = new Set([
    "a",
    "w",
    "s",
    "d",
    "ArrowLeft",
    "ArrowUp",
    "ArrowDown",
    "ArrowRight",
    " ",
  ]);
  mouseX: number = 0;
  mouseY: number = 0;
  coordsMapper: (x: number, y: number) => [number, number] = (x, y) => [x, y];

  constructor(selector: string, width: number, height: number) {
    this.width = width;
    this.height = height;

    const canvas = document.querySelector<HTMLCanvasElement>(selector);
    if (!canvas)
      throw new Error(`Canvas with selector "${selector}" not found`);
    this.canvas = canvas;

    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Context not found");
    this.ctx = ctx;

    if (window.devicePixelRatio > 1) {
      var canvasWidth = canvas.width;
      var canvasHeight = canvas.height;

      canvas.width = canvasWidth * window.devicePixelRatio;
      canvas.height = canvasHeight * window.devicePixelRatio;
      canvas.style.width = canvasWidth + "px";
      canvas.style.height = canvasHeight + "px";

      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    canvas.addEventListener("keydown", (e) => {
      if (!this.keysObserved.has(e.key)) return;
      this.keysPressed.add(e.key);
    });

    canvas.addEventListener("keyup", (e) => {
      if (!this.keysObserved.has(e.key)) return;
      this.keysPressed.delete(e.key);
    });

    canvas.addEventListener("blur", (e) => {
      this.keysPressed.clear();
    });

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
  }
  focus() {
    this.canvas.focus();
  }
  clear() {
    this.ctx.fillStyle = colors.bgFloor;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  fillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string | CanvasGradient | CanvasPattern = colors.defaultColor,
  ) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(...this.coordsMapper(x, y), width, height);
  }
  roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color = colors.defaultColor,
  ) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.roundRect(...this.coordsMapper(x, y), width, height, radius);
    this.ctx.fill();
    this.ctx.stroke();
  }
  fillCircle(
    x: number,
    y: number,
    radius: number,
    color = colors.defaultColor,
  ) {
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.arc(
      ...this.coordsMapper(x + radius, y + radius),
      radius,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();
  }
  fillText(text: string, x: number, y: number, color = "black") {
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, ...this.coordsMapper(x, y));
  }
  drawLine(x1: number, y1: number, x2: number, y2: number, color = "black") {
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(...this.coordsMapper(x1, y1));
    this.ctx.lineTo(...this.coordsMapper(x2, y2));
    this.ctx.stroke();
  }
  fillPolygon(points: Vector2[], color = colors.bgFloorNoise) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(...this.coordsMapper(points[0].x, points[0].y));
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(...this.coordsMapper(points[i].x, points[i].y));
    }
    this.ctx.closePath();
    this.ctx.fill();
  }
}
