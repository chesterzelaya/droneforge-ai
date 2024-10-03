import * as THREE from 'three';

class DroneControls {
    constructor() {
      this.channels = {
        yaw: 1500,
        pitch: 1500,
        roll: 1500,
        throttle: 855,
      };

      this.droneQuaternion = new THREE.Quaternion();
      this.keyStates = {};
      this.controlRate = 2; // Rate of change per frame

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

    update(droneQuaternion) {
      if (droneQuaternion) {
        this.droneQuaternion.copy(droneQuaternion);
      }

      this.updateControlChannels();
    }

    updateControlChannels() {
      // Yaw Controls
      if (this.keyStates['KeyA']) this.channels.yaw = Math.max(1000, this.channels.yaw - this.controlRate); // Rotate West
      if (this.keyStates['KeyD']) this.channels.yaw = Math.min(2000, this.channels.yaw + this.controlRate); // Rotate East

      // Pitch Controls
      if (this.keyStates['ArrowUp']) this.channels.pitch = Math.min(2000, this.channels.pitch + this.controlRate); // Tilt Forward (North)
      if (this.keyStates['ArrowDown']) this.channels.pitch = Math.max(1000, this.channels.pitch - this.controlRate); // Tilt Backward (Away from North)

      // Roll Controls
      if (this.keyStates['ArrowLeft']) this.channels.roll = Math.max(1000, this.channels.roll - this.controlRate); // Tilt Left (West)
      if (this.keyStates['ArrowRight']) this.channels.roll = Math.min(2000, this.channels.roll + this.controlRate); // Tilt Right (East)

      // Throttle Controls
      if (this.keyStates['KeyW']) this.channels.throttle = Math.min(2000, this.channels.throttle + this.controlRate); // Increase Throttle
      if (this.keyStates['KeyS']) this.channels.throttle = Math.max(0, this.channels.throttle - this.controlRate); // Decrease Throttle

      // Gradually return controls to center when keys are not pressed
      if (!this.keyStates['KeyA'] && !this.keyStates['KeyD']) this.channels.yaw = this.moveTowardsCenter(this.channels.yaw);
      if (!this.keyStates['ArrowUp'] && !this.keyStates['ArrowDown']) this.channels.pitch = this.moveTowardsCenter(this.channels.pitch);
      if (!this.keyStates['ArrowLeft'] && !this.keyStates['ArrowRight']) this.channels.roll = this.moveTowardsCenter(this.channels.roll);
      if (!this.keyStates['KeyW'] && !this.keyStates['KeyS']) this.channels.throttle = this.moveTowardsCenter(this.channels.throttle, 855);
    }

    moveTowardsCenter(value, center = 1500, rate = 1) {
      if (value > center) {
        return Math.max(center, value - rate);
      } else if (value < center) {
        return Math.min(center, value + rate);
      }
      return value;
    }

    getControlInputs() {
      return {
        roll: (this.channels.roll - 1500) / 500,      // -1 to 1
        pitch: (this.channels.pitch - 1500) / 500,    // -1 to 1
        yaw: (this.channels.yaw - 1500) / 500,        // -1 to 1
        throttle: (this.channels.throttle - 855) / 1145,  // 0 to 1
      };
    }
}

export default DroneControls;
