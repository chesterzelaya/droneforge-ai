import React, { useRef, useEffect } from 'react';
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
} from '../utils/helperFunctions';
import {
  createFPVDisplay,
  captureFPVSnapshot,
  downloadImage,
  displayImage,
  startFrameCapture,
} from '../utils/fpvUtils';
import { runInferenceOnFrameCapture } from '../inference/modelHelper';

const Simulation = () => {
  const mountRef = useRef(null);
  const fpvMountRef = useRef(null);
  const axesMountRef = useRef(null);
  const controlBarsRef = useRef(null);
  const compassRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    // Initialize Three.js Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Initialize Scene and Camera
    const scene = new DroneScene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, -10);
    camera.lookAt(0, 0, 0);

    // Initialize Controls and Physics
    const controls = new DroneControls();
    const physicsEngine = new PhysicsEngine(controls);

    // Initialize the scene and physics engine
    scene.init().then(() => {
      console.log('DroneScene initialized successfully');
      physicsEngine.init(scene).then(() => {
        console.log('PhysicsEngine initialized successfully');
      }).catch((error) => {
        console.error('Error initializing PhysicsEngine:', error);
      });
    }).catch((error) => {
      console.error('Error initializing DroneScene:', error);
    });

    // Initialize UI Elements
    const positionDisplay = createPositionDisplay();
    mountRef.current.appendChild(positionDisplay);

    const fpvRenderer = createFPVDisplay();
    if (fpvMountRef.current) {
      fpvMountRef.current.appendChild(fpvRenderer.domElement);
    }

    const axesRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    axesRenderer.setSize(100, 100);
    if (axesMountRef.current) {
      axesMountRef.current.appendChild(axesRenderer.domElement);
    }
    const axesScene = new THREE.Scene();
    const axesCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    axesCamera.position.set(0, 0, 3);
    axesCamera.lookAt(0, 0, 0);
    const axesHelper = new THREE.AxesHelper(2);
    axesScene.add(axesHelper);

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

    const controlBars = {
      roll: createControlBar('Roll', 1500, 0, 3000),
      pitch: createControlBar('Pitch', 1500, 0, 3000),
      yaw: createControlBar('Yaw', 1500, 0, 3000),
      throttle: createControlBar('Throttle', 1500, 0, 3000),
    };

    Object.values(controlBars).forEach((bar) => {
      controlDisplay.appendChild(bar.container);
    });

    const compass = createCompass();
    mountRef.current.appendChild(compass);

    // Initialize Performance Stats
    const stats = createPerformanceStats();
    statsRef.current = stats;
    mountRef.current.appendChild(stats.dom);

    // Handle Window Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
      stats.begin();

      requestAnimationFrame(animate);

      // Update physics engine
      physicsEngine.update();

      if (scene.drone && scene.drone.quaternion) {
        controls.update(scene.drone.quaternion);
      } else {
        controls.update();
      }

      // Update Camera Positions
      updateCameraPosition(camera, scene.drone);
      updateFPVCameraPosition(fpvRenderer, scene.drone);

      // Render Scenes
      renderer.render(scene, camera);
      fpvRenderer.render(scene, camera);
      if (scene.drone) {
        axesScene.quaternion.copy(scene.drone.quaternion);
        axesRenderer.render(axesScene, axesCamera);
      }

      // Update UI Elements
      if (scene.drone) {
        updatePositionDisplay(positionDisplay, scene.drone.position);
        // Assuming you have a function to update the compass
        // updateCompass(compass, scene.drone.quaternion);
      }
      updateControlBarsDisplay(controlBars, controls.channels);

      stats.end();
    };

    animate();

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
    };
  }, []);

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
