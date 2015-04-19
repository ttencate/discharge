/// <reference path="../typings/tsd.d.ts" />
/// <reference path="hud.ts" />
/// <reference path="player.ts" />
/// <reference path="sound.ts" />

enum SeedState {
  NEW,
  PICKED_UP,
  THROWN,
  DYING,
  GONE
}

class Seed {
  private obj: THREE.Object3D;
  private mesh: THREE.Mesh;
  private thrown: boolean = false;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private tmp: THREE.Vector3 = new THREE.Vector3();
  private state: SeedState = SeedState.NEW;
  private time: number = 0;

  private pickUp: THREE.Audio;
  private thrownSnd: THREE.Audio;
  private plant: THREE.Audio;

  constructor(private terrain: Terrain) {
    this.obj = new THREE.Object3D();

    this.mesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(2.0, 0),
        new THREE.MeshPhongMaterial({
          color: 0x4f0937,
          shading: THREE.FlatShading,
        }));
    this.obj.add(this.mesh);

    this.pickUp = new THREE.Audio(audioListener);
    this.pickUp.load('seed.ogg');
    (<any>this.pickUp).setVolume(0.5);
    this.obj.add(this.pickUp);

    this.thrownSnd = new THREE.Audio(audioListener);
    this.thrownSnd.load('thrown.ogg');
    (<any>this.thrownSnd).setVolume(0.3);
    this.obj.add(this.thrownSnd);

    this.plant = new THREE.Audio(audioListener);
    this.plant.load('tree.ogg');
    this.plant.setRefDistance(10);
    //(<any>this.plant).setVolume(3);
    this.obj.add(this.plant);
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  throwIt(pos: THREE.Vector3, v: THREE.Vector3) {
    this.state = SeedState.THROWN;
    this.obj.parent.remove(this.obj);
    this.obj.position.copy(pos);
    this.obj.scale.set(1, 1, 1);
    this.velocity.copy(v).setLength(15.0);
    this.terrain.scene.add(this.getObject());
    play(this.thrownSnd);
  }

  isGone(): boolean {
    return this.state == SeedState.GONE;
  }

  update(delta: number, player: Player, hud: HUD) {
    this.mesh.rotation.y += delta;
    this.mesh.position.y = 2 + 0.3 * Math.sin(0.2 * this.mesh.rotation.y);

    switch (this.state) {
      case SeedState.NEW:
        if (planarDistance(this.obj.position, player.getPosition()) < 1.5 * TREE_RADIUS
            && !player.seed) {
          player.seed = this;
          this.obj.parent.remove(this.obj);

          this.obj.position.set(0.20, -0.18, 0);
          this.obj.scale.set(0.01, 0.01, 0.01);
          hud.getObject().add(this.obj);
          this.state = SeedState.PICKED_UP;
          play(this.pickUp);
        }
        break;
      case SeedState.PICKED_UP:
        break;
      case SeedState.THROWN:
        this.velocity.y -= delta * GRAVITY;
        this.tmp.copy(this.velocity).multiplyScalar(delta);
        this.obj.position.add(this.tmp);
        if (this.obj.position.y <= this.terrain.heightAt(this.obj.position)) {
          this.terrain.spawnTree(this.obj.position);
          this.terrain.scene.remove(this.obj);
          play(this.plant);
          this.state = SeedState.DYING;
        }
        break;
      case SeedState.DYING:
        this.time += delta;
        if (this.time > 2) {
          this.state = SeedState.GONE;
        }
        break;
    }
  }
}
