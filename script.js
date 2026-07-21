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
function skyForHour(h) {
  if (h >= 5 && h < 8) {
    return { top: '#7a6aa8', bottom: '#f3b899', sun: '#ffd9a0', night: false, dayProg: (h - 5) / 3 };
  }
  if (h >= 8 && h < 17) {
    return { top: '#6fb8e8', bottom: '#d9f0ff', sun: '#fff3c4', night: false, dayProg: 0.5 };
  }
  if (h >= 17 && h < 20) {
    return { top: '#3a3466', bottom: '#e8895f', sun: '#ffb27a', night: false, dayProg: 1 - (h - 17) / 3 };
  }
  return { top: '#0b0a1e', bottom: '#1c1a38', sun: '#e6e6f0', night: true, dayProg: 0.5 };
}