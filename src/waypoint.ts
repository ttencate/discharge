/// <reference path="../typings/tsd.d.ts" />
/// <reference path="common.ts" />

class Waypoint {
  private obj: THREE.Object3D;

  constructor(pos: THREE.Vector3) {
    this.obj = new THREE.Object3D();
    this.obj.position.copy(pos);

    var mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(WAYPOINT_RADIUS, WAYPOINT_RADIUS, 10, 24, 1, true),
        new THREE.MeshPhongMaterial({
          emissive: 0xaa1700,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }));
    mesh.position.y = 0;
    this.obj.add(mesh);
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  getPosition(): THREE.Vector3 {
    return this.obj.position;
  }
}

class Path {
  private waypoints: Waypoint[] = [];
  private index: number = 0;
  private obj: THREE.Object3D;

  private tmp: THREE.Vector3 = new THREE.Vector3();

  constructor(private terrain: Terrain, private player: Player) {
    this.obj = new THREE.Object3D();
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  addWaypoint(x: number, z: number) {
    this.tmp.set(x, 0, z);
    this.tmp.y = this.terrain.heightAt(this.tmp);
    var w = new Waypoint(this.tmp);
    if (this.waypoints.length == 0) {
      this.obj.add(w.getObject());
      this.index = 0;
    }
    this.waypoints.push(w);
  }

  numWaypoints(): number {
    return this.waypoints.length;
  }

  waypointIndex(): number {
    return this.index;
  }

  currentWaypoint(): Waypoint {
    return this.waypoints[this.index];
  }

  update(delta: number) {
    var w = this.waypoints[this.index];
    if (w && planarDistance(this.player.getPosition(), w.getPosition()) <= WAYPOINT_RADIUS) {
      this.obj.remove(w.getObject());
      this.index++;
      if (this.waypoints[this.index]) {
        this.obj.add(this.waypoints[this.index].getObject());
      }
    }
  }
}
