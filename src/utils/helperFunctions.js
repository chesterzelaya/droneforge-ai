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