import { Vector2 } from "./primitives/Vector2";

export class Line {
  #A?: number = undefined;
  #B?: number = undefined;
  #C?: number = undefined;

  constructor(
    public start: Vector2,
    public end: Vector2,
  ) {}

  // Ax+By=C
  get A() {
    if (this.#A === undefined) {
      this.#A = this.end.y - this.start.y;
    }
    return this.#A;
  }

  get B() {
    if (this.#B === undefined) {
      this.#B = this.start.x - this.end.x;
    }
    return this.start.x - this.end.x;
  }

  get C() {
    if (this.#C === undefined) {
      this.#C = this.A * this.start.x + this.B * this.start.y;
    }
    return this.#C;
  }
}

export const findIntersection = (a: Line, b: Line): Vector2 | null => {
  const det = a.A * b.B - b.A * a.B;
  if (det === 0) {
    return null;
  }
  const x = (b.B * a.C - a.B * b.C) / det;
  const y = (a.A * b.C - b.A * a.C) / det;
  return new Vector2(x, y);
};

export const findIntersectionInRange = (a: Line, bs: Line[]): Vector2 => {
  for (const b of bs) {
    const intersection = findIntersection(a, b);
    if (
      intersection &&
      intersection.x > a.start.x &&
      intersection.x < a.end.x &&
      intersection.y > a.start.y &&
      intersection.y < a.end.y
    ) {
      return intersection;
    }
  }
  throw new Error("No intersection found");
};

export const lineRayIntersectionPoint = (
  rayOrigin: Vector2,
  rayDirection: Vector2,
  point1: Vector2,
  point2: Vector2,
): Vector2 | null => {
  const v1 = rayOrigin.clone().subtract(point1);
  const v2 = point2.clone().subtract(point1);
  const v3 = new Vector2(-rayDirection.y, rayDirection.x);

  const dot = v2.dot(v3);
  if (Math.abs(dot) < 0.0000001) return null;

  const t1 = v2.cross(v1) / dot;
  const t2 = v1.dot(v3) / dot;

  if (t1 >= 0 && t2 >= 0 && t2 <= 1) {
    return rayOrigin.clone().add(rayDirection.clone().multiplyScalar(t1));
  }
  return null;
};
