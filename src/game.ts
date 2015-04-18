/// <reference path="../typings/tsd.d.ts" />
/// <reference path="common.ts" />
/// <reference path="player.ts" />
/// <reference path="sky.ts" />
/// <reference path="terrain.ts" />

class Game {

  renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  private sky: Sky;
  private terrain: Terrain;
  private player: Player;

  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xc0c0c0);
    this.renderer.shadowMapEnabled = true;

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, VIEW_DISTANCE);

    this.scene = new THREE.Scene();

    this.scene.fog = new THREE.Fog(0xaa8a5e, 0.1, VIEW_DISTANCE);

    var ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    var light = new THREE.DirectionalLight(0xc0c0c0, 1.0);
    light.position.set(1, 1, 1);
    // light.castShadow = true;
    // light.shadowCameraNear = 0.1;
    // light.shadowCameraFar = 100;
    // light.shadowCameraLeft = -5;
    // light.shadowCameraRight = 5;
    // light.shadowCameraTop = -5;
    // light.shadowCameraBottom = 5;
    // light.shadowMapWidth = 1024;
    // light.shadowMapHeight = 1024;
    this.scene.add(light);

    this.sky = new Sky(this.camera);

    this.terrain = new Terrain(this.scene, this.camera);

    this.player = new Player(this.camera, this.terrain);
    this.scene.add(this.player.getObject());

    this.update(0);
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update(delta) {
    this.terrain.update();
    this.sky.update();
    this.player.update(delta);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  setControlsEnabled(enabled: boolean) {
    this.player.setControlsEnabled(enabled);
  }
}

