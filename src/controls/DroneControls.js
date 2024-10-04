import GamepadHandler from '../utils/gamepadHandler';

/**
 * @class DroneControls
 * @description Manages the control inputs for the drone, handling both gamepad and keyboard inputs.
 * This class is responsible for translating raw input into normalized control values for the drone's movement.
 */
class DroneControls {
    /**
     * @constructor
     * Initializes the DroneControls with default values and sets up input handlers.
     */
    constructor() {
      /**
       * @property {Object} channels - Stores the current values for each control channel.
       * @property {number} channels.roll - Roll control value (0-3000).
       * @property {number} channels.pitch - Pitch control value (0-3000).
       * @property {number} channels.yaw - Yaw control value (0-3000).
       * @property {number} channels.throttle - Throttle control value (0-3000).
       */
      this.channels = {
        roll: 1500,
        pitch: 1500,
        yaw: 1500,
        throttle: 0, // Initialize throttle to 0
      };

      /**
       * @property {Object} keyStates - Tracks the current state of keyboard inputs.
       */
      this.keyStates = {};

      /**
       * @property {number} controlRate - Rate of change for keyboard controls (pixels per frame).
       */
      this.controlRate = 10; // Increased for more responsive keyboard control

      /**
       * @property {GamepadHandler} gamepadHandler - Handles gamepad input.
       */
      this.gamepadHandler = new GamepadHandler();

      this.initControls();
    }

    /**
     * @method initControls
     * @private
     * Initializes event listeners for keyboard input.
     */
    initControls() {
      document.addEventListener('keydown', this.onKeyDown.bind(this));
      document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    /**
     * @method onKeyDown
     * @private
     * @param {KeyboardEvent} event - The keydown event.
     * Handles keydown events, updating the keyStates object.
     */
    onKeyDown(event) {
      this.keyStates[event.code] = true;
    }

    /**
     * @method onKeyUp
     * @private
     * @param {KeyboardEvent} event - The keyup event.
     * Handles keyup events, updating the keyStates object.
     */
    onKeyUp(event) {
      this.keyStates[event.code] = false;
    }

    /**
     * @method update
     * @public
     * Updates the control channels based on current input states.
     * This method should be called once per frame in the main game loop.
     */
    update() {
      this.gamepadHandler.update();
      this.updateControlChannels();
    }

    /**
     * @method updateControlChannels
     * @private
     * Updates the control channels based on gamepad or keyboard input.
     */
    updateControlChannels() {
      const gamepadAxes = this.gamepadHandler.getAxes();

      if (this.gamepadHandler.connected) {
        // Use gamepad input directly
        this.channels.roll = gamepadAxes[0];
        this.channels.pitch = gamepadAxes[1];
        this.channels.yaw = gamepadAxes[2];
        this.channels.throttle = gamepadAxes[3];
      } else {
        // Use keyboard input with swapped controls
        if (this.keyStates['KeyA']) this.channels.yaw = Math.max(0, this.channels.yaw - this.controlRate);
        if (this.keyStates['KeyD']) this.channels.yaw = Math.min(3000, this.channels.yaw + this.controlRate);
        if (this.keyStates['ArrowRight']) this.channels.pitch = Math.min(3000, this.channels.pitch + this.controlRate);
        if (this.keyStates['ArrowLeft']) this.channels.pitch = Math.max(0, this.channels.pitch - this.controlRate);
        if (this.keyStates['ArrowDown']) this.channels.roll = Math.max(0, this.channels.roll - this.controlRate);
        if (this.keyStates['ArrowUp']) this.channels.roll = Math.min(3000, this.channels.roll + this.controlRate);
        if (this.keyStates['KeyW']) this.channels.throttle = Math.min(3000, this.channels.throttle + this.controlRate);
        if (this.keyStates['KeyS']) this.channels.throttle = Math.max(0, this.channels.throttle - this.controlRate);

        // Gradually return controls to center when keys are not pressed
        if (!this.keyStates['KeyA'] && !this.keyStates['KeyD']) this.channels.yaw = this.moveTowardsCenter(this.channels.yaw);
        if (!this.keyStates['ArrowRight'] && !this.keyStates['ArrowLeft']) this.channels.pitch = this.moveTowardsCenter(this.channels.pitch);
        if (!this.keyStates['ArrowDown'] && !this.keyStates['ArrowUp']) this.channels.roll = this.moveTowardsCenter(this.channels.roll);
        if (!this.keyStates['KeyW'] && !this.keyStates['KeyS']) this.channels.throttle = this.moveTowardsZero(this.channels.throttle);
      }
    }

    /**
     * @method moveTowardsCenter
     * @private
     * @param {number} value - Current value of the control channel.
     * @param {number} [center=1500] - The center value to move towards.
     * @param {number} [rate=5] - The rate at which to move towards the center.
     * @returns {number} The new value after moving towards the center.
     * Gradually moves a control value towards its center position.
     */
    moveTowardsCenter(value, center = 1500, rate = 5) {
      if (value > center) {
        return Math.max(center, value - rate);
      } else if (value < center) {
        return Math.min(center, value + rate);
      }
      return value;
    }

    /**
     * @method moveTowardsZero
     * @private
     * @param {number} value - Current value of the control channel.
     * @param {number} [rate=5] - The rate at which to move towards zero.
     * @returns {number} The new value after moving towards zero.
     * Gradually moves a control value towards zero.
     */
    moveTowardsZero(value, rate = 5) {
      return Math.max(0, value - rate);
    }

    /**
     * @method getControlInputs
     * @public
     * @returns {Object} Normalized control inputs for roll, pitch, yaw, and throttle.
     * Provides normalized control inputs in the range of -1 to 1 for roll, pitch, and yaw,
     * and 0 to 1 for throttle.
     */
    getControlInputs() {
      return {
        roll: (this.channels.roll - 1500) / 1500,      // -1 to 1
        pitch: (this.channels.pitch - 1500) / 1500,    // -1 to 1
        yaw: (this.channels.yaw - 1500) / 1500,        // -1 to 1
        throttle: this.channels.throttle / 3000,       // 0 to 1
      };
    }
}

export default DroneControls;