const NS = 'http://www.w3.org/2000/svg';
const PRODUCTS = Array.from({ length: 12 }, (_, i) => `p${String(i + 1).padStart(2, '0')}.webp`);
const PRODUCT_BASE = 'assets/products/';
const LOGOS = ['tcc.png', 'chaokoh.png', 'maeploy.png', 'yoddoi.png'];
const LOGO_BASE = 'assets/logos/';
const PER_PAGE = 3;
const PAGE_MS = 4000;

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

function rng(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function drawStars(g) {
  const r = rng(7);
  for (let i = 0; i < 220; i++) {
    const c = el('circle', {
      cx: (i < 90 ? -100 + r() * 590 : -800 + r() * 1990).toFixed(1), cy: (-120 + r() * 400).toFixed(1),
      r: (0.4 + r() * 1.1).toFixed(2), opacity: (0.4 + r() * 0.6).toFixed(2),
    }, g);
    if (i % 4 === 0) { c.classList.add('twinkle'); c.style.animationDelay = (-r() * 4).toFixed(2) + 's'; }
  }
}

const FAR = [[-100, 270, 56, 176], [-40, 320, 46, 126], [10, 290, 40, 156], [60, 250, 54, 196], [118, 300, 40, 146],
  [350, 240, 50, 206], [400, 300, 60, 146], [470, 260, 70, 186], [-160, 300, 50, 146], [-280, 340, 100, 106], [560, 330, 110, 116]];

export function drawCityWindows(g) {
  const r = rng(11);
  for (const [x, y, w] of FAR) {
    for (let wy = y + 8; wy < 432; wy += 12) {
      for (let wx = x + 5; wx < x + w - 6; wx += 9) {
        if (r() > 0.42) continue;
        const on = r();
        const rect = el('rect', { x: wx, y: wy, width: 4, height: 5, fill: on > 0.25 ? '#F7D28A' : '#9FB4FF', opacity: (0.35 + r() * 0.5).toFixed(2) }, g);
        if (r() < 0.18) { rect.classList.add('twinkle'); rect.style.animationDuration = (2 + r() * 5).toFixed(1) + 's'; rect.style.animationDelay = (-r() * 6).toFixed(1) + 's'; }
      }
    }
  }
}

export function drawLanterns(g) {
  const r = rng(23);
  for (let i = 0; i < 18; i++) {
    const outer = el('g', { transform: `translate(${(i < 9 ? -60 + r() * 520 : -600 + r() * 1600).toFixed(0)} ${(380 + r() * 60).toFixed(0)})` }, g);
    const inner = el('g', { class: 'lantern' }, outer);
    const s = 0.6 + r() * 0.7;
    inner.style.setProperty('--dx', ((r() - 0.5) * 140).toFixed(0) + 'px');
    inner.style.animationDuration = (26 + r() * 22).toFixed(1) + 's';
    inner.style.animationDelay = (-r() * 40).toFixed(1) + 's';
    const sc = el('g', { transform: `scale(${s.toFixed(2)})` }, inner);
    el('circle', { cx: 0, cy: 0, r: 16, fill: 'url(#lanternGlow)' }, sc);
    el('path', { d: 'M-5 -7 Q0 -10 5 -7 L4 6 Q0 8 -4 6 Z', fill: '#FF9F2E' }, sc);
    el('path', { d: 'M-3 -5 Q0 -7 3 -5 L2.5 4 Q0 5.5 -2.5 4 Z', fill: '#FFD27A' }, sc);
  }
}

export function drawWaves(g) {
  const bands = 8;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const y = 460 + t * t * 230 + i * 5;
    const half = 60 + t * 80;
    const amp = 2 + t * 5;
    const off = (i % 3) * half * 0.6;
    let d = `M${(-1000 - off).toFixed(1)} ${y.toFixed(1)} q${half / 2} ${(-amp).toFixed(1)} ${half} 0`;
    for (let x = -1000 - off + half; x < 1400; x += half) d += ` t${half} 0`;
    d += ` L1400 ${(y + 34 + t * 34).toFixed(1)} L-1100 ${(y + 34 + t * 34).toFixed(1)} Z`;
    el('path', { d, fill: i % 2 ? '#1E407F' : '#0B1C48', 'fill-opacity': (0.4 + t * 0.25).toFixed(2) }, g);
  }
}

export function shootingStar(line) {
  const go = () => {
    const x = 120 + Math.random() * 300, y = -100 + Math.random() * 120;
    line.setAttribute('transform', `translate(${x.toFixed(0)} ${y.toFixed(0)})`);
    line.classList.remove('go'); void line.getBBox(); line.classList.add('go');
    setTimeout(go, 7000 + Math.random() * 9000);
  };
  setTimeout(go, 3000);
}

function img(href, x, y, w, h) {
  return el('image', { href, x, y, width: w, height: h, preserveAspectRatio: 'xMidYMid meet' });
}

export function startBillboard(productsG, logosG, base) {
  const pages = [];
  for (let p = 0; p * PER_PAGE < PRODUCTS.length; p++) {
    const g = el('g', { class: 'billboard-fade' }, productsG);
    g.style.opacity = p === 0 ? 1 : 0;
    PRODUCTS.slice(p * PER_PAGE, p * PER_PAGE + PER_PAGE).forEach((f, k) => {
      const im = img(PRODUCT_BASE + f, 12 + k * 50, 184, 46, 80);
      im.addEventListener('error', () => im.remove());
      g.appendChild(im);
    });
    pages.push(g);
  }
  const w = 150 / LOGOS.length;
  LOGOS.forEach((l, i) => {
    const im = img(LOGO_BASE + l, 10 + i * w + 3, 274, w - 6, 18);
    im.addEventListener('error', () => im.remove());
    logosG.appendChild(im);
  });
  let i = 0;
  setInterval(() => {
    i = (i + 1) % pages.length;
    pages.forEach((g, j) => (g.style.opacity = j === i ? 1 : 0));
  }, PAGE_MS);
}

export function drawBridgeLights(g) {
  for (let x = -54; x < 300; x += 12) {
    const c = el('circle', { cx: x, cy: 409, r: 1.3 }, g);
    c.classList.add('twinkle');
    c.style.animationDuration = '2.6s';
    c.style.animationDelay = (-(x + 60) / 40).toFixed(2) + 's';
  }
}
