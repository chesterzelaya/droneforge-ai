import { Jimp } from 'jimp';
import { Tensor } from 'onnxruntime-web';

export async function getImageTensorFromPath(path, dims = [1, 3, 224, 224]) {
  // 1. Load image
  console.log("path", path);
  var image = await loadImagefromPath(path, dims[2], dims[3]);

  // 2. convert image to tensor
  var imageTensor = imageDataToTensor(image, dims);

  // 3. return tensor
  return imageTensor;
}



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

   function imageDataToTensor(image, dims) {
    // 1. Get buffer data from image and create R, G, and B arrays.
    var imageBufferData = image.bitmap.data;
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
  
    // 3. Concatenate RGB to transpose [224, 224, 3] -> [3, 224, 224] to a number array
    const transposedData = redArray.concat(greenArray).concat(blueArray);
  
    // 4. convert to float32
    let i, l = transposedData.length; // length, we need this for the loop
    // create the Float32Array size 3 * 224 * 224 for these dimensions output
    const float32Data = new Float32Array(dims[1] * dims[2] * dims[3]);
    for (i = 0; i < l; i++) {
      float32Data[i] = transposedData[i] / 255.0; // convert to float
    }
    // 5. create the tensor object from onnxruntime-web.
    const inputTensor = new Tensor("float32", float32Data, dims);
    return inputTensor;
  }
  