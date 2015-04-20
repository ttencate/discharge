/// <reference path="../typings/tsd.d.ts" />
/// <reference path="common.ts" />
/// <reference path="game.ts" />
/// <reference path="sound.ts" />

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if (!havePointerLock) {
  alert('Your browser does not support pointer lock. Please use a recent version of Chrome or Firefox to play!');
  throw new Error('no pointer lock');
}

var renderer = new THREE.WebGLRenderer();
renderer.shadowMapEnabled = true;
document.getElementById('canvas').appendChild(renderer.domElement);

var game = null;
function newGame() {
  if (game) {
    game.destroy();
    game = null;
  }

  game = new Game();
  resize();

  unlock();
}
newGame();

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
    game.setControlsEnabled(true);
  } else {
    game.setControlsEnabled(false);
  }
  updateOverlay();
}
function pointerLockError() {
  locked = false;
  game.setControlsEnabled(false);
}
document.getElementById('overlay').addEventListener('click', (e: Event) => {
  if (game.isOver()) {
    location.reload();
  } else {
    lock();
  }
  e.preventDefault();
});
document.addEventListener('click', (e: MouseEvent) => {
  if (locked && e.button == 2) {
    unlock();
  }
});

function lock() {
  lockElement.requestPointerLock = lockElement.requestPointerLock || lockElement.mozRequestPointerLock || lockElement.webkitRequestPointerLock;
  lockElement.requestPointerLock();
}

function unlock() {
  var doc = <any>document;
  doc.exitPointerLock = doc.exitPointerLock || doc.mozExitPointerLock || doc.webkitExitPointerLock;
  doc.exitPointerLock();
}

var overlayScore = null;
function updateOverlay() {
  if (!game) {
    setOverlay('loading');
  } else if (game.isOver()) {
    setOverlay('dead');
    if (game.getScore() !== overlayScore) {
      overlayScore = game.getScore();
      document.getElementById('score').innerHTML = '' + game.getScore();
    }
  } else if (!locked) {
    setOverlay('instructions');
  } else {
    setOverlay(null);
  }
}

window.addEventListener('resize', resize);
resize();
function resize() { 
  var w = window.innerWidth;
  var h = window.innerHeight;
  this.renderer.setSize(w, h);
  game.resize(w, h);
}

window.setInterval(function() {
  console.log(renderer.info.memory);
}, 1000);

var clock = new THREE.Clock();
function render() {
  var delta = clock.getDelta();
  if (delta > 1/20) delta = 1/20;
  if (locked || game.isOver()) {
    game.update(delta);
  }
  renderer.render(game.getScene(), game.getCamera());
  if (locked && game.isOver()) {
    unlock();
  }
  updateOverlay();
  requestAnimationFrame(render);
}
render();
