import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

/**
 * @function createPositionDisplay
 * @description Creates a DOM element to display the drone's position.
 * @returns {HTMLElement} The created position display element.
 */
export function createPositionDisplay() {
  const positionDisplay = document.createElement('div');
  positionDisplay.style.position = 'absolute';
  positionDisplay.style.bottom = '10px';
  positionDisplay.style.right = '10px';
  positionDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  positionDisplay.style.color = 'white';
  positionDisplay.style.padding = '10px';
  positionDisplay.style.fontFamily = 'Arial, sans-serif';
  positionDisplay.style.fontSize = '14px';
  positionDisplay.style.borderRadius = '5px';
  document.body.appendChild(positionDisplay);
  return positionDisplay;
}

/**
 * @function updatePositionDisplay
 * @description Updates the position display with the current drone position.
 * @param {HTMLElement} display - The position display element.
 * @param {THREE.Vector3} position - The current position of the drone.
 */
export function updatePositionDisplay(display, position) {
  display.textContent = `Position: 
    X: ${position.x.toFixed(2)}
    Y: ${position.y.toFixed(2)}
    Z: ${position.z.toFixed(2)}`;
}

/**
 * @function createControlBar
 * @description Creates a control bar for displaying drone input values.
 * @param {string} label - The label for the control bar.
 * @param {number} initialValue - The initial value of the control.
 * @param {number} min - The minimum value of the control.
 * @param {number} max - The maximum value of the control.
 * @returns {Object} An object containing the control bar elements.
 */
export function createControlBar(label, initialValue, min, max) {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'flex-start';

  const labelElem = document.createElement('span');
  labelElem.textContent = `${label}: ${initialValue}`;
  labelElem.style.color = 'white';
  labelElem.style.marginBottom = '5px';
  container.appendChild(labelElem);

  const bar = document.createElement('div');
  bar.style.width = '100%';
  bar.style.height = '20px';
  bar.style.backgroundColor = '#555';
  bar.style.borderRadius = '10px';
  bar.style.overflow = 'hidden';
  container.appendChild(bar);

  const fill = document.createElement('div');
  fill.style.height = '100%';
  fill.style.width = `${((initialValue - min) / (max - min)) * 100}%`;
  fill.style.backgroundColor = getBarColor(label);
  fill.style.transition = 'width 0.1s ease-in-out';
  bar.appendChild(fill);

  return { container, fill, labelElem, min, max };
}

/**
 * @function updateControlBar
 * @description Updates a control bar with a new value.
 * @param {Object} controlBar - The control bar object.
 * @param {number} value - The new value for the control bar.
 */
export function updateControlBar(controlBar, value) {
  const { fill, labelElem, min, max } = controlBar;
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;
  fill.style.width = `${percentage}%`;
  labelElem.textContent = `${labelElem.textContent.split(':')[0]}: ${clampedValue}`;
}

/**
 * @function getBarColor
 * @private
 * @description Returns a color for a control bar based on its label.
 * @param {string} label - The label of the control bar.
 * @returns {string} The color for the control bar.
 */
function getBarColor(label) {
  switch (label) {
    case 'Roll': return '#ff0000'; // Red
    case 'Pitch': return '#00ff00'; // Green
    case 'Yaw': return '#0000ff'; // Blue
    case 'Throttle': return '#ffff00'; // Yellow
    default: return '#ffffff'; // White
  }
}

/**
 * @function createPerformanceStats
 * @description Creates a performance stats display using Stats.js.
 * @returns {Stats} The created Stats object.
 */
export function createPerformanceStats() {
  const stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);
  stats.dom.style.position = 'absolute';
  stats.dom.style.top = '10px';
  stats.dom.style.left = '10px';
  return stats;
}

/**
 * @function createCompass
 * @description Creates a compass display for showing drone orientation.
 * @returns {HTMLElement} The created compass element.
 */
export function createCompass() {
  const compass = document.createElement('div');
  compass.style.position = 'absolute';
  compass.style.top = '10px';
  compass.style.left = '50%';
  compass.style.transform = 'translateX(-50%)';
  compass.style.width = '100px';
  compass.style.height = '100px';
  compass.style.borderRadius = '50%';
  compass.style.border = '2px solid white';
  compass.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

  const needle = document.createElement('div');
  needle.style.position = 'absolute';
  needle.style.top = '10px';
  needle.style.left = '50%';
  needle.style.width = '2px';
  needle.style.height = '40px';
  needle.style.backgroundColor = 'red';
  needle.style.transformOrigin = 'bottom center';

  compass.appendChild(needle);
  document.body.appendChild(compass);

  return compass;
}

/**
 * @function updateCompass
 * @description Updates the compass display based on the drone's orientation.
 * @param {HTMLElement} compass - The compass element.
 * @param {THREE.Quaternion} quaternion - The drone's current orientation.
 */
export function updateCompass(compass, quaternion) {
  const needle = compass.firstChild;
  const euler = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ');
  
  let yawDegrees = THREE.MathUtils.radToDeg(euler.y);
  yawDegrees = (yawDegrees + 360) % 360;

  needle.style.transform = `translateX(-50%) rotate(${yawDegrees}deg)`;
}