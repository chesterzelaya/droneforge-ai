import * as ort from 'onnxruntime-web';
import { sessionPromise } from '../main';

/**
 * Retrieves the ONNX session from the promise in main.js.
 * @returns {Promise<ort.InferenceSession>} A promise that resolves to the ONNX session.
 */
async function useSession() {
    const session = await sessionPromise;
    return session;
}

/**
 * Runs the ONNX model on the preprocessed data.
 * @param {Tensor} preprocessedData - The preprocessed input data as a tensor.
 * @returns {Promise<ort.Tensor>} A promise that resolves to the model's output tensor.
 */
export async function runSessionModel(preprocessedData) {
    const session = await useSession();
    console.log('Inference session created');
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
    
    console.log('session.inputNames[0]: ', session.inputNames[0]);
    console.log('preprocessedData: ', preprocessedData);
    
    // Ensure that the input name matches what the model expects
    let inputName = session.inputNames[0];
    if (!preprocessedData) {
        throw new Error(`Preprocessed data is missing for input: ${inputName}`);
    }

    feeds[inputName] = preprocessedData;

    // Assuming the model has two inputs with the same data
    inputName = session.inputNames[1];
    feeds[inputName] = preprocessedData;

    const outputData = await session.run(feeds);
    
    const end = new Date();
    const inferenceTime = (end.getTime() - start.getTime()) / 1000;
    console.log(`Inference time: ${inferenceTime} seconds`);

    const output = outputData[session.outputNames[0]];
    console.log('output: ', output);
    return output;
}
