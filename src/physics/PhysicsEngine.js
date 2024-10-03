import * as THREE from 'three';

class PhysicsEngine {
  constructor(controls) {
    this.controls = controls;
    this.rigidBodies = [];
    this.physicsWorld = null;
    this.Ammo = null;
    this.tmpTransformation = null;
    this.clockDelta = 0;
    this.lastTime = performance.now();
    this.droneMass = 0.25; // 250g
  }

  async init(scene) {
    this.scene = scene;
    
    await this.loadAmmo();
    
    if (!this.Ammo) {
      console.error('Ammo.js could not be loaded!');
      return;
    }

    this.setupPhysicsWorld();
    this.createPhysicsObjects();
    this.tmpTransformation = new this.Ammo.btTransform();
  }

  loadAmmo() {
    return new Promise((resolve) => {
      if (window.Ammo) {
        this.Ammo = window.Ammo;
        resolve();
      } else {
        window.addEventListener('ammo-loaded', () => {
          this.Ammo = window.Ammo;
          resolve();
        });
      }
    });
  }

  setupPhysicsWorld() {
    const collisionConfiguration = new this.Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new this.Ammo.btCollisionDispatcher(collisionConfiguration);
    const broadphase = new this.Ammo.btDbvtBroadphase();
    const solver = new this.Ammo.btSequentialImpulseConstraintSolver();

    this.physicsWorld = new this.Ammo.btDiscreteDynamicsWorld(
      dispatcher,
      broadphase,
      solver,
      collisionConfiguration
    );
    this.physicsWorld.setGravity(new this.Ammo.btVector3(0, -9.81, 0));
  }

  createPhysicsObjects() {
    this.createGround();
    this.createDronePhysics();
  }

  createGround() {
    const groundShape = new this.Ammo.btBoxShape(new this.Ammo.btVector3(500, 0.5, 500));
    const groundTransform = new this.Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new this.Ammo.btVector3(0, -0.5, 0));

    const mass = 0;
    const localInertia = new this.Ammo.btVector3(0, 0, 0);
    const motionState = new this.Ammo.btDefaultMotionState(groundTransform);
    const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(mass, motionState, groundShape, localInertia);
    const body = new this.Ammo.btRigidBody(rbInfo);

    this.physicsWorld.addRigidBody(body);
  }

  createDronePhysics() {
    if (!this.scene.drone) {
      setTimeout(() => this.createDronePhysics(), 100);
      return;
    }

    const droneMesh = this.scene.drone;
    const position = droneMesh.position;
    const quaternion = droneMesh.quaternion;
    
    const dimensions = new this.Ammo.btVector3(0.5, 0.5, 0.5); // Half-extents

    const shape = new this.Ammo.btBoxShape(dimensions);
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new this.Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(new this.Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

    const localInertia = new this.Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(this.droneMass, localInertia);

    const motionState = new this.Ammo.btDefaultMotionState(transform);
    const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(this.droneMass, motionState, shape, localInertia);
    this.droneRigidBody = new this.Ammo.btRigidBody(rbInfo);
    
    // Increase damping for stability
    this.droneRigidBody.setDamping(0.7, 0.7); // Linear and angular damping
    this.droneRigidBody.setActivationState(4); // DISABLE_DEACTIVATION

    this.physicsWorld.addRigidBody(this.droneRigidBody);
    this.rigidBodies.push({ mesh: droneMesh, body: this.droneRigidBody });
  }

  update() {
    const now = performance.now();
    this.clockDelta = (now - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = now;

    if (this.physicsWorld) {
      this.physicsWorld.stepSimulation(this.clockDelta, 10);

      if (this.droneRigidBody) {
        this.applyAerodynamics();
        this.applyControlsToDrone();
      }

      this.updateMeshPositions();
    }
  }

  updateMeshPositions() {
    for (let i = 0; i < this.rigidBodies.length; i++) {
      const objThree = this.rigidBodies[i].mesh;
      const objAmmo = this.rigidBodies[i].body;
      const ms = objAmmo.getMotionState();
      if (ms) {
        ms.getWorldTransform(this.tmpTransformation);
        const p = this.tmpTransformation.getOrigin();
        const q = this.tmpTransformation.getRotation();

        // Ensure valid numerical values
        const x = isFinite(p.x()) ? p.x() : objThree.position.x;
        const y = isFinite(p.y()) ? p.y() : objThree.position.y;
        const z = isFinite(p.z()) ? p.z() : objThree.position.z;
        const qx = isFinite(q.x()) ? q.x() : objThree.quaternion.x;
        const qy = isFinite(q.y()) ? q.y() : objThree.quaternion.y;
        const qz = isFinite(q.z()) ? q.z() : objThree.quaternion.z;
        const qw = isFinite(q.w()) ? q.w() : objThree.quaternion.w;

        objThree.position.set(x, y, z);
        objThree.quaternion.set(qx, qy, qz, qw);

        // Limit maximum linear velocity
        const velocity = objAmmo.getLinearVelocity();
        const currentSpeed = velocity.length();
        const maxVelocity = 50; // m/s

        if (currentSpeed > maxVelocity) {
          const scale = maxVelocity / currentSpeed;
          velocity.setX(velocity.x() * scale);
          velocity.setY(velocity.y() * scale);
          velocity.setZ(velocity.z() * scale);
          objAmmo.setLinearVelocity(velocity);
        }

        // Limit maximum angular velocity
        const angularVelocity = objAmmo.getAngularVelocity();
        const currentAngSpeed = angularVelocity.length();
        const maxAngularVelocity = 10; // rad/s

        if (currentAngSpeed > maxAngularVelocity) {
          const scale = maxAngularVelocity / currentAngSpeed;
          angularVelocity.setX(angularVelocity.x() * scale);
          angularVelocity.setY(angularVelocity.y() * scale);
          angularVelocity.setZ(angularVelocity.z() * scale);
          objAmmo.setAngularVelocity(angularVelocity);
        }
      }
    }
  }

  applyAerodynamics() {
    const velocity = this.droneRigidBody.getLinearVelocity();
    const speed = velocity.length();
    
    const dragCoefficient = 0.47; // Sphere drag coefficient as a reference
    const frontalArea = 0.25; // m^2 (for a cube with side 1m)
    const airDensity = 1.225; // kg/m^3 at sea level
    const dragMagnitude = 0.5 * dragCoefficient * frontalArea * airDensity * speed * speed;
    
    // Prevent division by zero
    if (speed > 0) {
      const dragForce = new this.Ammo.btVector3(-velocity.x(), -velocity.y(), -velocity.z());
      dragForce.normalize();
      dragForce.op_mul(dragMagnitude);

      this.droneRigidBody.applyCentralForce(dragForce);
    }
    
    // No manual gravity; Ammo.js handles it
  }

  applyControlsToDrone() {
    const controls = this.controls.getControlInputs();
    
    const maxThrust = 9.81 * 2; // N (twice the hover thrust for maneuverability)
    const thrustForce = controls.throttle * maxThrust;
    const torqueStrength = 0.5; // Adjust as needed for responsiveness
    
    // Get drone's current orientation
    const droneTransform = this.droneRigidBody.getWorldTransform();
    const rotation = droneTransform.getRotation();
    
    // Convert Ammo.js quaternion to Three.js quaternion
    const ammoQuat = rotation;
    const threeQuat = new THREE.Quaternion(ammoQuat.x(), ammoQuat.y(), ammoQuat.z(), ammoQuat.w());
    
    // Calculate local thrust vector and rotate it to world space
    const thrustLocal = new THREE.Vector3(0, thrustForce, 0);
    const thrustWorldVector = thrustLocal.applyQuaternion(threeQuat);
    
    // Convert back to Ammo.js vector
    const thrustWorld = new this.Ammo.btVector3(thrustWorldVector.x, thrustWorldVector.y, thrustWorldVector.z);

    // Apply thrust
    this.droneRigidBody.applyCentralForce(thrustWorld);
    
    // Define local torques based on control inputs
    let torqueLocal = new THREE.Vector3(
      torqueStrength * controls.roll,          // Roll
      torqueStrength * -controls.yaw,         // Yaw (inverted)
      torqueStrength * controls.pitch         // Pitch
    );

    // Rotate the local torque vector to world space
    torqueLocal.applyQuaternion(threeQuat);

    // Convert the rotated torque vector back to Ammo.js btVector3
    const torqueWorld = new this.Ammo.btVector3(torqueLocal.x, torqueLocal.y, torqueLocal.z);

    // Apply the transformed torque to the drone
    this.droneRigidBody.applyTorque(torqueWorld);
  }
}

export default PhysicsEngine;
