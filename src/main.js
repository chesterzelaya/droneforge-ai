import App from './App';
import * as ort from 'onnxruntime-web/webgpu';

let sessionPromise = ort.InferenceSession.create('./neuflow_things.onnx', {
  executionProviders: ['cpu']
}).then(sess => {
  console.log('OnnxRuntime Web session created with WebGPU backend');
  return sess;
}).catch(err => {
  console.error('Error creating ONNX session:', err);
});



async function initializeApp() {
  const loadingElement = document.getElementById('loading');

  try {
    // Start inference session with OnnxRuntime Web
    const session = await sessionPromise;
    console.log('Session created:', session);
    const app = new App();
    await app.init();

    // Hide loading element if it exists
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
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
