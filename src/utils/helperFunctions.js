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
