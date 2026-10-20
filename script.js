const phrases = [
  'I love you',
  'Seni seviyorum',
  'Te amo',
  'Je t\'aime',
  'Ich liebe dich',
  'Ti amo',
  'Eu te amo',
  'Я тебя люблю',
  '사랑해',
  '愛してる',
  '我爱你',
  'मैं तुमसे प्यार करता हूँ',
  'Σ\' αγαπώ',
  'Ik hou van jou',
  'Jag älskar dig',
  'Kocham cię',
  'ฉันรักเธอ',
  'Anh yêu em',
  'Aku cinta kamu',
  'Я тебе кохаю'
];

const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

const state = {
  width: 0,
  height: 0,
  scale: 1,
  rows: [],
  t: 0,
  pulse: 0,
  lastPaint: 0
};

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

function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x, y };
}

function heartPath() {
  const points = [];
  for (let i = 0; i <= 720; i += 1) {
    const t = (2 * Math.PI * i) / 720;
    points.push(heartPoint(t));
  }
  return points;
}

function bindRows() {
  const heart = heartPath();
  const rows = [];
  const top = -14;
  const bottom = 14;
  const rowHeight = 0.8;

  for (let y = top; y > bottom; y -= rowHeight) {
    const xs = [];

    for (let i = 0; i < heart.length - 1; i += 1) {
      const a = heart[i];
      const b = heart[i + 1];
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

function buildLayout() {
  const rows = bindRows();
  const placed = [];
  const rng = mulberry32(11);

  let offset = 0;
  for (const row of rows) {
    const spacing = 12;
    const width = row.right - row.left;
    if (width <= 0) continue;

    let cursor = row.left + 4;
    const line = [];

    while (cursor < row.right - 8) {
      const phrase = phrases[(Math.floor(rng() * phrases.length) + offset) % phrases.length];
      const size = 9 + Math.floor(rng() * 4);
      const font = `${size}px Arial`;
      const measure = ctx.measureText(phrase);
      const requiredWidth = measure.width + 12;

      if (cursor + requiredWidth > row.right - 4) break;

      line.push({ text: phrase, x: cursor + requiredWidth / 2, y: row.y, size, color: `hsl(${Math.floor(rng() * 40) + 340}, 80%, ${70 + Math.random() * 12}%)` });
      cursor += requiredWidth + spacing;
    }

    if (line.length > 0) {
      const gap = row.right - line[line.length - 1].x - 18;
      for (let i = 0; i < line.length; i += 1) {
        const item = line[i];
        item.x += gap * (i / Math.max(1, line.length - 1));
        item.y += (rng() - 0.5) * 2;
        placed.push(item);
      }
    }

    offset += 1;
  }

  state.rows = placed;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawHeartBackground() {
  const cx = state.width / 2;
  const cy = state.height / 2 + 10;
  const scale = state.scale * 24;

  ctx.fillStyle = '#060208';
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.beginPath();
  for (let i = 0; i <= 720; i += 1) {
    const t = (2 * Math.PI * i) / 720;
    const p = heartPoint(t);
    const x = cx + p.x * scale;
    const y = cy - p.y * scale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const grad = ctx.createRadialGradient(cx, cy - 25, 20, cx, cy, 360 * state.scale);
  grad.addColorStop(0, 'rgba(255, 112, 146, 0.35)');
  grad.addColorStop(0.4, 'rgba(186, 20, 67, 0.18)');
  grad.addColorStop(1, 'rgba(8, 4, 11, 0.2)');

  ctx.fillStyle = grad;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 247, 250, 0.1)';
  ctx.stroke();
}

function drawRows(time) {
  const cx = state.width / 2;
  const cy = state.height / 2 + 10;
  const scale = state.scale * 24;

  ctx.save();
  ctx.translate(cx, cy);
  const ramp = 0.2 + Math.sin(time * 0.002) * 0.08;
  ctx.scale(1 + ramp, 1 + ramp);
  ctx.translate(-cx, -cy);

  for (const item of state.rows) {
    const x = cx + item.x * scale;
    const y = cy - item.y * scale;
    const offset = Math.sin(time * 0.004 + item.x + item.y) * 4;

    ctx.font = `${item.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(4, 2, 10, 0.8)';
    ctx.fillText(item.text, x + 2, y + 1 + offset);

    ctx.fillStyle = item.color;
    ctx.fillText(item.text, x, y + offset);
  }

  ctx.restore();
}

function render(time) {
  drawHeartBackground();
  drawRows(time);
  requestAnimationFrame(render);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(render);
