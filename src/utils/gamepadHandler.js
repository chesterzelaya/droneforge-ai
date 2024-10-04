/**
 * @class GamepadHandler
 * @description Manages gamepad input for the drone simulation.
 * Handles gamepad connection, disconnection, and provides real-time input data.
 */
class GamepadHandler {
  /**
   * @constructor
   * Initializes the GamepadHandler and sets up the connection visualizer.
   */
  constructor() {
    this.gamepad = null;
    this.connected = false;
    this.axes = [1500, 1500, 1500, 1500]; // [roll, pitch, yaw, throttle]
    this.buttons = [];

    this.setupEventListeners();
    this.createConnectionVisualizer();
  }

  /**
   * @method setupEventListeners
   * @private
   * Sets up event listeners for gamepad connection and disconnection.
   */
  setupEventListeners() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
      this.connected = true;
      this.gamepad = e.gamepad;
      this.updateConnectionVisualizer();
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('Gamepad disconnected:', e.gamepad.id);
      this.connected = false;
      this.gamepad = null;
      this.updateConnectionVisualizer();
    });
  }

  /**
   * @method update
   * @public
   * Updates the gamepad state, including axes and button values.
   */
  update() {
    if (!this.connected) return;

    // Get the latest gamepad state
    const gamepads = navigator.getGamepads();
    this.gamepad = gamepads[this.gamepad.index];

    // Update axes values (map from -1 to 1 range to 0 to 3000 range)
    this.axes = [
      this.mapAxisToRange(this.gamepad.axes[4]), // Roll
      this.mapAxisToRange(this.gamepad.axes[3]), // Pitch
      this.mapAxisToRange(this.gamepad.axes[0]), // Yaw
      this.mapAxisToRange(this.gamepad.axes[5]), // Throttle
    ];

    // Update button states
    this.buttons = this.gamepad.buttons.map(button => button.pressed);
  }

  /**
   * @method mapAxisToRange
   * @private
   * @param {number} value - The raw axis value from -1 to 1
   * @returns {number} The mapped value from 0 to 3000
   */
  mapAxisToRange(value) {
    // Map from -1 to 1 range to 0 to 3000 range
    return Math.round((value + 1) * 1500);
  }

  /**
   * @method getAxes
   * @public
   * @returns {number[]} The current axes values
   */
  getAxes() {
    return this.axes;
  }

  /**
   * @method getButtons
   * @public
   * @returns {boolean[]} The current button states
   */
  getButtons() {
    return this.buttons;
  }

  /**
   * @method createConnectionVisualizer
   * @private
   * Creates a visual indicator for gamepad connection status.
   */
  createConnectionVisualizer() {
    this.visualizer = document.createElement('div');
    this.visualizer.style.position = 'absolute';
    this.visualizer.style.top = '10px';
    this.visualizer.style.left = '10px';
    this.visualizer.style.padding = '5px 10px';
    this.visualizer.style.borderRadius = '5px';
    this.visualizer.style.fontFamily = 'Arial, sans-serif';
    this.visualizer.style.fontSize = '14px';
    document.body.appendChild(this.visualizer);
    this.updateConnectionVisualizer();
  }

  /**
   * @method updateConnectionVisualizer
   * @private
   * Updates the visual indicator based on the current connection status.
   */
  updateConnectionVisualizer() {
    this.visualizer.textContent = this.connected ? 'Controller Connected' : 'Controller Disconnected';
    this.visualizer.style.backgroundColor = this.connected ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)';
    this.visualizer.style.color = this.connected ? 'black' : 'white';
  }
}

export default GamepadHandler;