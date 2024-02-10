const canvas = document.querySelector<HTMLCanvasElement>("#boxhead-game");
if (!canvas) throw new Error("Canvas not found");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Context not found");

const speed = 24;
const canvasWidth = 1200;
const canvasHeight = 720;

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max));
};

class Arena {
  width: number;
  height: number;
  entities: Player[];
  player: Player;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.entities = [];
    this.player = new Player(this, 48, 48, 48, 48);
  }
  addEntity(entity: Player) {
    this.entities.push(entity);
  }
  mapToCanvas(x: number, y: number) {
    let viewportX = this.player.x - (canvasWidth - this.player.width) / 2;
    let viewportY = this.player.y - (canvasHeight - this.player.height) / 2;
    viewportX = clamp(viewportX, 0, this.width - canvasWidth);
    viewportY = clamp(viewportY, 0, this.height - canvasHeight);
    let canvasX = x - viewportX;
    let canvasY = y - viewportY;
    return [canvasX, canvasY] as const;
  }
  fillRect(x: number, y: number, width: number, height: number) {
    ctx?.fillRect(...this.mapToCanvas(x, y), width, height);
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "black";

    // borders
    this.fillRect(0, 0, this.width, 48); // top
    this.fillRect(0, this.height - 48, this.width, 48); // bottom
    this.fillRect(0, 0, 48, this.height); // left
    this.fillRect(this.width - 48, 0, 48, this.height); // right

    this.fillRect(1000, 1000, 48, 48); // left

    for (let i = 0; i < this.width; i += 48) {
      this.fillRect(i, 0, 1, this.height);
    }
    for (let i = 0; i < this.height; i += 48) {
      this.fillRect(0, i, this.width, 1);
    }

    this.player.draw(ctx);
    // const xDist = canvasWidth - this.width;
    // for (const entity of this.entities) {
    //   entity.draw(ctx);
    // }
  }
}

class Player {
  arena: Arena;
  #x: number;
  #y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  constructor(
    arena: Arena,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    this.arena = arena;
    this.#x = x;
    this.#y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
  }
  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }
  get cx() {
    return this.x + this.width / 2;
  }
  get cy() {
    return this.y + this.height / 2;
  }
  set x(x: number) {
    this.#x = Math.max(0, Math.min(x, this.arena.width - this.width));
  }
  set y(y: number) {
    this.#y = Math.max(0, Math.min(y, this.arena.height - this.height));
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    if (this.vx && this.vy) {
      this.x = this.x + this.vx / Math.sqrt(2);
      this.y = this.y + this.vy / Math.sqrt(2);
    } else {
      this.x = this.x + this.vx;
      this.y = this.y + this.vy;
    }

    const [canvasX, canvasY] = this.arena.mapToCanvas(this.x, this.y);

    ctx.fillRect(canvasX, canvasY, this.width, this.height);
    ctx.fillStyle = "white";

    ctx.fillText(
      Math.round(this.x) + " " + Math.round(this.y),
      canvasX,
      canvasY + 10,
    );
  }
}

const arena = new Arena(1920, 1920);

canvas.addEventListener("keydown", (e) => {
  // console.log(e);
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

canvas.addEventListener("keyup", (e) => {
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

const update = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  arena.draw(ctx);
  requestAnimationFrame(update);
};
update();
