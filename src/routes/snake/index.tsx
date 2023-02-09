import { Show } from "solid-js";
import { startGame, score, highScore } from "./game";
import "./index.css";

export default function Snake() {
  if (typeof document !== "undefined") {
    startGame();
  }

  return (
    <main>
      <h1>
        <a href="/">Home</a> {">"} Snake
      </h1>
      <p>
        Current score: <b>{score()}</b>
        <Show when={highScore() > 0}>
          {" "}
          - High Score: <b>{highScore()}</b>
        </Show>
      </p>
      <div>
        <canvas height="600" width="600" id="snake"></canvas>
      </div>
    </main>
  );
}
