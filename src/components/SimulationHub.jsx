import React, { useEffect, useState } from 'react';
import * as styles from './SimulationHub.module.css';
import GamepadHandler from '../utils/gamepadHandler';
import { FaBrain, FaRedo, FaGlobe, FaRobot, FaChartLine } from 'react-icons/fa';

/**
 * @component SimulationHub
 * @description A sleek sidebar component providing navigation and status for the drone simulation.
 */
const SimulationHub = () => {
  const [gamepadConnected, setGamepadConnected] = useState(false);

  useEffect(() => {
    const gamepadHandler = new GamepadHandler();
    
    const checkGamepadConnection = () => {
      setGamepadConnected(gamepadHandler.connected);
    };

    checkGamepadConnection();
    const intervalId = setInterval(checkGamepadConnection, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.hub}>
      <div className={styles.glowBackground}></div>
      <div className={styles.content}>
        <h2 className={styles.title}>DF</h2>
        <nav className={styles.nav}>
          <button className={styles.navButton} title="Load AI Models">
            <FaBrain />
            <span className={styles.buttonText}>Models</span>
          </button>
          <button className={styles.navButton} title="Reset Parameters">
            <FaRedo />
            <span className={styles.buttonText}>Reset</span>
          </button>
          <button className={styles.navButton} title="Modify Environment">
            <FaGlobe />
            <span className={styles.buttonText}>Environment</span>
          </button>
          <button className={styles.navButton} title="Drone Configuration">
            <FaRobot />
            <span className={styles.buttonText}>Configure</span>
          </button>
          <button className={styles.navButton} title="Export Telemetry">
            <FaChartLine />
            <span className={styles.buttonText}>Telemetry</span>
          </button>
        </nav>
        <div className={styles.gamepadStatus}>
          <div className={`${styles.statusIndicator} ${gamepadConnected ? styles.connected : styles.disconnected}`}>
            {gamepadConnected ? 'Controller Connected' : 'Controller Disconnected'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationHub;
