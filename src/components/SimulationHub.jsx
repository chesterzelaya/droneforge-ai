import React from 'react';
import * as styles from './SimulationHub.module.css';

const SimulationHub = () => {
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
    </div>
  );
};

export default SimulationHub;
