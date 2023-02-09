import { createSignal } from "solid-js";

const COLORS = ["red", "orange", "yellow", "green", "aqua", "blue", "purple"];
const frameRate: number = 65;
const pixelSize: number = 30;

const [score, setScore] = createSignal(0);
const [highScore, setHighScore] = createSignal(0);

class Game {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  interval: number | null;
  paused: boolean;
  started: boolean;
  snakeDirection: string;
  snake: Pixel[];
  mouse: Pixel;

  constructor() {
    this.canvas = document.getElementById("snake") as HTMLCanvasElement;
    this.canvas.width = 600;
    this.canvas.height = 600;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    this.interval = null;
    this.paused = true;
    this.started = false;

    this.randomizeMouse();
    this.buildSnake();

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (this.paused) {
        this.unpause();
      }

      if (
        ![38, 40, 37, 39].includes(e.keyCode) &&
        !["Escape", "Spacebar"].includes(e.key)
      ) {
        return;
      }

      e.preventDefault();

      if (e.keyCode === 38) {
        // up arrow pressed
        if (this.snakeDirection !== "d" || this.snake.length === 1) {
          this.snakeDirection = "u";
        }
      } else if (e.keyCode === 40) {
        // down arrow pressed
        if (this.snakeDirection !== "u" || this.snake.length === 1) {
          this.snakeDirection = "d";
        }
      } else if (e.keyCode === 37) {
        // left arrow pressed
        if (this.snakeDirection !== "r" || this.snake.length === 1) {
          this.snakeDirection = "l";
        }
      } else if (e.keyCode === 39) {
        // right arrow pressed
        if (this.snakeDirection !== "l" || this.snake.length === 1) {
          this.snakeDirection = "r";
        }
      } else if (e.key === "Escape" || e.key === "Spacebar") {
        this.pause();
      }
    });

    this.renderFrame();
    this.snakeDirection = "r";
  }

  start() {
    this.interval = setInterval(() => {
      if (!this.paused) {
        if (this.isGameOver()) {
          this.endGame();
        } else {
          this.clearCanvas();
          this.renderFrame();
        }
      }
    }, frameRate);
  }

  pause() {
    this.paused = true;
  }

  unpause() {
    this.paused = false;
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  buildSnake = function () {
    this.snake = [
      new Pixel(pixelSize, pixelSize, COLORS[0], 90, pixelSize * 2),
      new Pixel(pixelSize, pixelSize, COLORS[1], 90 - pixelSize, pixelSize * 2),
      new Pixel(
        pixelSize,
        pixelSize,
        COLORS[2],
        90 - pixelSize * 2,
        pixelSize * 2
      ),
    ];
  };

  incrementSnake = function (snake, snakeDirection) {
    let newX, newY;

    const oldX = snake[0].x;
    const oldY = snake[0].y;

    switch (snakeDirection) {
      case "r":
        newX = oldX - pixelSize;
        newY = oldY;
        break;
      case "l":
        newX = oldX + pixelSize;
        newY = oldY;
        break;
      case "u":
        newX = oldX;
        newY = oldY + pixelSize;
        break;
      case "d":
        newX = oldX;
        newY = oldY - pixelSize;
        break;
      default:
        break;
    }

    setScore((prev) => prev + 1);

    const newSnake = [
      new Pixel(
        pixelSize,
        pixelSize,
        COLORS[this.snake.length % COLORS.length],
        newX,
        newY
      ),
      ...snake,
    ];

    return newSnake;
  };

  updatePixel = function (pixel) {
    let ctx = this.context;
    ctx.fillStyle = pixel.color;
    ctx.fillRect(pixel.x, pixel.y, pixel.width, pixel.height);
  };

  isGameOver = function () {
    const snakeHeadX = this.snake[this.snake.length - 1].x;
    const snakeHeadY = this.snake[this.snake.length - 1].y;

    for (let i = 0; i < this.snake.length - 1; i++) {
      if (snakeHeadX === this.snake[i].x && snakeHeadY === this.snake[i].y) {
        return true;
      }
    }

    return false;
  };

  endGame = function () {
    this.buildSnake();
    this.randomizeMouse();
    this.snakeDirection = "r";
    this.pause();

    if (score() > highScore()) {
      setHighScore(score());
    }

    setScore(0);
  };

  randomizeMouse = function () {
    this.mouseCoordinates = {
      x:
        Math.round(
          (Math.random() * (this.canvas.width - 10 - pixelSize) + 0) / pixelSize
        ) * pixelSize,
      y:
        Math.round(
          (Math.random() * (this.canvas.height - 10 - pixelSize) + 0) /
            pixelSize
        ) * pixelSize,
    };
  };

  renderFrame = function () {
    const snakeDirection = this.snakeDirection;

    let mouse = new Pixel(
      pixelSize,
      pixelSize,
      "#5a5a5a",
      this.mouseCoordinates.x,
      this.mouseCoordinates.y
    );

    this.updatePixel(mouse);

    let prevSnake = [...this.snake];

    for (let i = 0; i < this.snake.length; i++) {
      if (i === this.snake.length - 1) {
        switch (snakeDirection) {
          case "r":
            this.snake[i].x += pixelSize;
            break;
          case "l":
            this.snake[i].x -= pixelSize;
            break;
          case "u":
            this.snake[i].y -= pixelSize;
            break;
          case "d":
            this.snake[i].y += pixelSize;
            break;
          default:
            break;
        }

        if (this.snake[i].x + this.snake[i].width > this.canvas.width) {
          // overflowed right side
          this.snake[i].x = 0;
        } else if (this.snake[i].x < 0) {
          // overflowed left side
          this.snake[i].x = this.canvas.width - this.snake[i].width;
        } else if (
          this.snake[i].y + this.snake[i].height >
          this.canvas.height
        ) {
          // overflowed bottom side
          this.snake[i].y = 0;
        } else if (this.snake[i].y < 0) {
          // overflowed top side
          this.snake[i].y = this.canvas.height - this.snake[i].height;
        }

        if (this.snake[i].x === mouse.x && this.snake[i].y === mouse.y) {
          this.randomizeMouse();
          this.snake = this.incrementSnake(this.snake, snakeDirection);
        }
      } else {
        this.snake[i].x = prevSnake[i + 1].x;
        this.snake[i].y = prevSnake[i + 1].y;
      }

      this.updatePixel(this.snake[i]);
    }
  };
}

class Pixel {
  width: number;
  height: number;
  color: string;
  x: number;
  y: number;

  constructor(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = x;
    this.y = y;
  }
}

function startGame() {
  let game = new Game();
  game.start();
}

export { startGame, score, highScore };
