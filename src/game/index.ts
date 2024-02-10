import { Arena } from "./Arena";
import { Canvas } from "./Canvas";

const canvas = new Canvas("#boxhead-game", 1200, 720);
canvas.focus();
new Arena(canvas, 1920, 1920);
