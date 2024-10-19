import React from 'react';
import './LoadingScreen.css'; // Ensure this path is correct

const LoadingScreen = ({ logs }) => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <h1>Drone Simulation Loading...</h1>
        <div className="loading-spinner"></div>
      </div>
      <div className="log-container">
        <h2>Loading Logs</h2>
        <div className="logs">
          {logs.map((log, index) => (
            <div key={index} className="log-entry">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
