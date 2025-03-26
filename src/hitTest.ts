import * as THREE from "three";
import useMapStore from "./stores/map";
import { state as playerState } from "./stores/player";
import { minTileIndex, maxTileIndex, tileSize } from "./constants";
import { gameState } from "./stores/gameState";

// Remove DOM elements references since we're using React components now
let lastCollisionTime = 0;
let gameStartTime = Date.now();
let debugElements: HTMLElement[] = [];
let lastPlayerPosition: THREE.Vector3 | null = null;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

// Helper function to create or update debug box visualization
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

// Function to clean up all debug visualizations
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

// Remove DOM event listeners since we're using React

// These functions are now handled by the GameOverMenu component

export function hitTest(debug = false) {
  // Remove cooldown check - we want to detect collisions every frame
  const now = Date.now();

  // If debug visualization is no longer enabled, clean up
  if (!debug) {
    cleanupDebugVisualizations();
  }

  // If we're not in playing state, don't handle collisions, but still check
  const shouldProcessCollision = gameState.current.screen === "playing";

  // Get the row the player is currently on
  const rowIndex = playerState.currentRow;
  if (rowIndex <= 0) return; // Player is on grass, no collision possible

  const rows = useMapStore.getState().rows;
  const row = rows[rowIndex - 1];
  if (!row) return;

  // Only check car lanes for collisions
  if (row.type === "car") {
    // Create player bounding box
    const tileCenterOffset = tileSize / 2;

    const playerPosition = new THREE.Vector3(
      playerState.currentTile * tileSize + tileCenterOffset,
      playerState.currentRow * tileSize + tileCenterOffset,
      10 // Player's z position remains the same
    );

    // Check if player position has changed
    const positionChanged =
      !lastPlayerPosition ||
      lastPlayerPosition.x !== playerPosition.x ||
      lastPlayerPosition.y !== playerPosition.y;

    // Print player position only when it changes
    if (debug && positionChanged) {
      console.log(
        `Player Position: Tile=${playerState.currentTile}, Row=${playerState.currentRow}, X=${playerPosition.x}, Y=${playerPosition.y}`
      );

      // Store the position for comparison next time
      lastPlayerPosition = playerPosition.clone();
    }

    // Player size based on actual mesh size from Player.tsx
    // The visual model in Player.tsx uses boxGeometry args={[15, 15, 20]}
    const playerSize = new THREE.Vector3(12, 12, 20); // Slightly smaller hitbox for more forgiving collisions

    const playerBox = new THREE.Box3(
      new THREE.Vector3(
        playerPosition.x - playerSize.x / 2,
        playerPosition.y - playerSize.y / 2,
        playerPosition.z
      ),
      new THREE.Vector3(
        playerPosition.x + playerSize.x / 2,
        playerPosition.y + playerSize.y / 2,
        playerPosition.z + playerSize.z
      )
    );

    // Visualize player hitbox if debug is enabled
    if (debug) {
      cleanupDebugVisualizations(); // Clear previous visualizations first
      const playerBoxEl = createDebugBox(playerBox, "lime", "Player");
      debugElements.push(playerBoxEl);
    }

    // Set up road boundaries
    const beginningOfRow = (minTileIndex - 2) * tileSize + tileCenterOffset;
    const endOfRow = (maxTileIndex + 2) * tileSize + tileCenterOffset;
    const distanceRange = endOfRow - beginningOfRow;

    // Use the elapsed time since the game started
    const elapsedTime = now - gameStartTime;
    const speed = row.speed / 1000; // speed in units/ms

    // Check collision with each vehicle in the row
    for (const vehicle of row.vehicles) {
      const baseX = vehicle.initialTileIndex * tileSize + tileCenterOffset;
      const baseOffset = baseX - beginningOfRow;
      let vehicleX: number;

      if (row.direction) {
        // Vehicle moves to the right
        vehicleX =
          beginningOfRow + mod(baseOffset + elapsedTime * speed, distanceRange);
      } else {
        // Vehicle moves to the left
        vehicleX =
          beginningOfRow + mod(baseOffset - elapsedTime * speed, distanceRange);
      }

      // Adjusted vehicle size for more accurate collision detection
      const vehicleSize = new THREE.Vector3(40, 25, 15); // Slightly smaller than visual size

      // Calculate vehicleBox using the row's expected y coordinate rather than the player's
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
          15
        )
      );

      // Visualize vehicles if debug is enabled
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

      // Check for collision
      const isColliding = playerBox.intersectsBox(vehicleBox);

      // Print collision info if debugging
      if (debug && isColliding) {
        const overlapX =
          Math.min(playerBox.max.x, vehicleBox.max.x) -
          Math.max(playerBox.min.x, vehicleBox.min.x);
        const overlapY =
          Math.min(playerBox.max.y, vehicleBox.max.y) -
          Math.max(playerBox.min.y, vehicleBox.min.y);
        console.log(
          `COLLISION DETECTED with vehicle at tile ${
            vehicle.initialTileIndex
          }! Overlap: X=${overlapX.toFixed(1)}, Y=${overlapY.toFixed(1)}`
        );
      }

      // Only process collision if enough time has passed since the last collision
      if (
        isColliding &&
        shouldProcessCollision &&
        now - lastCollisionTime > 500
      ) {
        // Calculate overlap to decide if collision is valid
        const overlapX =
          Math.min(playerBox.max.x, vehicleBox.max.x) -
          Math.max(playerBox.min.x, vehicleBox.min.x);
        const overlapY =
          Math.min(playerBox.max.y, vehicleBox.max.y) -
          Math.max(playerBox.min.y, vehicleBox.min.y);

        // Require a more significant X overlap for collision to trigger
        // This will avoid grazing collisions that don't look visually correct
        if (overlapX > 10 && overlapY > 7) {
          lastCollisionTime = now;

          // Immediately handle the collision
          playerState.movesQueue = [];
          gameState.setScreen("game-over");
          gameState.notifyListeners();
          document.body.classList.add("game-over");

          // Break since we've found a collision
          break;
        }
      }
    }
  }
}
