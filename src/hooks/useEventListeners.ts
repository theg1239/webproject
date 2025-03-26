import { useEffect, useRef } from "react";
import { queueMove } from "../stores/player";
import { gameState } from "../stores/gameState";

export default function useEventListeners(onPause?: () => void) {
  // Use a ref to track if an event listener is already set up
  const isListenerSetRef = useRef(false);

  useEffect(() => {
    // Skip if we already set up the listener
    if (isListenerSetRef.current) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Global escape key handler
      if (event.key === "Escape") {
        event.preventDefault();
        
        // Use the centralized escape handler
        gameState.handleEscape();
        
        // Sync React state if in playing/paused screens
        if (onPause && 
            (gameState.current.screen === 'playing' || 
             gameState.current.screen === 'paused')) {
          onPause();
        }
        
        return;
      }
      
      // Only process movement keys if game is in playing state
      if (gameState.current.screen !== 'playing') {
        return;
      }
      
      // Game is playing - handle movement
      if (event.key === "ArrowUp") {
        event.preventDefault();
        queueMove("forward");
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        queueMove("backward");
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        queueMove("left");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        queueMove("right");
      }
    };

    // Set up the listener only once
    window.addEventListener("keydown", handleKeyDown);
    isListenerSetRef.current = true;

    // Cleanup function to remove the event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      isListenerSetRef.current = false;
    };
  }, [onPause]);
}