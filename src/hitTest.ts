import * as THREE from "three";
import useMapStore from "./stores/map";
import { state as playerState } from "./stores/player";
import { minTileIndex, maxTileIndex, tileSize } from "./constants";
import { gameState } from "./stores/gameState";

let lastCollisionTime = 0;
let gameStartTime = Date.now();
let debugElements: HTMLElement[] = [];
let lastPlayerPosition: THREE.Vector3 | null = null;

/**
 * Resets the game start time and collision timer.
 * Call this at every game initialization.
 */
export function resetGameStartTime() {
  gameStartTime = Date.now();
  lastCollisionTime = 0;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function createDebugBox(
  box: THREE.Box3,
  color: string,
  label: string
): HTMLElement {
  const element = document.createElement("div");
  element.style.position = "absolute";
  element.style.border = `2px solid ${color}`;
  element.style.background = `${color}33`; // 20% opacity
  element.style.zIndex = "1000";
  element.style.pointerEvents = "none";
  element.style.boxSizing = "border-box";
  element.style.left = `${box.min.x}px`;
  element.style.top = `${box.min.y}px`;
  element.style.width = `${box.max.x - box.min.x}px`;
  element.style.height = `${box.max.y - box.min.y}px`;
  element.setAttribute("data-debug", "true");

  // Label
  const labelElement = document.createElement("div");
  labelElement.style.position = "absolute";
  labelElement.style.top = "-20px";
  labelElement.style.left = "0";
  labelElement.style.color = color;
  labelElement.style.backgroundColor = "rgba(0,0,0,0.5)";
  labelElement.style.padding = "2px 4px";
  labelElement.style.fontSize = "10px";
  labelElement.style.whiteSpace = "nowrap";
  labelElement.textContent = label;
  element.appendChild(labelElement);

  document.body.appendChild(element);
  return element;
}

function cleanupDebugVisualizations() {
  // Remove all previous debug elements
  debugElements.forEach((el) => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
  debugElements = [];

  // Also clean up any stray debug elements that might have been missed
  document.querySelectorAll('[data-debug="true"]').forEach((el) => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
}

export function hitTest(debug = false) {
  const now = Date.now();

  // Clean up debug visuals if debugging is off
  if (!debug) {
    cleanupDebugVisualizations();
  }

  const shouldProcessCollision = gameState.current.screen === "playing";

  // Only check collision if player is on a row where collision is possible
  const rowIndex = playerState.currentRow;
  if (rowIndex <= 0) return; // On grass—no collision
  const rows = useMapStore.getState().rows;
  const row = rows[rowIndex - 1];
  if (!row) return;

  if (row.type === "car") {
    const tileCenterOffset = tileSize / 2;
    const playerPosition = new THREE.Vector3(
      playerState.currentTile * tileSize + tileCenterOffset,
      playerState.currentRow * tileSize + tileCenterOffset,
      10 // Player's z position
    );

    // Log player position if it changes (for debugging)
    const positionChanged =
      !lastPlayerPosition ||
      lastPlayerPosition.x !== playerPosition.x ||
      lastPlayerPosition.y !== playerPosition.y;
    if (debug && positionChanged) {
      console.log(
        `Player Position: Tile=${playerState.currentTile}, Row=${playerState.currentRow}, X=${playerPosition.x}, Y=${playerPosition.y}`
      );
      lastPlayerPosition = playerPosition.clone();
    }

    // Define player hitbox (match visual size closely)
    const playerSize = new THREE.Vector3(14, 14, 20);
    const playerBox = new THREE.Box3(
      new THREE.Vector3(
        playerPosition.x - playerSize.x / 2,
        playerPosition.y - playerSize.y / 2,
        0 // start at ground level
      ),
      new THREE.Vector3(
        playerPosition.x + playerSize.x / 2,
        playerPosition.y + playerSize.y / 2,
        playerSize.z
      )
    );

    if (debug) {
      cleanupDebugVisualizations();
      const playerBoxEl = createDebugBox(playerBox, "lime", "Player");
      debugElements.push(playerBoxEl);
    }

    // Grace period after row change (in ms)
    const rowChangeGracePeriod = 300;
    const lastRowChangeTime = playerState.lastRowChangeTime || 0;
    const isInGracePeriod = now - lastRowChangeTime < rowChangeGracePeriod;

    // Set up road boundaries for the row
    const beginningOfRow = (minTileIndex - 2) * tileSize + tileCenterOffset;
    const endOfRow = (maxTileIndex + 2) * tileSize + tileCenterOffset;
    const distanceRange = endOfRow - beginningOfRow;

    // Compute speed per millisecond
    const speedPerMs = row.speed / 1000;
    // Calculate the cycle time (ms to traverse the row)
    const cycleTime = distanceRange / speedPerMs;
    // Use modulo arithmetic so positions wrap smoothly
    const elapsed = (now - gameStartTime) % cycleTime;

    let vehicleX: number;
    for (const vehicle of row.vehicles) {
      const baseX = vehicle.initialTileIndex * tileSize + tileCenterOffset;
      const baseOffset = baseX - beginningOfRow;
      if (row.direction) {
        // Moving to the right
        vehicleX = beginningOfRow + mod(baseOffset + elapsed * speedPerMs, distanceRange);
      } else {
        // Moving to the left
        vehicleX = beginningOfRow + mod(baseOffset - elapsed * speedPerMs, distanceRange);
      }

      // Use a hitbox size that matches the visual size closely
      const vehicleSize = new THREE.Vector3(38, 22, 20);
      const vehicleY = playerState.currentRow * tileSize + tileCenterOffset;
      const vehicleBox = new THREE.Box3(
        new THREE.Vector3(
          vehicleX - vehicleSize.x / 2,
          vehicleY - vehicleSize.y / 2,
          0
        ),
        new THREE.Vector3(
          vehicleX + vehicleSize.x / 2,
          vehicleY + vehicleSize.y / 2,
          vehicleSize.z
        )
      );

      if (debug) {
        const isColliding = playerBox.intersectsBox(vehicleBox);
        const color = isColliding ? "red" : "yellow";
        const distance = Math.abs(vehicleX - playerPosition.x);
        const vehicleBoxEl = createDebugBox(
          vehicleBox,
          color,
          `Vehicle (${vehicle.initialTileIndex}) - ${Math.round(distance)}`
        );
        debugElements.push(vehicleBoxEl);
      }

      const isColliding = playerBox.intersectsBox(vehicleBox);
      if (debug && isColliding) {
        const overlapX =
          Math.min(playerBox.max.x, vehicleBox.max.x) -
          Math.max(playerBox.min.x, vehicleBox.min.x);
        const overlapY =
          Math.min(playerBox.max.y, vehicleBox.max.y) -
          Math.max(playerBox.min.y, vehicleBox.min.y);
        console.log(
          `COLLISION DETECTED with vehicle at tile ${vehicle.initialTileIndex}! Overlap: X=${overlapX.toFixed(
            1
          )}, Y=${overlapY.toFixed(1)}`
        );
      }

      // Process collision if:
      // - a collision is detected,
      // - the game is in playing state,
      // - enough time has passed since the last collision (cooldown now 100ms),
      // - and we are not in a grace period.
      if (
        isColliding &&
        shouldProcessCollision &&
        now - lastCollisionTime > 100 &&
        !isInGracePeriod
      ) {
        const overlapX =
          Math.min(playerBox.max.x, vehicleBox.max.x) -
          Math.max(playerBox.min.x, vehicleBox.min.x);
        const overlapY =
          Math.min(playerBox.max.y, vehicleBox.max.y) -
          Math.max(playerBox.min.y, vehicleBox.min.y);

        if (overlapX > 5 && overlapY > 5) {
          lastCollisionTime = now;
          playerState.movesQueue = [];
          gameState.setScreen("game-over");
          gameState.notifyListeners();
          document.body.classList.add("game-over");
          break;
        }
      }
    }
  }
}
