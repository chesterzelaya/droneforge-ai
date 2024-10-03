class DroneControls {
    constructor(camera, domElement) {
      this.camera = camera;
      this.domElement = domElement;
      this.channels = {
        yaw: 0,
        pitch: 0,
        roll: 0,
        throttle: 0,
      };
  
      this.initControls();
    }
  
    initControls() {
      // Bind the event handlers
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);
  
      // Add event listeners
      window.addEventListener('keydown', this.onKeyDown, false);
      window.addEventListener('keyup', this.onKeyUp, false);
    }
  
    onKeyDown(event) {
      switch (event.code) {
        case 'KeyW':
          this.channels.pitch = 1;
          break;
        case 'KeyS':
          this.channels.pitch = -1;
          break;
        case 'KeyA':
          this.channels.roll = -1;
          break;
        case 'KeyD':
          this.channels.roll = 1;
          break;
        case 'ArrowUp':
          this.channels.throttle = 1;
          break;
        case 'ArrowDown':
          this.channels.throttle = -1;
          break;
        case 'ArrowLeft':
          this.channels.yaw = -1;
          break;
        case 'ArrowRight':
          this.channels.yaw = 1;
          break;
      }
    }
  
    onKeyUp(event) {
      switch (event.code) {
        case 'KeyW':
        case 'KeyS':
          this.channels.pitch = 0;
          break;
        case 'KeyA':
        case 'KeyD':
          this.channels.roll = 0;
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          this.channels.throttle = 0;
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          this.channels.yaw = 0;
          break;
      }
    }
  
    update(deltaTime) {
      // You can add smoothing or filtering here if needed
    }
  }
  
  export default DroneControls;
  