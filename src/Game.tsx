import { useState, useEffect, useRef } from "react";
import { Scene } from "./components/Scene";
import { Player } from "./components/Player";
import { GameMap } from "./components/GameMap";
import { Controls } from "./components/Controls";
import useEventListeners from "./hooks/useEventListeners";
import { state as scoreState } from "./stores/score";
import { hitTest } from "./hitTest";
import { gameState } from "./stores/gameState";
import { initializeGame } from "./utilities/gameInitializer";
import "./Game.css";

// Debug flag for collision detection
const DEBUG_COLLISION = true;

interface GameProps {
  onPause?: () => void;
}

export default function Game({ onPause }: GameProps) {
  // Track score for live updates
  const [score, setScore] = useState(scoreState.value);
  
  // Animation frame ref for collision detection
  const animationFrameRef = useRef<number | null>(null);
  
  // Add state to track current game screen
  const [currentScreen, setCurrentScreen] = useState(gameState.current.screen);
  
  // Debug display toggle state
  const [showDebugDisplay, setShowDebugDisplay] = useState(true);
  
  // Connect event listeners with pause handler
  useEventListeners(onPause);

  // Subscribe to score changes
  useEffect(() => {
    // Subscribe to score updates
    const unsubscribe = scoreState.subscribe(() => {
      setScore(scoreState.value);
    });
    
    // Cleanup function to unsubscribe
    return unsubscribe;
  }, []);
  
  // Track game state changes
  useEffect(() => {
    const unsubscribe = gameState.subscribe((state) => {
      setCurrentScreen(state.screen);
    });
    
    return unsubscribe;
  }, []);
  
  // Set up collision detection using requestAnimationFrame
  useEffect(() => {
    // Function to check for collisions each frame
    const checkCollisions = () => {
      // Run collision detection on every frame, not just in playing state
      hitTest(DEBUG_COLLISION && showDebugDisplay);
      
      // Continue the animation loop
      animationFrameRef.current = requestAnimationFrame(checkCollisions);
    };
    
    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(checkCollisions);
    
    // Cleanup function to cancel animation frame on unmount
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showDebugDisplay]);

  // Handle pause - no need to do anything special since state is stored 
  // in persistent stores that survive component unmounting
  const handlePause = () => {
    if (onPause) {
      // Camera state and player state are already in their respective stores
      onPause();
    }
  };

  return (
    <>
      <h1 className="game-title">Pixel Tanks</h1>
      <div className="game-container">
        <div className="game">
          {onPause && currentScreen === 'playing' && (
            <button className="pause-btn" onClick={handlePause}>
              II
            </button>
          )}
          <div className="score-display">
            <span>SCORE:</span> {score}
          </div>
          {DEBUG_COLLISION && (
            <div className="debug-info" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'lime', padding: '5px', zIndex: 1000 }}>
              DEBUG MODE: Collision Detection
              <button 
                onClick={() => setShowDebugDisplay(!showDebugDisplay)}
                style={{ marginLeft: '10px', background: 'rgba(100,100,100,0.7)', border: '1px solid lime', color: 'white', cursor: 'pointer' }}
              >
                {showDebugDisplay ? 'Hide' : 'Show'} Console
              </button>
              <div style={{ fontSize: '10px', marginTop: '5px' }}>
                Check browser console for detailed collision information
              </div>
            </div>
          )}
          <Scene>
            <Player />
            <GameMap />
          </Scene>
          <Controls />
          
          {/* Game Over Dialog */}
          <div id="result-container" className={currentScreen === 'game-over' ? 'visible' : ''}>
            <div id="result">
              <h1>Game Over</h1>
              <p>Your score: <span id="final-score">{score}</span></p>
              <div className="menu-buttons" style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <button 
                  className="btn" 
                  style={{ 
                    padding: '8px 16px',
                    fontSize: '14px',
                    margin: '0 8px',
                    minWidth: 'auto',
                    width: 'auto'
                  }}
                  onClick={() => initializeGame('playing')}
                >
                  Retry
                </button>
                <button 
                  className="btn" 
                  style={{ 
                    padding: '8px 16px',
                    fontSize: '14px',
                    margin: '0 8px',
                    minWidth: 'auto',
                    width: 'auto'
                  }}
                  onClick={() => initializeGame('home', 'main')}
                >
                  Quit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}