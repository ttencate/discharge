/// <reference path="../typings/tsd.d.ts" />

var treeMesh = new THREE.CylinderGeometry(TREE_RADIUS/4, TREE_RADIUS, 1, 12, 1);

class Tree {
  private mesh: THREE.Mesh;

  constructor(x: number, y: number, z: number, height: number) {
    this.mesh = new THREE.Mesh(
        treeMesh,
        new THREE.MeshPhongMaterial({
          color: 0x4f0937,
          shading: THREE.FlatShading,
        }));
    this.mesh.scale.y = height;
    this.mesh.position.set(x, y + height/2 - 2, z);
  }

  getObject(): THREE.Object3D {
    return this.mesh;
  }

  getPosition(): THREE.Vector3 {
    return this.getObject().position;
  }

  distanceTo(x: number, z: number) {
  }
}
