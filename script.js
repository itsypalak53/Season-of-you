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

function animate() {
  requestAnimationFrame(animate);
  drawSky();
}
animate();
