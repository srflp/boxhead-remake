export class Canvas {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

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
  }
  focus() {
    this.canvas.focus();
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
