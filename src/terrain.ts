/// <reference path="../typings/tsd.d.ts" />
/// <reference path="random.ts" />
/// <reference path="tree.ts" />

var TILE_SIZE = 64;
var TILE_SUBDIVISIONS = 64;
var TILE_VERTS = TILE_SUBDIVISIONS + 1;
var TILE_DISTANCE = TERRAIN_DISTANCE / TILE_SIZE + 1;

var TREE_PROBABILITY = 0.3;
var MIN_TREES_PER_TILE = 5;
var MAX_TREES_PER_TILE = 20;
var MIN_TREE_HEIGHT = 20;
var MAX_TREE_HEIGHT = 30;

class Terrain {
  private terragen: Terragen = new Terragen(new Random());
  private tiles: {[key: string]: Tile} = {};

  constructor(private scene: THREE.Scene, private center: THREE.Object3D) {
  }

  update() {
    var center = new THREE.Vector3();
    this.center.localToWorld(center);
    center.x = center.x / TILE_SIZE - 0.5;
    center.y = 0;
    center.z = center.z / TILE_SIZE - 0.5;

    var prevTiles = this.tiles;
    this.tiles = {};
    var v = new THREE.Vector3();
    for (v.z = Math.floor(center.z - TILE_DISTANCE); v.z <= Math.ceil(center.z + TILE_DISTANCE); v.z++) {
      for (v.x = Math.floor(center.x - TILE_DISTANCE); v.x <= Math.ceil(center.x + TILE_DISTANCE); v.x++) {
        if (v.distanceToSquared(center) > TILE_DISTANCE * TILE_DISTANCE) {
          continue;
        }
        var key = v.x + ',' + v.z;
        var tile = prevTiles[key];
        if (tile) {
          delete prevTiles[key];
        } else {
          tile = new Tile(v.x, v.z, this.terragen);
          this.scene.add(tile.getObject());
        }
        this.tiles[key] = tile;
      }
    }

    for (key in prevTiles) {
      prevTiles[key].destroy();
    }
  }

  heightAt(pos: THREE.Vector3): number {
    var tx = Math.floor(pos.x / TILE_SIZE);
    var tz = Math.floor(pos.z / TILE_SIZE);
    var key = tx + ',' + tz;
    var tile = this.tiles[key];
    if (tile) {
      return tile.heightAt(pos);
    } else {
      return this.terragen.heightAt(pos.x, pos.z);
    }
  }

  closestTree(pos): Tree {
    var tx = Math.floor(pos.x / TILE_SIZE);
    var tz = Math.floor(pos.z / TILE_SIZE);
    var closest = null;
    var dist = 1e99;
    for (var dx = -1; dx <= 1; dx++) {
      for (var dz = -1; dz <= 1; dz++) {
        var key = (tx + dx) + ',' + (tz + dz);
        var tile = this.tiles[key];
        if (tile) {
          var tree = tile.closestTree(pos);
          if (tree) {
            var d = tree.distanceTo(pos);
            if (d < dist) {
              closest = tree;
              dist = d;
            }
          }
        }
      }
    }
    return closest;
  }
}

var terrainMaterial = null;

class Tile {
  private obj: THREE.Object3D;
  private mesh: THREE.Mesh;
  private heightmap: Float64Array;
  private x: number;
  private z: number;
  private trees: Tree[] = [];

  constructor(tx: number, tz: number, terragen: Terragen) {
    this.x = tx * TILE_SIZE;
    this.z = tz * TILE_SIZE;

    this.obj = new THREE.Object3D();

    this.heightmap = new Float64Array(TILE_VERTS * TILE_VERTS);
    for (var z = 0; z < TILE_VERTS; z++) {
      for (var x = 0; x < TILE_VERTS; x++) {
        var height = terragen.heightAt(this.x + x / TILE_SUBDIVISIONS * TILE_SIZE, this.z + z / TILE_SUBDIVISIONS * TILE_SIZE);
        this.heightmap[x + TILE_VERTS * z] = height;
      }
    }

    var geo = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, TILE_SUBDIVISIONS, TILE_SUBDIVISIONS);
    var verts = geo.vertices;
    for (var z = 0; z < TILE_VERTS; z++) {
      for (var x = 0; x < TILE_VERTS; x++) {
        verts[x + TILE_VERTS * z].set(
            x / TILE_SUBDIVISIONS * TILE_SIZE,
            this.heightmap[x + TILE_VERTS * z],
            z / TILE_SUBDIVISIONS * TILE_SIZE);
      }
    }
    geo.verticesNeedUpdate = true;
    geo.computeFaceNormals();
    geo.dynamic = false;

    terrainMaterial = terrainMaterial || new THREE.MeshLambertMaterial({
      color: 0xaa7a39,
      shading: THREE.FlatShading,
    });
    this.mesh = new THREE.Mesh(geo, terrainMaterial);
    this.mesh.position.x = this.x;
    this.mesh.position.z = this.z;
    this.mesh.receiveShadow = true;
    this.obj.add(this.mesh);

    var random = new Random(2579 * tx + 7919 * tz);
    if (random.boolean(TREE_PROBABILITY)) {
      var numTrees = random.int(MIN_TREES_PER_TILE, MAX_TREES_PER_TILE + 1);
      var treePos = new THREE.Vector3();
      while (numTrees--) {
        treePos.x = this.x + TREE_RADIUS + random.float(TILE_SIZE - 2 * TREE_RADIUS);
        treePos.z = this.z + TREE_RADIUS + random.float(TILE_SIZE - 2 * TREE_RADIUS);
        var closest = this.closestTree(treePos);
        if (closest && closest.distanceTo(treePos) < 2 * TREE_RADIUS) {
          continue;
        }
        var height = this.heightAt(treePos);
        var tree = new Tree(treePos.x, height, treePos.z, random.float(MIN_TREE_HEIGHT, MAX_TREE_HEIGHT));
        this.trees.push(tree);
        this.obj.add(tree.getObject());
      }
    }
  }

  destroy() {
    if (this.obj.parent) {
      this.obj.parent.remove(this.obj);
    }
  }

  getObject(): THREE.Object3D {
    return this.obj;
  }

  heightAt(pos: THREE.Vector3): number {
    var x = pos.x - this.x;
    var z = pos.z - this.z;
    x = clamp(0, TILE_SUBDIVISIONS, x / TILE_SIZE * TILE_SUBDIVISIONS);
    z = clamp(0, TILE_SUBDIVISIONS, z / TILE_SIZE * TILE_SUBDIVISIONS);
    var ix = Math.floor(x);
    var iz = Math.floor(z);
    var fx = x - ix;
    var fz = z - iz;
    if (ix == TILE_SUBDIVISIONS) {
      ix--;
      fx++;
    }
    if (iz == TILE_SUBDIVISIONS) {
      iz--;
      fz++;
    }
    var a = lerp(this.heightmap[ix + TILE_VERTS * iz], this.heightmap[ix + 1 + TILE_VERTS * iz], fx);
    var b = lerp(this.heightmap[ix + TILE_VERTS * (iz + 1)], this.heightmap[ix + 1 + TILE_VERTS * (iz + 1)], fx);
    return lerp(a, b, fz);
  }

  closestTree(pos: THREE.Vector3): Tree {
    var closest = null;
    var dist = 1e99;
    for (var i = 0; i < this.trees.length; i++) {
      var d = this.trees[i].distanceTo(pos);
      if (d < dist) {
        dist = d;
        closest = this.trees[i];
      }
    }
    return closest;
  }
}

const NOISE_SIZE = 64;
const OCTAVES = 8;
const AMP = 128;
const X_OFFSET = 0.2187474;
const Z_OFFSET = 0.1736391;

class Terragen {
  private noise: Float64Array = new Float64Array(NOISE_SIZE * NOISE_SIZE);
  private transforms: THREE.Matrix3[] = [];
  private exponents: number[] = [];
  private v: THREE.Vector3 = new THREE.Vector3();

  constructor(private random: Random) {
    for (var i = 0; i < this.noise.length; i++) {
      this.noise[i] = random.float();
    }
    var scale = 128;
    var exponent = 8;
    for (var i = 0; i < OCTAVES; i++) {
      var m = new THREE.Matrix3();
      var rot = random.float(0.0, 2 * Math.PI);
      var s = 1/scale;
      m.elements[0] = s * Math.cos(rot);
      m.elements[1] = s * Math.sin(rot);
      m.elements[3] = s * -Math.sin(rot);
      m.elements[4] = s * Math.cos(rot);
      m.elements[2] = random.float(0.0, s);
      m.elements[5] = random.float(0.0, s);
      this.transforms[i] = m;

      this.exponents[i] = exponent;

      scale /= random.float(1.6, 2.5);
      exponent = Math.pow(exponent, random.float(0.5, 1.0));
    }
  }
   
  heightAt(x: number, z: number): number {
    var v = this.v;

    var amplitude = AMP / 2;
    var scale = 128;
    var sum = 0;
    for (var octave = 0; octave < OCTAVES; octave++) {
      v.set(x, z, 1).applyMatrix3(this.transforms[octave]);
      var sx = (v.x % NOISE_SIZE + NOISE_SIZE) % NOISE_SIZE;
      var sz = (v.y % NOISE_SIZE + NOISE_SIZE) % NOISE_SIZE;
      var ix0 = Math.floor(sx);
      var iz0 = Math.floor(sz);
      var ix1 = (ix0 + 1) % NOISE_SIZE;
      var iz1 = (iz0 + 1) % NOISE_SIZE;
      var fx = sx - ix0;
      var fz = sz - iz0;
      var a = lerp(this.noise[ix0 + NOISE_SIZE * iz0], this.noise[ix1 % NOISE_SIZE + NOISE_SIZE * iz0], fx);
      var b = lerp(this.noise[ix0 + NOISE_SIZE * iz1], this.noise[ix1 % NOISE_SIZE + NOISE_SIZE * iz1], fx);
      var sample = lerp(a, b, fz);
      sum += amplitude * Math.pow(sample, this.exponents[octave]);
      amplitude /= 2;
    }
    return sum;
  }
}
