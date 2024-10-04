export async function setupTensorFlow() {
  return new Promise((resolve) => {
    if (typeof tf !== 'undefined') {
      initializeTF().then(resolve);
    } else {
      // If tf is not defined, wait for it to load
      window.addEventListener('load', () => {
        if (typeof tf !== 'undefined') {
          initializeTF().then(resolve);
        } else {
          console.error('TensorFlow.js failed to load');
          resolve(false);
        }
      });
    }
  });
}

async function initializeTF() {
  try {
    await tf.ready();
    if (tf.findBackend('webgpu')) {
      await tf.setBackend('webgpu');
      console.log('WebGPU backend initialized');
    } else {
      await tf.setBackend('webgl');
      console.log('Fallback to WebGL backend');
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize TensorFlow.js backend:', error);
    return false;
  }
}