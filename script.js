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

  // soft glow around it
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 90);
  glow.addColorStop(0, sky.sun);
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
  ctx.fill();

  // the solid disc itself
  ctx.fillStyle = sky.sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
  ctx.fill();
}

// house positions and roof colors, generated once
const houses = [];
for (let i = 0; i < 4; i++) {
  houses.push({
    x: 0.12 + i * 0.22 + Math.random() * 0.05,
    w: 0.07 + Math.random() * 0.02,
    roof: Math.random() > 0.5 ? '#c65b4a' : '#7a5a8a'
  });
}
// tree positions, generated once
const trees = [];
for (let i = 0; i < 6; i++) {
  trees.push({
    x: Math.random(),
    scale: 0.6 + Math.random() * 0.7,
    sway: Math.random() * Math.PI * 2
  });
}

function drawGround() {
  ctx.fillStyle = '#7bc65e'; // spring/summer green for now, we'll make this season-driven later
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

    // body
    ctx.fillStyle = '#5a4a63';
    ctx.fillRect(hx, hy - hh, hw, hh);

    // triangular roof
    ctx.fillStyle = h.roof;
    ctx.beginPath();
    ctx.moveTo(hx - 5, hy - hh);
    ctx.lineTo(hx + hw / 2, hy - hh - hw * 0.5);
    ctx.lineTo(hx + hw + 5, hy - hh);
    ctx.closePath();
    ctx.fill();

    // window, glowing warm if it's dusk/night
    const lit = sky.night || sky.dayProg < 0.25;
    ctx.fillStyle = lit ? 'rgba(255,214,140,0.9)' : 'rgba(60,50,70,0.5)';
    ctx.fillRect(hx + hw * 0.35, hy - hh * 0.55, hw * 0.3, hw * 0.3);
  });
}
function drawTrees() {
  const now = performance.now();

  trees.forEach((tr) => {
    const tx = tr.x * W;
    const ty = H * 0.79;
    const sway = Math.sin(now * 0.0006 + tr.sway) * 4;
    const th = 70 * tr.scale;

    // trunk
    ctx.strokeStyle = '#5c4433';
    ctx.lineWidth = 6 * tr.scale;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + sway, ty - th);
    ctx.stroke();

    // foliage — two overlapping blobs for a fuller look
    ctx.fillStyle = '#3f8f4a';
    ctx.beginPath();
    ctx.arc(tx + sway, ty - th, 30 * tr.scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2b6a34';
    ctx.beginPath();
    ctx.arc(tx + sway - 12 * tr.scale, ty - th + 8 * tr.scale, 18 * tr.scale, 0, Math.PI * 2);
    ctx.fill();
  });
}
function animate() {
  requestAnimationFrame(animate);
  drawSky();
  drawSun();
  drawGround();
  drawHouses();
  drawTrees();
}
animate();