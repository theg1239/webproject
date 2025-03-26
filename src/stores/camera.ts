import * as THREE from "three";

// Default camera offset values (isometric view)
const DEFAULT_OFFSET_X = 300;
const DEFAULT_OFFSET_Y = -300;
const DEFAULT_OFFSET_Z = 300;

// Store to manage camera state
export const state = {
  // Values for camera relative position to player
  offsetX: DEFAULT_OFFSET_X,
  offsetY: DEFAULT_OFFSET_Y,
  offsetZ: DEFAULT_OFFSET_Z,
  // Fixed up vector for consistent orientation
  upX: 0,
  upY: 0,
  upZ: 1,
};

// Apply the stored camera position to a camera
export function updateCameraPosition(camera: THREE.Camera, playerPosition: THREE.Vector3) {
  camera.position.set(
    playerPosition.x + state.offsetX,
    playerPosition.y + state.offsetY,
    playerPosition.z + state.offsetZ
  );
  camera.up.set(state.upX, state.upY, state.upZ);
  camera.lookAt(playerPosition);
}

// Reset camera to default state
export function resetCamera() {
  state.offsetX = DEFAULT_OFFSET_X;
  state.offsetY = DEFAULT_OFFSET_Y;
  state.offsetZ = DEFAULT_OFFSET_Z;
  state.upX = 0;
  state.upY = 0;
  state.upZ = 1;
} 