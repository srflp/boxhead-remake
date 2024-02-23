import type { Canvas } from "./Canvas";

export abstract class Drawable {
  public abstract draw(canvas: Canvas): void;
}
