import type { MoveDirection } from "../types";
import { calculateFinalPosition } from "./calculateFinalPosition";
import { minTileIndex, maxTileIndex } from "../constants";
import useMapStore from "../stores/map";
import { tileSize } from "../constants";
import * as THREE from "three";

export function endsUpInValidPosition(
  currentPosition: { rowIndex: number; tileIndex: number },
  moves: MoveDirection[]
) {
  // Calculate where the player would end up after the move
  const finalPosition = calculateFinalPosition(
    currentPosition,
    moves
  );

  // Detect if we hit the edge of the board
  if (
    finalPosition.rowIndex === -1 ||
    finalPosition.tileIndex === minTileIndex - 1 ||
    finalPosition.tileIndex === maxTileIndex + 1
  ) {
    // Invalid move, ignore move command
    return false;
  }

  // Detect if we hit a tree
  const finalRow = useMapStore.getState().rows[finalPosition.rowIndex - 1];
  if (
    finalRow &&
    finalRow.type === "forest" &&
    finalRow.trees.some(
      (tree) => tree.tileIndex === finalPosition.tileIndex
    )
  ) {
    // Invalid move, ignore move command
    return false;
  }

  // Check for car collision
  if (finalRow && finalRow.type === "car") {
    // Create player bounding box at the final position
    const playerPosition = new THREE.Vector3(
      finalPosition.tileIndex * tileSize,
      finalPosition.rowIndex * tileSize,
      10 // Player's z position
    );
    
    // Player size (slightly reduced for better gameplay)
    const playerSize = new THREE.Vector3(13, 13, 20);
    
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
    
    // Get current time to calculate vehicle positions
    const now = Date.now();
    
    // Check for collision with each vehicle in the row
    for (const vehicle of finalRow.vehicles) {
      // Calculate vehicle position
      const speed = finalRow.speed / 1000; // Convert to units per millisecond
      const direction = finalRow.direction ? 1 : -1;
      
      // Calculate time elapsed for animation
      const elapsedTime = now % 10000;
      const distanceTraveled = elapsedTime * speed * direction;
      
      // Calculate current x position
      let vehicleX = (vehicle.initialTileIndex * tileSize) + distanceTraveled;
      
      // Handle wrap around
      const roadWidth = tileSize * 20;
      while (vehicleX > roadWidth) vehicleX -= roadWidth * 2;
      while (vehicleX < -roadWidth) vehicleX += roadWidth * 2;
      
      // Make vehicle collision box slightly larger than visual size
      const vehicleSize = new THREE.Vector3(65, 35, 15);
      
      // Create vehicle bounding box
      const vehicleBox = new THREE.Box3(
        new THREE.Vector3(
          vehicleX - vehicleSize.x / 2,
          playerPosition.y - vehicleSize.y / 2,
          0
        ),
        new THREE.Vector3(
          vehicleX + vehicleSize.x / 2,
          playerPosition.y + vehicleSize.y / 2,
          15
        )
      );
      
      // If collision detected, return false to prevent the move
      if (playerBox.intersectsBox(vehicleBox)) {
        return false;
      }
    }
  }

  return true;
}   