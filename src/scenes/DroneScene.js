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
   */
  constructor() {
    super();
    this.drone = null;
    this.environment = null;
    console.log('DroneScene constructor: Scene initialized');
  }

  /**
   * @method init
   * @async
   * @description Initializes the scene, setting up lights, creating the drone, and loading the environment.
   */
  async init() {
    console.log('DroneScene init: Initializing scene');

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.add(ambientLight);
    console.log('DroneScene init: Ambient light added');

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    this.add(directionalLight);
    console.log('DroneScene init: Directional light added');

    // Create cube drone
    this.createCubeDrone();

    // Load new environment
    await this.loadEnvironment();

    // Skybox (simple color for now)
    const skyColor = new THREE.Color(0x87CEEB);
    this.background = skyColor;
    console.log('DroneScene init: Skybox color set');
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
    console.log('DroneScene createCubeDrone: Drone created and added to scene');
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

      // Optional: Use DRACOLoader for compressed meshes
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/'); // Adjust this path if needed
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        '/assets/models/gltf_enviorment3/Map_v1.gltf', // Adjust this path to your GLTF file
        (gltf) => {
          this.environment = gltf.scene;
          this.add(this.environment);
          console.log('DroneScene loadEnvironment: Environment loaded successfully');
          resolve();
        },
        (xhr) => {
          console.log(`DroneScene loadEnvironment: ${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error) => {
          console.error('DroneScene loadEnvironment: An error happened', error);
          reject(error);
        }
      );
    });
  }
}

export default DroneScene;
