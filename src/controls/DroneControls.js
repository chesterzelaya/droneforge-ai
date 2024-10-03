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
        case 'ArrowUp': this.channels.pitch = 1; break;
        case 'ArrowDown': this.channels.pitch = -1; break;
        case 'ArrowLeft': this.channels.roll = -1; break;
        case 'ArrowRight': this.channels.roll = 1; break;
        case 'KeyW': this.channels.throttle = 1; break;
        case 'KeyS': this.channels.throttle = -1; break;
        case 'KeyA': this.channels.yaw = -1; break;
        case 'KeyD': this.channels.yaw = 1; break;
      }
    }

    onKeyUp(event) {
      switch (event.code) {
        case 'ArrowUp':
        case 'ArrowDown':
          this.channels.pitch = 0;
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
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
