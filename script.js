// grab our canvas and its 2D drawing context
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();
// season setup
const SEASON_NAMES = ['spring', 'summer', 'autumn', 'winter'];
const SEASON_COLORS = {
  foliage:     ['#f3b6d3', '#3f8f4a', '#d9822b', '#7a8a94'],
  foliageDark: ['#d98cb0', '#2b6a34', '#a9601c', '#5c6b74'],
  ground:      ['#bfe3a0', '#7bc65e', '#c9955a', '#eef2f5']
};

function hexLerp(hexA, hexB, t) {
  const a = parseInt(hexA.slice(1), 16), b = parseInt(hexB.slice(1), 16);
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}