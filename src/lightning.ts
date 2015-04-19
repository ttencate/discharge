/// <reference path="../typings/tsd.d.ts" />
/// <reference path="sound.ts" />

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
  private sounds: THREE.Audio[] = [];

  private a: THREE.Vector3 = new THREE.Vector3();
  private b: THREE.Vector3 = new THREE.Vector3();

  constructor(private target: THREE.Object3D) {
    this.obj = new THREE.Object3D();
    for (var i = 0; i < 4; i++) {
      var points = [];
      const N = 32;
      for (var j = 0; j <= N; j++) {
        points.push(X_AXIS.clone().multiplyScalar(j / (N+1)));
      }
      displace(points, 0, N, 0.1);

      var tube = new THREE.TubeGeometry(<any>new THREE.SplineCurve3(points), N, 0.04, 8, false);
      tube.computeVertexNormals();
      var mesh = new THREE.Mesh(
          tube,
          new THREE.ShaderMaterial({
            vertexShader: document.getElementById('lightning-vertex').textContent,
            fragmentShader: document.getElementById('lightning-fragment').textContent,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
          }));
      mesh.visible = false;
      this.meshes[i] = mesh;
      this.obj.add(mesh);

      this.intensities[-1] = 0;
      this.intensities[i] = 8.0 + 4.0 * Math.random();
    }

    this.light = new THREE.PointLight(0xddeeff, 0.0, 0.0);
    this.obj.add(this.light);

    for (var i = 0; i < 3; i++) {
      var sound = new THREE.Audio(audioListener);
      sound.load('thunder' + (i+1) + '.ogg');
      sound.setRefDistance(50);
      this.sounds.push(sound);
      this.light.add(sound);
    }
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  setVisible(visible: boolean) {
    if (visible) {
      (<any>this.sounds[Math.floor(Math.random() * 3)]).play();
      this.meshIndex = 0;
    } else {
      this.meshIndex = -1;
    }
  }

  update(delta) {
    var target = this.b.set(0, 0, 0);
    this.target.localToWorld(target);
    this.obj.parent.worldToLocal(target);

    var s = target.length();
    this.obj.scale.set(s, 40, 40);

    target.normalize();
    this.obj.quaternion.setFromUnitVectors(X_AXIS, target);

    this.light.distance = 1.5 * s;

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
