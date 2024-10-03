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
    this.droneMass = 0.25; // Updated mass to 0.25 kg (250g)
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
    
    // Use the actual dimensions of the cube
    const dimensions = new this.Ammo.btVector3(0.5, 0.5, 0.5);

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
    this.droneRigidBody.setDamping(0.7, 0.7); // Increased damping
    this.droneRigidBody.setActivationState(4);

    this.physicsWorld.addRigidBody(this.droneRigidBody);
    this.rigidBodies.push({ mesh: droneMesh, body: this.droneRigidBody });
  }

  update() {
    const now = performance.now();
    this.clockDelta = (now - this.lastTime) / 1000;
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
        const x = isFinite(p.x()) ? p.x() : 0;
        const y = isFinite(p.y()) ? p.y() : 0;
        const z = isFinite(p.z()) ? p.z() : 0;
        const qx = isFinite(q.x()) ? q.x() : 0;
        const qy = isFinite(q.y()) ? q.y() : 0;
        const qz = isFinite(q.z()) ? q.z() : 0;
        const qw = isFinite(q.w()) ? q.w() : 1;

        objThree.position.set(x, y, z);
        objThree.quaternion.set(qx, qy, qz, qw);
      }
    }
  }

  applyAerodynamics() {
    const velocity = this.droneRigidBody.getLinearVelocity();
    const speed = velocity.length();
    
    const dragCoefficient = 0.5;
    const frontalArea = 0.1; // m^2
    const airDensity = 1.225; // kg/m^3 at sea level
    const dragMagnitude = 0.5 * dragCoefficient * frontalArea * airDensity * speed * speed;

    // Prevent division by zero
    if (speed > 0) {
      const dragForce = new this.Ammo.btVector3(-velocity.x(), -velocity.y(), -velocity.z());
      dragForce.normalize();
      dragForce.op_mul(dragMagnitude);

      this.droneRigidBody.applyCentralForce(dragForce);
    }
    
    // No need to manually apply gravity as Ammo.js handles it
  }

  applyControlsToDrone() {
    const { yaw, pitch, roll, throttle } = this.controls.channels;

    const maxThrust = 4.9; // N (half of the hover thrust for safety)
    const thrustForce = (throttle + 1) * 0.5 * maxThrust; // Map [-1, 1] to [0, maxThrust]
    const torqueStrength = 0.5; // Reduced torque strength for stability

    // Apply upward thrust
    const thrust = new this.Ammo.btVector3(0, thrustForce, 0);
    // No rotation applied to thrust for simplicity
    this.droneRigidBody.applyCentralForce(thrust);

    // Apply torques
    const torqueX = new this.Ammo.btVector3(torqueStrength * pitch, 0, 0);
    const torqueY = new this.Ammo.btVector3(0, torqueStrength * yaw, 0);
    const torqueZ = new this.Ammo.btVector3(0, 0, torqueStrength * roll);

    this.droneRigidBody.applyTorque(torqueX);
    this.droneRigidBody.applyTorque(torqueY);
    this.droneRigidBody.applyTorque(torqueZ);

    // Optional: Apply damping force to stabilize
    // const stabilizingForce = new this.Ammo.btVector3(0, -0.05, 0);
    // this.droneRigidBody.applyCentralForce(stabilizingForce);
  }
}

export default PhysicsEngine;