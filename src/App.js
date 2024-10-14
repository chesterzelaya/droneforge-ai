import * as THREE from 'three';
import DroneScene from './scenes/DroneScene';
import DroneControls from './controls/DroneControls';
import PhysicsEngine from './physics/PhysicsEngine';
import { createPositionDisplay, updatePositionDisplay, createControlBar, updateControlBar, createPerformanceStats, createCompass, updateCompass } from './utils/helperFunctions';
import { loadModel } from './inference/objectDetection';
import { getImageTensorFromPath } from './utils/imageHelper';
import { runSessionModel } from './inference/modelHelper';
import { createFPVDisplay, captureFPVSnapshot, downloadImage, displayImage, startFrameCapture } from './utils/fpvUtils';

/**
 * @class App
 * @description Main application class for the drone simulation.
 * This class initializes and manages the 3D scene, cameras, controls, and various UI elements.
 */
class App {
  constructor() {
    // Initialize Three.js renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // Create main scene and camera
    this.scene = new DroneScene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    // Initialize drone controls and physics engine
    this.controls = new DroneControls();
    this.physicsEngine = new PhysicsEngine(this.controls);
    
    // UI elements
    this.positionDisplay = null;
    this.compass = null;

    // Camera offset relative to the drone
    this.cameraOffset = new THREE.Vector3(0, 5, -10);
    
    // Initialize main camera position
    this.camera.position.set(0, 5, -10);
    this.camera.lookAt(0, 0, 0);

    // Initialize FPV (First Person View) camera
    this.fpvCamera = new THREE.PerspectiveCamera(
      90, // Wider FOV for FPV
      1, // Aspect ratio of 1 for a square viewport
      0.1,
      1000
    );
    
    // Initialize axes renderer for orientation display
    this.axesRenderer = null;
    this.axesScene = null;
    this.axesCamera = null;

    // Initialize control bars for displaying drone inputs
    this.controlBars = {};

    // Initialize performance stats
    this.stats = createPerformanceStats();

    // Object detection properties
    this.objectDetectionReady = false;
    this.testImageLoaded = false;
    this.testImage = new Image();
    this.testImage.src = '/assets/test_image.jpg';
    this.testImage.onload = () => {
      console.log('Test image loaded successfully');
      this.testImageLoaded = true;
      //this.tryRunTestInference();
    };
  }

  /**
   * @method init
   * @description Initializes the application, setting up the scene, physics, and UI elements.
   */
  async init() {
    document.body.appendChild(this.renderer.domElement);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    await this.scene.init();
    await this.physicsEngine.init(this.scene);

    // Create UI elements
    this.positionDisplay = createPositionDisplay();
    this.fpvRenderer = createFPVDisplay();
    this.createAxesDisplay();
    this.createControlBarsDisplay();
    this.compass = createCompass();

    // Initialize object detection
    await this.initObjectDetection();

    // Set up event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    
    // Start the animation loop
    this.animate();

    // Capture a snapshot from the FPV display
    const snapshotDataURL = captureFPVSnapshot(this.fpvRenderer);
    if (snapshotDataURL) {
      console.log('Snapshot captured successfully:', snapshotDataURL);
      // Download the image
      //downloadImage(snapshotDataURL, 'fpv_snapshot.png');
      // Optionally display the image
      displayImage(snapshotDataURL);
    }

    // Start capturing frames every 2 seconds
    startFrameCapture(this.fpvRenderer, this.scene, this.fpvCamera, 2000);
  }

  /**
   * @method initObjectDetection
   * @description Initializes the object detection model.
   */
  async initObjectDetection() {
    try {
      // first we start with image conversion to Tensor
      const imageTensor = await getImageTensorFromPath(this.testImage.src, [1, 3, 432, 768]);

      // run model
      //const [predictions, inferenceTime] = 
      const outputData = await runSessionModel(imageTensor);

      // // Convert output data to a string
      // const outputString = JSON.stringify(outputData['cpuData']);

      // // Create a Blob from the output string
      // const blob = new Blob([outputString], { type: 'text/plain' });

      // // Create a link element
      // const link = document.createElement('a');
      // link.href = URL.createObjectURL(blob);

      // // clear the current content of utils/output.txt
      // link.download = 'output.txt';
      
      // // Append the link to the document body and click it to trigger the download
      // document.body.appendChild(link);
      // link.click();

      // // Remove the link from the document
      // document.body.removeChild(link);
      
    } catch (error) {
      console.error('Failed to initialize object detection:', error);
    }
  }

  /**
   * @method tryRunTestInference
   * @description Attempts to run a test inference if both the model and test image are ready.
   */
  tryRunTestInference() {
    if (this.objectDetectionReady && this.testImageLoaded) {
      this.runTestInference();
    }
  }

  /**
   * @method runTestInference
   * @description Runs a test inference on the loaded test image.
   */
  async runTestInference() {
    try {
      console.log('Running test inference...');
      const predictions = await runInference(this.testImage);
      console.log('Test inference results:', predictions);
    } catch (error) {
      console.error('Error running inference:', error);
    }
  }

  /**
   * @method createAxesDisplay
   * @description Creates the axes display for showing drone orientation.
   */
  createAxesDisplay() {
    const axesDisplay = document.createElement('div');
    axesDisplay.style.position = 'absolute';
    axesDisplay.style.bottom = '10px';
    axesDisplay.style.right = '10px';
    axesDisplay.style.width = '100px';
    axesDisplay.style.height = '100px';
    axesDisplay.style.border = '1px solid white';
    document.body.appendChild(axesDisplay);

    const axesCanvas = document.createElement('canvas');
    axesCanvas.width = 100;
    axesCanvas.height = 100;
    axesDisplay.appendChild(axesCanvas);

    this.axesRenderer = new THREE.WebGLRenderer({ canvas: axesCanvas, alpha: true });
    this.axesRenderer.setSize(100, 100);

    this.axesScene = new THREE.Scene();
    this.axesCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    this.axesCamera.position.set(0, 0, 3);
    this.axesCamera.lookAt(0, 0, 0);

    const axesHelper = new THREE.AxesHelper(2);
    this.axesScene.add(axesHelper);
  }

  /**
   * @method createControlBarsDisplay
   * @description Creates control bars to display drone input values.
   */
  createControlBarsDisplay() {
    const controlDisplay = document.createElement('div');
    controlDisplay.style.position = 'absolute';
    controlDisplay.style.top = '10px';
    controlDisplay.style.right = '10px';
    controlDisplay.style.width = '200px';
    controlDisplay.style.padding = '10px';
    controlDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    controlDisplay.style.borderRadius = '8px';
    controlDisplay.style.display = 'flex';
    controlDisplay.style.flexDirection = 'column';
    controlDisplay.style.gap = '10px';
    document.body.appendChild(controlDisplay);

    // Create bars for roll, pitch, yaw, and throttle
    this.controlBars.roll = createControlBar('Roll', 1500, 0, 3000);
    this.controlBars.pitch = createControlBar('Pitch', 1500, 0, 3000);
    this.controlBars.yaw = createControlBar('Yaw', 1500, 0, 3000);
    this.controlBars.throttle = createControlBar('Throttle', 1500, 0, 3000);

    controlDisplay.appendChild(this.controlBars.roll.container);
    controlDisplay.appendChild(this.controlBars.pitch.container);
    controlDisplay.appendChild(this.controlBars.yaw.container);
    controlDisplay.appendChild(this.controlBars.throttle.container);
  }

  /**
   * @method animate
   * @description Main animation loop that updates the scene and renders each frame.
   */
  animate() {
    this.stats.begin();

    requestAnimationFrame(this.animate.bind(this));

    this.physicsEngine.update();
    
    // Update controls with the drone's current orientation
    if (this.scene.drone && this.scene.drone.quaternion) {
      this.controls.update(this.scene.drone.quaternion);
    } else {
      this.controls.update();
    }
    
    // Update camera positions
    this.updateCameraPosition();
    this.updateFPVCameraPosition();

    // Render main view, FPV, and axes
    this.renderer.render(this.scene, this.camera);
    this.fpvRenderer.render(this.scene, this.fpvCamera);
    if (this.scene.drone) {
      this.axesScene.quaternion.copy(this.scene.drone.quaternion);
      this.axesRenderer.render(this.axesScene, this.axesCamera);
    }

    // Update UI elements
    if (this.scene.drone) {
      updatePositionDisplay(this.positionDisplay, this.scene.drone.position);
      updateCompass(this.compass, this.scene.drone.quaternion);
    }
    this.updateControlBars();

    this.stats.end();
  }

  /**
   * @method updateControlBars
   * @description Updates the control bar displays with current input values.
   */
  updateControlBars() {
    const { roll, pitch, yaw, throttle } = this.controls.channels;

    updateControlBar(this.controlBars.roll, roll);
    updateControlBar(this.controlBars.pitch, pitch);
    updateControlBar(this.controlBars.yaw, yaw);
    updateControlBar(this.controlBars.throttle, throttle);
  }

  /**
   * @method updateCameraPosition
   * @description Updates the main camera position relative to the drone.
   */
  updateCameraPosition() {
    if (this.scene.drone) {
      const dronePosition = this.scene.drone.position;
      const droneQuaternion = this.scene.drone.quaternion;

      // Calculate the rotated offset
      const rotatedOffset = this.cameraOffset.clone().applyQuaternion(droneQuaternion);

      // Set camera position
      this.camera.position.set(
        dronePosition.x + rotatedOffset.x,
        dronePosition.y + rotatedOffset.y,
        dronePosition.z + rotatedOffset.z
      );

      // Make the camera look at the drone
      this.camera.lookAt(dronePosition);
    }
  }

  /**
   * @method updateFPVCameraPosition
   * @description Updates the FPV camera position and orientation to match the drone.
   */
  updateFPVCameraPosition() {
    if (this.scene.drone) {
      const dronePosition = this.scene.drone.position;
      const droneQuaternion = this.scene.drone.quaternion;

      // Set FPV camera position to match the drone's position
      this.fpvCamera.position.copy(dronePosition);

      // Create a quaternion for rotating 180 degrees around the Y-axis
      const rotationY180 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));

      // Combine the drone's rotation with the 180-degree Y-rotation
      const combinedRotation = new THREE.Quaternion().multiplyQuaternions(droneQuaternion, rotationY180);

      // Set FPV camera rotation to the combined rotation
      this.fpvCamera.setRotationFromQuaternion(combinedRotation);

      // Offset the camera slightly forward and up from the drone's center
      const offset = new THREE.Vector3(0, 0.5, 0.5);
      offset.applyQuaternion(combinedRotation);
      this.fpvCamera.position.add(offset);
    }
  }

  /**
   * @method onWindowResize
   * @description Handles window resize events, updating the camera and renderer accordingly.
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export default App;