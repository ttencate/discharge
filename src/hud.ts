/// <reference path="../typings/tsd.d.ts" />
/// <reference path="waypoint.ts" />

class HUD {
  private obj: THREE.Object3D;
  private arrow: THREE.Object3D;
  private markers: THREE.Mesh[] = [];

  private tmp: THREE.Vector3 = new THREE.Vector3();

  constructor(private path: Path) {
    this.obj = new THREE.Object3D();
    this.obj.position.set(0, 0, -0.2);

    var shape = new THREE.Shape([
        new THREE.Vector2(0, 4),
        new THREE.Vector2(-3, -1),
        new THREE.Vector2(-1, 0),
        new THREE.Vector2(-1, -2),
        new THREE.Vector2(1, -2),
        new THREE.Vector2(1, 0),
        new THREE.Vector2(3, -1),
    ]);
    this.arrow = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, {
          amount: 0.5,
          steps: 1,
          bevelEnabled: true,
          bevelThickness: 0.2,
          bevelSize: 0.2,
          bevelSegments: 1,
        }),
        new THREE.MeshPhongMaterial({
          emissive: 0xaa1700,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
          depthTest: false,
          blending: THREE.AdditiveBlending,
        }));
    this.arrow.scale.set(0.01, 0.01, 0.01);
    this.arrow.position.set(0, -0.15, 0);
    this.arrow.rotation.x = -Math.PI/2;
    this.obj.add(this.arrow);

    var n = this.path.numWaypoints();
    for (var i = 0; i < n; i++) {
      var marker = new THREE.Mesh(
          new THREE.SphereGeometry(0.005),
          new THREE.MeshPhongMaterial({
            emissive: 0xaa1700,
            transparent: true,
            opacity: 0.5,
            //side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
          }));
      marker.position.set(0.02 * (i - (n-1)/2), -0.18, 0);
      this.obj.add(marker);
      this.markers.push(marker);
    }
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  private lastIndex: number = -1;

  update(delta) {
    var w = this.path.currentWaypoint();
    if (w) {
      this.tmp.copy(w.getPosition());
      this.arrow.parent.worldToLocal(this.tmp);
      this.tmp.normalize();
      this.arrow.quaternion.setFromUnitVectors(Y_AXIS, this.tmp);
    } else {
      this.arrow.rotation.z += delta;
      this.arrow.rotation.x += delta;
    }

    var idx = this.path.waypointIndex();
    if (idx != this.lastIndex) {
      this.lastIndex = idx;
      for (var i = 0; i < this.markers.length; i++) {
        var mat = <THREE.MeshPhongMaterial>this.markers[i].material;
        if (i == idx) {
          mat.emissive = new THREE.Color(0xaa1700);
          mat.opacity = 0.8;
        } else if (i < idx) {
          mat.emissive = new THREE.Color(0xaa928f);
          mat.opacity = 0.2;
        } else {
          mat.emissive = new THREE.Color(0xaa1700);
          mat.opacity = 0.2;
        }
      }
    }
  }
}
