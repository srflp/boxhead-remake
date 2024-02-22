// code from https://sszczep.dev/blog/ray-casting-in-2d-game-engines
// originally from https://playtechs.blogspot.com/2007/03/raytracing-on-grid.html
// modified by me
export function bresenham(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  visit: (x: number, y: number) => boolean | void,
) {
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let x = x0;
  let y = y0;
  let n = 1 + dx + dy;
  const x_inc = x1 > x0 ? 1 : -1;
  const y_inc = y1 > y0 ? 1 : -1;
  let error = dx - dy;
  dx *= 2;
  dy *= 2;
  for (; n > 0; --n) {
    if (visit(x, y)) return;
    if (error > 0) {
      x += x_inc;
      error -= dy;
    } else {
      y += y_inc;
      error += dx;
    }
  }
}
