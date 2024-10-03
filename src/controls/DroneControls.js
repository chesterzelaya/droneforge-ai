import * as THREE from 'three';

class DroneControls {
    constructor() {
      this.channels = {
        yaw: 0,
        pitch: 0,
        roll: 0,
        throttle: 0,
      };

      this.droneQuaternion = new THREE.Quaternion();

      this.initControls();
    }

    initControls() {
      document.addEventListener('keydown', this.onKeyDown.bind(this));
      document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown(event) {
      this.updateControlChannels(event, 1);
    }

    onKeyUp(event) {
      this.updateControlChannels(event, 0);
    }

    updateControlChannels(event, value) {
      switch (event.code) {
        case 'ArrowDown':
          this.channels.roll = -value;
          break;
        case 'ArrowUp':
          this.channels.roll = value;
          break;
        case 'ArrowRight':
          this.channels.pitch = value;
          break;
        case 'ArrowLeft':
          this.channels.pitch = -value;
          break;
        case 'KeyW':
          this.channels.throttle = value;
          break;
        case 'KeyS':
          this.channels.throttle = -value;
          break;
        case 'KeyA':
          this.channels.yaw = value;
          break;
        case 'KeyD':
          this.channels.yaw = -value;
          break;
      }
    }

    update(droneQuaternion) {
      if (droneQuaternion) {
        this.droneQuaternion.copy(droneQuaternion);
      }
      // No continuous updates needed for now
    }

    getLocalControlForces() {
      const force = new THREE.Vector3(this.channels.roll, this.channels.throttle, this.channels.pitch);
      force.applyQuaternion(this.droneQuaternion);
      return force;
    }

    getLocalControlTorques() {
      const torque = new THREE.Vector3(this.channels.roll, this.channels.yaw, this.channels.pitch);
      torque.applyQuaternion(this.droneQuaternion);
      return torque;
    }

    applyControlsToDrone() {
      // This method is now handled within PhysicsEngine.js
      // No changes needed here
    }
}

export default DroneControls;