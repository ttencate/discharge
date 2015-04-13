/// <reference path="../typings/tsd.d.ts" />

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.y = 1.0;
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xc0c0c0);
renderer.shadowMapEnabled = true;
function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
onResize();
window.addEventListener('resize', onResize);
document.body.insertBefore(renderer.domElement, document.body.firstChild);

var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xc0c0c0, 0.05);

var ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

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
scene.add(light);

var cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({color: 0xff8000}));
cube.position.y = 1.0;
cube.position.z = -3.0;
cube.castShadow = true;
scene.add(cube);

var ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 1, 1), new THREE.MeshPhongMaterial({color: 0x40e010}));
ground.rotation.x = -Math.PI/2;
ground.receiveShadow = true;
scene.add(ground);

var sky = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 1, 1), new THREE.MeshBasicMaterial({color: 0xa0b0ff}));
sky.position.y = 6;
sky.rotation.x = Math.PI/2;
scene.add(sky);


var clock = new THREE.Clock();
function render() {
  var delta = clock.getDelta();

  cube.rotation.x += 1 * delta;
  cube.rotation.y += 1 * delta;

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
