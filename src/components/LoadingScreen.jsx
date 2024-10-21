import React, { useEffect, useRef } from 'react';
import './LoadingScreen.css'; // Ensure this path is correct
import * as THREE from 'three';

/**
 * @component LoadingScreen
 * @description A React component that displays a loading screen with a 3D animated orb and log messages.
 * It uses Three.js for rendering the 3D orb and custom shaders for visual effects.
 * 
 * @param {Object} props - The component props.
 * @param {string[]} props.logs - An array of log messages to display.
 * 
 * @example
 * <LoadingScreen logs={['Initializing...', 'Loading assets...', 'Ready!']} />
 */
const LoadingScreen = ({ logs }) => {
  const orbRef = useRef(null);
  const rendererRef = useRef(null);
  const mousePosition = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    if (!orbRef.current) return;

    /**
     * Sets up the Three.js scene, camera, and renderer.
     * @type {THREE.Scene}
     */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    orbRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    /**
     * Creates a crystal-like geometry with custom shaders.
     * @type {THREE.Mesh}
     */
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mousePosition: { value: new THREE.Vector2(0, 0) },
        backgroundColor: { value: new THREE.Color(0x050a0e) },
        accentColor: { value: new THREE.Color(0x00F135) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        uniform vec2 mousePosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          vec3 pos = position;
          float distanceToMouse = length(mousePosition - vec2(pos.x, pos.y));
          pos += normal * sin(distanceToMouse * 10.0) * 0.02;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 backgroundColor;
        uniform vec3 accentColor;
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          float fresnel = pow(1.0 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
          vec3 color = mix(backgroundColor, accentColor, fresnel * 0.3);
          float pulse = sin(time * 1.5 + vUv.y * 8.0) * 0.5 + 0.5;
          color = mix(color, accentColor, pulse * fresnel * 0.2);
          gl_FragColor = vec4(color, 0.8 + fresnel * 0.2);
        }
      `,
      transparent: true,
    });

    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 2.73;

    /**
     * Handles mouse movement to update the orb's appearance.
     * @param {MouseEvent} event - The mouse move event.
     */
    const onMouseMove = (event) => {
      const targetX = (event.clientX / window.innerWidth) * 2 - 1;
      const targetY = -(event.clientY / window.innerHeight) * 2 + 1;
      mousePosition.current.x += (targetX - mousePosition.current.x) * 0.05;
      mousePosition.current.y += (targetY - mousePosition.current.y) * 0.05;
    };

    window.addEventListener('mousemove', onMouseMove);

    /**
     * Animation loop for continuous rendering.
     * @param {number} time - The current timestamp.
     */
    const animate = (time) => {
      requestAnimationFrame(animate);
      orb.rotation.x += 0.001;
      orb.rotation.y += 0.002;
      material.uniforms.time.value = time * 0.001;
      material.uniforms.mousePosition.value.copy(mousePosition.current);
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (orbRef.current && rendererRef.current) {
        orbRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="loading-container">
      <div className="glow-background"></div>
      <div id="orb-container" ref={orbRef}></div>
      <div className="loading-content">
        <h1 className="title">DRONEFORGE-SDK</h1>
        <div className="loading-text">Initializing Simulation</div>
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
        </div>
      </div>
      <div className="log-container">
        <h2>Forge Progress</h2>
        <div className="logs">
          {logs.slice(-5).map((log, index) => (
            <div key={index} className="log-entry">
              <span className="log-bullet"></span>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
