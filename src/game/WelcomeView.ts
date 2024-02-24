import { Arena } from "./Arena";
import type { Canvas } from "./Canvas";
import { colors } from "./colors";

export class WelcomeView {
  canvas: Canvas;
  img: HTMLImageElement;
  imgLoaded = false;

  constructor(canvas: Canvas) {
    this.canvas = canvas;

    this.canvas.fillRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      colors.bgFloor,
    );

    this.img = new Image();
    this.img.src = "images/boxhead-logo.png";
    this.img.onload = () => {
      this.imgLoaded = true;
    };

    this.canvas.canvas.addEventListener("click", () => {
      this.canvas.ctx.textAlign = "right";
      this.canvas.ctx.font = "bold 13px Arial";

      const originalAuthor = "Original author: Sean Cooper 2007";
      const { width } = this.canvas.ctx.measureText(originalAuthor);
      if (
        this.canvas.mouseX > this.canvas.width - 10 - width &&
        this.canvas.mouseX < this.canvas.width - 10 &&
        this.canvas.mouseY > this.canvas.height - 40 &&
        this.canvas.mouseY < this.canvas.height - 25
      ) {
        window.open("https://www.seantcooper.com/", "_blank");
      }

      // play button
      const playText = "Play!";
      let fontWeight = "normal";
      this.canvas.ctx.font = `${fontWeight} 40px Arial`;
      const { width: playWidth } = this.canvas.ctx.measureText(playText);
      if (
        this.canvas.mouseX > this.canvas.width / 2 - playWidth / 2 &&
        this.canvas.mouseX < this.canvas.width / 2 + playWidth / 2 &&
        this.canvas.mouseY > 400 &&
        this.canvas.mouseY < 460
      ) {
        new Arena(canvas, 1920, 1920);
      }
    });

    this.repaint();
  }
  repaint = () => {
    this.canvas.clear();
    this.canvas.canvas.style.cursor = "auto";

    if (this.imgLoaded) {
      this.canvas.ctx.drawImage(
        this.img,
        (this.canvas.width - this.img.width) / 2,
        100,
      );
    }

    this.canvas.ctx.textAlign = "left";
    this.canvas.ctx.font = "bold 20px Arial";
    this.canvas.fillText("REMAKE", this.canvas.width / 2 + 100, 280, "#A40000");

    const playText = "Play!";
    let fontWeight = "normal";
    this.canvas.ctx.font = `${fontWeight} 40px Arial`;
    const { width: playWidth } = this.canvas.ctx.measureText(playText);
    if (
      this.canvas.mouseX > this.canvas.width / 2 - playWidth / 2 &&
      this.canvas.mouseX < this.canvas.width / 2 + playWidth / 2 &&
      this.canvas.mouseY > 400 &&
      this.canvas.mouseY < 460
    ) {
      fontWeight = "bold";
      this.canvas.canvas.style.cursor = "pointer";
    }
    this.canvas.ctx.textAlign = "center";
    this.canvas.ctx.font = `${fontWeight} 40px Arial`;
    this.canvas.fillText(playText, this.canvas.width / 2, 440, "black");

    this.canvas.ctx.textAlign = "right";
    this.canvas.ctx.font = "bold 13px Arial";
    const originalAuthor = "Original author: Sean Cooper 2007";
    this.canvas.fillText(
      originalAuthor,
      this.canvas.width - 10,
      this.canvas.height - 28,
      colors.text,
    );
    const { width } = this.canvas.ctx.measureText(originalAuthor);

    if (
      this.canvas.mouseX > this.canvas.width - 10 - width &&
      this.canvas.mouseX < this.canvas.width - 10 &&
      this.canvas.mouseY > this.canvas.height - 40 &&
      this.canvas.mouseY < this.canvas.height - 25
    ) {
      this.canvas.canvas.style.cursor = "pointer";
    }

    this.canvas.fillText(
      "Remade by: Filip Sauer 2024",
      this.canvas.width - 10,
      this.canvas.height - 10,
      colors.text,
    );

    requestAnimationFrame(this.repaint);
  };
}
