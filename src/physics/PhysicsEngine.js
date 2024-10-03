class PhysicsEngine {
  constructor(controls) {
    this.controls = controls;
    this.rigidBodies = [];
    this.physicsWorld = null;
    this.Ammo = window.Ammo; // Access Ammo from the global window object
    this.tmpTransformation = null;
  }

  async init(scene) {
    this.scene = scene;
    
    // Ensure Ammo is loaded
    if (!this.Ammo) {
      console.error('Ammo.js is not loaded!');
      return;
    }

    this.setupPhysicsWorld();
    this.createPhysicsObjects();
    this.tmpTransformation = new this.Ammo.btTransform();
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
    // Create ground physics
    const groundShape = new this.Ammo.btBoxShape(new this.Ammo.btVector3(500, 0.5, 500));
    const groundTransform = new this.Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new this.Ammo.btVector3(0, -0.5, 0));

    const mass = 0;
    const localInertia = new this.Ammo.btVector3(0, 0, 0);
    const motionState = new this.Ammo.btDefaultMotionState(groundTransform);
    const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      groundShape,
      localInertia
    );
    const body = new this.Ammo.btRigidBody(rbInfo);

    this.physicsWorld.addRigidBody(body);

    // Create drone physics
    this.createDronePhysics();
  }

  createDronePhysics() {
    // Ensure the drone model is loaded
    if (!this.scene.drone) {
      setTimeout(() => this.createDronePhysics(), 100);
      return;
    }

    const droneMesh = this.scene.drone;
    const position = droneMesh.position;
    const quaternion = droneMesh.quaternion;

    const scale = droneMesh.scale;
    const mass = 1; // Adjust the mass as needed

    const shape = new this.Ammo.btBoxShape(
      new this.Ammo.btVector3(scale.x * 0.5, scale.y * 0.1, scale.z * 0.5)
    );
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new this.Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(
      new this.Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
    );

    const localInertia = new this.Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass, localInertia);

    const motionState = new this.Ammo.btDefaultMotionState(transform);
    const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      shape,
      localInertia
    );
    this.droneRigidBody = new this.Ammo.btRigidBody(rbInfo);
    this.droneRigidBody.setActivationState(4); // Disable deactivation

    this.physicsWorld.addRigidBody(this.droneRigidBody);
    this.rigidBodies.push({ mesh: droneMesh, body: this.droneRigidBody });
  }

  update(deltaTime) {
    if (this.physicsWorld) {
      this.physicsWorld.stepSimulation(deltaTime, 10);

      // Apply forces based on controls
      if (this.droneRigidBody) {
        this.applyControlsToDrone();
      }

      // Update mesh positions from physics
      for (let i = 0; i < this.rigidBodies.length; i++) {
        const objThree = this.rigidBodies[i].mesh;
        const objAmmo = this.rigidBodies[i].body;
        const ms = objAmmo.getMotionState();
        if (ms) {
          ms.getWorldTransform(this.tmpTransformation);
          const p = this.tmpTransformation.getOrigin();
          const q = this.tmpTransformation.getRotation();
          objThree.position.set(p.x(), p.y(), p.z());
          objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
      }
    }
  }

  applyControlsToDrone() {
    const { yaw, pitch, roll, throttle } = this.controls.channels;

    // Convert control inputs to forces and torques
    const thrustForce = throttle * 15; // Adjust thrust coefficient as needed
    const torqueX = pitch * 0.5; // Adjust torque coefficients as needed
    const torqueY = yaw * 0.5;
    const torqueZ = roll * 0.5;

    // Apply upward thrust
    const thrust = new this.Ammo.btVector3(0, thrustForce, 0);
    this.droneRigidBody.applyCentralForce(thrust);

    // Apply torques
    const torque = new this.Ammo.btVector3(torqueX, torqueY, torqueZ);
    this.droneRigidBody.applyTorque(torque);
  }
}

export default PhysicsEngine;