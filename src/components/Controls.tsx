import { queueMove } from "../stores/player";
import "./Controls.css";

export function Controls() {
  return (
    <div id="controls" className="controls">
      <div className="movement-controls">
        <button type="button" onClick={() => queueMove("forward")}>▲</button>
        <button type="button" onClick={() => queueMove("left")}>◀</button>
        <button type="button" onClick={() => queueMove("backward")}>▼</button>
        <button type="button" onClick={() => queueMove("right")}>▶</button>
      </div>
    </div>
  );
}