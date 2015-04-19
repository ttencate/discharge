/// <reference path="../typings/tsd.d.ts" />
/// <reference path="common.ts" />
/// <reference path="lightning.ts" />

const up = new THREE.Vector3(0, 1, 0);

enum CloudState {
  CHARGING,
  DISCHARGING,
  COOLDOWN,
}

class Cloud {
  private obj: THREE.Object3D;
  private mesh: THREE.Mesh;
  private velocity: THREE.Vector3 = new THREE.Vector3();

  private state: CloudState = CloudState.CHARGING;
  private charge: number = 0;
  private cooldown: number = 0;

  private lightning: Lightning;
  private lightningTarget: THREE.Object3D;
  private hitTree: Tree;

  private tmp: THREE.Vector3 = new THREE.Vector3();

  constructor(x: number, z: number, private player: Player, private terrain: Terrain) {
    this.velocity.set(0, 0, MIN_CLOUD_SPEED);

    this.obj = new THREE.Object3D();
    this.obj.position.set(x, 0, z);
    this.obj.position.setY(this.terrain.heightAt(this.obj.position) + CLOUD_HEIGHT);

    var size = 10;
    var cloudMesh = new THREE.TorusKnotGeometry(size, 7, 50, 8);
    var cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0x370124,
      specular: 0xcf87b5,
      emissive: 0x370124,
      shininess: 5,
      shading: THREE.FlatShading,
      fog: false,
    });
    this.mesh = new THREE.Mesh(cloudMesh, cloudMaterial);
    this.mesh.castShadow = true;
    this.mesh.rotation.x = -PI_2;
    this.obj.add(this.mesh);

    var light = new THREE.DirectionalLight(SUN_COLOR, 1.0);
    light.position.set(0, 1, 0).multiplyScalar(5.0);
    light.target = this.mesh;
    light.castShadow = true;
    light.onlyShadow = true;
    light.shadowDarkness = 0.6;
    light.shadowCameraNear = 0.1;
    light.shadowCameraFar = 1000;
    light.shadowCameraLeft = -20;
    light.shadowCameraRight = 20;
    light.shadowCameraTop = 20;
    light.shadowCameraBottom = -20;
    this.obj.add(light);

    this.lightningTarget = new THREE.Object3D();

    this.lightning = new Lightning(this.lightningTarget);
    this.obj.add(this.lightning.getObject());
    this.lightning.setVisible(false);

    var sound = new THREE.Audio(audioListener);
    sound.position.y = -CLOUD_HEIGHT / 2;
    sound.load('cloud.ogg');
    sound.setLoop(true);
    (<any>sound).autoplay = true;
    sound.setRefDistance(70);
    sound.setRolloffFactor(10);
    this.obj.add(sound);
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  update(delta) {
    var pos = this.obj.position;
    var v = this.velocity;

    var tmp = this.tmp;
    tmp.copy(this.player.getPosition());
    this.obj.worldToLocal(tmp);
    if (tmp.x > 0) {
      this.obj.rotation.y += delta * CLOUD_TURN_SPEED;
    } else { 
      this.obj.rotation.y -= delta * CLOUD_TURN_SPEED;
    }
    if (tmp.z > 0) {
      v.z += delta * CLOUD_ACCELERATION;
    } else {
      v.z -= delta * CLOUD_ACCELERATION;
    }
    v.z = clamp(MIN_CLOUD_SPEED, MAX_CLOUD_SPEED, v.z);

    var h = this.terrain.heightAt(pos);
    v.y = 5.0 * (h + CLOUD_HEIGHT - pos.y);

    // this.obj.translateX(delta * this.velocity.x);
    pos.y = Math.max(h + MIN_CLOUD_HEIGHT, pos.y);
    this.obj.translateZ(delta * this.velocity.z);

    switch (this.state) {
      case CloudState.CHARGING:
        this.charge += delta / CLOUD_CHARGE_TIME;
        if (this.charge >= 1) {
          this.charge = 1;
          this.state = CloudState.DISCHARGING;

          this.hitTree = this.terrain.closestTree(this.obj.position);
          var height = this.terrain.heightAt(this.obj.position);
          if (this.hitTree && this.hitTree.distanceTo(this.obj.position) < TREE_LIGHTNING_ATTRACTION_RADIUS) {
            this.hitTree.getTop(this.lightningTarget.position);
            this.terrain.addSmoke(new Smoke(this.hitTree.getPosition().x, height, this.hitTree.getPosition().z, TREE_RADIUS, this.hitTree.getHeight(), 500, 0x0f000a));
          } else {
            this.hitTree = null;
            this.lightningTarget.position.copy(this.obj.position);
            this.lightningTarget.position.y = height;
          }
          this.terrain.addSmoke(new Smoke(this.lightningTarget.position.x, height, this.lightningTarget.position.z - 2, LIGHTNING_DEADLY_DISTANCE, 3, 500, 0x0f000a));
          this.obj.parent.add(this.lightningTarget);

          this.lightning.setVisible(true);

          if (planarDistance(this.lightningTarget.position, this.player.getPosition()) < LIGHTNING_DEADLY_DISTANCE) {
            this.player.die();
          }
        }
        break;
      case CloudState.DISCHARGING:
        this.charge -= delta / CLOUD_DISCHARGE_TIME;
        if (this.charge <= 0) {
          if (this.hitTree) {
            this.hitTree.burn();
          }
          this.lightning.setVisible(false);

          this.cooldown = 1;
          this.state = CloudState.COOLDOWN;
        }
        break;
      case CloudState.COOLDOWN:
        this.cooldown -= delta / CLOUD_COOLDOWN_TIME;
        if (this.cooldown <= 0 && !this.player.isDead()) {
          this.charge = 0;
          this.state = CloudState.CHARGING;
        }
        break;
    }

    //this.mesh.rotation.z += delta * CLOUD_ROTATE_SPEED;
    //var scale = 0.6 + 0.6 * this.charge;
    //this.mesh.scale.set(1, 1, scale);

    this.lightning.update(delta);
  }
}
