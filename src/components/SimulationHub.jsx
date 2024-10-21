import React, { useEffect, useState } from 'react';
import * as styles from './SimulationHub.module.css';
import GamepadHandler from '../utils/gamepadHandler';

const SimulationHub = () => {
  const [gamepadConnected, setGamepadConnected] = useState(false);

  useEffect(() => {
    const gamepadHandler = new GamepadHandler();
    
    const checkGamepadConnection = () => {
      setGamepadConnected(gamepadHandler.connected);
    };

    // Check connection status initially and set up an interval to check regularly
    checkGamepadConnection();
    const intervalId = setInterval(checkGamepadConnection, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={styles.hub}>
      <h2 className={styles.title}>Simulation Hub</h2>
      <nav className={styles.nav}>
        <button className={styles.navButton}>Start Simulation</button>
        <button className={styles.navButton}>Reset Simulation</button>
        <button className={styles.navButton}>Change Environment</button>
        <button className={styles.navButton}>Drone Settings</button>
        <button className={styles.navButton}>Export Data</button>
      </nav>
      <div className={styles.gamepadStatus}>
        <div className={`${styles.statusIndicator} ${gamepadConnected ? styles.connected : styles.disconnected}`}>
          {gamepadConnected ? 'Controller Connected' : 'Controller Disconnected'}
        </div>
      </div>
    </div>
  );
};

export default SimulationHub;
