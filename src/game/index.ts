import { Canvas } from "./Canvas";
import { ViewManager } from "./ViewManager";

const canvas = new Canvas("#boxhead-game", 1200, 720);
canvas.focus();

new ViewManager(canvas);
