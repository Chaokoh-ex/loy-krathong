const NS = 'http://www.w3.org/2000/svg';
const PRODUCTS = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png'];
const LOGOS = ['tcc.png', 'chaokoh.png', 'maeploy.png'];

function img(href, x, y, w, h) {
  const el = document.createElementNS(NS, 'image');
  el.setAttribute('href', href);
  el.setAttribute('x', x); el.setAttribute('y', y);
  el.setAttribute('width', w); el.setAttribute('height', h);
  el.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  return el;
}

export function drawStars(g) {
  let s = 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 70; i++) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', (rnd() * 390).toFixed(1));
    c.setAttribute('cy', (rnd() * 300).toFixed(1));
    c.setAttribute('r', (0.4 + rnd() * 1.1).toFixed(2));
    c.setAttribute('opacity', (0.4 + rnd() * 0.6).toFixed(2));
    g.appendChild(c);
  }
}

export function startBillboard(productsG, logosG, base) {
  const els = PRODUCTS.map(p => {
    const el = img(base + 'products/' + p, 26, 236, 96, 72);
    el.setAttribute('class', 'billboard-fade');
    el.style.opacity = 0;
    el.addEventListener('error', () => el.remove());
    productsG.appendChild(el);
    return el;
  });
  const w = 104 / LOGOS.length;
  LOGOS.forEach((l, i) => {
    const el = img(base + 'logos/' + l, 22 + i * w + 3, 318, w - 6, 18);
    if (l === 'tcc.png') el.setAttribute('preserveAspectRatio', 'xMinYMid slice');
    el.addEventListener('error', () => el.remove());
    logosG.appendChild(el);
  });
  let i = 0;
  const live = () => els.filter(e => e.isConnected);
  const show = () => {
    const l = live();
    if (!l.length) return;
    l.forEach((e, j) => (e.style.opacity = j === i % l.length ? 1 : 0));
    i++;
  };
  show();
  setInterval(show, 3000);
}
