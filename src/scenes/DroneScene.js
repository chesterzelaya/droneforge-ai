import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class DroneScene extends THREE.Scene {
  constructor() {
    super();
    this.loader = new GLTFLoader();
    this.drone = null;
  }

  init() {
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    this.add(directionalLight);

    // Load drone model
    this.loadDroneModel();

    // Add environment
    this.addEnvironment();
  }

  loadDroneModel() {
    this.loader.load(
      'assets/models/drone.glb',
      (gltf) => {
        this.drone = gltf.scene;
        this.drone.scale.set(1, 1, 1); // Increased scale by 10x (from 0.1 to 1)
        this.drone.position.set(0, 5, 0); // Position the drone above the ground
        this.add(this.drone);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('An error happened while loading the drone model', error);
      }
    );
  }

  addEnvironment() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.add(ground);

    // Skybox (simple color for now)
    const skyColor = new THREE.Color(0x87CEEB);
    this.background = skyColor;
  }
}

export default DroneScene;
