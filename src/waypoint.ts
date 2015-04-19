/// <reference path="../typings/tsd.d.ts" />
/// <reference path="common.ts" />

class Waypoint {
  private obj: THREE.Object3D;
  private sound: THREE.Audio;
  private count: number = 0;
  private random: Random = new Random(42);

  constructor(private player: Player, private terrain: Terrain) {
    this.obj = new THREE.Object3D();
    this.obj.position.copy(player.getPosition());
    this.nextPosition();

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
    (<any>this.sound).setVolume(1.0);
    this.sound.setRolloffFactor(0);
    this.obj.add(this.sound);
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  getPosition(): THREE.Vector3 {
    return this.obj.position;
  }

  getCount(): number {
    return this.count;
  }

  update(delta: number) {
    if (planarDistance(this.player.getPosition(), this.obj.position) <= WAYPOINT_RADIUS) {
      play(this.sound);
      this.count++;
      this.nextPosition();
    }
  }

  private nextPosition() {
    this.obj.position.x -= this.random.float(50, 100);
    this.obj.position.z += this.random.float(-80, 80);
    this.obj.position.y = this.terrain.heightAt(this.obj.position);
  }
}
