class DroneControls {
    constructor() {
      this.channels = {
        yaw: 0,
        pitch: 0,
        roll: 0,
        throttle: 0,
      };

      this.initControls();
    }

    initControls() {
      document.addEventListener('keydown', this.onKeyDown.bind(this));
      document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown(event) {
      switch (event.code) {
        case 'ArrowLeft': this.channels.pitch = -1; break;   // Pitch up (changed from roll)
        case 'ArrowRight': this.channels.pitch = 1; break; // Pitch down (changed from roll)
        case 'ArrowUp': this.channels.roll = 1; break;      // Roll right (changed from pitch)
        case 'ArrowDown': this.channels.roll = -1; break;   // Roll left (changed from pitch)
        case 'KeyW': this.channels.throttle = 1; break;     // Throttle up
        case 'KeyS': this.channels.throttle = -1; break;    // Throttle down
        case 'KeyA': this.channels.yaw = 1; break;         // Yaw left
        case 'KeyD': this.channels.yaw = -1; break;          // Yaw right
      }
    }

    onKeyUp(event) {
      switch (event.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
          this.channels.pitch = 0;
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          this.channels.roll = 0;
          break;
        case 'KeyW':
        case 'KeyS':
          this.channels.throttle = 0;
          break;
        case 'KeyA':
        case 'KeyD':
          this.channels.yaw = 0;
          break;
      }
    }

    update() {
      // This method can be used for any continuous updates if needed
    }
}

export default DroneControls;