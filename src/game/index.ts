import { Arena } from "./Arena";
import { Canvas } from "./Canvas";
const speed = 24;

const canvas = new Canvas("#boxhead-game", 1200, 720);
canvas.focus();
const arena = new Arena(canvas, 1920, 1920);

canvas.canvas.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  switch (e.key) {
    case "w":
      arena.player.vy -= speed;
      break;
    case "a":
      arena.player.vx -= speed;
      break;
    case "s":
      arena.player.vy += speed;
      break;
    case "d":
      arena.player.vx += speed;
      break;
  }
});

canvas.canvas.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      arena.player.vy += speed;
      break;
    case "a":
      arena.player.vx += speed;
      break;
    case "s":
      arena.player.vy -= speed;
      break;
    case "d":
      arena.player.vx -= speed;
      break;
  }
});
