import { useState, useEffect } from 'react'
import Game from './Game'
import { HomeScreen } from './components/HomeScreen'
import { PauseMenu } from './components/PauseMenu'
import { resetCamera } from './stores/camera'
import { resetPlayer } from './stores/player'
import useMapStore from './stores/map'
import { state as scoreState } from './stores/score'
import { gameState, GameStateInterface, HomeSubScreen } from './stores/gameState'
import { initializeGame } from './utilities/gameInitializer'
import './App.css'

export default function App() {
  // Local state to track game state changes
  const [gameStateScreen, setGameStateScreen] = useState(gameState.current.screen);
  const [homeSubScreen, setHomeSubScreen] = useState<HomeSubScreen>(gameState.current.homeSubScreen);

  // Sync with global game state
  useEffect(() => {
    const unsubscribe = gameState.subscribe((state: GameStateInterface) => {
      setGameStateScreen(state.screen);
      setHomeSubScreen(state.homeSubScreen);
    });

    return unsubscribe;
  }, []);

  const startGame = () => {
    gameState.setScreen('playing');
  }

  const pauseGame = () => {
    // This will be called when Escape is pressed or pause button is clicked
    // Toggle between playing and paused
    gameState.togglePause();
  }

  const resumeGame = () => {
    gameState.setScreen('playing');
  }

  const goToMainMenu = () => {
    // Reset all game state when returning to main menu
    initializeGame('home', 'main');
  }

  return (
    <div className="app-container">
      {gameStateScreen === 'home' && (
        <HomeScreen 
          onStartGame={startGame} 
          currentSubScreen={homeSubScreen}
        />
      )}
      
      {gameStateScreen !== 'home' && (
        <div className="game-wrapper">
          <Game onPause={pauseGame} />
          {gameStateScreen === 'paused' && (
            <PauseMenu onResume={resumeGame} onMainMenu={goToMainMenu} />
          )}
        </div>
      )}
    </div>
  )
}
