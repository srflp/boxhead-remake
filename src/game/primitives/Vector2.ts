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

  add(vector: Vector2) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  divideScalar(scalar: number) {
    this.x /= scalar;
    this.y /= scalar;
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
}
