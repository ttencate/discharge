/// <reference path="../typings/tsd.d.ts" />

var audioListener: THREE.AudioListener = null;

function play(snd: THREE.Audio) {
  if (snd.source.buffer) {
    (<any>snd).play();
  }
}
