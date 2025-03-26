import React from 'react';
import { gameState, HomeSubScreen } from '../stores/gameState';
import '../Game.css';

interface HomeScreenProps {
  onStartGame: () => void;
  currentSubScreen: HomeSubScreen;
}

const MainMenu: React.FC<{ onStartGame: () => void }> = ({ onStartGame }) => (
  <>
    <h1 className="title" style={{ color: 'orange', fontSize: '60px' }}>Pixel Tanks</h1>
    <div className="menu-buttons">
      <button className="btn" onClick={onStartGame}>
        Start Game
      </button>
      <button className="btn" onClick={() => gameState.setHomeSubScreen('settings')}>
        Settings
      </button>
      <button className="btn" onClick={() => gameState.setHomeSubScreen('credits')}>
        Credits
      </button>
    </div>
    <div className="game-instructions">
      <p>Use arrow keys or buttons to move</p>
      <p>Avoid obstacles and reach as far as you can!</p>
    </div>
  </>
);

const SettingsMenu: React.FC = () => (
  <>
    <h1 className="title">Settings</h1>
    <div className="menu-content">
      <p>Game settings will appear here in future updates.</p>
    </div>
    <div className="menu-buttons">
      <button className="btn" onClick={() => gameState.setHomeSubScreen('main')}>
        Back
      </button>
    </div>
  </>
);

const CreditsMenu: React.FC = () => (
  <>
    <h1 className="title">Credits</h1>
    <div className="menu-content">
      <p>Pixel Tanks</p>
      <p>A simple game created with React and Three.js</p>
    </div>
    <div className="menu-buttons">
      <button className="btn" onClick={() => gameState.setHomeSubScreen('main')}>
        Back
      </button>
    </div>
  </>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame, currentSubScreen }) => {
  return (
    <div className="game-ui-container">
      {currentSubScreen === 'main' && <MainMenu onStartGame={onStartGame} />}
      {currentSubScreen === 'settings' && <SettingsMenu />}
      {currentSubScreen === 'credits' && <CreditsMenu />}
    </div>
  );
}; 