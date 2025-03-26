import { resetCamera } from "../stores/camera";
import { initializePlayerPosition } from "../stores/player";
import useMapStore from "../stores/map";
import { state as scoreState } from "../stores/score";
import { gameState } from "../stores/gameState";
import { resetGameStartTime } from "../hitTest"; // <-- New import

/**
 * Initializes the game state completely, resetting player position, camera,
 * map, and score. Also immediately updates the visual position of the player.
 */
export function initializeGame(setScreen: 'playing' | 'home' = 'playing', homeSubScreen?: string) {
  // Reset player with immediate position update
  initializePlayerPosition();

  // Reset camera to default position
  resetCamera();

  // Reset map
  useMapStore.getState().resetMap();

  // Reset score
  scoreState.reset();

  // Remove any game-over classes
  document.body.classList.remove('game-over');

  // Reset the collision timer
  resetGameStartTime();

  // Set the screen as requested
  gameState.setScreen(setScreen);

  // If returning to home with a sub-screen, update accordingly
  if (setScreen === 'home' && homeSubScreen) {
    gameState.setHomeSubScreen(homeSubScreen as any);
  }
}
