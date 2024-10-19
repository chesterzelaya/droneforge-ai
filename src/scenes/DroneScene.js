import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * @class DroneScene
 * @extends THREE.Scene
 * @description Manages the 3D scene for the drone simulation, including the drone model and environment.
 */
class DroneScene extends THREE.Scene {
  /**
   * @constructor
   * @param {Function} addLog - Function to log messages.
   */
  constructor(addLog) {
    super();
    this.drone = null;
    this.environment = null;
    this.addLog = addLog;
    this.addLog('DroneScene constructor: Scene initialized');
  }

  /**
   * @method init
   * @async
   * @description Initializes the scene, setting up lights, creating the drone, and loading the environment.
   */
  async init() {
    this.addLog('DroneScene init: Initializing scene');

    try {
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.add(ambientLight);
      this.addLog('DroneScene init: Ambient light added');

      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(10, 10, 10);
      this.add(directionalLight);
      this.addLog('DroneScene init: Directional light added');

      // Create drone
      this.createCubeDrone();

      // Load environment
      await this.loadEnvironment();

      // Set sky color
      const skyColor = new THREE.Color(0x87CEEB);
      this.background = skyColor;
      this.addLog('DroneScene init: Skybox color set');
    } catch (error) {
      this.addLog(`DroneScene init: Initialization failed - ${error.message}`);
      throw error; // Re-throw to allow higher-level handling
    }
  }

  /**
   * @method createCubeDrone
   * @private
   * @description Creates a simple cube representation of the drone and adds it to the scene.
   */
  createCubeDrone() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    this.drone = new THREE.Mesh(geometry, material);
    this.drone.position.set(0, 5, 0);

    // Ensure the drone is facing north (negative Z-axis)
    this.drone.rotation.y = 0;

    this.add(this.drone);
    this.addLog('DroneScene createCubeDrone: Drone created and added to scene');
  }

  /**
   * @method loadEnvironment
   * @private
   * @returns {Promise} A promise that resolves when the environment is loaded.
   * @description Loads the 3D environment model and adds it to the scene.
   */
  loadEnvironment() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();

      // Use DRACOLoader for compressed meshes
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/'); // Ensure the path is correct
      loader.setDRACOLoader(dracoLoader);

      // Ensure the path is correct and accessible
      loader.load(
        '/assets/models/gltf_enviorment3/Map_v1.gltf', // Correct the directory name here
        (gltf) => {
          this.environment = gltf.scene;
          this.add(this.environment);
          this.addLog('DroneScene loadEnvironment: Environment loaded successfully');
          resolve();
        },
        (xhr) => {
          this.addLog(`DroneScene loadEnvironment: ${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error) => {
          this.addLog(`DroneScene loadEnvironment: An error occurred - ${error.message}`);
          reject(error);
        }
      );
    });
  }
}

export default DroneScene;
