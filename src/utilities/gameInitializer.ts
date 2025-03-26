import { resetCamera } from "../stores/camera";
import { initializePlayerPosition } from "../stores/player";
import useMapStore from "../stores/map";
import { state as scoreState } from "../stores/score";
import { gameState } from "../stores/gameState";

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
  
  // Reset game state
  document.body.classList.remove('game-over');
  
  // Set the screen as requested
  gameState.setScreen(setScreen);
  
  // Set home sub-screen if going to home and a sub-screen is specified
  if (setScreen === 'home' && homeSubScreen) {
    gameState.setHomeSubScreen(homeSubScreen as any);
  }
} 