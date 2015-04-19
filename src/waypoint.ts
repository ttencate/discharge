/// <reference path="../typings/tsd.d.ts" />
/// <reference path="common.ts" />

class Waypoint {
  private obj: THREE.Object3D;
  private sound: THREE.Audio;

  constructor(pos: THREE.Vector3, final: boolean) {
    this.obj = new THREE.Object3D();
    this.obj.position.copy(pos);

    var mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(WAYPOINT_RADIUS, WAYPOINT_RADIUS, 20, 24, 1, true),
        new THREE.MeshPhongMaterial({
          emissive: 0xaa1700,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }));
    mesh.position.y = -5;
    this.obj.add(mesh);

    this.sound = new THREE.Audio(audioListener);
    this.sound.load('waypoint.ogg');
    this.obj.add(this.sound);
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  getPosition(): THREE.Vector3 {
    return this.obj.position;
  }

  ping() {
    (<any>this.sound).play();
  }
}

class Path {
  private waypoints: Waypoint[] = [];
  private index: number;
  private obj: THREE.Object3D;

  private tmp: THREE.Vector3 = new THREE.Vector3();

  constructor(private terrain: Terrain, private player: Player, start: number) {
    this.obj = new THREE.Object3D();
    this.index = start;
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  addWaypoint(x: number, z: number, final?: boolean) {
    this.tmp.set(x, 0, z);
    this.tmp.y = this.terrain.heightAt(this.tmp);
    var w = new Waypoint(this.tmp, final || false);
    if (this.waypoints.length == this.index) {
      this.obj.add(w.getObject());
    }
    this.waypoints.push(w);
  }

  getWaypoint(i: number) {
    return this.waypoints[i];
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
      w.ping();
      this.obj.remove(w.getObject());
      this.index++;
      window.location.hash = '#' + this.index;
      if (this.waypoints[this.index]) {
        this.obj.add(this.waypoints[this.index].getObject());
      }
    }
  }
}
