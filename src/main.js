import App from './App';
import { setupTensorFlow } from './utils/tfSetup';
import * as ort from 'onnxruntime-web/webgpu';

let sessionPromise = ort.InferenceSession.create('./neuflow_things.onnx').then(sess => {
  console.log('OnnxRuntime Web session created');
  return sess;
});


async function initializeApp() {
  const loadingElement = document.getElementById('loading');

  // start inference session with OnnxRuntime Web
  const session = await sessionPromise;
  console.log('OnnxRuntime Web session created');


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

export { sessionPromise };
