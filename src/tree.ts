/// <reference path="../typings/tsd.d.ts" />

var treeMesh = null;
var treeMaterial = null;
var burntMesh = null;
var burntMaterial = null;

class Tree {
  public onBurn: () => void;

  private obj: THREE.Object3D;
  private mesh: THREE.Mesh;

  constructor(x: number, y: number, z: number, private height: number) {
    this.obj = new THREE.Object3D();
    this.obj.position.set(x, y, z);

    treeMesh = treeMesh || new THREE.CylinderGeometry(TREE_RADIUS/4, TREE_RADIUS, 1, 12, 1);
    treeMaterial = treeMaterial || new THREE.MeshPhongMaterial({
      color: 0x4f0937,
      shading: THREE.FlatShading,
    });
    this.mesh = new THREE.Mesh(treeMesh, treeMaterial);
    this.mesh.scale.y = height + 2;
    this.mesh.position.y = height/2 - 1;
    this.obj.add(this.mesh);
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  getPosition(): THREE.Vector3 {
    return this.getObject().position;
  }

  getTop(out: THREE.Vector3) {
    out.copy(this.obj.position);
    out.y += this.height;
  }

  distanceTo(pos: THREE.Vector3): number {
    var dx = pos.x - this.obj.position.x;
    var dz = pos.z - this.obj.position.z;
    return Math.sqrt(dx*dx + dz*dz);
  }

  burn() {
    if (this.onBurn) {
      this.onBurn();
    }
    this.obj.remove(this.mesh);

    burntMesh = burntMesh || new THREE.CylinderGeometry(TREE_RADIUS * 0.97, TREE_RADIUS, 4, 12, 1);
    burntMaterial = treeMaterial || new THREE.MeshPhongMaterial({
      color: 0x000000,
      shading: THREE.FlatShading,
    });
    this.mesh = new THREE.Mesh(burntMesh, burntMaterial);
    this.obj.add(this.mesh);
  }
}
