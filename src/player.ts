/// <reference path="../typings/tsd.d.ts" />
/// <reference path="common.ts" />

class Player {
  private feet: THREE.Object3D;
  private pitchObject: THREE.Object3D;
  private velocity: THREE.Vector3 = new THREE.Vector3();

  private controlsEnabled: boolean;
  private mouseMoveHandler: any;
  private keyDownHandler: any;
  private keyUpHandler: any;
  private keysDown: {[key: number]: boolean} = {};

  private onGround: boolean;

  constructor(camera: THREE.Camera, private terrain: Terrain) {
    camera.rotation.set(0, 0, 0);

    this.pitchObject = new THREE.Object3D();
    this.pitchObject.position.y = 1.6;
    this.pitchObject.add(camera);

    this.feet = new THREE.Object3D();
    this.feet.add(this.pitchObject);

    this.mouseMoveHandler = this.onMouseMove.bind(this);
    this.keyDownHandler = this.onKeyDown.bind(this);
    this.keyUpHandler = this.onKeyUp.bind(this);

    this.onGround = true;
  }

  getObject(): THREE.Object3D {
    return this.feet;
  }

  update(delta) {
    var d = new THREE.Vector3();
    if (this.keysDown[controls.forwardKey]) {
      d.z--;
    }
    if (this.keysDown[controls.backwardKey]) {
      d.z++;
    }
    if (this.keysDown[controls.leftKey]) {
      d.x--;
    }
    if (this.keysDown[controls.rightKey]) {
      d.x++;
    }
    if (this.keysDown[controls.jumpKey] && this.onGround) {
      this.velocity.y = 3.0;
      this.onGround = false;
    }
    this.velocity.y -= delta * GRAVITY;
    if (d.length() != 0) {
      d.setLength(WALK_SPEED);
      this.velocity.x = d.x;
      this.velocity.z = d.z;
    } else {
      this.velocity.x *= SLOW_DOWN_FACTOR;
      this.velocity.z *= SLOW_DOWN_FACTOR;
    }
    this.feet.translateX(delta * this.velocity.x);
    this.feet.translateY(delta * this.velocity.y);
    this.feet.translateZ(delta * this.velocity.z);

    var terrainHeight = this.terrain.heightAt(this.feet.position.x, this.feet.position.z);
    if (this.feet.position.y < terrainHeight) {
      this.feet.position.y = terrainHeight;
      this.velocity.y = 0;
      this.onGround = true;
    }
  }

  setControlsEnabled(enabled: boolean) {
    if (this.controlsEnabled == enabled) return;
    this.controlsEnabled = enabled;
    if (enabled) {
      document.addEventListener('mousemove', this.mouseMoveHandler, false);
      document.addEventListener('keydown', this.keyDownHandler, false);
      document.addEventListener('keyup', this.keyUpHandler, false);
    } else {
      document.removeEventListener('mousemove', this.mouseMoveHandler, false);
      document.removeEventListener('keydown', this.keyDownHandler, false);
      document.removeEventListener('keyup', this.keyUpHandler, false);
    }
  }

  private onMouseMove(event) {
    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    // Chrome bug workaround, https://code.google.com/p/chromium/issues/detail?id=461373
    var threshold = 50;
    if (Math.abs(movementX) > threshold || Math.abs(movementY) > threshold) {
      return;
    }

    this.feet.rotation.y -= movementX * 0.005;
    this.pitchObject.rotation.x -= movementY * 0.005;

    this.pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitchObject.rotation.x));
  }

  private onKeyDown(event) {
    this.keysDown[event.which] = true;
  }

  private onKeyUp(event) {
    this.keysDown[event.which] = false;
  }
}
