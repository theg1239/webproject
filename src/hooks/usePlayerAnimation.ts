import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { tileSize } from "../constants";
import { state, stepCompleted } from "../stores/player";
import { updateCameraPosition } from "../stores/camera";

export default function usePlayerAnimation(
  ref: React.RefObject<THREE.Group | null>,
  camera: THREE.Camera
) {
  const moveClock = new THREE.Clock(false);

  useFrame(() => {
    if (!ref.current) return;
    if (!state.movesQueue.length && !state.shouldForcePositionUpdate) return;
    const player = ref.current;

    // Handle immediate position update when flag is set
    if (state.shouldForcePositionUpdate) {
      // Set position directly to current state values
      player.position.x = state.currentTile * tileSize;
      player.position.y = state.currentRow * tileSize;
      
      // Reset any animation effects
      player.children[0].position.z = 0;
      player.children[0].rotation.z = 0;
      
      // Update camera position
      updateCameraPosition(camera, player.position);
      
      // Reset the flag
      state.shouldForcePositionUpdate = false;
      return;
    }

    if (!moveClock.running) moveClock.start();

    const stepTime = 0.2; // Seconds it takes to take a step
    const progress = Math.min(
      1,
      moveClock.getElapsedTime() / stepTime
    );

    setPosition(player, progress);
    setRotation(player, progress);

    // Update camera position to follow player
    updateCameraPosition(camera, player.position);

    // Once a step has ended
    if (progress >= 1) {
      stepCompleted();
      moveClock.stop();
    }
  });

  // Ensure player always faces forward and camera follows
  useFrame(() => {
    if (!ref.current) return;
    const player = ref.current;
    
    // Keep player rotation fixed forward
    player.rotation.z = 0;
    
    // Keep camera updated with player position even when not moving
    updateCameraPosition(camera, player.position);
  });
}

function setPosition(player: THREE.Group, progress: number) {
  const startX = state.currentTile * tileSize;
  const startY = state.currentRow * tileSize;
  let endX = startX;
  let endY = startY;

  if (state.movesQueue[0] === "left") endX -= tileSize;
  if (state.movesQueue[0] === "right") endX += tileSize;
  if (state.movesQueue[0] === "forward") endY += tileSize;
  if (state.movesQueue[0] === "backward") endY -= tileSize;

  player.position.x = THREE.MathUtils.lerp(startX, endX, progress);
  player.position.y = THREE.MathUtils.lerp(startY, endY, progress);
  player.children[0].position.z = Math.sin(progress * Math.PI) * 8;
}

function setRotation(player: THREE.Group, progress: number) {
  let endRotation = 0;
  if (state.movesQueue[0] === "forward") endRotation = 0;
  if (state.movesQueue[0] === "left") endRotation = Math.PI / 2;
  if (state.movesQueue[0] === "right") endRotation = -Math.PI / 2;
  if (state.movesQueue[0] === "backward") endRotation = Math.PI;

  player.children[0].rotation.z = THREE.MathUtils.lerp(
    player.children[0].rotation.z,
    endRotation,
    progress
  );
}