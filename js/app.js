import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { SUPABASE_URL, SUPABASE_ANON_KEY, ASSET_BASE, POLL_MS } from './config.js?v=16';
import { STYLES, WISH_MAX, countChars, validateEntry, placeFor, mergeNew, getMine, setMine } from './logic.js?v=16';
import { krathongSVG, STYLE_LABELS } from './krathong.js?v=16';
import { launchFireworks, ambientFireworks } from './fireworks.js?v=16';
import { drawStars, startBillboard, drawCityWindows, drawLanterns, drawWaves, shootingStar, drawBridgeLights } from './scene.js?v=16';

const $ = id => document.getElementById(id);
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const COLS = 'id,created_at,name,wish,style';
const screenMode = new URLSearchParams(location.search).has('screen');
if (screenMode) document.body.classList.add('screen');

let list = [];
let lastSeen = null;
let mine = getMine(localStorage);
const nodes = new Map();

// ---------- scene ----------
drawStars($('stars'));
drawCityWindows($('cityWindows'));
drawLanterns($('lanterns'));
drawWaves($('waves'));
drawBridgeLights(document.querySelector('#bridge .bridgeLights'));
shootingStar($('shoot'));
ambientFireworks($('fx'));
startBillboard($('bbProducts'), $('bbLogos'), ASSET_BASE);
$('logo').src = 'assets/logos/tcc.png';
$('logo').onerror = () => $('logo').remove();

const ORIG = {};
for (const id of ['billboard', 'building', 'tree', 'reflect', 'moon', 'moonReflect', 'palmA', 'palmB', 'bridge']) ORIG[id] = $(id).getAttribute('transform');
function setT(id, t) { t ? $(id).setAttribute('transform', t) : $(id).removeAttribute('transform'); }

function fitScene() {
  const svg = $('scene');
  const aspect = innerWidth / innerHeight;
  const wide = aspect > 590 / 844;
  if (wide) {
    const y0 = 36, H = 684, W = H * aspect, x0 = 195 - W / 2;
    svg.setAttribute('viewBox', `${x0.toFixed(1)} ${y0} ${W.toFixed(1)} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const split = aspect > 1.15;
    if (split) {
      const left = x0 + W * 0.24, right = x0 + W * 0.7;
      const bs = 1.3, hs = 1.34;
      setT('billboard', `translate(${left.toFixed(1)} 526) scale(${bs.toFixed(2)}) translate(-85 -446)`);
      setT('building', `translate(${right.toFixed(1)} 446) scale(${hs.toFixed(2)}) translate(-243 -446)`);
      setT('tree', `translate(${(right + 105 * hs / 1.32).toFixed(1)} 446) scale(${(1.2 * hs / 1.32).toFixed(2)}) translate(-320 -446)`);
      setT('reflect', `translate(${right.toFixed(1)} 0) scale(${(hs / 1.32).toFixed(2)} 1) translate(-252 0)`);
      const mdx = x0 + W * 0.47 - 66;
      setT('moon', `translate(${mdx.toFixed(1)} 110)`);
      setT('moonReflect', `translate(${mdx.toFixed(1)} 0)`);
      setT('palmA', `translate(${(x0 + W * 0.405).toFixed(1)} 446) scale(.9)`);
      setT('palmB', `translate(${(x0 + W * 0.93).toFixed(1)} 446)`);
      setT('bridge', `translate(${(x0 + W * 0.47 - 120).toFixed(1)} 446) scale(1.15) translate(0 -446)`);
    } else {
      for (const id in ORIG) setT(id, ORIG[id]);
      setT('moon', 'translate(470 120)');
      setT('moonReflect', 'translate(470 0)');
    }
  } else {
    const H = 780, W = H * aspect, x0 = 205 - W / 2;
    svg.setAttribute('viewBox', `${x0.toFixed(1)} -60 ${W.toFixed(1)} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
    for (const id in ORIG) setT(id, ORIG[id]);
    const bx = x0 + W * 0.66;
    setT('building', `translate(${bx.toFixed(1)} 446) scale(1.32) translate(-243 -446)`);
    setT('tree', `translate(${(bx + 104).toFixed(1)} 446) scale(1.2) translate(-320 -446)`);
    setT('reflect', `translate(${bx.toFixed(1)} 0) translate(-252 0)`);
    setT('billboard', `translate(${(x0 + W * 0.27).toFixed(1)} 540) scale(.95) translate(-85 -446)`);
    setT('moon', `translate(${(x0 + 30).toFixed(1)} 50)`);
    setT('moonReflect', `translate(${(x0 + 30).toFixed(1)} 0)`);
    setT('palmA', `translate(${(x0 + W * 0.5).toFixed(1)} 446) scale(.85)`);
    setT('palmB', `translate(${(x0 + W - 6).toFixed(1)} 446)`);
  }
  const m = svg.getScreenCTM();
  if (!m) return;
  const top = m.d * 462 + m.f;
  const bottom = Math.min(innerHeight, m.d * 700 + m.f);
  const river = $('river');
  river.style.top = top + 'px';
  river.style.bottom = (innerHeight - bottom) + 'px';
}
fitScene();
addEventListener('resize', fitScene);

// ---------- river ----------
function hashNum(s, mod) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h) % mod; }

function makeNode(k, isNew) {
  const p = placeFor(k.id, 100, 100);
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'k' + (k.id === mine ? ' mine' : '') + (isNew ? ' new' : '');
  el.style.left = Math.min(92, Math.max(6, p.x)) + '%';
  el.style.top = ((p.y - 62) / 33) * 100 + '%';
  el.style.zIndex = k.id === mine ? '40' : String(10 + p.lane);
  el.style.setProperty('--dx', (hashNum(k.id, 2) ? 1 : -1) * (20 + hashNum(k.id + 'x', 40)) + 'px');
  el.style.setProperty('--dur', 30 + hashNum(k.id + 'd', 40) + 's');
  el.style.setProperty('--bob', (2.6 + hashNum(k.id + 'b', 20) / 10) + 's');
  el.style.setProperty('--delay', -hashNum(k.id + 'l', 30) + 's');
  el.setAttribute('aria-label', 'กระทงของ ' + k.name);
  const bob = document.createElement('span');
  bob.className = 'bob';
  bob.innerHTML = krathongSVG(k.style);
  el.appendChild(bob);
  if (k.id === mine) {
    const tag = document.createElement('span');
    tag.className = 'tag'; tag.textContent = 'ของฉัน';
    el.appendChild(tag);
  }
  el.addEventListener('click', () => openPop(k));
  return el;
}

const MAX_VISIBLE = () => (innerWidth < 700 ? 50 : 120);
function visibleIds() {
  const ids = new Set(list.slice(-MAX_VISIBLE()).map(k => k.id));
  if (mine && list.some(k => k.id === mine)) ids.add(mine);
  return ids;
}

function render(added, animate) {
  const river = $('river');
  const keep = visibleIds();
  added = added.filter(k => keep.has(k.id));
  for (const [id, el] of nodes) if (!keep.has(id)) { el.remove(); nodes.delete(id); }
  for (const k of added) {
    if (nodes.has(k.id)) continue;
    const el = makeNode(k, animate);
    nodes.set(k.id, el);
    river.appendChild(el);
  }
}

function setCount(n) { $('count').textContent = n.toLocaleString('th-TH'); }

let lastFx = 0;
function fxAt(el, opts) {
  const r = el.getBoundingClientRect();
  launchFireworks($('fx'), r.left + r.width / 2, r.top, opts);
}

// ---------- data ----------
async function fullLoad() {
  const { data, error, count } = await sb.from('krathongs').select(COLS, { count: 'exact' })
    .order('created_at', { ascending: false }).limit(500);
  if (error) return;
  const fresh = data.reverse();
  list = fresh;
  if (fresh.length) lastSeen = fresh[fresh.length - 1].created_at;
  render(fresh, false);
  setCount(count ?? fresh.length);
}

async function poll() {
  if (!lastSeen) return fullLoad();
  const { data, error } = await sb.from('krathongs').select(COLS)
    .gt('created_at', lastSeen).order('created_at', { ascending: true }).limit(100);
  if (error || !data.length) return;
  const r = mergeNew(list, data);
  list = r.all;
  lastSeen = list[list.length - 1].created_at;
  render(r.added, true);
  setCount(Number($('count').textContent.replace(/\D/g, '')) + r.added.length);
  const now = Date.now();
  for (const k of r.added) {
    if (k.id === mine || now - lastFx < 1000) continue;
    lastFx = now;
    const el = nodes.get(k.id);
    if (el) setTimeout(() => fxAt(el, { count: 1, size: screenMode ? 1 : 0.6 }), 2200);
  }
}

// ---------- form ----------
let style = null;
function buildStyles() {
  const box = $('styles');
  for (const s of STYLES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = krathongSVG(s);
    const t = document.createElement('span'); t.textContent = STYLE_LABELS[s];
    b.appendChild(t);
    b.addEventListener('click', () => {
      style = s;
      box.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      showErr('style', '');
    });
    box.appendChild(b);
  }
}

function showErr(field, msg) { document.querySelector(`.err[data-for="${field}"]`).textContent = msg || ''; }

function refreshCta() {
  $('openForm').hidden = !!mine || screenMode;
  $('done').hidden = !mine || screenMode;
}

$('openForm').addEventListener('click', () => { $('sheet').hidden = false; });
$('closeForm').addEventListener('click', () => { $('sheet').hidden = true; });
$('sheet').addEventListener('click', e => { if (e.target === $('sheet')) $('sheet').hidden = true; });
$('wish').addEventListener('input', () => {
  const n = countChars($('wish').value.trim());
  $('wishCount').textContent = n;
  $('wishCount').parentElement.classList.toggle('over', n > WISH_MAX);
  showErr('wish', '');
});
$('name').addEventListener('input', () => showErr('name', ''));

let sending = false;
$('form').addEventListener('submit', async e => {
  e.preventDefault();
  if (sending) return;
  const entry = { name: $('name').value.trim(), wish: $('wish').value.trim(), style };
  const v = validateEntry(entry);
  ['name', 'wish', 'style'].forEach(f => showErr(f, v.errors[f]));
  $('sendErr').textContent = '';
  if (!v.ok) return;
  sending = true;
  const btn = $('submit');
  btn.disabled = true; btn.textContent = 'กำลังลอย…';
  const { data, error } = await sb.from('krathongs').insert(entry).select(COLS).single();
  sending = false;
  btn.disabled = false; btn.innerHTML = '<i data-lucide="send"></i> ลอยเลย';
  window.lucide?.createIcons();
  if (error || !data) { $('sendErr').textContent = 'ส่งไม่สำเร็จ ลองอีกครั้งนะ'; return; }
  mine = data.id;
  setMine(localStorage, mine);
  $('sheet').hidden = true;
  refreshCta();
  const r = mergeNew(list, [data]);
  list = r.all;
  render(r.added, true);
  setCount(Number($('count').textContent.replace(/\D/g, '')) + r.added.length);
  const el = nodes.get(mine);
  if (el) { fxAt(el, { count: 4, size: 1.1 }); setTimeout(() => fxAt(el, { count: 3, size: 1 }), 1600); }
});

// ---------- popup ----------
function openPop(k) {
  $('popArt').innerHTML = krathongSVG(k.style);
  $('popWish').textContent = '“' + k.wish + '”';
  $('popName').textContent = '— ' + k.name + (k.id === mine ? ' (ของฉัน)' : '');
  $('pop').hidden = false;
}
$('closePop').addEventListener('click', () => { $('pop').hidden = true; });
$('pop').addEventListener('click', e => { if (e.target === $('pop')) $('pop').hidden = true; });

// ---------- start ----------
buildStyles();
refreshCta();
window.lucide?.createIcons();
await fullLoad();
setInterval(poll, POLL_MS);
setInterval(fullLoad, 30000);
