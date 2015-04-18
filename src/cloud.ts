/// <reference path="../typings/tsd.d.ts" />
/// <reference path="common.ts" />

const up = new THREE.Vector3(0, 1, 0);

class Cloud {
  private obj: THREE.Object3D;
  private mesh: THREE.Mesh;
  private spot: THREE.SpotLight;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private rotationSpeed: number;

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

    var spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, -100, 0);
    this.obj.add(spotTarget);

    this.spot = new THREE.SpotLight(0xffffff, 2.0);
    this.spot.position.set(0, -10, 0);
    this.spot.target = spotTarget;
    this.spot.angle = 0.3 * Math.PI/2;
    this.spot.exponent = 100.0;
    this.obj.add(this.spot);
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
      this.rotationSpeed -= 0.1;
      v.applyAxisAngle(up, -delta * CLOUD_TURN_SPEED);
    } else {
      this.rotationSpeed += 0.1;
      v.applyAxisAngle(up, delta * CLOUD_TURN_SPEED);
    }
    v.setLength(CLOUD_SPEED);
    this.rotationSpeed = clamp(-CLOUD_ROTATE_SPEED, CLOUD_ROTATE_SPEED, this.rotationSpeed);

    var h = this.terrain.heightAt(pos.x, pos.z);
    v.y = 5.0 * (h + CLOUD_HEIGHT - pos.y);

    pos.x += delta * v.x;
    pos.y = Math.max(h + MIN_CLOUD_HEIGHT, pos.y + delta * v.y);
    pos.z += delta * v.z;

    this.mesh.rotation.z += delta * this.rotationSpeed;

    this.spot.intensity = 1.5 + Math.random();
  }
}
