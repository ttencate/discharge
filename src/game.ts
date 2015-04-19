/// <reference path="../typings/tsd.d.ts" />
/// <reference path="cloud.ts" />
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
  private clouds: Cloud[] = [];

  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xc0c0c0);
    this.renderer.shadowMapEnabled = true;

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, NEAR_PLANE, CAMERA_DISTANCE);

    this.scene = new THREE.Scene();

    this.scene.fog = new THREE.Fog(0xaa8a5e, 0.1, FOG_DISTANCE);

    var ambientLight = new THREE.AmbientLight(0x370124);
    this.scene.add(ambientLight);

    var light = new THREE.DirectionalLight(SUN_COLOR, 1.0);
    light.position.copy(SUN_POSITION);
    this.scene.add(light);

    this.sky = new Sky(this.camera);

    this.terrain = new Terrain(this.scene, this.camera);

    this.player = new Player(this.camera, this.terrain);
    this.scene.add(this.player.getObject());

    for (var i = 0; i < 1; i++) {
      var cloud = new Cloud(0, 0, this.player, this.terrain);
      this.scene.add(cloud.getObject());
      this.clouds.push(cloud);
    }

    this.update(0);
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update(delta) {
    this.terrain.update();
    for (var i = 0; i < this.clouds.length; i++) {
      this.clouds[i].update(delta);
    }
    this.player.update(delta);
    this.sky.update();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  setControlsEnabled(enabled: boolean) {
    this.player.setControlsEnabled(enabled);
  }
}

