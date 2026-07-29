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

// ---- real weather layer ----
let realWeather = { code: 0, temp: null, isDay: true };

const WEATHER_DESCRIPTIONS = {
  0: 'clear sky above you',
  1: 'mostly clear',
  2: 'a few clouds drifting by',
  3: 'the sky is overcast',
  45: 'fog is rolling in',
  48: 'fog is rolling in',
  51: 'a light drizzle',
  53: 'a gentle rain',
  55: 'steady rain',
  61: 'light rain falling',
  63: 'rain falling',
  65: 'heavy rain falling',
  71: 'light snow falling',
  73: 'snow falling',
  75: 'heavy snow falling',
  80: 'passing showers',
  95: 'a storm is passing through',
  96: 'a storm is passing through',
  99: 'a storm is passing through'
};

function weatherIconSVG(code, size) {
  const s = size || 22;
  if (code === 0) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><circle cx="20" cy="20" r="10" fill="#ffe6b0"/><circle cx="20" cy="20" r="16" fill="#ffe6b0" opacity="0.25"/></svg>`;
  }
  if (code === 1 || code === 2) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><circle cx="16" cy="16" r="8" fill="#ffe6b0" opacity="0.8"/><ellipse cx="22" cy="24" rx="14" ry="8" fill="#ffffff" opacity="0.85"/></svg>`;
  }
  if (code === 3) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><ellipse cx="20" cy="20" rx="15" ry="9" fill="#ffffff" opacity="0.8"/><ellipse cx="14" cy="16" rx="9" ry="6" fill="#ffffff" opacity="0.6"/></svg>`;
  }
  if (code === 45 || code === 48) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><rect x="6" y="14" width="28" height="2.5" rx="1.5" fill="#ffffff" opacity="0.6"/><rect x="10" y="20" width="20" height="2.5" rx="1.5" fill="#ffffff" opacity="0.5"/><rect x="8" y="26" width="24" height="2.5" rx="1.5" fill="#ffffff" opacity="0.6"/></svg>`;
  }
  if ([51, 53, 55, 61, 63, 65, 80].includes(code)) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><ellipse cx="20" cy="14" rx="13" ry="8" fill="#ffffff" opacity="0.8"/><line x1="14" y1="26" x2="11" y2="34" stroke="#bcd8ff" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="26" x2="18" y2="34" stroke="#bcd8ff" stroke-width="2" stroke-linecap="round"/><line x1="28" y1="26" x2="25" y2="34" stroke="#bcd8ff" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  if ([71, 73, 75].includes(code)) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><ellipse cx="20" cy="14" rx="13" ry="8" fill="#ffffff" opacity="0.85"/><circle cx="14" cy="28" r="2" fill="#ffffff"/><circle cx="20" cy="32" r="2" fill="#ffffff"/><circle cx="26" cy="28" r="2" fill="#ffffff"/></svg>`;
  }
  if ([95, 96, 99].includes(code)) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><ellipse cx="20" cy="13" rx="13" ry="8" fill="#cfc9d8" opacity="0.9"/><polygon points="20,22 15,30 19,30 16,36 25,26 20,26" fill="#ffe6b0"/></svg>`;
  }
  return `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><circle cx="20" cy="20" r="10" fill="#ffe6b0" opacity="0.7"/></svg>`;
}

function showWeatherIntro(tempC, code) {
  const intro = document.getElementById('weather-intro');
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');

  tempEl.textContent = `${Math.round(tempC)}°`;
  descEl.textContent = WEATHER_DESCRIPTIONS[code] || 'the sky above you, right now';

  setTimeout(() => {
    intro.style.opacity = '0';
  }, 3200);
}

function renderForecastCard(current, daily) {
  const card = document.getElementById('forecast-card');

  let daysHtml = '';
  for (let i = 1; i <= 4 && i < daily.time.length; i++) {
    const date = new Date(daily.time[i]);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const icon = weatherIconSVG(daily.weathercode[i], 26);
    const max = Math.round(daily.temperature_2m_max[i]);
    const min = Math.round(daily.temperature_2m_min[i]);
    daysHtml += `
      <div class="forecast-day">
        <div>${dayName}</div>
        <div class="forecast-day-icon">${icon}</div>
        <div class="forecast-day-temps">${max}° / ${min}°</div>
      </div>
    `;
  }

  card.innerHTML = `
    <div id="forecast-current-temp">${weatherIconSVG(current.weathercode, 40)} ${Math.round(current.temperature)}°</div>
    <div id="forecast-current-desc">${WEATHER_DESCRIPTIONS[current.weathercode] || 'clear skies'}</div>
    <div id="forecast-days">${daysHtml}</div>
  `;
}

function fetchRealWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const cw = data.current_weather;
      realWeather = { code: cw.weathercode, temp: cw.temperature, isDay: cw.is_day === 1 };
      showWeatherIntro(cw.temperature, cw.weathercode);
      renderForecastCard(cw, data.daily);
    })
    .catch(() => {
      document.getElementById('weather-intro').style.opacity = '0';
    });
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchRealWeather(pos.coords.latitude, pos.coords.longitude),
    () => {
      document.getElementById('weather-intro').style.opacity = '0';
    }
  );
} else {
  document.getElementById('weather-intro').style.opacity = '0';
}

// season setup
const SEASON_NAMES = ['spring', 'summer', 'autumn', 'winter'];
const SEASON_COLORS = {
  foliage:     ['#f3b6d3', '#3f8f4a', '#d9822b', '#7a8a94'],
  foliageDark: ['#d98cb0', '#2b6a34', '#a9601c', '#5c6b74'],
  ground:      ['#bfe3a0', '#7bc65e', '#c9955a', '#eef2f5']
};

const CAPTIONS = {
  spring: [
    'stay a while and the seasons will turn',
    'something is beginning to bloom',
    'the air remembers how to be gentle',
    'soft things are waking up again',
    'even the light feels new here',
    'a quiet kind of beginning',
    'the world is trying again',
    'something small is unfolding',
    'the ground is warm with waiting',
    'everything gentle starts here'
  ],
  summer: [
    'you moved, and the world grew warmer',
    'everything is a little more alive now',
    'the light is stretching itself thin',
    'the day is wide awake',
    'warmth has a way of spreading',
    'you brought the heat with you',
    'the air is humming louder now',
    'nothing here is standing still',
    'the light doesn\'t want to leave',
    'this is what motion feels like'
  ],
  autumn: [
    'the trees are letting go, slowly',
    'stillness has its own kind of color',
    'something in you has started to settle',
    'the light is turning gold and tired',
    'things are falling, gently, on purpose',
    'the air smells like an ending',
    'quiet has started to arrive',
    'the year is exhaling',
    'everything is turning inward now',
    'this is what slowing down looks like'
  ],
  winter: [
    'it grew quiet, so the snow came',
    'the world is resting, and so are you',
    'even stillness has a season',
    'the cold has its own kind of calm',
    'everything is holding its breath',
    'the quiet finally arrived',
    'this is what rest looks like',
    'the world went soft and white',
    'nothing is asking anything of you',
    'stillness settled in, and stayed'
  ]
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

const hour = new Date().getHours();
const sky = skyForHour(hour);

const houses = [];
for (let i = 0; i < 4; i++) {
  houses.push({
    x: 0.12 + i * 0.22 + Math.random() * 0.05,
    w: 0.07 + Math.random() * 0.02,
    roof: Math.random() > 0.5 ? '#c65b4a' : '#7a5a8a'
  });
}

const trees = [];
for (let i = 0; i < 6; i++) {
  trees.push({
    x: Math.random(),
    scale: 0.6 + Math.random() * 0.7,
    sway: Math.random() * Math.PI * 2
  });
}

const birds = [];
for (let i = 0; i < 4; i++) {
  birds.push({
    x: Math.random(),
    y: 0.15 + Math.random() * 0.15,
    speed: 0.02 + Math.random() * 0.02,
    phase: Math.random() * 10
  });
}

const PCOUNT = 90;
const particles = [];
for (let i = 0; i < PCOUNT; i++) {
  particles.push({
    x: Math.random(),
    y: Math.random(),
    speed: 0.3 + Math.random() * 0.5,
    drift: Math.random() * Math.PI * 2,
    size: 2 + Math.random() * 3
  });
}

const clouds = [];
for (let i = 0; i < 5; i++) {
  clouds.push({ x: Math.random(), y: 0.08 + Math.random() * 0.15, scale: 0.8 + Math.random() * 0.6, speed: 0.01 + Math.random() * 0.01 });
}

const rainDrops = [];
for (let i = 0; i < 150; i++) {
  rainDrops.push({ x: Math.random(), y: Math.random(), len: 10 + Math.random() * 15, speed: 4 + Math.random() * 3 });
}

const snowFlakes = [];
for (let i = 0; i < 100; i++) {
  snowFlakes.push({ x: Math.random(), y: Math.random(), speed: 0.15 + Math.random() * 0.2, drift: Math.random() * Math.PI * 2, size: 2 + Math.random() * 2 });
}

let lightningFlash = 0;
let lightningTimer = 3;

function isRainyCode(c)  { return [51, 53, 55, 61, 63, 65, 80].includes(c); }
function isSnowyCode(c)  { return [71, 73, 75].includes(c); }
function isCloudyCode(c) { return c >= 2; }
function isStormCode(c)  { return [95, 96, 99].includes(c); }

let lastMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let velocity = 0;
let idleTime = 0;
let lastFrame = performance.now();
let seasonPos = 0;

let calmTimer = performance.now();
let captionShown = false;
const caption = document.getElementById('caption');

window.addEventListener('mousemove', (e) => {
  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;
  velocity = Math.min(Math.sqrt(dx * dx + dy * dy), 60);
  lastMouse = { x: e.clientX, y: e.clientY };
  idleTime = 0;
});

function targetSeasonIndex() {
  if (idleTime > 14) return 3;
  if (idleTime > 5) return 2;
  if (velocity > 22) return 1;
  return 0;
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

function drawTrees() {
  const now = performance.now();
  const idxA = Math.floor(seasonPos) % 4;
  const idxB = (idxA + 1) % 4;
  const t = seasonPos - Math.floor(seasonPos);
  const foliage = hexLerp(SEASON_COLORS.foliage[idxA], SEASON_COLORS.foliage[idxB], t);
  const foliageDark = hexLerp(SEASON_COLORS.foliageDark[idxA], SEASON_COLORS.foliageDark[idxB], t);

  trees.forEach((tr) => {
    const tx = tr.x * W;
    const ty = H * 0.79;
    const sway = Math.sin(now * 0.0006 + tr.sway) * 4;
    const th = 70 * tr.scale;

    ctx.strokeStyle = '#5c4433';
    ctx.lineWidth = 6 * tr.scale;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + sway, ty - th);
    ctx.stroke();

    ctx.fillStyle = foliage;
    ctx.beginPath();
    ctx.arc(tx + sway, ty - th, 30 * tr.scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = foliageDark;
    ctx.beginPath();
    ctx.arc(tx + sway - 12 * tr.scale, ty - th + 8 * tr.scale, 18 * tr.scale, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBirds() {
  if (sky.night) return;

  const now = performance.now();

  birds.forEach((b) => {
    b.x += b.speed * 0.003;
    if (b.x > 1.1) b.x = -0.1;

    const bx = b.x * W;
    const by = b.y * H + Math.sin(now * 0.003 + b.phase) * 8;
    const flap = Math.sin(now * 0.01 + b.phase) * 6;

    ctx.strokeStyle = 'rgba(40,30,50,0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx - 8, by + flap);
    ctx.lineTo(bx, by - 3);
    ctx.lineTo(bx + 8, by + flap);
    ctx.stroke();
  });
}

function drawParticles(dt) {
  const now = performance.now();
  const idxA = Math.floor(seasonPos) % 4;
  const idxB = (idxA + 1) % 4;
  const t = seasonPos - Math.floor(seasonPos);

  const winterAmt = idxA === 3 ? (1 - t) : (idxB === 3 ? t : 0);
  const foliage = hexLerp(SEASON_COLORS.foliage[idxA], SEASON_COLORS.foliage[idxB], t);
  const particleColor = winterAmt > 0.3 ? 'rgba(255,255,255,0.85)' : foliage;

  particles.forEach((p) => {
    p.y += p.speed * dt * 0.05;
    p.x += Math.sin(now * 0.0006 + p.drift) * 0.0006;

    if (p.y > 1) p.y = -0.05;
    if (p.x > 1) p.x -= 1;
    if (p.x < 0) p.x += 1;

    ctx.fillStyle = particleColor;
    ctx.beginPath();
    ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawClouds(dt) {
  if (!isCloudyCode(realWeather.code)) return;
  clouds.forEach((c) => {
    c.x += c.speed * dt * 0.02;
    if (c.x > 1.3) c.x = -0.3;
    const cx = c.x * W, cy = c.y * H, r = 90 * c.scale;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.5, cy + 5, r * 0.7, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawRealRain(dt) {
  if (!isRainyCode(realWeather.code) && !isStormCode(realWeather.code)) return;
  ctx.strokeStyle = 'rgba(180,200,230,0.5)';
  ctx.lineWidth = 1;
  rainDrops.forEach((d) => {
    d.y += d.speed * dt;
    if (d.y > 1) { d.y = -0.05; d.x = Math.random(); }
    const x = d.x * W, y = d.y * H;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y + d.len);
    ctx.stroke();
  });
}

function drawRealSnow(dt) {
  if (!isSnowyCode(realWeather.code)) return;
  const now = performance.now();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  snowFlakes.forEach((f) => {
    f.y += f.speed * dt * 0.05;
    f.x += Math.sin(now * 0.0005 + f.drift) * 0.0004;
    if (f.y > 1) f.y = -0.05;
    ctx.beginPath();
    ctx.arc(f.x * W, f.y * H, f.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawLightning(dt) {
  if (!isStormCode(realWeather.code)) return;
  lightningTimer -= dt;
  if (lightningTimer <= 0) {
    lightningFlash = 1;
    lightningTimer = 4 + Math.random() * 6;
  }
  if (lightningFlash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${lightningFlash * 0.4})`;
    ctx.fillRect(0, 0, W, H);
    lightningFlash -= dt * 2;
    if (lightningFlash < 0) lightningFlash = 0;
  }
}

const seasonLabel = document.getElementById('season-label');

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min((now - lastFrame) / 1000, 0.1);
  lastFrame = now;

  idleTime += dt;
  velocity *= 0.94;

  const target = targetSeasonIndex();
  const current = ((seasonPos % 4) + 4) % 4;
  let diff = target - current;
  if (diff > 2) diff -= 4;
  if (diff < -2) diff += 4;
  seasonPos = (current + diff * dt * 0.15 + 4) % 4;

  drawSky();
  drawSun();
  drawGround();
  drawHouses();
  drawTrees();
  drawBirds();
  drawParticles(dt);
  drawClouds(dt);
  drawRealRain(dt);
  drawRealSnow(dt);
  drawLightning(dt);

  seasonLabel.textContent = SEASON_NAMES[Math.floor(seasonPos) % 4];

  if (!captionShown && now - calmTimer > 6000) {
    const currentSeason = SEASON_NAMES[Math.floor(seasonPos) % 4];
    const lines = CAPTIONS[currentSeason];
    caption.textContent = lines[Math.floor(Math.random() * lines.length)];
    caption.style.opacity = '1';
    captionShown = true;
    setTimeout(() => { caption.style.opacity = '0'; }, 7000);
  }

  if (velocity < 2 && idleTime < 1) {
    calmTimer = now;
  }
}
animate();