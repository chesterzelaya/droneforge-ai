let tfliteModel;
let labels = [];

/**
 * @function loadModel
 * @async
 * @description Loads the COCO SSD model for object detection.
 * @throws {Error} If TensorFlow.js or TFLite interpreter is not loaded.
 */
export async function loadModel() {
  console.log('Starting to load COCO SSD model...');
  try {
    // Ensure TensorFlow.js and TFLite interpreter are loaded
    if (typeof tf === 'undefined' || typeof tflite === 'undefined') {
      throw new Error('TensorFlow.js or TFLite interpreter is not loaded');
    }

    // Load the TFLite model
    console.log('Loading model from file...');
    tfliteModel = await tflite.loadTFLiteModel('/coco.tflite');
    console.log('COCO SSD model loaded successfully');
    
    // Load labels
    await loadLabels();
    
    // Log model information
    console.log('Model input shape:', tfliteModel.inputs[0].shape);
    console.log('Model output shapes:', tfliteModel.outputs.map(output => output.shape));
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
}

/**
 * @function loadLabels
 * @async
 * @description Loads the labels from the labelmap.txt file.
 */
async function loadLabels() {
  const response = await fetch('/labelmap.txt');
  const text = await response.text();
  labels = text.split('\n').filter(label => label.trim() !== '');
  console.log('Labels loaded:', labels);
}

/**
 * @function runInference
 * @async
 * @description Runs inference on the provided image using the loaded model.
 * @param {HTMLImageElement|HTMLCanvasElement} imageElement - The image to run inference on.
 * @returns {Promise<Array>} The detected objects with bounding boxes and labels.
 * @throws {Error} If the model is not loaded or if there's an error during inference.
 */
export async function runInference(imageElement) {
  if (!tfliteModel) {
    throw new Error('Model not loaded. Please load the model before running inference.');
  }

  console.log('Starting inference...');

  try {
    const imgTensor = tf.tidy(() => {
      let img = tf.browser.fromPixels(imageElement);
      img = tf.image.resizeBilinear(img, [300, 300]);
      img = img.expandDims(0);
      img = tf.clipByValue(img, 0, 255);
      img = tf.cast(img, 'int32');
      console.log('Image tensor created:', img.shape, img.dtype);
      return img;
    });

    console.log('Running model prediction...');

    if (imgTensor instanceof tf.Tensor) {
      console.log('imgTensor is a Tensor with shape:', imgTensor.shape, 'and dtype:', imgTensor.dtype);
    } else {
      console.error('imgTensor is not a Tensor. Type:', typeof imgTensor);
      throw new Error('Invalid image tensor');
    }

    // Log tensor information before saving
    console.log('Tensor before saving:', imgTensor);

    //await saveTensorDataToFile(imgTensor);

    const outputTensor = await tfliteModel.predict(imgTensor);
    console.log('Model prediction completed.');

    // Log the output tensor to inspect its structure
    console.log('Model output:', outputTensor);

    // Access the output tensors using their property names
    const boxes = outputTensor['TFLite_Detection_PostProcess'];
    console.log('Boxes:', boxes);
    const classes = outputTensor['TFLite_Detection_PostProcess:1'];
    console.log('classes:', classes);
    const scores = outputTensor['TFLite_Detection_PostProcess:2'];
    console.log('scores:', scores);
    const numDetections = outputTensor['TFLite_Detection_PostProcess:3'];
    console.log('numDetections:', numDetections);

    // Check if tensors are valid
    if (!boxes || !scores || !classes || !numDetections) {
      throw new Error('Failed to get output tensors. Check the output tensor keys.');
    }

    // Process the output tensors
    const boxesData = await boxes.array();
    console.log('Boxes data:', boxesData);
    const scoresData = await scores.array();
    console.log('Scores data:', scoresData);
    const classesData = await classes.array();
    console.log('Classes data:', classesData);
    const numDetectionsData = await numDetections.array();
    console.log('Num detections data:', numDetectionsData);

    // Process predictions
    const detections = [];
    const numDetected = numDetectionsData[0];
    console.log('Number of detections:', numDetected);

    for (let i = 0; i < numDetected && i < 10; i++) {
      const score = scoresData[0][i];
      const classIndex = classesData[0][i];
      const bbox = boxesData[0][i]; // An array of 4 numbers
      console.log('BBox:', bbox);

      if (score > 0.02) {  // Confidence threshold
        detections.push({
          bbox: [
            bbox[1] * imageElement.width,  // xmin
            bbox[0] * imageElement.height, // ymin
            (bbox[3] - bbox[1]) * imageElement.width,  // width
            (bbox[2] - bbox[0]) * imageElement.height, // height
          ],
          class: labels[classIndex],
          score: score,
        });
      }
    }

    // Clean up tensors
    tf.dispose([imgTensor]);
    for (let key in outputTensor) {
      tf.dispose(outputTensor[key]);
    }

    // Save detection results
    //await saveDetectionResults(detections);

    return detections;
  } catch (error) {
    console.error('Error during inference:', error);
    throw error;
  }
}

async function saveTensorDataToFile(tensor) {
  try {
    console.log('Attempting to save tensor data...');
    console.log('Tensor shape:', tensor.shape);
    console.log('Tensor dtype:', tensor.dtype);

    // Check if the tensor is valid
    if (!tensor || !tensor.shape) {
      throw new Error('Invalid tensor object');
    }

    // Safely access tensor data
    let tensorData;
    try {
      tensorData = await tensor.data();
      console.log('Tensor data retrieved successfully');
    } catch (dataError) {
      console.error('Error accessing tensor data:', dataError);
      return; // Exit the function if we can't access the data
    }

    // Convert the TypedArray to a string format for saving
    const tensorDataString = Array.from(tensorData).join('\n');

    // Create a Blob from the string
    const blob = new Blob([tensorDataString], { type: 'text/plain' });

    // Create a link element to download the file
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'tensorData.txt';

    // Programmatically click the link to trigger the download
    link.click();

    console.log('Tensor data saved to tensorData.txt');
  } catch (error) {
    console.error('Error saving tensor data:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

/**
 * @function drawBoundingBoxes
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on
 * @param {Array} detections - Array of detection objects
 */
export function drawBoundingBoxes(canvas, detections) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  detections.forEach(detection => {
    const [x, y, width, height] = detection.bbox;

    // Draw bounding box
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width - x, height - y);

    // Draw label
    ctx.fillStyle = 'red';
    ctx.font = '16px Arial';
    ctx.fillText(`${detection.class} (${detection.score.toFixed(2)})`, x, y - 5);
  });
}

// Add this function to your objectDetection.js file
async function saveDetectionResults(detections) {
  const detectionsString = JSON.stringify(detections);
  const blob = new Blob([detectionsString], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'detectionResults.json';
  link.click();
}