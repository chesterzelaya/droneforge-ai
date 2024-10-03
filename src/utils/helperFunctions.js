import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

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

export function updatePositionDisplay(display, position) {
  display.textContent = `Position: 
    X: ${position.x.toFixed(2)}
    Y: ${position.y.toFixed(2)}
    Z: ${position.z.toFixed(2)}`;
}

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

export function updateControlBar(controlBar, value) {
  const { fill, labelElem, min, max } = controlBar;
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;
  fill.style.width = `${percentage}%`;
  labelElem.textContent = `${labelElem.textContent.split(':')[0]}: ${clampedValue}`;
}

function getBarColor(label) {
  switch (label) {
    case 'Roll':
      return '#ff0000'; // Red
    case 'Pitch':
      return '#00ff00'; // Green
    case 'Yaw':
      return '#0000ff'; // Blue
    case 'Throttle':
      return '#ffff00'; // Yellow
    default:
      return '#ffffff'; // White
  }
}

export function createPerformanceStats() {
  const stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);
  stats.dom.style.position = 'absolute';
  stats.dom.style.top = '10px';
  stats.dom.style.left = '10px';
  return stats;
}

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

export function updateCompass(compass, quaternion) {
  const needle = compass.firstChild;
  const euler = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ');
  
  // Convert yaw from radians to degrees
  let yawDegrees = THREE.MathUtils.radToDeg(euler.y);

  // Normalize yawDegrees to [0, 360)
  yawDegrees = (yawDegrees + 360) % 360;

  // Adjust the rotation so that 0 degrees points north (-Z axis)
  // In Three.js, positive Y rotation (yaw) turns the object clockwise when viewed from above
  // Therefore, to align with compass directions:
  // - 0 degrees: North (-Z)
  // - 90 degrees: East (+X)
  // - 180 degrees: South (+Z)
  // - 270 degrees: West (-X)

  // Rotate the needle accordingly
  needle.style.transform = `translateX(-50%) rotate(${yawDegrees}deg)`;
}
