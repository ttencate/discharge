/// <reference path="../typings/tsd.d.ts" />

class Tree {
  private mesh: THREE.Mesh;

  constructor(x: number, y: number, z: number) {
    var height = 50;
    this.mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 2, height, 12, 1),
        new THREE.MeshPhongMaterial({
          color: 0x4f0937,
          shading: THREE.FlatShading,
        }));
    this.mesh.position.set(x, y - 1, z);
  }

  getObject(): THREE.Object3D {
    return this.mesh;
  }
}
