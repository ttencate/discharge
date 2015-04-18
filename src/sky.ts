/// <reference path="../typings/tsd.d.ts" />

class Sky {
  private mesh: THREE.Mesh;

  constructor(private camera: THREE.PerspectiveCamera) {
    this.mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.ShaderMaterial({
          vertexShader: document.getElementById('sky-vertex').textContent,
          fragmentShader: document.getElementById('sky-fragment').textContent,
          side: THREE.BackSide,
          depthWrite: false,
        }));
    this.camera.add(this.mesh);
  }

  update() {
    this.camera.updateMatrixWorld(false);
    this.mesh.quaternion.setFromRotationMatrix(this.camera.matrixWorld).inverse();
  }
}
