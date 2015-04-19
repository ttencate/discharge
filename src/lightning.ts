/// <reference path="../typings/tsd.d.ts" />

function displace(points: THREE.Vector3[], start: number, end: number, offset: number) {
  if (end - start < 2) {
    return;
  }
  var mid = (start + end) / 2;
  var p = points[mid];
  p.copy(points[end]).add(points[start]).multiplyScalar(0.5);
  p.x += offset * 2 * (Math.random() - 0.5);
  p.y += offset * 2 * (Math.random() - 0.5);
  p.z += offset * 2 * (Math.random() - 0.5);
  displace(points, start, mid, offset/2);
  displace(points, mid, end, offset/2);
}

class Lightning {
  private obj: THREE.Object3D;
  private meshes: THREE.Mesh[] = [];
  private intensities: number[] = [];
  private light: THREE.PointLight;
  private meshIndex: number = -1;
  private time: number = 0;

  constructor(direction: THREE.Vector3) {
    this.obj = new THREE.Object3D();
    for (var i = 0; i < 4; i++) {
      var r = 0.2 * direction.length();
      var points = [];
      const N = 33;
      for (var j = 0; j < N; j++) {
        points.push(direction.clone().multiplyScalar(j / N));
      }
      displace(points, 0, N - 1, r);

      var tube = new THREE.TubeGeometry(<any>new THREE.SplineCurve3(points), 50, 2, 8, false);
      tube.computeVertexNormals();
      var mesh = new THREE.Mesh(
          tube,
          new THREE.ShaderMaterial({
            vertexShader: document.getElementById('lightning-vertex').textContent,
            fragmentShader: document.getElementById('lightning-fragment').textContent,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
          }));
      mesh.visible = false;
      this.meshes[i] = mesh;
      this.obj.add(mesh);

      this.intensities[-1] = 0;
      this.intensities[i] = 8.0 + 4.0 * Math.random();
    }

    this.light = new THREE.PointLight(0xddeeff, 0.0, 1.5 * direction.length());
    this.light.position.copy(direction).multiplyScalar(0.5);
    this.obj.add(this.light);
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  setVisible(visible: boolean) {
    if (visible) {
      this.meshIndex = 0;
    } else {
      this.meshIndex = -1;
    }
  }

  update(delta) {
    this.time += delta;
    if (this.time < 1/60) {
      return;
    }
    this.time = 0;

    if (this.meshIndex >= 0) {
      this.meshIndex += 1;
      this.meshIndex = this.meshIndex % (this.meshes.length * 2);
    }
    for (var i = 0; i < this.meshes.length; i++) {
      this.meshes[i].visible = i == this.meshIndex / 2;
    }
    this.light.intensity = this.intensities[this.meshIndex / 2] || 0.0;
  }
}
