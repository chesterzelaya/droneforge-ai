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
    this.controls = new DroneControls(this.camera, this.renderer.domElement);
    this.physicsEngine = new PhysicsEngine(this.controls);
    this.positionDisplay = null;

    // Camera offset relative to the drone
    this.cameraOffset = new THREE.Vector3(0, 5, -10);
  }

  async init() {
    document.body.appendChild(this.renderer.domElement);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene.init();
    await this.physicsEngine.init(this.scene);

    // Initialize camera position relative to the drone
    this.updateCameraPosition();

    // Create position display
    this.positionDisplay = createPositionDisplay();

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.physicsEngine.update();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    // Update camera position to follow the drone
    this.updateCameraPosition();

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
      this.camera.lookAt(this.scene.drone.position);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export default App;