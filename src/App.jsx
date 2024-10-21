import React, { useContext, useEffect, useState } from 'react';
import Simulation from './components/Simulation';
import ModelSlider from './components/ModelSlider';
import ErrorBoundary from './components/ErrorBoundary'; // Ensure this import is correct
import { LoadingContext, LoadingProvider } from './context/LoadingContext';
import LoadingScreen from './components/LoadingScreen';
import SimulationHub from './components/SimulationHub';
import * as styles from './App.module.css';

const AppContent = () => {
  const { logs, addLog } = useContext(LoadingContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialization steps
    const initialize = async () => {
      try {
        addLog('Starting initialization...');
        
        addLog('Loading Drone Scene...');
        // Simulate Drone Scene initialization
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Replace with actual initialization
        addLog('Drone Scene loaded.');

        addLog('Loading Physics Engine...');
        // Simulate Physics Engine initialization
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Replace with actual initialization
        addLog('Physics Engine loaded.');

        addLog('Loading ONNX Model...');
        // Load the ONNX model
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Replace with actual model loading
        addLog('ONNX Model loaded successfully.');

        // All initialization done
        setIsLoading(false);
        addLog('Initialization complete.');
      } catch (error) {
        addLog(`Error during initialization: ${error.message}`);
        setIsLoading(false);
      }
    };

    initialize();
  }, [addLog]);

  if (isLoading) {
    return <LoadingScreen logs={logs} />;
  }

  return (
    <ErrorBoundary>
      <div className={styles.appContainer}>
        <SimulationHub />
        <div className={styles.simulationContent}>
          <Simulation />
          <ModelSlider />
        </div>
      </div>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
};

export default App;
