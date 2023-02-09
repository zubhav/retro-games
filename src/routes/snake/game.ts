import { createSignal } from "solid-js";

const COLORS: string[] = ["blue", "red", "yellow", "purple", "aqua", "orange"];
const frameRate: number = 70;
const pixelSize: number = 10;

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
    this.canvas.width = 300;
    this.canvas.height = 300;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    this.interval = null;
    this.paused = true;
    this.started = false;

    this.randomizeMouse();
    this.buildSnake();

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      e.preventDefault();

      if (this.paused) {
        this.unpause();
      }

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
      new Pixel(pixelSize, pixelSize, "blue", 90, 50),
      new Pixel(pixelSize, pixelSize, "red", 80, 50),
      new Pixel(pixelSize, pixelSize, "green", 70, 50),
    ];
  };

  incrementSnake = function (snake, snakeDirection) {
    let newX, newY;

    switch (snakeDirection) {
      case "r":
        newX = snake[0].x - 10;
        newY = snake[0].y;
        break;
      case "l":
        newX = snake[0].x + 10;
        newY = snake[0].y;
        break;
      case "u":
        newX = snake[0].x;
        newY = snake[0].y + 10;
        break;
      case "d":
        newX = snake[0].x;
        newY = snake[0].y - 10;
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
      x: Math.round((Math.random() * (290 - 10) + 0) / 10) * 10,
      y: Math.round((Math.random() * (290 - 10) + 0) / 10) * 10,
    };
  };

  renderFrame = function () {
    const snakeDirection = this.snakeDirection;

    let mouse = new Pixel(
      pixelSize,
      pixelSize,
      "black",
      this.mouseCoordinates.x,
      this.mouseCoordinates.y
    );

    this.updatePixel(mouse);

    let prevSnake = [...this.snake];

    for (let i = 0; i < this.snake.length; i++) {
      if (i === this.snake.length - 1) {
        switch (snakeDirection) {
          case "r":
            this.snake[i].x += 10;
            break;
          case "l":
            this.snake[i].x -= 10;
            break;
          case "u":
            this.snake[i].y -= 10;
            break;
          case "d":
            this.snake[i].y += 10;
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
