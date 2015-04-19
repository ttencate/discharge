/// <reference path="../typings/tsd.d.ts" />
/// <reference path="cloud.ts" />
/// <reference path="common.ts" />
/// <reference path="hud.ts" />
/// <reference path="player.ts" />
/// <reference path="sky.ts" />
/// <reference path="terrain.ts" />
/// <reference path="waypoint.ts" />

class Game {

  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  private sky: Sky;
  private terrain: Terrain;
  private player: Player;
  private clouds: Cloud[] = [];
  private path: Path;
  private hud: HUD;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, NEAR_PLANE, CAMERA_DISTANCE);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xaa8a5e, 0.1, FOG_DISTANCE);

    var ambientLight = new THREE.AmbientLight(0x220016);
    this.scene.add(ambientLight);

    var light = new THREE.DirectionalLight(SUN_COLOR, 1.0);
    light.position.copy(SUN_POSITION);
    this.scene.add(light);

    this.sky = new Sky(this.camera);

    this.terrain = new Terrain(this.scene, this.camera);

    this.player = new Player(this.camera, this.terrain);
    this.player.getObject().position.set(104, 0, -26);
    this.player.getObject().rotation.y = Math.PI/2;
    this.scene.add(this.player.getObject());

    for (var i = 0; i < 1; i++) {
      var cloud = new Cloud(11, 24, this.player, this.terrain);
      this.scene.add(cloud.getObject());
      this.clouds.push(cloud);
    }

    this.path = new Path(this.terrain, this.player);
    this.path.addWaypoint(71, -74);
    this.path.addWaypoint(20, -147);
    this.path.addWaypoint(101, -193);
    this.path.addWaypoint(212, -248);
    this.path.addWaypoint(309, -243);
    this.path.addWaypoint(420, -292);
    this.path.addWaypoint(494, -363);
    this.path.addWaypoint(611, -463);
    this.path.addWaypoint(691, -616);
    this.path.addWaypoint(892, -672);
    this.path.addWaypoint(1001, -616);
    this.path.addWaypoint(1058, -577, true);
    this.scene.add(this.path.getObject());

    this.hud = new HUD(this.path);
    this.camera.add(this.hud.getObject());

    this.update(0);
  }

  destroy() {
    this.player.setControlsEnabled(false);
  }

  isOver(): boolean {
    return this.player.isDead();
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update(delta) {
    this.terrain.update(delta);
    for (var i = 0; i < this.clouds.length; i++) {
      this.clouds[i].update(delta);
    }
    this.player.update(delta);
    this.path.update(delta);
    this.sky.update();
    this.hud.update(delta);
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): THREE.Camera {
    return this.camera;
  }

  setControlsEnabled(enabled: boolean) {
    this.player.setControlsEnabled(enabled);
  }
}

