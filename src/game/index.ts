import { Arena } from "./Arena";
import { Canvas } from "./Canvas";
import { WelcomeView } from "./WelcomeView";

const canvas = new Canvas("#boxhead-game", 1200, 720);
canvas.focus();

// new WelcomeView(canvas);

new Arena(canvas, 1920, 1920);
