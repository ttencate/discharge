/// <reference path="../typings/tsd.d.ts" />
/// <reference path="game.ts" />

var game = new Game();
document.getElementById('canvas').appendChild(game.renderer.domElement);

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if (!havePointerLock) {
  alert('Your browser does not support pointer lock. Please use a recent version of Chrome or Firefox to play!');
}
var locked = false;
var lockElement = <any>document.body;
document.addEventListener('pointerlockchange', pointerLockChange, false);
document.addEventListener('mozpointerlockchange', pointerLockChange, false);
document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
document.addEventListener('pointerlockerror', pointerLockError, false);
document.addEventListener('mozpointerlockerror', pointerLockError, false);
document.addEventListener('webkitpointerlockerror', pointerLockError, false);
function pointerLockChange() {
  var elt = (<any>document).pointerLockElement || (<any>document).mozPointerLockElement || (<any>document).webkitPointerLockElement;
  locked = elt == lockElement;
  if (locked) {
    document.getElementById('instructions').classList.add('hidden');
    game.setControlsEnabled(true);
  } else {
    document.getElementById('instructions').classList.remove('hidden');
    game.setControlsEnabled(false);
  }
}
function pointerLockError() {
  locked = false;
  document.getElementById('instructions').classList.remove('hidden');
  game.setControlsEnabled(false);
}
document.getElementById('instructions').addEventListener('click', () => {
  lockElement.requestPointerLock = lockElement.requestPointerLock || lockElement.mozRequestPointerLock || lockElement.webkitRequestPointerLock;
  lockElement.requestPointerLock();
});

game.resize();
window.addEventListener('resize', game.resize.bind(game));

var clock = new THREE.Clock();
function render() {
  var delta = clock.getDelta();
  if (locked) {
    game.update(delta);
  }
  game.render();
  requestAnimationFrame(render);
}
render();

document.getElementById('loading').classList.add('hidden');
