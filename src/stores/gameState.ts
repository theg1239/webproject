// Base game state types
export type GameScreenType = 'home' | 'playing' | 'paused' | 'game-over';

// Home screen sub-states
export type HomeSubScreen = 'main' | 'settings' | 'credits';

// Game state interface
export interface GameStateInterface {
  screen: GameScreenType;
  homeSubScreen: HomeSubScreen;
  previousScreen?: GameScreenType;
}

// Global store for game state
export const gameState = {
  // Current state
  current: {
    screen: 'home' as GameScreenType,
    homeSubScreen: 'main' as HomeSubScreen,
    previousScreen: undefined as GameScreenType | undefined
  } as GameStateInterface,
  
  // Listeners
  listeners: [] as Array<(state: GameStateInterface) => void>,
  
  // Set main screen state
  setScreen: (screen: GameScreenType) => {
    // Save previous screen for navigation history
    gameState.current.previousScreen = gameState.current.screen;
    gameState.current.screen = screen;
    gameState.notifyListeners();
  },
  
  // Set home sub-screen
  setHomeSubScreen: (subScreen: HomeSubScreen) => {
    gameState.current.homeSubScreen = subScreen;
    gameState.notifyListeners();
  },
  
  // Go back to previous screen if available
  goBack: () => {
    if (gameState.current.previousScreen) {
      const temp = gameState.current.screen;
      gameState.current.screen = gameState.current.previousScreen;
      gameState.current.previousScreen = temp;
      gameState.notifyListeners();
    }
  },
  
  // Handle Escape key
  handleEscape: () => {
    // In home sub-screens, go back to main home
    if (gameState.current.screen === 'home' && gameState.current.homeSubScreen !== 'main') {
      gameState.setHomeSubScreen('main');
      return;
    }
    
    // In pause screen, resume game
    if (gameState.current.screen === 'paused') {
      gameState.setScreen('playing');
      return;
    }
    
    // In playing screen, pause game
    if (gameState.current.screen === 'playing') {
      gameState.setScreen('paused');
      return;
    }
    
    // In game-over screen, do nothing (the retry/quit buttons handle this state)
    if (gameState.current.screen === 'game-over') {
      return;
    }
  },
  
  // Pause/resume toggle
  togglePause: () => {
    if (gameState.current.screen === 'paused') {
      gameState.setScreen('playing');
    } else if (gameState.current.screen === 'playing') {
      gameState.setScreen('paused');
    }
    // Don't allow toggling pause when in game-over state
  },
  
  // Subscribe to state changes
  subscribe: (listener: (state: GameStateInterface) => void) => {
    gameState.listeners.push(listener);
    return () => {
      gameState.listeners = gameState.listeners.filter(l => l !== listener);
    };
  },
  
  // Notify all listeners of state changes
  notifyListeners: () => {
    gameState.listeners.forEach(listener => listener(gameState.current));
  }
}; 