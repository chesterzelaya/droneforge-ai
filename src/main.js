import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Ensure this points to App.jsx
import * as ort from 'onnxruntime-web/webgpu';

let sessionPromise = ort.InferenceSession.create('./neuflow_things.onnx', {
  executionProviders: ['cpu'],
})
  .then((sess) => {
    console.log('OnnxRuntime Web session created with WebGPU backend');
    return sess;
  })
  .catch((err) => {
    console.error('Error creating ONNX session:', err);
  });

async function initializeApp() {
  const loadingElement = document.getElementById('loading');

  try {
    // Start inference session with OnnxRuntime Web
    const session = await sessionPromise;
    console.log('Session created:', session);
    // Initialize the App component
    const app = <App />;

    // Hide loading element if it exists
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }

    // Render the React component using createRoot for React 18
    const root = ReactDOM.createRoot(document.getElementById('app'));
    root.render(app);
  } catch (error) {
    console.error('Error initializing app:', error);
    // Show error message to user
    if (loadingElement) {
      loadingElement.textContent = 'Error loading application. Please try again.';
    }
  }
}

// Wait for the DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

export { sessionPromise };
