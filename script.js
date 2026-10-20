const phrases = [
  'I love you',
  'Seni seviyorum',
  'Te amo',
  "Je t'aime",
  'Ich liebe dich',
  'Ti amo',
  'Eu te amo',
  'Я тебя люблю',
  '사랑해',
  '愛してる',
  '我爱你',
  'मैं तुमसे प्यार करता हूँ',
  "Σ' αγαπώ",
  'Ik hou van jou',
  'Jag älskar dig',
  'Kocham cię',
  'ฉันรักเธอ',
  'Anh yêu em',
  'Aku cinta kamu',
  'Я тебе кохаю',
  'I miss you',
  'Beni seviyorsun',
  'Love you',
  'Aşkım',
  'Mahal kita',
  'Seni seviyorum',
  'Te quiero',
  'J’aime',
  'Kocham cię',
  'I adore you'
];

const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
const state = {
  width: 0,
  height: 0,
  scale: 1,
  items: [],
  visibleCount: 0,
  lastReveal: 0,
  lastTs: 0,
};

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return { x, y };
}

function heartRows() {
  const rows = [];
  const points = [];

  for (let i = 0; i <= 720; i++) {
    const t = (2 * Math.PI * i) / 720;
    points.push(heartPoint(t));
  }

  for (let y = 14; y >= -15; y -= 0.9) {
    const xs = [];

    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const y1 = a.y;
      const y2 = b.y;

      if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
        const x = a.x + ((y - y1) * (b.x - a.x)) / (y2 - y1);
        xs.push(x);
      }
    }

    xs.sort((a, b) => a - b);
    for (let i = 0; i < xs.length - 1; i += 2) {
      rows.push({ y, left: xs[i], right: xs[i + 1] });
    }
  }

  return rows;
}

function measureText(text, size) {
  ctx.font = `${size}px Arial`;
  return ctx.measureText(text).width;
}

function buildLayout() {
  const rows = heartRows();
  const rng = mulberry32(11);
  const items = [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const width = row.right - row.left;
    if (width <= 0) continue;

    let cursor = row.left + 4;
    const line = [];

    while (cursor < row.right - 8) {
      const phrase = phrases[Math.floor(rng() * phrases.length)];
      const size = 9 + Math.floor(rng() * 4);
      const textWidth = measureText(phrase, size) + 12;

      if (cursor + textWidth > row.right - 4) break;

      const x = cursor + textWidth / 2;
      const color = `hsl(${Math.floor(rng() * 36) + 350}, 90%, ${64 + Math.random() * 18}%)`;

      line.push({
        text: phrase,
        x,
        y: row.y,
        size,
        color,
        alpha: 0,
        drift: rng() * 0.8 - 0.4,
      });

      cursor += textWidth + 8;
    }

    if (line.length > 0) {
      const lastItem = line[line.length - 1];
      const totalWidth = lastItem.x + lastItem.size * 0.5;
      const gap = row.right - totalWidth;
      const span = Math.max(1, line.length - 1);

      for (let i = 0; i < line.length; i++) {
        const item = line[i];
        item.x += gap * (i / span);
        item.y += (rng() - 0.5) * 2;
        items.push(item);
      }
    }
  }

  state.items = items;
  state.visibleCount = 0;
  state.lastReveal = 0;
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const size = Math.min(window.innerWidth * 0.9, 900);

  canvas.width = size * ratio;
  canvas.height = size * ratio;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  state.width = size;
  state.height = size;
  state.scale = size / 800;
  buildLayout();
}

function drawBackground(time) {
  const cx = state.width / 2;
  const cy = state.height / 2 + 12;
  const scale = state.scale * 22.8;

  ctx.fillStyle = '#040208';
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.beginPath();
  for (let i = 0; i <= 720; i++) {
    const t = (2 * Math.PI * i) / 720;
    const p = heartPoint(t);
    const x = cx + p.x * scale;
    const y = cy - p.y * scale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const glow = ctx.createRadialGradient(cx, cy - 30, 30, cx, cy, 330);
  glow.addColorStop(0, 'rgba(255, 80, 110, 0.24)');
  glow.addColorStop(0.45, 'rgba(150, 0, 40, 0.12)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const flicker = Math.sin(time * 0.0025) * 0.08;
  ctx.fillStyle = `rgba(255, 0, 64, ${0.1 + flicker})`;
  ctx.fillRect(0, 0, state.width, state.height);
}

function drawItems(time) {
  const cx = state.width / 2;
  const cy = state.height / 2 + 12;
  const scale = state.scale * 22.8;

  for (let i = 0; i < state.visibleCount; i++) {
    const item = state.items[i];
    const x = cx + item.x * scale;
    const y = cy - item.y * scale + Math.sin(time * 0.004 + i * 0.4) * 1.8;
    const alpha = Math.min(1, item.alpha + 0.06);

    ctx.font = `${item.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText(item.text, x + 2, y + 2);

    ctx.fillStyle = item.color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
    ctx.fillText(item.text, x, y);
  }
}

function animate(now) {
  drawBackground(now);

  const stepDelay = 18;
  if (now - state.lastReveal > stepDelay && state.visibleCount < state.items.length) {
    state.visibleCount += 1;
    state.items[state.visibleCount - 1].alpha = 1;
    state.lastReveal = now;
  }

  drawItems(now);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(animate);
