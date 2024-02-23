import type { Arena } from "./Arena";

export abstract class Drawable {
  public abstract draw(arena: Arena): void;
}
