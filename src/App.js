import * as THREE from 'three';
import DroneScene from './scenes/DroneScene';
import DroneControls from './controls/DroneControls';
import PhysicsEngine from './physics/PhysicsEngine';
import { createPositionDisplay, updatePositionDisplay } from './utils/helperFunctions';

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

    // Camera offset relative to the drone
    this.cameraOffset = new THREE.Vector3(0, 5, -10);
    
    // Initialize camera position
    this.camera.position.set(0, 5, -10);
    this.camera.lookAt(0, 0, 0);

    // Add FPV camera
    this.fpvCamera = new THREE.PerspectiveCamera(
      90, // Wider FOV for FPV
      1, // Aspect ratio of 1 for a square viewport
      0.1,
      1000
    );
    
    // FPV render target
    this.fpvRenderTarget = new THREE.WebGLRenderTarget(256, 256);
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

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    this.animate();
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

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.physicsEngine.update();
    
    // Update controls with the drone's current orientation
    if (this.scene.drone && this.scene.drone.quaternion) {
      this.controls.update(this.scene.drone.quaternion);
    } else {
      this.controls.update(); // Call update without parameters if drone is not available
    }
    
    // Update camera positions
    this.updateCameraPosition();
    this.updateFPVCameraPosition();

    // Render main view
    this.renderer.render(this.scene, this.camera);

    // Render FPV
    this.fpvRenderer.render(this.scene, this.fpvCamera);

    // Update position display
    if (this.scene.drone) {
      updatePositionDisplay(this.positionDisplay, this.scene.drone.position);
    }
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

      // Set FPV camera position slightly above the drone
      this.fpvCamera.position.set(
        dronePosition.x,
        dronePosition.y + 0.5, // Slightly above the drone
        dronePosition.z
      );

      // Create a quaternion for the initial north-facing rotation
      const northRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));

      // Extract Euler angles from the drone's quaternion
      const droneEuler = new THREE.Euler().setFromQuaternion(droneQuaternion);

      // Create a new quaternion with inverted roll
      const invertedRollQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          -droneEuler.x, // Invert the x-rotation (roll)
          droneEuler.y,  // Keep y-rotation (yaw) the same
          droneEuler.z   // Keep z-rotation (pitch) the same
        )
      );

      // Combine the north rotation with the inverted roll rotation
      const combinedRotation = new THREE.Quaternion().multiplyQuaternions(invertedRollQuaternion, northRotation);

      // Set FPV camera rotation to the combined rotation
      this.fpvCamera.setRotationFromQuaternion(combinedRotation);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export default App;