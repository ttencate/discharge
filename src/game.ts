/// <reference path="../typings/tsd.d.ts" />
/// <reference path="cloud.ts" />
/// <reference path="common.ts" />
/// <reference path="hud.ts" />
/// <reference path="player.ts" />
/// <reference path="sky.ts" />
/// <reference path="sound.ts" />
/// <reference path="terrain.ts" />
/// <reference path="waypoint.ts" />

class Game {

  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  private sky: Sky;
  private terrain: Terrain;
  private player: Player;
  private clouds: Cloud[] = [];
  private waypoint: Waypoint;
  private hud: HUD;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, NEAR_PLANE, CAMERA_DISTANCE);

    audioListener = new THREE.AudioListener();
    this.camera.add(audioListener);

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
    this.player.getObject().position.set(-646, 0, 100);
    this.player.getObject().rotation.y = Math.PI/2;
    this.player.getObject().updateMatrix();
    this.player.getObject().updateMatrixWorld(true);
    this.scene.add(this.player.getObject());

    this.waypoint = new Waypoint(this.player, this.terrain);
    this.scene.add(this.waypoint.getObject());

    for (var i = 0; i < 1; i++) {
      var cloud = new Cloud(this.player.getPosition().x - 93, this.player.getPosition().z + 50, this.player, this.terrain);
      this.scene.add(cloud.getObject());
      this.clouds.push(cloud);
    }

    this.hud = new HUD(this.waypoint);
    this.camera.add(this.hud.getObject());

    this.update(0);
  }

  destroy() {
    this.player.setControlsEnabled(false);
  }

  isOver(): boolean {
    return this.player.isDead();
  }

  getScore(): number {
    return this.waypoint.getCount();
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update(delta) {
    for (var i = 0; i < this.clouds.length; i++) {
      this.clouds[i].update(delta);
    }
    this.player.update(delta);
    this.terrain.update(delta);
    this.waypoint.update(delta);
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

