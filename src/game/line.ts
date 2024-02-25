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

export const pointSegmentDistance = (p: Vector2, a: Vector2, b: Vector2) => {
  const ab = b.clone().subtract(a);
  const ap = p.clone().subtract(a);
  const proj = ap.dot(ab);
  const abLengthSquared = ab.lengthSquared();
  const d = proj / abLengthSquared;
  let closestPoint: Vector2;
  if (d <= 0) {
    closestPoint = a;
  } else if (d >= 1) {
    closestPoint = b;
  } else {
    closestPoint = a.clone().add(ab.clone().multiplyScalar(d));
  }
  return closestPoint.distanceTo(p);
};

export const lineCircleIntersections = (
  circlePoint: Vector2,
  radius: number,
  segmentStart: Vector2,
  segmentEnd: Vector2,
) => {
  const dx = segmentEnd.x - segmentStart.x;
  const dy = segmentEnd.y - segmentStart.y;
  const fx = segmentStart.x - circlePoint.x;
  const fy = segmentStart.y - circlePoint.y;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;

  const det = b * b - 4 * a * c;

  if (det < 0 || a <= 0.0000001) {
    return [];
  } else if (det === 0) {
    const t = -b / (2 * a);
    return [new Vector2(segmentStart.x + t * dx, segmentStart.y + t * dy)];
  } else {
    const t1 = (-b + Math.sqrt(det)) / (2 * a);
    const t2 = (-b - Math.sqrt(det)) / (2 * a);
    if (t1 > 0 && t2 > 0 && t1 < 1 && t2 < 1)
      return [
        new Vector2(segmentStart.x + t1 * dx, segmentStart.y + t1 * dy),
        new Vector2(segmentStart.x + t2 * dx, segmentStart.y + t2 * dy),
      ];
  }
  return [];
};
