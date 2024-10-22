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
    this.droneAnimations = [];
    this.animationMixer = null;
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

      // Add directional light with shadows
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 10);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 500;
      this.add(directionalLight);
      this.addLog('DroneScene init: Directional light added');

      // Load drone model
      await this.loadDroneModel();

      // Load environment
      await this.loadEnvironment();

      // Set sky color
      const skyColor = new THREE.Color(0x87CEEB);
      this.background = skyColor;
      this.addLog('DroneScene init: Skybox color set');
    } catch (error) {
      this.addLog(`DroneScene init: Initialization failed - ${error.message}`);
      throw error;
    }
  }

  async loadDroneModel() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        '/assets/models/drone/fpv.glb',
        (gltf) => {
          this.drone = gltf.scene;
          this.drone.scale.set(1, 1, 1);
          this.drone.position.set(0, 5, 0);

          // Traverse the drone model to ensure materials are properly applied
          this.drone.traverse((child) => {
            if (child.isMesh) {
              // Ensure the material is using its map (texture)
              if (child.material.map) {
                child.material.map.colorSpace = THREE.SRGBColorSpace;
                child.material.map.flipY = false; // GLB files typically don't need texture flipping
                child.material.needsUpdate = true;
              }
              
              // Apply these settings to other texture types if present
              ['normalMap', 'roughnessMap', 'metalnessMap'].forEach(mapType => {
                if (child.material[mapType]) {
                  child.material[mapType].colorSpace = THREE.LinearSRGBColorSpace;
                  child.material[mapType].flipY = false;
                }
              });

              // Enable shadows for each mesh
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.add(this.drone);

          // Set up animations
          this.animationMixer = new THREE.AnimationMixer(this.drone);
          this.droneAnimations = gltf.animations;
          
          // Play all animations
          this.droneAnimations.forEach((clip) => {
            const action = this.animationMixer.clipAction(clip);
            action.play();
          });

          this.addLog('DroneScene loadDroneModel: Drone model and animations loaded successfully');
          resolve();
        },
        (xhr) => {
          this.addLog(`DroneScene loadDroneModel: ${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error) => {
          this.addLog(`DroneScene loadDroneModel: An error occurred - ${error.message}`);
          reject(error);
        }
      );
    });
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

  update(deltaTime) {
    // Update animations
    if (this.animationMixer) {
      this.animationMixer.update(deltaTime);
    }
  }
}

export default DroneScene;
