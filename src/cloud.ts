/// <reference path="../typings/tsd.d.ts" />
/// <reference path="common.ts" />
/// <reference path="lightning.ts" />

const up = new THREE.Vector3(0, 1, 0);

enum CloudState {
  IDLE,
  CHARGING,
  DISCHARGING,
  COOLDOWN,
}

class Cloud {
  private obj: THREE.Object3D;
  private mesh: THREE.Mesh;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private rotationSpeed: number;

  private state: CloudState = CloudState.IDLE;
  private charge: number;
  private cooldown: number;

  private lightning: Lightning;

  constructor(x: number, z: number, private player: Player, private terrain: Terrain) {
    this.velocity.set(0, 0, -CLOUD_SPEED);
    this.rotationSpeed = CLOUD_ROTATE_SPEED;

    this.obj = new THREE.Object3D();
    this.obj.position.set(x, this.terrain.heightAt(x, z) + CLOUD_HEIGHT, z);

    this.mesh = new THREE.Mesh(
        new THREE.TorusKnotGeometry(10, 7, 50, 8),
        new THREE.MeshPhongMaterial({
          color: 0x370124,
          specular: 0xcf87b5,
          emissive: 0x370124,
          shininess: 5,
          shading: THREE.FlatShading,
          fog: false,
        }));
    this.mesh.castShadow = true;
    this.mesh.rotation.x = -PI_2;
    this.obj.add(this.mesh);

    var light = new THREE.DirectionalLight(SUN_COLOR, 1.0);
    light.position.copy(SUN_POSITION).multiplyScalar(5.0);
    light.target = this.mesh;
    light.castShadow = true;
    light.onlyShadow = true;
    light.shadowDarkness = 0.8;
    light.shadowCameraNear = 0.1;
    light.shadowCameraFar = 1000;
    light.shadowCameraLeft = -20;
    light.shadowCameraRight = 20;
    light.shadowCameraTop = 20;
    light.shadowCameraBottom = -20;
    this.obj.add(light);

    this.lightning = new Lightning(new THREE.Vector3(0, -CLOUD_HEIGHT, 0));
    this.lightning.setVisible(false);
    this.obj.add(this.lightning.getObject());
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  update(delta) {
    var player = this.player.getPosition();
    var pos = this.obj.position;
    var v = this.velocity;

    var dx = player.x - pos.x;
    var dz = player.z - pos.z;
    var d = dx * v.z - dz * v.x;
    if (d < 0) {
      this.rotationSpeed -= delta * CLOUD_ROTATE_ACCEL;
      v.applyAxisAngle(up, -delta * CLOUD_TURN_SPEED);
    } else {
      this.rotationSpeed += delta * CLOUD_ROTATE_ACCEL;
      v.applyAxisAngle(up, delta * CLOUD_TURN_SPEED);
    }
    v.setLength(CLOUD_SPEED);
    this.rotationSpeed = clamp(-CLOUD_ROTATE_SPEED, CLOUD_ROTATE_SPEED, this.rotationSpeed);

    var h = this.terrain.heightAt(pos.x, pos.z);
    v.y = 5.0 * (h + CLOUD_HEIGHT - pos.y);

    pos.x += delta * v.x;
    pos.y = Math.max(h + MIN_CLOUD_HEIGHT, pos.y + delta * v.y);
    pos.z += delta * v.z;

    switch (this.state) {
      case CloudState.IDLE:
        if (pos.distanceTo(player) < CLOUD_SPEED * CLOUD_CHARGE_TIME) {
          this.state = CloudState.CHARGING;
          this.charge = 0;
        }
        break;
      case CloudState.CHARGING:
        this.charge += delta / CLOUD_CHARGE_TIME;
        if (this.charge >= 1) {
          this.lightning.setVisible(true);
          this.state = CloudState.DISCHARGING;
          this.charge = 1;
        }
        break;
      case CloudState.DISCHARGING:
        this.charge -= delta / CLOUD_DISCHARGE_TIME;
        if (this.charge <= 0) {
          this.lightning.setVisible(false);
          this.state = CloudState.COOLDOWN;
          this.cooldown = 1;
        }
        break;
      case CloudState.COOLDOWN:
        this.cooldown -= delta / CLOUD_COOLDOWN_TIME;
        if (this.cooldown <= 0) {
          this.state = CloudState.IDLE;
        }
        break;
    }

    this.mesh.rotation.z += delta * this.rotationSpeed * (1 + 30 * this.charge);

    this.lightning.update(delta);
  }
}
