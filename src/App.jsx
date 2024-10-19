import React from 'react';
import Simulation from './components/Simulation';
import ModelSlider from './components/ModelSlider';
import ErrorBoundary from './components/ErrorBoundary'; // Ensure this import is correct

const App = () => {
  return (
    <ErrorBoundary>
      <Simulation />
      <ModelSlider />
    </ErrorBoundary>
  );
};

export default App;
