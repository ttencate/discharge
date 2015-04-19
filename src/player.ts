/// <reference path="../typings/tsd.d.ts" />
/// <reference path="common.ts" />

var tmp = new THREE.Vector3();
var tmp2 = new THREE.Vector3();

enum PlayerState {
  ALIVE,
  DEAD
}

class Player {
  private state: PlayerState = PlayerState.ALIVE;
  private feet: THREE.Object3D;
  private pitchObject: THREE.Object3D;
  private velocity: THREE.Vector3 = new THREE.Vector3();

  private controlsEnabled: boolean;
  private mouseMoveHandler: any;
  private keyDownHandler: any;
  private keyUpHandler: any;
  private keysDown: {[key: number]: boolean} = {};

  private onGround: boolean;

  private wind: THREE.Audio;

  private tmp: THREE.Vector3 = new THREE.Vector3();

  constructor(camera: THREE.Camera, private terrain: Terrain) {
    camera.rotation.set(0, 0, 0);

    this.wind = new THREE.Audio(audioListener);
    this.wind.load('wind.ogg');
    (<any>this.wind).autoplay = true;
    (<any>this.wind).setVolume(0.3);
    this.wind.setLoop(true);
    camera.add(this.wind);

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

  getPosition(): THREE.Vector3 {
    return this.feet.position;
  }

  update(delta) {
    var d = this.tmp.set(0, 0, 0);
    if (this.state == PlayerState.ALIVE) {
      if (this.isKeyDown(controls.forwardKeys)) {
        d.z--;
      }
      if (this.isKeyDown(controls.backwardKeys)) {
        d.z++;
      }
      if (this.isKeyDown(controls.leftKeys)) {
        d.x--;
      }
      if (this.isKeyDown(controls.rightKeys)) {
        d.x++;
      }
      if (this.isKeyDown(controls.jumpKeys) && this.onGround) {
        this.velocity.y = 3.0;
        this.onGround = false;
        console.log(Math.round(this.feet.position.x), Math.round(this.feet.position.z));
      }
    }

    this.velocity.y -= delta * GRAVITY;

    var terrainHeight = this.terrain.heightAt(this.feet.position);
    if (d.length() != 0) {
      this.velocity.x = d.x;
      this.velocity.z = d.z;

      d.setLength(2.0).applyQuaternion(this.feet.quaternion).add(this.feet.position);
      var slope = (this.terrain.heightAt(d) - terrainHeight) / 2.0;

      d.set(this.velocity.x, 0, this.velocity.z).setLength(WALK_SPEED * clamp(0.2, 1.8, 1 - 0.8 * slope));
      this.velocity.x = d.x;
      this.velocity.z = d.z;
    } else {
      this.velocity.x *= SLOW_DOWN_FACTOR;
      this.velocity.z *= SLOW_DOWN_FACTOR;
    }
    this.feet.translateX(delta * this.velocity.x);
    this.feet.translateY(delta * this.velocity.y);
    this.feet.translateZ(delta * this.velocity.z);

    terrainHeight = this.terrain.heightAt(this.feet.position);
    if (this.feet.position.y < terrainHeight) {
      this.feet.position.y = terrainHeight;
      this.velocity.y = 0;
      this.onGround = true;
    }

    var pos = this.feet.position;
    var tree = this.terrain.closestTree(pos);
    if (tree) {
      tmp.copy(tree.getPosition()).setY(pos.y);
      var min = TREE_RADIUS + NEAR_PLANE + 0.001;
      if (tmp.distanceTo(pos) < min) {
        tmp2.subVectors(pos, tmp);
        if (tmp2.x == 0 && tmp2.z == 0) tmp2.x = 1;
        tmp2.setLength(min);
        pos.addVectors(tmp, tmp2);
      }
    }

    if (this.state == PlayerState.DEAD) {
      this.pitchObject.position.y = Math.max(0.25, this.pitchObject.position.y - 2.0 * delta);
    }
  }

  die() {
    (<any>this.wind).stop();
    this.state = PlayerState.DEAD;
    document.getElementById('dead').classList.remove('hidden');
  }

  isDead(): boolean {
    return this.state == PlayerState.DEAD;
  }

  private isKeyDown(keys: number[]): boolean {
    for (var i = 0; i < keys.length; i++) {
      if (this.keysDown[keys[i]]) return true;
    }
    return false;
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
