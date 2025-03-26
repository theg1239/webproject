import * as THREE from "three";
import useMapStore from "./stores/map";
import { state as playerState } from "./stores/player";
import { minTileIndex, maxTileIndex, tileSize } from "./constants";
import { gameState } from "./stores/gameState";

// Track the last collision time to impose a cooldown
let lastCollisionTime = 0;
// Track the start time for vehicles’ cyclic motion; reset on game initialization
let gameStartTime = Date.now();
let debugElements: HTMLElement[] = [];
let lastPlayerPosition: THREE.Vector3 | null = null;

/**
 * Call this at every game initialization to reset the vehicle timing.
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

  // Only process collisions when the game is in playing state
  const shouldProcessCollision = gameState.current.screen === "playing";

  // Only check collision if the player is on a row where collision is possible
  const rowIndex = playerState.currentRow;
  if (rowIndex <= 0) return; // Player is on grass—no collision possible
  const rows = useMapStore.getState().rows;
  const row = rows[rowIndex - 1];
  if (!row) return;

  if (row.type === "car") {
    const tileCenterOffset = tileSize / 2;
    const playerPosition = new THREE.Vector3(
      playerState.currentTile * tileSize + tileCenterOffset,
      playerState.currentRow * tileSize + tileCenterOffset,
      10 // Player's z position remains constant
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

    // Define the player's hitbox using dimensions close to the visual model
    const playerSize = new THREE.Vector3(14, 14, 20);
    const playerBox = new THREE.Box3(
      new THREE.Vector3(
        playerPosition.x - playerSize.x / 2,
        playerPosition.y - playerSize.y / 2,
        0 // starting from ground level
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

    // Add a grace period after a row change to avoid false collision triggers
    const rowChangeGracePeriod = 300; // in milliseconds
    const lastRowChangeTime = playerState.lastRowChangeTime || 0;
    const isInGracePeriod = now - lastRowChangeTime < rowChangeGracePeriod;

    // Set up road boundaries for the row
    const beginningOfRow = (minTileIndex - 2) * tileSize + tileCenterOffset;
    const endOfRow = (maxTileIndex + 2) * tileSize + tileCenterOffset;
    const distanceRange = endOfRow - beginningOfRow;

    // Compute the speed in units per millisecond and a cycle time for vehicles to traverse the row
    const speedPerMs = row.speed / 1000;
    const cycleTime = distanceRange / speedPerMs;
    // Use modulo arithmetic so positions wrap smoothly
    const elapsed = (now - gameStartTime) % cycleTime;

    for (const vehicle of row.vehicles) {
      const baseX = vehicle.initialTileIndex * tileSize + tileCenterOffset;
      const baseOffset = baseX - beginningOfRow;
      let vehicleX: number;
      if (row.direction) {
        // Vehicle moves to the right
        vehicleX = beginningOfRow + mod(baseOffset + elapsed * speedPerMs, distanceRange);
      } else {
        // Vehicle moves to the left
        vehicleX = beginningOfRow + mod(baseOffset - elapsed * speedPerMs, distanceRange);
      }

      // Define the vehicle hitbox using the tank hull dimensions.
      // This covers the full visual extent of the car so that if the player enters it midway, the collision is detected.
      const vehicleSize = new THREE.Vector3(60, 30, 15); 
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
        // Use a different color if collision is detected
        const collidingDebug = playerBox.intersectsBox(vehicleBox) || vehicleBox.containsPoint(playerPosition);
        const color = collidingDebug ? "red" : "yellow";
        const distance = Math.abs(vehicleX - playerPosition.x);
        const vehicleBoxEl = createDebugBox(
          vehicleBox,
          color,
          `Vehicle (${vehicle.initialTileIndex}) - ${Math.round(distance)}`
        );
        debugElements.push(vehicleBoxEl);
      }

      // Use a combined collision test:
      // either the player hitbox intersects the vehicle hitbox
      // or the player's center is contained within the vehicle hitbox.
      const isColliding = playerBox.intersectsBox(vehicleBox) || vehicleBox.containsPoint(playerPosition);

      if (isColliding && shouldProcessCollision && now - lastCollisionTime > 100 && !isInGracePeriod) {
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
