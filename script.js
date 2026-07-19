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

// blends two hex colors together, t = 0 (fully colorA) to 1 (fully colorB)
function hexLerp(hexA, hexB, t) {
  const a = parseInt(hexA.slice(1), 16), b = parseInt(hexB.slice(1), 16);
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

// returns sky colors based on the real hour of day
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

const hour = new Date().getHours();
const sky = skyForHour(hour);

// houses, generated once
const houses = [];
for (let i = 0; i < 4; i++) {
  houses.push({
    x: 0.12 + i * 0.22 + Math.random() * 0.05,
    w: 0.07 + Math.random() * 0.02,
    roof: Math.random() > 0.5 ? '#c65b4a' : '#7a5a8a'
  });
}

// trees, generated once
const trees = [];
for (let i = 0; i < 6; i++) {
  trees.push({
    x: Math.random(),
    scale: 0.6 + Math.random() * 0.7,
    sway: Math.random() * Math.PI * 2
  });
}

// birds, generated once
const birds = [];
for (let i = 0; i < 4; i++) {
  birds.push({
    x: Math.random(),
    y: 0.15 + Math.random() * 0.15,
    speed: 0.02 + Math.random() * 0.02,
    phase: Math.random() * 10
  });
}
// behavior tracking
let lastMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let velocity = 0;
let idleTime = 0;
let lastFrame = performance.now();
let seasonPos = 0; // 0 = spring, 1 = summer, 2 = autumn, 3 = winter (blends between)

window.addEventListener('mousemove', (e) => {
  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;
  velocity = Math.min(Math.sqrt(dx * dx + dy * dy), 60);
  lastMouse = { x: e.clientX, y: e.clientY };
  idleTime = 0;
});

function targetSeasonIndex() {
  if (idleTime > 14) return 3; // winter: long stillness
  if (idleTime > 5) return 2;  // autumn: settling down
  if (velocity > 22) return 1; // summer: energetic movement
  return 0;                    // spring: calm, gentle movement
}
function drawSky() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, sky.top);
  grad.addColorStop(1, sky.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawSun() {
  const sunX = W * (0.15 + 0.7 * sky.dayProg);
  const sunY = H * (0.55 - 0.4 * Math.sin(sky.dayProg * Math.PI));
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 90);
  glow.addColorStop(0, sky.sun);
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = sky.sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
  ctx.fill();
}
function drawGround() {
  const idxA = Math.floor(seasonPos) % 4;
  const idxB = (idxA + 1) % 4;
  const t = seasonPos - Math.floor(seasonPos);
  const groundColor = hexLerp(SEASON_COLORS.ground[idxA], SEASON_COLORS.ground[idxB], t);

  ctx.fillStyle = groundColor;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.78);
  ctx.quadraticCurveTo(W * 0.25, H * 0.72, W * 0.5, H * 0.76);
  ctx.quadraticCurveTo(W * 0.75, H * 0.8, W, H * 0.74);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
}
function drawHouses() {
  houses.forEach((h) => {
    const hx = h.x * W;
    const hw = h.w * W;
    const hy = H * 0.72;
    const hh = hw * 0.8;

    ctx.fillStyle = '#5a4a63';
    ctx.fillRect(hx, hy - hh, hw, hh);

    ctx.fillStyle = h.roof;
    ctx.beginPath();
    ctx.moveTo(hx - 5, hy - hh);
    ctx.lineTo(hx + hw / 2, hy - hh - hw * 0.5);
    ctx.lineTo(hx + hw + 5, hy - hh);
    ctx.closePath();
    ctx.fill();
    const lit = sky.night || sky.dayProg < 0.25;
    ctx.fillStyle = lit ? 'rgba(255,214,140,0.9)' : 'rgba(60,50,70,0.5)';
    ctx.fillRect(hx + hw * 0.35, hy - hh * 0.55, hw * 0.3, hw * 0.3);
  });
}