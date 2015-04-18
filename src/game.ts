/// <reference path="../typings/tsd.d.ts" />
/// <reference path="common.ts" />
/// <reference path="player.ts" />
/// <reference path="terrain.ts" />

class Game {

  renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private clock: THREE.Clock;

  private terrain: Terrain;
  private player: Player;
  private cube: THREE.Mesh;

  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xc0c0c0);
    this.renderer.shadowMapEnabled = true;

    this.clock = new THREE.Clock();

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, VIEW_DISTANCE);

    this.scene = new THREE.Scene();

    this.scene.fog = new THREE.Fog(0xc0c0c0, 0.1, VIEW_DISTANCE);

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

    for (var z = -6; z <= -2; z += 2) {
      for (var x = -2; x <= 2; x += 2) {
        var h = 2.0 * Math.random();
        this.cube = new THREE.Mesh(new THREE.BoxGeometry(1, h, 1), new THREE.MeshPhongMaterial({color: 0xff8000}));
        this.cube.position.x = x;
        this.cube.position.y = h/2;
        this.cube.position.z = z;
        this.cube.castShadow = true;
        this.scene.add(this.cube);
      }
    }

    var sky = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 1, 1), new THREE.MeshBasicMaterial({color: 0xa0b0ff}));
    sky.position.y = 6;
    sky.rotation.x = Math.PI/2;
    this.scene.add(sky);

    this.terrain = new Terrain(this.scene, this.camera);

    this.player = new Player(this.camera, this.terrain);
    this.scene.add(this.player.getObject());
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  render() {
    var delta = this.clock.getDelta();

    this.terrain.update();
    this.player.update(delta);

    this.renderer.render(this.scene, this.camera);
  }

  setControlsEnabled(enabled: boolean) {
    this.player.setControlsEnabled(enabled);
  }
}

