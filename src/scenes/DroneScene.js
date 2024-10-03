import * as THREE from 'three';

class DroneScene extends THREE.Scene {
  constructor() {
    super();
    this.drone = null;
    this.axesHelper = null;
  }

  init() {
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    this.add(directionalLight);

    // Create cube drone
    this.createCubeDrone();

    // Add axes helper to the drone
    this.addAxesHelper();

    // Add environment
    this.addEnvironment();

    // Add scenery
    this.addScenery();
  }

  createCubeDrone() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    this.drone = new THREE.Mesh(geometry, material);
    this.drone.position.set(0, 5, 0);
    
    // Rotate the drone to face north initially
    this.drone.rotation.y = Math.PI;
    
    this.add(this.drone);
  }

  addAxesHelper() {
    // Create a custom axes helper
    this.axesHelper = new THREE.Group();

    const axisLength = 2;
    const axisWidth = 0.05;

    // X-axis (red)
    const xAxis = new THREE.Mesh(
      new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    xAxis.rotation.z = -Math.PI / 2;
    xAxis.position.x = axisLength / 2;

    // Y-axis (green)
    const yAxis = new THREE.Mesh(
      new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    yAxis.position.y = axisLength / 2;

    // Z-axis (blue)
    const zAxis = new THREE.Mesh(
      new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength),
      new THREE.MeshBasicMaterial({ color: 0x0000ff })
    );
    zAxis.rotation.x = Math.PI / 2;
    zAxis.position.z = axisLength / 2;
    zAxis.position.y = -0.5; // Move the Z-axis slightly down and back

    this.axesHelper.add(xAxis, yAxis, zAxis);
    this.axesHelper.position.set(0, 0.5, 0); // Offset slightly to be on top of the drone
    this.drone.add(this.axesHelper);
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

  addScenery() {
    const treeGeometry = new THREE.ConeGeometry(1, 5, 8);
    const treeMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
    const treeTrunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    const treeTrunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });

    for (let i = -50; i <= 50; i += 10) {
      for (let j = -50; j <= 50; j += 10) {
        const tree = new THREE.Mesh(treeGeometry, treeMaterial);
        tree.position.set(i, 3.5, j);

        const trunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
        trunk.position.set(0, -2, 0);
        tree.add(trunk);

        this.add(tree);
      }
    }

    // Add some buildings
    const buildingGeometry = new THREE.BoxGeometry(5, 10, 5);
    const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0xa9a9a9 });

    for (let i = -40; i <= 40; i += 20) {
      for (let j = -40; j <= 40; j += 20) {
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(i, 5, j);
        this.add(building);
      }
    }
  }
}

export default DroneScene;