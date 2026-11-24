import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countChars, validateEntry, placeFor, mergeNew, getMine, setMine, STYLES } from '../js/logic.js';

test('countChars counts Thai graphemes', () => {
  assert.equal(countChars('ก้'), 1);
  assert.equal(countChars('abc'), 3);
  assert.equal(countChars('ก้'.repeat(100)), 100);
  assert.equal(countChars(''), 0);
});

test('validateEntry', () => {
  const ok = { name: 'ต้น', wish: 'ขอให้รวย', style: 'coconut' };
  assert.equal(validateEntry(ok).ok, true);
  assert.equal(validateEntry({ ...ok, name: '   ' }).errors.name, 'ใส่ชื่อก่อนนะ');
  assert.equal(validateEntry({ ...ok, name: 'ก'.repeat(31) }).errors.name, 'ชื่อยาวเกิน 30 ตัวอักษร');
  assert.equal(validateEntry({ ...ok, wish: '' }).errors.wish, 'เขียนคำอธิษฐานก่อนนะ');
  assert.equal(validateEntry({ ...ok, wish: 'ก้'.repeat(101) }).errors.wish, 'คำอธิษฐานยาวเกิน 100 ตัวอักษร');
  assert.equal(validateEntry({ ...ok, wish: 'ก้'.repeat(100) }).ok, true);
  assert.equal(validateEntry({ ...ok, style: 'x' }).errors.style, 'เลือกกระทงก่อนนะ');
  assert.deepEqual(STYLES, ['banana', 'lotus', 'bread', 'coconut']);
});

test('placeFor is deterministic and in river zone', () => {
  const a = placeFor('abc-123', 390, 720);
  assert.deepEqual(a, placeFor('abc-123', 390, 720));
  const lanes = new Set();
  for (let i = 0; i < 200; i++) {
    const p = placeFor('id-' + i + '-' + (i * 7919), 390, 720);
    assert.ok(p.y >= 720 * 0.62 && p.y <= 720 * 0.95, 'y in river');
    assert.ok(p.x >= 0 && p.x <= 390, 'x in width');
    lanes.add(p.lane);
  }
  assert.equal(lanes.size, 6);
});

test('mergeNew dedupes and reports added', () => {
  const e = [{ id: '1', created_at: '2026-11-24T10:00:00Z' }];
  const r = mergeNew(e, [
    { id: '1', created_at: '2026-11-24T10:00:00Z' },
    { id: '2', created_at: '2026-11-24T10:01:00Z' },
  ]);
  assert.deepEqual(r.all.map(k => k.id), ['1', '2']);
  assert.deepEqual(r.added.map(k => k.id), ['2']);
});

test('getMine/setMine survive broken storage', () => {
  const broken = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
  assert.equal(getMine(broken), null);
  assert.doesNotThrow(() => setMine(broken, 'a'));
  const m = new Map();
  const s = { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
  setMine(s, 'abc');
  assert.equal(getMine(s), 'abc');
  assert.equal(m.get('tcc-lk-2569-mine'), 'abc');
});
