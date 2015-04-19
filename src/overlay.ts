/// <reference path="../typings/tsd.d.ts" />

var overlayShown = true;
var currentOverlay = 'loading';

function setOverlay(id: string) {
  if (overlayShown == !!id && currentOverlay == id) {
    return;
  }
  if (!id) {
    document.getElementById('overlay').classList.add('hidden');
  } else {
    document.getElementById(currentOverlay).classList.add('gone');
    document.getElementById(id).classList.remove('gone');
    document.getElementById('overlay').classList.remove('hidden');
  }
  currentOverlay = id || currentOverlay;
  overlayShown = !!id;
}
