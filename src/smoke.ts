/// <reference path="../typings/tsd.d.ts" />

var SMOKE_TIME = 2;

var smokeTexture;

class Smoke {
  private obj: THREE.Object3D;
  private time: number = 0;
  private geometry: THREE.Geometry;
  private material: THREE.PointCloudMaterial;
  private v: THREE.Vector3[] = [];

  private tmp: THREE.Vector3 = new THREE.Vector3();

  constructor(x: number, y: number, z: number, r: number, h: number, n: number, c: number) {
    this.obj = new THREE.Object3D();
    this.obj.position.set(x, y, z);

    this.geometry = new THREE.Geometry();
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 2 * Math.PI;
      var d = Math.random() * r;
      var p = new THREE.Vector3(Math.cos(a) * d, h * Math.random(), Math.sin(a) * d);
      this.geometry.vertices.push(p);

      var v = new THREE.Vector3(Math.random() * Math.cos(a) * d, 5.0 * Math.random(), Math.random() * Math.sin(a) * d);
      this.v.push(v);
    }

    smokeTexture = smokeTexture || THREE.ImageUtils.loadTexture('smoke.png');
    this.material = new THREE.PointCloudMaterial({
      map: smokeTexture,
      size: 1.0,
      color: c,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });

    var cloud = new THREE.PointCloud(this.geometry, this.material);
    this.obj.add(cloud);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  update(delta: number) {
    this.time += delta;
    var f = this.time / SMOKE_TIME;

    for (var i = 0; i < this.v.length; i++) {
      this.geometry.vertices[i].add(this.tmp.copy(this.v[i]).multiplyScalar(delta));
    }
    this.geometry.verticesNeedUpdate = true;

    this.material.opacity = 1.0 * (1 - f);
    this.material.size = 1.0 + 3.0 * f;
  }

  isExpired() {
    return this.time > SMOKE_TIME;
  }
}
