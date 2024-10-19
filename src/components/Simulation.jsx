import React, { useRef, useEffect, useContext } from 'react';
import * as THREE from 'three';
import DroneScene from '../scenes/DroneScene';
import DroneControls from '../controls/DroneControls';
import PhysicsEngine from '../physics/PhysicsEngine';
import {
  createPositionDisplay,
  updatePositionDisplay,
  createControlBar,
  updateControlBar,
  createPerformanceStats,
  createCompass,
  updateCompass, // Ensure this is imported
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

const Simulation = () => {
  const mountRef = useRef(null);
  const fpvMountRef = useRef(null);
  const axesMountRef = useRef(null);
  const controlBarsRef = useRef(null);
  const compassRef = useRef(null);
  const statsRef = useRef(null);
  const { addLog } = useContext(LoadingContext);

  useEffect(() => {
    // Initialize Three.js Renderer
    addLog('Initializing Three.js Renderer...');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    addLog('Three.js Renderer initialized.');

    // Initialize Scene and Camera
    addLog('Initializing Drone Scene...');
    const scene = new DroneScene(addLog); // Pass addLog here
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, -10);
    camera.lookAt(0, 0, 0);
    addLog('Drone Scene and Camera initialized.');

    // Initialize Controls and Physics
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

    // Initialize UI Elements
    addLog('Creating UI Elements...');
    const positionDisplay = createPositionDisplay();
    mountRef.current.appendChild(positionDisplay);
    addLog('Position Display created.');

    const fpvRenderer = createFPVDisplay();
    if (fpvMountRef.current) {
      fpvMountRef.current.appendChild(fpvRenderer.domElement);
      addLog('FPV Renderer created.');
    }

    const axesRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    axesRenderer.setSize(100, 100);
    if (axesMountRef.current) {
      axesMountRef.current.appendChild(axesRenderer.domElement);
      addLog('Axes Renderer created.');
    }
    const axesScene = new THREE.Scene();
    const axesCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    axesCamera.position.set(0, 0, 3);
    axesCamera.lookAt(0, 0, 0);
    const axesHelper = new THREE.AxesHelper(2);
    axesScene.add(axesHelper);
    addLog('Axes Scene and Helper initialized.');

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

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      stats.begin();

      // Update physics engine
      physicsEngine.update();

      // Update controls with the drone's current orientation
      if (scene.drone && scene.drone.quaternion) {
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
        axesScene.quaternion.copy(scene.drone.quaternion);
        axesRenderer.render(axesScene, axesCamera);
      }

      // Update UI elements
      if (scene.drone) {
        updatePositionDisplay(positionDisplay, scene.drone.position);
        updateCompass(compass, scene.drone.quaternion);
      }
      updateControlBars(); // Call directly
      updateControlBarsDisplay(controlBars, controls.getControlInputs());

      stats.end();
    };

    animate();
    addLog('Animation loop started.');

    // Cleanup on Unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
      mountRef.current.removeChild(positionDisplay);
      if (fpvMountRef.current) {
        fpvMountRef.current.removeChild(fpvRenderer.domElement);
      }
      if (axesMountRef.current) {
        axesMountRef.current.removeChild(axesRenderer.domElement);
      }
      mountRef.current.removeChild(controlDisplay);
      mountRef.current.removeChild(compass);
      mountRef.current.removeChild(stats.dom);
      addLog('Cleanup completed on unmount.');
    };
  }, [addLog]);

  // Helper Functions to Update Camera Positions
  const updateCameraPosition = (camera, drone) => {
    if (drone) {
      const cameraOffset = new THREE.Vector3(0, 5, -10);
      const rotatedOffset = cameraOffset.clone().applyQuaternion(drone.quaternion);
      camera.position.set(
        drone.position.x + rotatedOffset.x,
        drone.position.y + rotatedOffset.y,
        drone.position.z + rotatedOffset.z
      );
      camera.lookAt(drone.position);
    }
  };

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

  const updateControlBarsDisplay = (controlBars, channels) => {
    const { roll, pitch, yaw, throttle } = channels;
    updateControlBar(controlBars.roll, roll);
    updateControlBar(controlBars.pitch, pitch);
    updateControlBar(controlBars.yaw, yaw);
    updateControlBar(controlBars.throttle, throttle);
  };

  const updateControlBars = () => {
    // Implement any additional logic if needed
  };

  return (
    <>
      {/* Mount Point for Main Renderer */}
      <div ref={mountRef} />

      {/* Mount Point for FPV Renderer */}
      <div ref={fpvMountRef} />

      {/* Mount Point for Axes Renderer */}
      <div ref={axesMountRef} />

      {/* Mount Point for Control Bars */}
      {/* If additional mount points are needed, add them here */}
    </>
  );
};

export default Simulation;
