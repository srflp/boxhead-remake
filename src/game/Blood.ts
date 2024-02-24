import type { Canvas } from "./Canvas";
import { Drawable } from "./Drawable";
import { getRandomIntInclusive } from "./utils";

export class Blood extends Drawable {
  img: HTMLImageElement;
  imgLoaded = false;
  variant: number;

  constructor(
    public x: number,
    public y: number,
  ) {
    super();
    this.variant = getRandomIntInclusive(1, 4);
    this.img = new Image();
    this.img.src = `images/blood${this.variant}.png`;
    this.img.onload = () => {
      this.imgLoaded = true;
    };
  }
  draw(canvas: Canvas) {
    if (this.imgLoaded) {
      canvas.drawImage(this.img, this.x - 5, this.y - 3, 58, 55);
    }
  }
}
