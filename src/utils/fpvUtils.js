import * as THREE from 'three';

/**
 * @function createFPVDisplay
 * @description Creates the First Person View display and returns the FPV renderer.
 * @returns {THREE.WebGLRenderer} The FPV renderer.
 */
export function createFPVDisplay() {
  const fpvDisplay = document.createElement('div');
  fpvDisplay.style.position = 'absolute';
  fpvDisplay.style.top = '10px';
  fpvDisplay.style.left = '10px';
  fpvDisplay.style.width = '256px';
  fpvDisplay.style.height = '256px';
  fpvDisplay.style.border = '2px solid white';
  document.body.appendChild(fpvDisplay);

  const fpvCanvas = document.createElement('canvas');
  fpvCanvas.width = 256;
  fpvCanvas.height = 256;
  fpvDisplay.appendChild(fpvCanvas);

  const fpvRenderer = new THREE.WebGLRenderer({ canvas: fpvCanvas });
  fpvRenderer.setSize(256, 256);

  return fpvRenderer;
}

/**
 * @function captureFPVSnapshot
 * @description Captures a snapshot from the FPV display and returns it as a data URL.
 * @param {THREE.WebGLRenderer} fpvRenderer - The FPV renderer.
 * @returns {string} A base64-encoded data URL of the FPV snapshot.
 */
export function captureFPVSnapshot(fpvRenderer) {
  if (fpvRenderer && fpvRenderer.domElement) {
    const fpvCanvas = fpvRenderer.domElement;
    const snapshotDataURL = fpvCanvas.toDataURL('image/png');
    //console.log('FPV Snapshot captured:', snapshotDataURL);
    return snapshotDataURL;
  } else {
    console.error('FPV Renderer or canvas not initialized.');
    return null;
  }
}

/**
 * @function downloadImage
 * @description Downloads the image from a base64 data URL.
 * @param {string} dataURL - The base64 data URL of the image.
 * @param {string} filename - The name of the file to be downloaded.
 */
export function downloadImage(dataURL, filename = 'snapshot.png') {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * @function displayImage
 * @description Displays the image from a base64 data URL in an img element.
 * @param {string} dataURL - The base64 data URL of the image.
 */
export function displayImage(dataURL) {
  const img = document.createElement('img');
  img.src = dataURL;
  img.style.position = 'absolute';
  img.style.bottom = '10px';
  img.style.left = '10px';
  img.style.border = '2px solid white';
  document.body.appendChild(img);
}

/**
 * @function startFrameCapture
 * @description Starts capturing frames at a specified interval and displays them.
 * @param {THREE.WebGLRenderer} fpvRenderer - The FPV renderer.
 * @param {THREE.Scene} scene - The scene to render.
 * @param {THREE.Camera} camera - The camera to use for rendering.
 * @param {number} interval - The interval in milliseconds between frame captures.
 */
export function startFrameCapture(fpvRenderer, scene, camera, interval = 1000) {
  setInterval(() => {
    // Render the scene with the FPV camera
    fpvRenderer.render(scene, camera);

    // Capture the snapshot
    const snapshotDataURL = captureFPVSnapshot(fpvRenderer);
    if (snapshotDataURL) {
      displayImage(snapshotDataURL);
    }
  }, interval);
}
