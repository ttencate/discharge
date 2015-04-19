/// <reference path="../typings/tsd.d.ts" />

var NEAR_PLANE = 0.1;
var FOG_DISTANCE = 100;
var TERRAIN_DISTANCE = 150;
var CAMERA_DISTANCE = 500;
var SUN_POSITION = new THREE.Vector3(-5, 1, 0);
var SUN_COLOR = 0xaa9f8f;

var GRAVITY = 9.81;
var WALK_SPEED = 5.0;
var SLOW_DOWN_FACTOR = 0.8;

var CLOUD_HEIGHT = 50;
var MIN_CLOUD_HEIGHT = 30;
var CLOUD_SPEED = WALK_SPEED * 1.3;
var CLOUD_TURN_SPEED = 1.0;
var CLOUD_ROTATE_SPEED = 1.0;
var CLOUD_CHARGE_TIME = 0.8;
var CLOUD_DISCHARGE_TIME = 0.3;
var CLOUD_COOLDOWN_TIME = 0.5;

var TREE_RADIUS = 2.0;
var MIN_TREE_HEIGHT = 20;
var MAX_TREE_HEIGHT = 30;
var TREE_LIGHTNING_ATTRACTION_RADIUS = MAX_TREE_HEIGHT;

var LIGHTNING_DEADLY_DISTANCE = 5.0;

var WAYPOINT_RADIUS = 10.0;

var PI_2 = Math.PI / 2;
const X_AXIS = new THREE.Vector3(1, 0, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

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

function planarDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  var dx = a.x - b.x;
  var dz = a.z - b.z;
  return Math.sqrt(dx*dx + dz*dz);
}
