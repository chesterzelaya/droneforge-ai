import { Jimp } from 'jimp';
import { Tensor } from 'onnxruntime-web';
import * as ort from 'onnxruntime-web/webgpu';


/**
 * Loads an image from a given path and converts it to a tensor suitable for input into a neural network.
 * @param {string} path - The path or URL to the image file.
 * @param {number[]} dims - The desired dimensions of the output tensor. Default is [1, 3, 224, 224].
 * @returns {Promise<Tensor>} A promise that resolves to a tensor representing the image.
 */
export async function getImageTensorFromPath(path, dims = [1, 3, 224, 224]) {
  // 1. Load image
  console.log("path", path);
  var image = await loadImagefromPath(path, dims[2], dims[3]);

  // 2. Convert image to tensor
  var imageTensor = imageDataToTensor(image, dims);

  // 3. Return tensor
  return imageTensor;
}

/**
 * Loads an image from a given path using the Jimp library.
 * @param {string} path - The path or URL to the image file.
 * @param {number} width - The desired width of the loaded image. Default is 224.
 * @param {number} height - The desired height of the loaded image. Default is 224.
 * @returns {Promise<Jimp>} A promise that resolves to a Jimp image object.
 */
async function loadImagefromPath(path, width = 224, height = 224) {
  try {
    // Use Jimp to load the image and resize it.
    var imageData = await Jimp.read(path);
    console.log("imageData", imageData);
    //imageData = imageData.resize(width, height);
    return imageData;
  } catch (error) {
    console.error('Error loading image:', error);
    throw error;
  }
}

/**
 * Converts an ImageData object to a tensor suitable for input into a neural network.
 * @param {ImageData} imageData - The ImageData object to convert.
 * @param {number[]} dims - The desired dimensions of the output tensor.
 * @returns {Tensor} A tensor representing the image data.
 */
function imageDataToTensor(imageData, dims) {
  // 1. Get buffer data from image and create R, G, and B arrays.
  const imageBufferData = imageData.data;
  const redArray = [];
  const greenArray = [];
  const blueArray = [];
  
  // 2. Loop through the image buffer and extract the R, G, and B channels
  for (let i = 0; i < imageBufferData.length; i += 4) {
    redArray.push(imageBufferData[i]);
    greenArray.push(imageBufferData[i + 1]);
    blueArray.push(imageBufferData[i + 2]);
    // skip data[i + 3] to filter out the alpha channel
  }

  // 3. Concatenate RGB to transpose [height, width, 3] -> [3, height, width] to a number array
  const transposedData = redArray.concat(greenArray).concat(blueArray);

  // 4. Convert to float32
  const float32Data = new Float32Array(dims[1] * dims[2] * dims[3]);
  for (let i = 0; i < transposedData.length; i++) {
    float32Data[i] = transposedData[i] / 255.0; // convert to float
  }

  // 5. Create the tensor object from onnxruntime-web.
  const inputTensor = new Tensor("float32", float32Data, dims);
  return inputTensor;
}

/**
 * Captures an image from a canvas and converts it to a tensor.
 * @param {HTMLCanvasElement} canvas - The canvas element to capture the image from.
 * @param {number[]} dims - The desired dimensions of the output tensor.
 * @returns {Promise<Tensor>} A promise that resolves to a tensor representing the image.
 */
export async function getImageTensorFromCanvas(canvas, dims = [1, 3, 224, 224]) {
  console.log('Getting image data from canvas...');
  const context = canvas.getContext('2d');
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  console.log('Image data captured:', imageData);

  const tensor = imageDataToTensor(imageData, dims);
  console.log('Image data converted to tensor:', tensor);
  return tensor;
}


/**
 * Converts raw pixel data to a tensor suitable for a neural network.
 * @param {Uint8Array} pixelData - The raw pixel data from the WebGL canvas.
 * @param {number[]} dims - The desired dimensions of the output tensor [batchSize, channels, height, width].
 * @returns {Tensor} A tensor representing the image data.
 */
export function pixelDataToTensor(pixelData, dims) {
  const [batchSize, channels, height, width] = dims;
  const float32Data = new Float32Array(height * width * channels);

  let idx = 0;
  // Loop through the pixel data and extract R, G, B channels, ignoring Alpha
  for (let i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i] / 255.0;     // Red channel normalized to [0, 1]
    const g = pixelData[i + 1] / 255.0; // Green channel normalized to [0, 1]
    const b = pixelData[i + 2] / 255.0; // Blue channel normalized to [0, 1]

    // Store the RGB values in the float32 array in channel-first format (C, H, W)
    float32Data[idx++] = r; // Red channel
    float32Data[idx++] = g; // Green channel
    float32Data[idx++] = b; // Blue channel
  }

  // Create and return the tensor
  const inputTensor = new ort.Tensor('float32', float32Data, dims);
  return inputTensor;
}