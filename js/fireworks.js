const COLORS = ['#FFD27A', '#FF8FB1', '#9BE7FF', '#C6FF9B', '#FFFFFF', '#F2B544'];
let parts = [], running = false, ctx, cv;

function frame() {
  const dpr = devicePixelRatio || 1;
  ctx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life > 0);
  for (const p of parts) {
    p.vy += 0.035; p.vx *= 0.985; p.vy *= 0.985;
    p.x += p.vx; p.y += p.vy; p.life -= p.decay;
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.arc(p.x * dpr, p.y * dpr, p.r * dpr, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (parts.length) requestAnimationFrame(frame); else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
}

function burst(x, y, n, size) {
  const c = COLORS[(Math.random() * COLORS.length) | 0];
  const c2 = COLORS[(Math.random() * COLORS.length) | 0];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.283 + Math.random() * 0.2;
    const s = (1.2 + Math.random() * 2.4) * size;
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 1.6 + Math.random() * 1.4, life: 1, decay: 0.012 + Math.random() * 0.01, c: i % 3 ? c : c2 });
  }
}

function prep(canvas) {
  cv = canvas; ctx = canvas.getContext('2d');
  const dpr = devicePixelRatio || 1;
  if (cv.width !== innerWidth * dpr || cv.height !== innerHeight * dpr) { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
}

export function skyBurst(canvas, x, y, size = 1) {
  prep(canvas);
  burst(x, y, Math.round(60 * size), size);
  if (!running) { running = true; requestAnimationFrame(frame); }
}

export function ambientFireworks(canvas) {
  const one = () => {
    if (!document.hidden) {
      const n = Math.random() < 0.3 ? 3 : 1;
      for (let i = 0; i < n; i++) {
        setTimeout(() => skyBurst(canvas, innerWidth * (0.12 + Math.random() * 0.76), innerHeight * (0.12 + Math.random() * 0.26), (innerWidth > 700 ? 1.3 : 0.95) + Math.random() * 0.7), i * 350);
      }
    }
    setTimeout(one, 3500 + Math.random() * 5000);
  };
  setTimeout(one, 1500);
}

export function launchFireworks(canvas, x, y, { count = 3, size = 1 } = {}) {
  prep(canvas);
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const bx = x + (Math.random() - 0.5) * 160 * size;
      const by = Math.max(60, y - 160 * size - Math.random() * 120 * size);
      burst(bx, by, Math.round(60 * size), size);
      if (!running) { running = true; requestAnimationFrame(frame); }
    }, i * 380);
  }
}
