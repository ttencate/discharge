/// <reference path="../typings/tsd.d.ts" />

class Game {

  renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private clock: THREE.Clock;
  private player: Player;
  private cube: THREE.Mesh;

  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xc0c0c0);
    this.renderer.shadowMapEnabled = true;

    this.clock = new THREE.Clock();

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.y = 1.0;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xc0c0c0, 0.05);

    var ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    var light = new THREE.DirectionalLight(0xc0c0c0, 1.0);
    light.position.set(2, 5, 0);
    light.castShadow = true;
    light.shadowCameraNear = 0.1;
    light.shadowCameraFar = 100;
    light.shadowCameraLeft = -5;
    light.shadowCameraRight = 5;
    light.shadowCameraTop = -5;
    light.shadowCameraBottom = 5;
    light.shadowMapWidth = 1024;
    light.shadowMapHeight = 1024;
    this.scene.add(light);

    this.cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({color: 0xff8000}));
    this.cube.position.y = 1.0;
    this.cube.position.z = -3.0;
    this.cube.castShadow = true;
    this.scene.add(this.cube);

    var ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 1, 1), new THREE.MeshPhongMaterial({color: 0x40e010}));
    ground.rotation.x = -Math.PI/2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    var sky = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 1, 1), new THREE.MeshBasicMaterial({color: 0xa0b0ff}));
    sky.position.y = 6;
    sky.rotation.x = Math.PI/2;
    this.scene.add(sky);

    this.player = new Player(this.scene, this.camera);
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  render() {
    var delta = this.clock.getDelta();

    this.player.update(delta);

    this.renderer.render(this.scene, this.camera);
  }

  setControlsEnabled(enabled: boolean) {
    this.player.setControlsEnabled(enabled);
  }
}

class Player {
  private controls: any; // THREE.PointerLockControls

  constructor(scene: THREE.Scene, private camera: THREE.Camera) {
    this.controls = new (<any>THREE).PointerLockControls(camera);
    scene.add(this.controls.getObject());
  }

  update(delta) {
  }

  setControlsEnabled(enabled: boolean) {
    this.controls.enabled = enabled;
  }
}

var game = new Game();
document.getElementById('canvas').appendChild(game.renderer.domElement);

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if (!havePointerLock) {
  alert('Your browser does not support pointer lock. Please use a recent version of Chrome or Firefox to play!');
}
var lockElement = <any>document.body;
document.addEventListener('pointerlockchange', pointerLockChange, false);
document.addEventListener('mozpointerlockchange', pointerLockChange, false);
document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
document.addEventListener('pointerlockerror', pointerLockError, false);
document.addEventListener('mozpointerlockerror', pointerLockError, false);
document.addEventListener('webkitpointerlockerror', pointerLockError, false);
function pointerLockChange() {
  var elt = (<any>document).pointerLockElement || (<any>document).mozPointerLockElement || (<any>document).webkitPointerLockElement;
  var locked = elt == lockElement;
  game.setControlsEnabled(locked);
  document.getElementById('overlay').style.display = locked ? 'none' : null;
}
function pointerLockError() {
  document.getElementById('overlay').style.display = null;
  game.setControlsEnabled(false);
}
document.getElementById('overlay').addEventListener('click', () => {
  lockElement.requestPointerLock = lockElement.requestPointerLock || lockElement.mozRequestPointerLock || lockElement.webkitRequestPointerLock;
  lockElement.requestPointerLock();
});

game.resize();
window.addEventListener('resize', game.resize.bind(game));

function render() {
  game.render();
  requestAnimationFrame(render);
}
render();
