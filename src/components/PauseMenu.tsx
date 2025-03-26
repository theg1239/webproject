import React, { useEffect } from 'react';
import { gameState } from '../stores/gameState';
import '../Game.css';

interface PauseMenuProps {
  onResume: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onMainMenu }) => {
  return (
    <div className="game-ui-container" style={{ position: 'absolute', top: 0, left: 0, zIndex: 100 }}>
      <h2 className="title">Paused</h2>
      <div className="menu-buttons">
        <button className="btn" onClick={onResume}>
          Resume
        </button>
        <button className="btn" onClick={onMainMenu}>
          Main Menu
        </button>
      </div>
      <div className="menu-content">
        <p>Press ESC to resume</p>
      </div>
    </div>
  );
}; 