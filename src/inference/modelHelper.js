import * as ort from 'onnxruntime-web';

/**
 * Initialize the ONNX Inference Session.
 * This function ensures that the session is created only once.
 */
let sessionPromise = null;

/**
 * Loads the ONNX model and initializes the inference session.
 * @returns {Promise<ort.InferenceSession>} A promise that resolves to the ONNX inference session.
 */
export const initializeSession = () => {
  if (!sessionPromise) {
    console.log('Initializing ONNX Inference Session...');
    sessionPromise = ort.InferenceSession.create('./neuflow_things.onnx', {
      executionProviders: ['cpu'], // Add other execution providers if needed
    })
      .then((sess) => {
        console.log('ONNX Inference Session initialized successfully.');
        logModelInfo(sess);
        return sess;
      })
      .catch((err) => {
        console.error('Error initializing ONNX Inference Session:', err);
        throw err;
      });
  }
  return sessionPromise;
};

/**
 * Logs information about the loaded model.
 * @param {ort.InferenceSession} session - The ONNX inference session.
 */
const logModelInfo = (session) => {
  const inputNames = session.inputNames;
  const outputNames = session.outputNames;
  const inputShapes = inputNames.map((name) => session.input(name).dims);
  const outputShapes = outputNames.map((name) => session.output(name).dims);

  console.log('Model input names:', inputNames);
  console.log('Model input shapes:', inputShapes);
  console.log('Model output names:', outputNames);
  console.log('Model output shapes:', outputShapes);
};

/**
 * Runs the ONNX model on the preprocessed data.
 * @param {ort.Tensor} preprocessedData - The preprocessed input data as a tensor.
 * @returns {Promise<ort.Tensor>} A promise that resolves to the model's output tensor.
 */
export const runSessionModel = async (preprocessedData) => {
  try {
    const session = await initializeSession();
    console.log('Running inference...');
    const feeds = { [session.inputNames[0]]: preprocessedData };

    // If your model has multiple inputs with the same data, uncomment the following line
    // feeds[session.inputNames[1]] = preprocessedData;

    const outputData = await session.run(feeds);
    console.log('Inference completed:', outputData);
    return outputData;
  } catch (error) {
    console.error('Error during inference:', error);
    throw error;
  }
};

/**
 * Runs inference on a frame captured from the livestream.
 * @param {ort.Tensor} inputTensor - The tensor containing the captured frame.
 * @returns {Promise<ort.Tensor>} A promise that resolves to the model's output tensor.
 */
export const runInferenceOnFrameCapture = async (inputTensor) => {
  try {
    console.log('Running model inference on captured frame...');
    const outputData = await runSessionModel(inputTensor);
    console.log('Model inference on captured frame completed:', outputData);
    return outputData;
  } catch (error) {
    console.error('Error during livestream inference:', error);
    throw error;
  }
};
