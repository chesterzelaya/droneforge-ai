let tfliteModel;

export async function loadModel() {
  console.log('Starting to load MobileNet v3 large model...');
  try {
    // Ensure TensorFlow.js and TFLite interpreter are loaded
    if (typeof tf === 'undefined' || typeof tflite === 'undefined') {
      console.error('TensorFlow.js or TFLite interpreter is not loaded');
      return;
    }

    // Load the TFLite model
    console.log('Loading model from file...');
    tfliteModel = await tflite.loadTFLiteModel('/mobilenet_v3_large.tflite');
    console.log('MobileNet v3 large model loaded successfully');
    
    // Log model information
    console.log('Model input shape:', tfliteModel.inputs[0].shape);
    console.log('Model output shape:', tfliteModel.outputs[0].shape);
  } catch (error) {
    console.error('Error loading model:', error);
  }
}

export async function runInference(imageElement) {
  console.log('Starting inference process...');
  
  if (!tfliteModel) {
    console.error('Model not loaded. Please load the model before running inference.');
    return;
  }

  try {
    console.log('Preparing image for inference...');
    // Prepare the image
    let img = tf.browser.fromPixels(imageElement);
    console.log('Image converted to tensor. Shape:', img.shape);
    
    img = tf.image.resizeBilinear(img, [224, 224]);
    console.log('Image resized. Shape:', img.shape);
    
    img = img.expandDims(0).toFloat();
    img = img.div(127.5).sub(1);
    console.log('Image preprocessed. Final shape:', img.shape);

    console.log('Running model prediction...');
    // Run inference
    const outputTensor = await tfliteModel.predict(img);
    console.log('Model prediction complete. Output shape:', outputTensor.shape);
    
    const predictions = await outputTensor.data();
    console.log('Prediction data extracted');

    // Get top 5 predictions
    console.log('Calculating top 5 predictions...');
    const top5 = Array.from(predictions)
      .map((p, i) => ({probability: p, className: i}))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);
    
    console.log('Top 5 predictions:', top5);

    // Clean up tensors
    tf.dispose([img, outputTensor]);
    console.log('Tensors cleaned up');

    return top5;
  } catch (error) {
    console.error('Error during inference:', error);
  }
}