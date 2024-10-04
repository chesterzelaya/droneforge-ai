import * as THREE from 'three';
import DroneScene from './scenes/DroneScene';
import DroneControls from './controls/DroneControls';
import PhysicsEngine from './physics/PhysicsEngine';
import { createPositionDisplay, updatePositionDisplay, createControlBar, updateControlBar, createPerformanceStats, createCompass, updateCompass } from './utils/helperFunctions';
import { loadModel, runInference } from './utils/objectDetection';

class App {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new DroneScene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.controls = new DroneControls(); // Removed camera dependency
    this.physicsEngine = new PhysicsEngine(this.controls);
    this.positionDisplay = null;
    this.compass = null;

    // Camera offset relative to the drone
    this.cameraOffset = new THREE.Vector3(0, 5, -10);
    
    // Initialize camera position
    this.camera.position.set(0, 5, -10);
    this.camera.lookAt(0, 0, 0);

    // Modify FPV camera setup
    this.fpvCamera = new THREE.PerspectiveCamera(
      90, // Wider FOV for FPV
      1, // Aspect ratio of 1 for a square viewport
      0.1,
      1000
    );
    
    // Remove the FPV render target as it's not needed
    // this.fpvRenderTarget = new THREE.WebGLRenderTarget(256, 256);

    // Add axes renderer
    this.axesRenderer = null;
    this.axesScene = null;
    this.axesCamera = null;

    // Add control bars
    this.controlBars = {};

    // Add performance stats
    this.stats = createPerformanceStats();

    // Add object detection properties
    this.objectDetectionReady = false;
    this.testImage = new Image();
    this.testImage.src = '/assets/test_image.jpg'; // Make sure to add a test image to your public/assets folder
  }

  async init() {
    document.body.appendChild(this.renderer.domElement);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene.init();
    await this.physicsEngine.init(this.scene);

    // Create position display
    this.positionDisplay = createPositionDisplay();

    // Create FPV display
    this.createFPVDisplay();

    // Create axes display
    this.createAxesDisplay();

    // Create control bars display
    this.createControlBarsDisplay();

    // Create compass
    this.compass = createCompass();

    // Initialize object detection
    await this.initObjectDetection();

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    this.animate();
  }

  async initObjectDetection() {
    try {
      await loadModel();
      this.objectDetectionReady = true;
      console.log('Object detection initialized');
      this.runTestInference();
    } catch (error) {
      console.error('Failed to initialize object detection:', error);
    }
  }

  async runTestInference() {
    if (!this.objectDetectionReady) {
      console.error('Object detection not ready');
      return;
    }

    this.testImage.onload = async () => {
      const predictions = await runInference(this.testImage);
      console.log('Test inference results:', predictions);
      // You can display these results in your UI if desired
    };
  }

  createFPVDisplay() {
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

    this.fpvRenderer = new THREE.WebGLRenderer({ canvas: fpvCanvas });
    this.fpvRenderer.setSize(256, 256);
  }

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

    // Render main view
    this.renderer.render(this.scene, this.camera);

    // Render FPV
    this.fpvRenderer.render(this.scene, this.fpvCamera);

    // Render axes
    if (this.scene.drone) {
      this.axesScene.quaternion.copy(this.scene.drone.quaternion);
      this.axesRenderer.render(this.axesScene, this.axesCamera);
    }

    // Update position display
    if (this.scene.drone) {
      updatePositionDisplay(this.positionDisplay, this.scene.drone.position);
    }

    // Update control bars
    this.updateControlBars();

    // Update compass
    if (this.scene.drone) {
      updateCompass(this.compass, this.scene.drone.quaternion);
    }

    this.stats.end();
  }

  updateControlBars() {
    const { roll, pitch, yaw, throttle } = this.controls.channels;

    updateControlBar(this.controlBars.roll, roll);
    updateControlBar(this.controlBars.pitch, pitch);
    updateControlBar(this.controlBars.yaw, yaw);
    updateControlBar(this.controlBars.throttle, throttle);
  }

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
      const offset = new THREE.Vector3(0, 0.5, 0.5); // Adjusted to move camera forward
      offset.applyQuaternion(combinedRotation);
      this.fpvCamera.position.add(offset);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export default App;
