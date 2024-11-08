import { createStore, produce } from "solid-js/store";
import { onCleanup, onMount } from "solid-js";

enum Stance {
  Rest,
  Stand,
  Crouch,
  Move,
}

enum Direction {
  Up,
  Right,
  Down,
  Left,
}

const stances: Record<Stance, string> = {
  [Stance.Rest]: "Rest",
  [Stance.Stand]: "Stand",
  [Stance.Crouch]: "Crouch",
  [Stance.Move]: "Move",
};

export default function App() {
  const [state, setState] = createStore({
    actions: 0,
    stance: Stance.Stand,
    x: 0,
    y: 0,
  });

  function onToggleCrouch() {
    setState(
      produce((state) => {
        state.stance =
          state.stance === Stance.Crouch ? Stance.Stand : Stance.Crouch;
      }),
    );
  }

  function onRest() {
    setState(
      produce((state) => {
        switch (state.stance) {
          case Stance.Rest:
            state.actions += 2;
            break;
          case Stance.Crouch:
            state.actions += 1;
            state.stance = Stance.Rest;
            break;
          default:
            state.stance = Stance.Crouch;
        }
      }),
    );
  }

  function onMove(direction: Direction) {
    setState(
      produce((state) => {
        switch (state.stance) {
          case Stance.Stand:
          case Stance.Move:
            const delta = Math.min(
              state.stance === Stance.Move ? 2 : 1,
              state.actions,
            );
            if (state.actions < delta) return;
            state.actions -= delta;
            switch (direction) {
              case Direction.Up:
                state.y += delta;
                break;
              case Direction.Right:
                state.y += delta;
                break;
              case Direction.Down:
                state.y -= delta;
                break;
              case Direction.Left:
                state.x -= delta;
                break;
            }
            if (state.stance === Stance.Stand) state.stance = Stance.Move;
            break;
          default:
            state.stance = Stance.Stand;
        }
      }),
    );
  }

  function onKeyPress(e: KeyboardEvent) {
    switch (e.key) {
      case "w":
        return onMove(Direction.Up);
      case "d":
        return onMove(Direction.Right);
      case "s":
        return onMove(Direction.Down);
      case "a":
        return onMove(Direction.Left);
      case "z":
        return onToggleCrouch();
      case "x":
        return onRest();
    }
  }

  const listeners: {
    [K in keyof WindowEventMap]?: (this: Window, ev: WindowEventMap[K]) => any;
  } = { keypress: onKeyPress };

  onMount(() => {
    for (const key in listeners) {
      // @ts-ignore
      window.addEventListener(key, listeners[key]);
    }
  });
  onCleanup(() => {
    for (const key in listeners) {
      // @ts-ignore
      window.removeEventListener(key, listeners[key]);
    }
  });

  return (
    <main>
      <fieldset>
        <legend>Stance: {stances[state.stance]}</legend>
        <button onClick={onRest}>Rest</button>
        <button onClick={onToggleCrouch}>
          {state.stance === Stance.Stand ? "Crouch" : "Stand"}
        </button>
      </fieldset>
      <fieldset disabled={state.actions === 0}>
        <legend>Move</legend>
        <button onClick={[onMove, Direction.Left]}>Left</button>
        <button onClick={[onMove, Direction.Up]}>Up</button>
        <button onClick={[onMove, Direction.Down]}>Down</button>
        <button onClick={[onMove, Direction.Right]}>Right</button>
      </fieldset>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </main>
  );
}
