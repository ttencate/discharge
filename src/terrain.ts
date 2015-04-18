/// <reference path="../typings/tsd.d.ts" />

var TILE_SIZE = 32;
var TILE_SUBDIVISIONS = 32;
var TILE_VERTS = TILE_SUBDIVISIONS + 1;
var TILE_DISTANCE = VIEW_DISTANCE / TILE_SIZE + 1;

function clamp(min, max, x) {
  return x < min ? min : (x > max ? max : x);
}

function lerp(a, b, f) {
  return (1-f) * a + f * b;
}

class Terrain {
  private terragen: Terragen = new Terragen(new Random());
  private tiles: {[key: string]: Tile} = {};

  constructor(private scene: THREE.Scene, private center: THREE.Object3D) {
  }

  update() {
    var center = new THREE.Vector3();
    this.center.localToWorld(center);
    center.x /= TILE_SIZE;
    center.y = 0;
    center.z /= TILE_SIZE;

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

  heightAt(x: number, z: number): number {
    var tx = Math.floor(x / TILE_SIZE);
    var tz = Math.floor(z / TILE_SIZE);
    var key = tx + ',' + tz;
    var tile = this.tiles[key];
    if (!tile) {
      return 0;
    }
    return tile.heightAt(x - tx*TILE_SIZE, z - tz*TILE_SIZE);
  }
}

class Tile {
  private mesh: THREE.Mesh;
  private heightmap: Float64Array;
  private x: number;
  private z: number;

  constructor(tx: number, tz: number, terragen: Terragen) {
    this.x = tx * TILE_SIZE;
    this.z = tz * TILE_SIZE;

    this.heightmap = new Float64Array(TILE_VERTS * TILE_VERTS);
    for (var z = 0; z < TILE_VERTS; z++) {
      for (var x = 0; x < TILE_VERTS; x++) {
        this.heightmap[x + TILE_VERTS * z] =
            terragen.heightAt(this.x + x / TILE_SUBDIVISIONS * TILE_SIZE, this.z + z / TILE_SUBDIVISIONS * TILE_SIZE);
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

    this.mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
      color: 0x40e010,
      shading: THREE.FlatShading,
    }));
    this.mesh.position.x = this.x;
    this.mesh.position.z = this.z;
    this.mesh.receiveShadow = true;
  }

  destroy() {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }

  getObject(): THREE.Object3D {
    return this.mesh;
  }

  heightAt(x: number, z: number): number {
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
}

class Terragen {
  private noise: Float64Array = new Float64Array(1024);

  constructor(private random: Random) {
    for (var i = 0; i < this.noise.length; i++) {
      this.noise[i] = random.float();
    }
  }
   
  heightAt(x: number, z: number): number {
    return 3 * Math.sin(0.3*x) * Math.sin(0.2*z);
  }
}

class Random {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed || 1;
  }

  float(min?: number, max?: number) {
    if (min === undefined) {
      min = 0;
      max = 1;
    } else if (max === undefined) {
      max = min;
      min = 0;
    }
    var x = Math.sin(this.seed++) * 10000;
    x -= Math.floor(x);
    return min + (max - min) * x;
  }
}
