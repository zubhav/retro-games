import { createSignal, Show } from "solid-js";
import { startGame, score, highScore } from "./game";

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

      <canvas height="300" width="300" id="snake"></canvas>
    </main>
  );
}