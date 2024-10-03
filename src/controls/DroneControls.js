import GamepadHandler from '../utils/gamepadHandler';

class DroneControls {
    constructor() {
      this.channels = {
        roll: 1500,
        pitch: 1500,
        yaw: 1500,
        throttle: 1500,
      };

      this.keyStates = {};
      this.controlRate = 10; // Increased for more responsive keyboard control

      this.gamepadHandler = new GamepadHandler();

      this.initControls();
    }

    initControls() {
      document.addEventListener('keydown', this.onKeyDown.bind(this));
      document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown(event) {
      this.keyStates[event.code] = true;
    }

    onKeyUp(event) {
      this.keyStates[event.code] = false;
    }

    update() {
      this.gamepadHandler.update();
      this.updateControlChannels();
    }

    updateControlChannels() {
      const gamepadAxes = this.gamepadHandler.getAxes();

      if (this.gamepadHandler.connected) {
        // Use gamepad input directly
        this.channels.roll = gamepadAxes[0];
        this.channels.pitch = gamepadAxes[1];
        this.channels.yaw = gamepadAxes[2];
        this.channels.throttle = gamepadAxes[3];
      } else {
        // Use keyboard input (existing logic)
        if (this.keyStates['KeyA']) this.channels.yaw = Math.max(0, this.channels.yaw - this.controlRate);
        if (this.keyStates['KeyD']) this.channels.yaw = Math.min(3000, this.channels.yaw + this.controlRate);
        if (this.keyStates['ArrowUp']) this.channels.pitch = Math.min(3000, this.channels.pitch + this.controlRate);
        if (this.keyStates['ArrowDown']) this.channels.pitch = Math.max(0, this.channels.pitch - this.controlRate);
        if (this.keyStates['ArrowLeft']) this.channels.roll = Math.max(0, this.channels.roll - this.controlRate);
        if (this.keyStates['ArrowRight']) this.channels.roll = Math.min(3000, this.channels.roll + this.controlRate);
        if (this.keyStates['KeyW']) this.channels.throttle = Math.min(3000, this.channels.throttle + this.controlRate);
        if (this.keyStates['KeyS']) this.channels.throttle = Math.max(0, this.channels.throttle - this.controlRate);

        // Gradually return controls to center when keys are not pressed
        if (!this.keyStates['KeyA'] && !this.keyStates['KeyD']) this.channels.yaw = this.moveTowardsCenter(this.channels.yaw);
        if (!this.keyStates['ArrowUp'] && !this.keyStates['ArrowDown']) this.channels.pitch = this.moveTowardsCenter(this.channels.pitch);
        if (!this.keyStates['ArrowLeft'] && !this.keyStates['ArrowRight']) this.channels.roll = this.moveTowardsCenter(this.channels.roll);
        if (!this.keyStates['KeyW'] && !this.keyStates['KeyS']) this.channels.throttle = this.moveTowardsCenter(this.channels.throttle);
      }
    }

    moveTowardsCenter(value, center = 1500, rate = 5) {
      if (value > center) {
        return Math.max(center, value - rate);
      } else if (value < center) {
        return Math.min(center, value + rate);
      }
      return value;
    }

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
