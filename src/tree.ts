/// <reference path="../typings/tsd.d.ts" />
/// <reference path="seed.ts" />
/// <reference path="sound.ts" />

class Tree {
  private obj: THREE.Object3D;
  private mesh: THREE.Mesh;
  private sounds: THREE.Audio[] = [];
  private burnt: boolean;
  private seed: Seed;

  constructor(x: number, y: number, z: number, private height: number, private game: Game) {
    this.obj = new THREE.Object3D();
    this.obj.position.set(x, y, z);

    var treeMesh = new THREE.CylinderGeometry(TREE_RADIUS/4, TREE_RADIUS, 1, 12, 1);
    var treeMaterial = new THREE.MeshPhongMaterial({
      color: 0x4f0937,
      shading: THREE.FlatShading,
    });
    this.mesh = new THREE.Mesh(treeMesh, treeMaterial);
    this.mesh.scale.y = height + 2;
    this.mesh.position.y = height/2 - 1;
    this.obj.add(this.mesh);

    for (var i = 0; i < 3; i++) {
      var sound = new THREE.Audio(audioListener);
      sound.load('boom' + (i+1) + '.ogg');
      sound.setRefDistance(100);
      this.sounds.push(sound);
      this.obj.add(sound);
    }
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  getPosition(): THREE.Vector3 {
    return this.getObject().position;
  }

  getTop(out: THREE.Vector3) {
    out.copy(this.obj.position);
    out.y += this.height - 1;
  }

  getHeight(): number {
    return this.height;
  }

  distanceTo(pos: THREE.Vector3): number {
    var dx = pos.x - this.obj.position.x;
    var dz = pos.z - this.obj.position.z;
    return Math.sqrt(dx*dx + dz*dz);
  }

  isBurnt(): boolean {
    return this.burnt;
  }

  burn() {
    this.burnt = true;
    play(this.sounds[Math.floor(Math.random() * 3)]);
    this.obj.remove(this.mesh);

    var burntMesh = new THREE.CylinderGeometry(TREE_RADIUS * 0.97, TREE_RADIUS, 4, 12, 1);
    var burntMaterial = new THREE.MeshPhongMaterial({
      color: 0x220016,
      shading: THREE.FlatShading,
    });
    this.mesh = new THREE.Mesh(burntMesh, burntMaterial);
    this.obj.add(this.mesh);

    var seed = new Seed(this.game.terrain);
    seed.getObject().position.copy(this.obj.position);
    seed.getObject().position.y += 2.5;
    this.game.addSeed(seed);
  }
}
