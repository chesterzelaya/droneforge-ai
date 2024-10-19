import React from 'react';

/**
 * Creates a position display element.
 * @returns {HTMLElement} The DOM element for displaying position.
 */
export const createPositionDisplay = () => {
  const positionDiv = document.createElement('div');
  positionDiv.style.position = 'absolute';
  positionDiv.style.bottom = '10px';
  positionDiv.style.left = '10px';
  positionDiv.style.padding = '10px';
  positionDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  positionDiv.style.color = 'white';
  positionDiv.style.borderRadius = '5px';
  positionDiv.style.fontFamily = 'Arial, sans-serif';
  positionDiv.innerText = 'Position: (0, 0, 0)';
  return positionDiv;
};

/**
 * Updates the position display with the current drone position.
 * @param {HTMLElement} positionDiv - The position display element.
 * @param {THREE.Vector3} position - The drone's current position.
 */
export const updatePositionDisplay = (positionDiv, position) => {
  if (positionDiv && position) {
    positionDiv.innerText = `Position: (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`;
  }
};

/**
 * Creates a control bar for displaying channel values.
 * @param {string} name - The name of the control bar.
 * @param {number} value - The initial value.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {Object} The control bar object containing the container and value element.
 */
export const createControlBar = (name, value, min, max) => {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '5px';

  const label = document.createElement('span');
  label.innerText = `${name}:`;
  container.appendChild(label);

  const valueSpan = document.createElement('span');
  valueSpan.innerText = value;
  container.appendChild(valueSpan);

  return { container, valueSpan };
};

/**
 * Updates the control bar with the current channel value.
 * @param {Object} controlBar - The control bar object.
 * @param {number} value - The current value of the channel.
 */
export const updateControlBar = (controlBar, value) => {
  if (controlBar && controlBar.valueSpan) {
    controlBar.valueSpan.innerText = value;
  }
};

/**
 * Creates performance stats using Stats.js.
 * @returns {Stats} The Stats instance.
 */
export const createPerformanceStats = () => {
  const Stats = require('stats.js'); // Ensure stats.js is installed
  const stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);
  return stats;
};

/**
 * Creates a compass element.
 * @returns {HTMLElement} The compass element.
 */
export const createCompass = () => {
  const compassDiv = document.createElement('div');
  compassDiv.style.position = 'absolute';
  compassDiv.style.top = '10px';
  compassDiv.style.left = '220px';
  compassDiv.style.width = '100px';
  compassDiv.style.height = '100px';
  compassDiv.style.border = '2px solid white';
  compassDiv.style.borderRadius = '50%';
  compassDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  compassDiv.style.display = 'flex';
  compassDiv.style.alignItems = 'center';
  compassDiv.style.justifyContent = 'center';
  compassDiv.innerText = 'Compass';
  return compassDiv;
};

/**
 * Updates the compass based on drone's orientation.
 * @param {HTMLElement} compass - The compass element.
 * @param {THREE.Quaternion} quaternion - The drone's current orientation.
 */
export const updateCompass = (compass, quaternion) => {
  if (compass && quaternion) {
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    const yaw = THREE.MathUtils.radToDeg(euler.y);
    compass.innerText = `Yaw: ${yaw.toFixed(2)}°`;
  }
};
