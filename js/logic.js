export const STYLES = ['banana', 'lotus', 'bread', 'coconut'];
export const NAME_MAX = 30;
export const WISH_MAX = 100;
const MINE_KEY = 'tcc-lk-2569-mine';
const LANES = 6;

const seg = typeof Intl !== 'undefined' && Intl.Segmenter
  ? new Intl.Segmenter('th', { granularity: 'grapheme' })
  : null;

export function countChars(s) {
  if (!s) return 0;
  if (seg) { let n = 0; for (const _ of seg.segment(s)) n++; return n; }
  return [...s].length;
}

export function validateEntry({ name, wish, style }) {
  const errors = {};
  const n = (name || '').trim();
  const w = (wish || '').trim();
  if (!n) errors.name = 'ใส่ชื่อก่อนนะ';
  else if (countChars(n) > NAME_MAX) errors.name = `ชื่อยาวเกิน ${NAME_MAX} ตัวอักษร`;
  if (!w) errors.wish = 'เขียนคำอธิษฐานก่อนนะ';
  else if (countChars(w) > WISH_MAX) errors.wish = `คำอธิษฐานยาวเกิน ${WISH_MAX} ตัวอักษร`;
  if (!STYLES.includes(style)) errors.style = 'เลือกกระทงก่อนนะ';
  return { ok: Object.keys(errors).length === 0, errors };
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function placeFor(id, w, h) {
  const v = hash(String(id));
  const lane = v % LANES;
  const top = h * 0.62, bottom = h * 0.95;
  const laneH = (bottom - top) / LANES;
  const jitter = ((v >>> 8) % 1000) / 1000;
  const y = top + laneH * lane + laneH * jitter;
  const x = (((v >>> 16) % 1000) / 1000) * w;
  return { x, y, lane };
}

export function mergeNew(existing, incoming) {
  const seen = new Set(existing.map(k => k.id));
  const added = incoming.filter(k => !seen.has(k.id) && seen.add(k.id));
  const all = [...existing, ...added].sort((a, b) => a.created_at.localeCompare(b.created_at));
  return { all, added };
}

export function getMine(storage) {
  try { return storage.getItem(MINE_KEY) || null; } catch { return null; }
}

export function setMine(storage, id) {
  try { storage.setItem(MINE_KEY, id); } catch { /* private mode */ }
}
