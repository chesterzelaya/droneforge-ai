import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

class DroneScene extends THREE.Scene {
  constructor() {
    super();
    this.drone = null;
    this.environment = null;
  }

  async init() {
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    this.add(directionalLight);

    // Create cube drone
    this.createCubeDrone();

    // Load new environment
    await this.loadEnvironment();

    // Skybox (simple color for now)
    const skyColor = new THREE.Color(0x87CEEB);
    this.background = skyColor;
  }

  createCubeDrone() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    this.drone = new THREE.Mesh(geometry, material);
    this.drone.position.set(0, 5, 0);
    
    // Ensure the drone is facing north (negative Z-axis)
    this.drone.rotation.y = 0;
    
    this.add(this.drone);
  }

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
          
          // Optional: Adjust the scale of the loaded environment if needed
          // this.environment.scale.set(10, 10, 10);

          // Optional: Adjust the position of the loaded environment if needed
          // this.environment.position.set(0, 0, 0);

          this.add(this.environment);
          console.log('Environment loaded successfully');
          resolve();
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.error('An error happened', error);
          reject(error);
        }
      );
    });
  }
}

export default DroneScene;
