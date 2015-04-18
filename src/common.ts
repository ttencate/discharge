/// <reference path="../typings/tsd.d.ts" />

var FOG_DISTANCE = 100;
var TERRAIN_DISTANCE = 150;
var CAMERA_DISTANCE = 500;
var SUN_POSITION = new THREE.Vector3(-5, 1, 0);
var SUN_COLOR = 0xaa9f8f;

var GRAVITY = 9.81;
var WALK_SPEED = 4.0;
var SLOW_DOWN_FACTOR = 0.8;

var CLOUD_HEIGHT = 50;
var MIN_CLOUD_HEIGHT = 20;
var CLOUD_SPEED = 30.0;
var CLOUD_TURN_SPEED = 0.5;
var CLOUD_ROTATE_SPEED = 1.0;

var PI_2 = Math.PI / 2;

var controls = {
  forwardKey: 190,
  backwardKey: 69,
  leftKey: 79,
  rightKey: 85,
  jumpKey: 32,
}

function clamp(min, max, x) {
  return x < min ? min : (x > max ? max : x);
}

function lerp(a, b, f) {
  return (1-f) * a + f * b;
}
