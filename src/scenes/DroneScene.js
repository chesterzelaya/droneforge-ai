import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class DroneScene extends THREE.Scene {
  constructor() {
    super();
    this.loader = new GLTFLoader();
    this.addEnvironment();
  }

  init() {
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    this.add(directionalLight);

    // Comment out the drone model loading for now
    // this.loadDroneModel();

    // Add a simple cube to represent the drone
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.drone = new THREE.Mesh(geometry, material);
    this.drone.position.set(0, 5, 0); // Position the cube above the ground
    this.add(this.drone);
  }

  loadDroneModel() {
    this.loader.load(
      '/assets/models/drone.glb',
      (gltf) => {
        this.drone = gltf.scene;
        this.add(this.drone);
      },
      undefined,
      (error) => {
        console.error('An error happened while loading the drone model.', error);
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

    // Skybox or Sky Sphere
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.add(sky);

    // Obstacles
    this.addTrees();
    this.addBuildings();
  }

  addTrees() {
    const treeGeometry = new THREE.ConeGeometry(5, 20, 8);
    const treeMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
    
    for (let i = 0; i < 20; i++) {
      const tree = new THREE.Mesh(treeGeometry, treeMaterial);
      tree.position.set(
        Math.random() * 200 - 100,
        10,
        Math.random() * 200 - 100
      );
      tree.castShadow = true;
      this.add(tree);
    }
  }

  addBuildings() {
    const buildingGeometry = new THREE.BoxGeometry(20, 40, 20);
    const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0xA9A9A9 });
    
    for (let i = 0; i < 10; i++) {
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.set(
        Math.random() * 300 - 150,
        20,
        Math.random() * 300 - 150
      );
      building.castShadow = true;
      this.add(building);
    }
  }
}

export default DroneScene;
