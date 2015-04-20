/// <reference path="../typings/tsd.d.ts" />

var skyGeometry;
var skyMaterial;

class Sky {
  private mesh: THREE.Mesh;

  constructor(private camera: THREE.PerspectiveCamera) {
    skyGeometry = skyGeometry || new THREE.SphereGeometry(1, 32, 32),
    skyMaterial = skyMaterial || new THREE.ShaderMaterial({
      vertexShader: document.getElementById('sky-vertex').textContent,
      fragmentShader: document.getElementById('sky-fragment').textContent,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(skyGeometry, skyMaterial);
    this.camera.add(this.mesh);
  }

  update() {
    this.camera.updateMatrixWorld(false);
    this.mesh.quaternion.setFromRotationMatrix(this.camera.matrixWorld).inverse();
  }
}
