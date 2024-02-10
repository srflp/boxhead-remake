export class Canvas {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  keysPressed: Set<string> = new Set();
  keysObserved: Set<string> = new Set(["a", "w", "s", "d"]);

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
