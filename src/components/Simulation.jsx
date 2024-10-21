import React, { useRef, useEffect, useContext } from 'react';
import * as THREE from 'three';
import DroneScene from '../scenes/DroneScene';
import DroneControls from '../controls/droneControls';
import PhysicsEngine from '../physics/physicsEngine';
import {
  createPositionDisplay,
  updatePositionDisplay,
  createControlBar,
  updateControlBar,
  createPerformanceStats,
  createCompass,
  updateCompass,
  createAxesView,
  updateAxesView,
} from '../utils/helperFunctions';
import {
  createFPVDisplay,
  captureFPVSnapshot,
  downloadImage,
  displayImage,
  startFrameCapture,
} from '../utils/fpvUtils';
import { runInferenceOnFrameCapture } from '../inference/modelHelper';
import { LoadingContext } from '../context/LoadingContext';

/**
 * @component Simulation
 * @description A React component that renders a 3D drone simulation using Three.js.
 * It includes a main view, First Person View (FPV), axes display, and various UI elements
 * for displaying drone status and controls.
 * 
 * @example
 * <Simulation />
 */
const Simulation = () => {
  const mountRef = useRef(null);
  const { addLog } = useContext(LoadingContext);

  useEffect(() => {
    if (!mountRef.current) return;

    /**
     * Initializes the Three.js renderer and sets up the main scene.
     * @type {THREE.WebGLRenderer}
     */
    addLog('Initializing Three.js Renderer...');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    addLog('Three.js Renderer initialized.');

    /**
     * Sets up the main camera for the drone scene.
     * @type {THREE.PerspectiveCamera}
     */
    addLog('Initializing Drone Scene...');
    const scene = new DroneScene(addLog);
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, -3);
    camera.lookAt(0, 0, 0);
    addLog('Drone Scene and Camera initialized.');

    /**
     * Initializes drone controls and physics engine.
     * @type {DroneControls}
     * @type {PhysicsEngine}
     */
    addLog('Initializing Drone Controls...');
    const controls = new DroneControls();
    addLog('Drone Controls initialized.');

    addLog('Initializing Physics Engine...');
    const physicsEngine = new PhysicsEngine(controls);
    addLog('Physics Engine initialized.');

    // Initialize the scene and physics engine
    scene.init().then(() => {
      addLog('Drone Scene initialized successfully.');
      physicsEngine.init(scene).then(() => {
        addLog('Physics Engine initialized successfully.');
      }).catch((error) => {
        addLog(`Error initializing Physics Engine: ${error.message}`);
      });
    }).catch((error) => {
      addLog(`Error initializing Drone Scene: ${error.message}`);
    });

    /**
     * Creates and sets up various UI elements for the simulation.
     */
    addLog('Creating UI Elements...');
    const positionDisplay = createPositionDisplay();
    mountRef.current.appendChild(positionDisplay);
    addLog('Position Display created.');

    const fpvRenderer = createFPVDisplay(mountRef.current);
    addLog('FPV Display created.');

    /**
     * Creates and sets up the axes view for showing drone orientation.
     */
    addLog('Creating Axes View...');
    const axesView = createAxesView(mountRef.current);
    addLog('Axes View created.');

    /**
     * Creates control display for showing drone control inputs.
     */
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
    mountRef.current.appendChild(controlDisplay);
    addLog('Control Display container created.');

    const controlBars = {
      roll: createControlBar('Roll', 1500, 0, 3000),
      pitch: createControlBar('Pitch', 1500, 0, 3000),
      yaw: createControlBar('Yaw', 1500, 0, 3000),
      throttle: createControlBar('Throttle', 0, 0, 3000),
    };

    Object.values(controlBars).forEach((bar) => controlDisplay.appendChild(bar.container));
    addLog('Control Bars created.');

    const compass = createCompass();
    mountRef.current.appendChild(compass);
    addLog('Compass created.');

    const stats = createPerformanceStats();
    addLog('Performance Stats created.');

    /**
     * Handles window resize events to update camera and renderer.
     */
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    /**
     * Main animation loop for the simulation.
     * @param {number} time - The current timestamp.
     */
    const animate = (time) => {
      requestAnimationFrame(animate);
      stats.begin();

      const deltaTime = clock.getDelta();

      // Update physics engine
      physicsEngine.update();

      // Update drone scene (for animations)
      scene.update(deltaTime);

      // Update controls with the drone's current orientation
      if (scene.drone) {
        controls.update(scene.drone.quaternion);
      } else {
        controls.update();
      }

      // Update camera positions
      updateCameraPosition(camera, scene.drone);
      updateFPVCameraPosition(fpvRenderer, scene.drone);

      // Render main view, FPV, and axes
      renderer.render(scene, camera);
      fpvRenderer.render(scene, camera);
      if (scene.drone) {
        axesView.axesScene.quaternion.copy(scene.drone.quaternion);
        axesView.axesRenderer.render(axesView.axesScene, axesView.axesCamera);
      }

      // Update UI elements
      if (scene.drone) {
        updatePositionDisplay(positionDisplay, scene.drone.position);
        updateCompass(compass, scene.drone.quaternion);
      }
      updateControlBarsDisplay(controlBars, controls.getControlInputs());

      // Update axes view
      if (scene.drone) {
        updateAxesView(axesView, scene.drone.quaternion);
      }

      stats.end();
    };

    const clock = new THREE.Clock();
    animate();
    addLog('Animation loop started.');

    // Cleanup on Unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
        mountRef.current.removeChild(positionDisplay);
        mountRef.current.removeChild(controlDisplay);
        mountRef.current.removeChild(compass);
        mountRef.current.removeChild(axesView.axesRenderer.domElement);
        const fpvDisplay = mountRef.current.querySelector('div');
        if (fpvDisplay) {
          mountRef.current.removeChild(fpvDisplay);
        }
      }
      document.body.removeChild(stats.dom);
      addLog('Cleanup completed on unmount.');
    };
  }, [addLog]);

  /**
   * Updates the main camera position relative to the drone.
   * @param {THREE.PerspectiveCamera} camera - The main camera.
   * @param {THREE.Object3D} drone - The drone object.
   */
  const updateCameraPosition = (camera, drone) => {
    if (drone) {
      const cameraOffset = new THREE.Vector3(0, 1, -3);
      const rotatedOffset = cameraOffset.clone().applyQuaternion(drone.quaternion);
      camera.position.set(
        drone.position.x + rotatedOffset.x,
        drone.position.y + rotatedOffset.y,
        drone.position.z + rotatedOffset.z
      );
      camera.lookAt(drone.position);
    }
  };

  /**
   * Updates the FPV camera position and orientation.
   * @param {THREE.WebGLRenderer} fpvRenderer - The FPV renderer.
   * @param {THREE.Object3D} drone - The drone object.
   */
  const updateFPVCameraPosition = (fpvRenderer, drone) => {
    if (drone) {
      const fpvCamera = new THREE.PerspectiveCamera(
        90,
        fpvRenderer.domElement.width / fpvRenderer.domElement.height,
        0.1,
        1000
      );
      fpvCamera.position.copy(drone.position);
      const rotationY180 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));
      const combinedRotation = new THREE.Quaternion().multiplyQuaternions(
        drone.quaternion,
        rotationY180
      );
      fpvCamera.setRotationFromQuaternion(combinedRotation);
      const offset = new THREE.Vector3(0, 0.5, 0.5).applyQuaternion(combinedRotation);
      fpvCamera.position.add(offset);
    }
  };

  /**
   * Updates the control bars display with current control inputs.
   * @param {Object} controlBars - The control bar elements.
   * @param {Object} channels - The current control input values.
   */
  const updateControlBarsDisplay = (controlBars, channels) => {
    const { roll, pitch, yaw, throttle } = channels;
    updateControlBar(controlBars.roll, roll * 1500 + 1500);
    updateControlBar(controlBars.pitch, pitch * 1500 + 1500);
    updateControlBar(controlBars.yaw, yaw * 1500 + 1500);
    updateControlBar(controlBars.throttle, throttle * 3000);
  };

  return (
    <div ref={mountRef} />
  );
};

export default Simulation;
