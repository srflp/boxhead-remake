import type { Point } from "./Point";
import { Line } from "./line";

export const findIntersection = (a: Line, b: Line): Point | null => {
  const det = a.A * b.B - b.A * a.B;
  if (det === 0) {
    return null;
  }
  const x = (b.B * a.C - a.B * b.C) / det;
  const y = (a.A * b.C - b.A * a.C) / det;
  return { x, y };
};
