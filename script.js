const phraseList = [
  'Seni seviyorum', 'I love you', 'Te amo', 'Je t\'aime', 'Ich liebe dich', 'Ti amo',
  'Eu te amo', 'Я тебя люблю', '사랑해', '愛してる', '我爱你', 'मैं तुमसे प्यार करता हूँ',
  'Σ\' αγαπώ', 'Ik hou van jou', 'Jag älskar dig', 'Kocham cię', 'ฉันรักเธอ',
  'Anh yêu em', 'Aku cinta kamu', 'Я тебе кохаю', 'Aşkım var', 'Mahal kita',
  'Te quiero', 'Tôi yêu bạn', 'Moezheh', 'Ôi em yêu anh', 'Mi amas', 'Pag-ibig kita',
  'Pryär', 'Szeretlek', 'Love you', 'Mina rakastan sinua', 'Ljubim te', 'Amor te',
  'Seni çok seviyorum', 'Amo-te', 'A mo te', 'Lubim cię', 'Sento che ti amo',
  'Je t\'adore', 'Án szeretlek', 'Te adoro', 'Ik hou van je', 'Amor tu', 'O iubesc',
  'T\'aime', 'Mi szeretem', 'Miluji tě', 'Aš tave myliu', 'Vă iubesc', 'Greu',
  'Tú me amas', 'Seni sevirem', 'Mina armastan sind', 'Mina armastan teid', 'Te vull',
  'Aš tave myliu', 'I love you very much', 'Seni çok seviyorum', 'Mimi ni penye',
  'Mahal kita', 'Igol kiye', 'Aime toi', 'Jongin joo', 'Seni sev diyorum', 'T\'aime',
  'T\'aime énormément', 'Ik lief jou', 'Ek is lief vir jou', 'Ngiyakutsanda', 'Mwen renmen ou',
  'Mina rakastan sinua', 'Miluji tě', 'Vas szeretlek', 'Jeg elsker dig', 'Jeg elsker deg',
  'Tu me amas', 'Seni seviyorum', 'Tove dig', 'Seni sevirem', 'Aku sayang kamu',
  'Sergi mityan', 'A mo te', 'Mina rakastan sinua', 'J\'aime', 'Seni seviyorum',
  'Mahal kita', 'Sughuru', 'Te iubesc', 'Seni seviyorum', 'Je t\'adore', 'Tavtove',
  'Seni seviyorum', 'A mí me gustas', 'Naku penda', 'Tė myliu', 'Mina armastan sind',
  'Te amo muito', 'Mina armastan teid', 'T\'aime', 'Beni seviyor musun', 'Seni seviyorum',
  'Mimi ni penye', 'Seni seviyorum', 'Naku penda', 'Seni seviyorum', 'I love you', 'Love you',
  'Seni seviyorum', 'Seni seviyorum', 'Seni seviyorum', 'Seni seviyorum', 'Seni seviyorum',
  'Seni seviyorum', 'Seni seviyorum', 'Seni seviyorum', 'Seni seviyorum', 'Seni seviyorum',
  'Seni seviyorum', 'Seni seviyorum', 'Seni seviyorum', 'Seni seviyorum', 'Seni seviyorum'
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
};

function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x, y };
}

function heartRows() {
  const points = [];
  for (let i = 0; i <= 720; i += 1) {
    const t = (2 * Math.PI * i) / 720;
    points.push(heartPoint(t));
  }

  const rows = [];
  for (let y = 14; y >= -15; y -= 0.9) {
    const xs = [];
    for (let i = 0; i < points.length - 1; i += 1) {
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
  const items = [];

  for (const row of rows) {
    const width = row.right - row.left;
    if (width <= 0) continue;

    let cursor = row.left + 4;
    const line = [];

    while (cursor < row.right - 8) {
      const index = Math.floor(Math.random() * phraseList.length);
      const text = phraseList[index];
      const size = 9 + Math.floor(Math.random() * 4);
      const w = measureText(text, size) + 12;
      if (cursor + w > row.right - 4) break;

      const x = cursor + w / 2;
      line.push({ text, x, y: row.y, size, alpha: 0, color: `hsl(${Math.floor(Math.random() * 26) + 350}, 90%, ${68 + Math.random() * 10}%)` });
      cursor += w + 8;
    }

    if (!line.length) continue;

    const last = line[line.length - 1];
    const totalWidth = last.x + last.size * 0.5;
    const gap = row.right - totalWidth;
    const span = Math.max(1, line.length - 1);

    for (let i = 0; i < line.length; i += 1) {
      const item = line[i];
      item.x += gap * (i / span);
      item.y += (Math.random() - 0.5) * 2;
      items.push(item);
    }
  }

  state.items = items;
  state.visibleCount = 0;
  state.lastReveal = 0;
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const size = Math.min(window.innerWidth * 0.9, 960);

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

function drawHeartBackground(time) {
  const cx = state.width / 2;
  const cy = state.height / 2 + 8;
  const scale = state.scale * 23;

  ctx.fillStyle = '#030106';
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

  ctx.strokeStyle = 'rgba(255, 0, 80, 0.04)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const glow = ctx.createRadialGradient(cx, cy - 20, 20, cx, cy, 320);
  glow.addColorStop(0, 'rgba(255, 80, 120, 0.10)');
  glow.addColorStop(0.6, 'rgba(180, 0, 50, 0.04)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fill();

  const pulse = 0.12 + Math.sin(time * 0.003) * 0.06;
  ctx.fillStyle = `rgba(255, 35, 90, ${pulse})`;
  ctx.fillRect(0, 0, state.width, state.height);
}

function drawItems(time) {
  const cx = state.width / 2;
  const cy = state.height / 2 + 8;
  const scale = state.scale * 23;

  for (let i = 0; i < state.visibleCount; i += 1) {
    const item = state.items[i];
    const x = cx + item.x * scale;
    const y = cy - item.y * scale + Math.sin(time * 0.004 + i * 0.5) * 2;

    ctx.font = `${item.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillText(item.text, x + 2, y + 2);

    ctx.fillStyle = item.color;
    ctx.globalAlpha = Math.min(1, item.alpha + 0.1);
    ctx.fillText(item.text, x, y);
    ctx.globalAlpha = 1;
  }
}

function animate(now) {
  drawHeartBackground(now);

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
