export class Vector2 {
  constructor(
    public x: number,
    public y: number,
  ) {}

  subtract(vector: Vector2) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  subtractScalar(scalar: number) {
    this.x -= scalar;
    this.y -= scalar;
    return this;
  }

  add(vector: Vector2) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  addScalar(scalar: number) {
    this.x += scalar;
    this.y += scalar;
    return this;
  }

  divideScalar(scalar: number) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  multiplyScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  magnitude() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag !== 0) {
      this.divideScalar(mag);
    }
    return this;
  }

  dot(vector: Vector2): number {
    return this.x * vector.x + this.y * vector.y;
  }

  cross(vector: Vector2): number {
    return this.x * vector.y - this.y * vector.x;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  clamp(min: Vector2, max: Vector2) {
    this.x = Math.max(min.x, Math.min(this.x, max.x));
    this.y = Math.max(min.y, Math.min(this.y, max.y));
    return this;
  }

  clampScalar(min: number, max: number) {
    this.x = Math.max(min, Math.min(this.x, max));
    this.y = Math.max(min, Math.min(this.y, max));
    return this;
  }

  setX(x: number) {
    this.x = x;
    return this;
  }

  setY(y: number) {
    this.y = y;
    return this;
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  min(v: Vector2) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    return this;
  }

  max(v: Vector2) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    return this;
  }

  minScalar(s: number) {
    this.x = Math.min(this.x, s);
    this.y = Math.min(this.y, s);
    return this;
  }

  maxScalar(s: number) {
    this.x = Math.max(this.x, s);
    this.y = Math.max(this.y, s);
    return this;
  }
}
