import App from './App';
import { setupTensorFlow } from './utils/tfSetup';

async function initializeApp() {
  const loadingElement = document.getElementById('loading');
  
  const tfInitialized = await setupTensorFlow();
  if (!tfInitialized) {
    console.error('Failed to initialize TensorFlow.js. Some features may not work.');
    loadingElement.textContent = 'TensorFlow.js initialization failed. Some features may not work.';
  } else {
    console.log('TensorFlow.js initialized successfully');
  }

  const app = new App();
  await app.init();

  loadingElement.style.display = 'none';
}

// Wait for the DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
