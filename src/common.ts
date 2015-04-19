/// <reference path="../typings/tsd.d.ts" />

var FOG_DISTANCE = 100;
var TERRAIN_DISTANCE = 150;
var CAMERA_DISTANCE = 500;
var SUN_POSITION = new THREE.Vector3(-5, 1, 0);
var SUN_COLOR = 0xaa9f8f;

var GRAVITY = 9.81;
var WALK_SPEED = 5.0;
var SLOW_DOWN_FACTOR = 0.8;

var CLOUD_HEIGHT = 50;
var MIN_CLOUD_HEIGHT = 20;
var CLOUD_SPEED = 30.0;
var CLOUD_TURN_SPEED = 0.5;
var CLOUD_ROTATE_SPEED = 1.0;
var CLOUD_ROTATE_ACCEL = 100.0;
var CLOUD_CHARGE_TIME = 3.0;
var CLOUD_DISCHARGE_TIME = 0.5;
var CLOUD_COOLDOWN_TIME = 3.0;

var TREE_RADIUS = 2.0;

var PI_2 = Math.PI / 2;

function k(s: string): number {
  return s.charCodeAt(0);
}
var controls = {
  forwardKeys: [190, k('W'), k('Z'), 38],
  backwardKeys: [k('E'), k('S'), 40],
  leftKeys: [k('O'), k('A'), 37],
  rightKeys: [k('U'), k('D'), 39],
  jumpKeys: [k(' ')],
};

function clamp(min, max, x) {
  return x < min ? min : (x > max ? max : x);
}

function lerp(a, b, f) {
  return (1-f) * a + f * b;
}
