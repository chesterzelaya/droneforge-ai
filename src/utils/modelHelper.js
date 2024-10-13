import * as ort from 'onnxruntime-web';
import _ from 'lodash';
import { sessionPromise } from '../main';

async function useSession() {
    const session = await sessionPromise;
    return session;
}

export async function runSessionModel(preprocessedData) {
    const session = await useSession();
    console.log('Inference session created');
    //var [results, inferenceTime] =  
    const outputData = await runInference(session, preprocessedData);
    return outputData;
    //return [results, inferenceTime];
}

async function runInference(session, preprocessedData) {
  // Get start time to calculate inference time.
  const start = new Date();
  // create feeds with the input name from model export and the preprocessed data.
  const feeds= {};
  console.log('session.inputNames[0]: ', session.inputNames[0]);
  console.log('preprocessedData: ', preprocessedData);
  
  // Ensure that the input name matches what the model expects
  let inputName = session.inputNames[0];
  if (!preprocessedData) {
    throw new Error(`Preprocessed data is missing for input: ${inputName}`);
  }

  feeds[inputName] = preprocessedData;

  inputName = session.inputNames[1];
  feeds[inputName] = preprocessedData;
  const outputData = await session.run(feeds);
  // Get the end time to calculate inference time.
  const end = new Date();
  // Convert to seconds.
  const inferenceTime = (end.getTime() - start.getTime())/1000;
  // Get output results with the output name from the model export.
  const output = outputData[session.outputNames[0]];
  console.log('output: ', output);
  return output;
  // Get the top 5 results.

  // console.log('results: ', results);
  //return [results, inferenceTime];
}
