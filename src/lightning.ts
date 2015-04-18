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
  private spot: THREE.SpotLight;
  private meshes: THREE.Mesh[] = [];
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

      var curve = new THREE.SplineCurve3(points);
      var mesh = new THREE.Mesh(
          new THREE.TubeGeometry(<any>curve, 50, 1, 8, false),
          new THREE.MeshBasicMaterial({color: 0xffffff, fog: false}));
      mesh.visible = i == 0;
      this.meshes[i] = mesh;
      this.obj.add(mesh);
    }

    var spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, -100, 0);
    this.obj.add(spotTarget);

    this.spot = new THREE.SpotLight(0xffffff, 2.0);
    this.spot.position.set(0, -10, 0);
    this.spot.target = spotTarget;
    this.spot.angle = 0.3 * Math.PI/2;
    this.spot.exponent = 100.0;
    this.obj.add(this.spot);
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  setVisible(visible: boolean) {
    this.obj.visible = visible;
  }

  update(delta) {
    const MESH_TIME = 0.03;
    this.time += delta;
    this.time = this.time % (this.meshes.length * MESH_TIME);
    var meshIndex = Math.floor(this.time / MESH_TIME);
    for (var i = 0; i < this.meshes.length; i++) {
      this.meshes[i].visible = i == meshIndex;
    }

    this.spot.intensity = 1.5 + Math.random();
  }
}
