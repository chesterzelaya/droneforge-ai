/**
 * @function setupTensorFlow
 * @async
 * @description Sets up TensorFlow.js, initializing the appropriate backend.
 * @returns {Promise<boolean>} A promise that resolves to true if setup is successful, false otherwise.
 */
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

/**
 * @function initializeTF
 * @private
 * @async
 * @description Initializes TensorFlow.js backend, preferring WebGPU if available.
 * @returns {Promise<boolean>} A promise that resolves to true if initialization is successful, false otherwise.
 */
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