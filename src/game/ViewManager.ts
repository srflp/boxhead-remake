import type { Canvas } from "./Canvas";
import type { View } from "./View";
import { WelcomeView } from "./WelcomeView";

export class ViewManager {
  #view: View;
  constructor(public canvas: Canvas) {
    this.#view = new WelcomeView(this, canvas);
  }
  set view(view: View) {
    this.view.destroy();
    this.#view = view;
  }
  get view() {
    return this.#view;
  }
}
