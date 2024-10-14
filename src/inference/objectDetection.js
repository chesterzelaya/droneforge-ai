import * as ort from 'onnxruntime-web/webgpu';

let session;

/**
 * Loads the ONNX model using ONNX Runtime Web.
 * @returns {Promise<ort.InferenceSession>} A promise that resolves to the loaded ONNX session.
 * @throws {Error} If there's an error loading the model.
 */
export async function loadModelONNX() {
  console.log('Starting to load ONNX model using ONNX Runtime Web...');
  try {
    const modelPath = '/neuflow_things.onnx'; 
    session = await ort.InferenceSession.create(modelPath);
    console.log('Neuflow ONNX model loaded successfully');
    
    logModelInfo(session);
    return session;
  } catch (error) {
    console.error('Error loading ONNX model:', error);
    throw error;
  }
}

/**
 * Logs information about the loaded model.
 * @param {ort.InferenceSession} session - The ONNX inference session.
 */
function logModelInfo(session) {
  const inputNames = session.inputNames;
  const outputNames = session.outputNames;
  const inputShapes = inputNames.map(name => session.input(name).dims);
  const outputShapes = outputNames.map(name => session.output(name).dims);
  
  console.log('Model input names:', inputNames);
  console.log('Model input shapes:', inputShapes);
  console.log('Model output names:', outputNames);
  console.log('Model output shapes:', outputShapes);
}

/**
 * Runs inference on the loaded model with the given input tensor.
 * @param {ort.Tensor} inputTensor - The input tensor for the model.
 * @returns {Promise<ort.Tensor>} A promise that resolves to the model's output tensor.
 * @throws {Error} If the model is not loaded or if there's an error during inference.
 */
export async function runInference(inputTensor) {
  if (!session) {
    throw new Error('Model not loaded. Please load the model before running inference.');
  }

  try {
    const feeds = { [session.inputNames[0]]: inputTensor };
    const outputData = await session.run(feeds);
    return outputData;
  } catch (error) {
    console.error('Error during inference:', error);
    throw error;
  }
}

// Additional helper functions for preprocessing or postprocessing can be added here
