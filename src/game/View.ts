import type { Canvas } from "./Canvas";
import type { ViewManager } from "./ViewManager";

export abstract class View {
  // abstract update(delta: number): void;
  abstract destroy(): void;
  constructor(
    public viewManager: ViewManager,
    public canvas: Canvas,
  ) {}
}
