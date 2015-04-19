/// <reference path="../typings/tsd.d.ts" />

// A fast, but not crytographically strong xorshift PRNG, to make up for
// the lack of a seedable random number generator in JavaScript.
// If seed is 0 or undefined, the current time is used.
class Random {
  private x: number;
  private y: number;
  private z: number;
  private w: number;

  constructor(seed?: number) {
    seed = seed || 1;
    this.x = seed & 0xffffffff;
    this.y = 362436069;
    this.z = 521288629;
    this.w = 88675123;
    for (var i = 0; i < 32; i++) this.uint32();
  }

  uint32(): number {
    var t = this.x ^ ((this.x << 11) & 0xffffffff);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = (this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8)));
    return this.w + 0x80000000;
  }

  float(min?: number, max?: number): number {
    if (min === undefined && max === undefined) {
      min = 0;
      max = 1;
    } else if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + (max - min) * this.uint32() / 0xffffffff;
  }

  int(min?: number, max?: number): number {
    return Math.floor(this.float(min, max));
  }

  boolean(trueProbability: number): boolean {
    return this.float() < trueProbability;
  }
}
