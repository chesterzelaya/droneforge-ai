import * as ort from 'onnxruntime-web';
import { sessionPromise } from '../main';
import { getImageTensorFromCanvas } from '../utils/imageHelper'; // New function to be created

/**
 * Retrieves the ONNX session from the promise in main.js.
 * @returns {Promise<ort.InferenceSession>} A promise that resolves to the ONNX session.
 */
async function useSession() {
    const session = await sessionPromise;
    // getModelShapes(session);
    return session;
}

/**
 * Runs the ONNX model on the preprocessed data.
 * @param {Tensor} preprocessedData - The preprocessed input data as a tensor.
 * @returns {Promise<ort.Tensor>} A promise that resolves to the model's output tensor.
 */
export async function runSessionModel(preprocessedData) {
    const session = await useSession();
    console.log('Inference session found');
    const outputData = await runInference(session, preprocessedData);
    return outputData;
}

/**
 * Performs the actual inference using the ONNX session.
 * @param {ort.InferenceSession} session - The ONNX inference session.
 * @param {Tensor} preprocessedData - The preprocessed input data as a tensor.
 * @returns {Promise<ort.Tensor>} A promise that resolves to the model's output tensor.
 */
async function runInference(session, preprocessedData) {
    const start = new Date();
    const feeds = {};
    
    // Ensure that the input name matches what the model expects
    // let inputName = session.inputNames[0];
    // if (!preprocessedData) {
    //     throw new Error(`Preprocessed data is missing for input: ${inputName}`);
    // }

    feeds[session.inputNames[0]] = preprocessedData;

    // Assuming the model has two inputs with the same data
    feeds[session.inputNames[1]] = preprocessedData;

    const outputData = await session.run(feeds);
    
    const end = new Date();
    const inferenceTime = (end.getTime() - start.getTime()) / 1000;
    console.log(`Inference time: ${inferenceTime} seconds`);

    const output = outputData[session.outputNames[0]];
    console.log('output after runInference(): ', output);
    return output;
}

/**
 * Runs inference on a frame captured from the livestream.
 * @param {Tensor} inputTensor - The tensor containing the captured frame.
 * @returns {Promise<ort.Tensor>} A promise that resolves to the model's output tensor.
 */
export async function runInferenceOnFrameCapture(inputTensor) {
  try {
    console.log('-----1. Running model inference on tensor')
    // Run the model
    console.log('Running model inference using runInferenceOnFrameCapture...');
    const outputData = await runSessionModel(inputTensor);
    console.log('Model inference completed:', outputData);
    return outputData;
  } catch (error) {
    console.error('Error during livestream inference:', error);
    throw error;
  }
}


// async function getModelShapes(session) {
//     // Get the input names
//     const inputNames = session.inputNames;
//     console.log('---------Input Names:', inputNames);
//     console.log('---------Input Metadata:', session.outputShape);
  
//     // Loop through the input names to get shapes from the metadata
//     inputNames.forEach((inputName) => {
//       const inputMetadata = session.inputMetadata[0];
//       const inputShape = inputMetadata.dimensions;
//       console.log(`Input Name: ${inputName}, Shape:`, inputShape);
//     });
  
//     // Get the output names
//     const outputNames = session.outputNames;
//     console.log('Output Names:', outputNames);
  
//     // Loop through the output names to get shapes from the metadata
//     outputNames.forEach((outputName) => {
//       const outputMetadata = session.outputMetadata[outputName];
//       const outputShape = outputMetadata.dimensions;
//       console.log(`Output Name: ${outputName}, Shape:`, outputShape);
//     });
// }