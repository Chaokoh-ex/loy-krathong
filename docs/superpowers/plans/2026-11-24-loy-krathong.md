# เว็บลอยกระทง TCC 2569 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เว็บมือถือให้พนักงาน ~200 คนลอยกระทงออนไลน์ลงแม่น้ำรวมคืนนี้ (24 พ.ย. 2569)

**Architecture:** Static site (HTML/CSS/vanilla JS ES modules, ไม่มี build step) บน GitHub Pages; Supabase เก็บตาราง `krathongs` + Storage bucket `assets` สำหรับรูปสินค้า/โลโก้; หน้าเว็บ poll ทุก 3500 ms แทน realtime

**Tech Stack:** HTML, CSS, JS ES modules, `@supabase/supabase-js@2` จาก esm.sh, Supabase (Postgres + RLS + Storage + Edge Function), GitHub Pages, `node --test` สำหรับ logic

**Spec:** `docs/2026-11-24-loy-krathong-design.md`

## Global Constraints
- UI ภาษาไทยทั้งหมด, mobile-first (ออกแบบที่ 390px กว้าง), ไอคอน Lucide
- ชื่อ: บังคับ, 1–30 ตัวอักษร (นับ grapheme); คำอธิษฐาน: บังคับ, 1–100 ตัวอักษร (นับ grapheme)
- แบบกระทง (`style`): `banana`, `lotus`, `bread`, `coconut`
- 1 เครื่องลอยได้ 1 ใบ: localStorage key `tcc-lk-2569-mine` เก็บ id
- Poll interval 3500 ms; แสดงเฉพาะ `hidden = false`
- ไม่มีรูปอัปโหลด, ไม่มีล็อกอิน, ไม่มีแผนก, ไม่มีเสียง
- Repo: `Chaokoh-ex/loy-krathong`, Pages จาก branch `main` root

## Review Focus
1. คำอธิษฐานมีโค้ด HTML/สคริปต์ → ต้องแสดงเป็นข้อความธรรมดา (ใช้ `textContent` เท่านั้น)
2. กดปุ่ม "ลอยกระทง" รัว ๆ / เน็ตช้า → ต้องได้แถวเดียว (ปุ่ม lock ระหว่างส่ง)
3. ภาษาไทยมีสระ/วรรณยุกต์ซ้อน → นับ 100 ตัวอักษรตามที่ตาเห็น (Intl.Segmenter) ไม่ใช่ code unit
4. ส่งไม่สำเร็จ (เน็ตหลุด) → ฟอร์มยังอยู่ ข้อความไม่หาย มีข้อความ error ให้กดใหม่
5. กระทง 200+ ใบ → ไม่ทับกันจนแตะไม่ได้ และหน้าไม่กระตุกบนมือถือรุ่นกลาง

---

## File Structure
```
index.html          โครงหน้า + ฉาก SVG + ฟอร์ม + popup
css/style.css       สไตล์ทั้งหมด, animation ลอย/แสงเรือง/พลุ
js/logic.js         pure functions (ทดสอบด้วย node)
js/scene.js         บิลบอร์ดสลับสินค้า
js/krathong.js      SVG ของกระทงแต่ละแบบ
js/fireworks.js     พลุบน <canvas>
js/app.js           ผูกทุกอย่าง: supabase, poll, ฟอร์ม, render
js/config.js        SUPABASE_URL, SUPABASE_ANON_KEY, ASSET_BASE
tests/logic.test.js
supabase/schema.sql
supabase/functions/copy-assets/index.ts
poster.html         โปสเตอร์ QR
```

### Task 1: Supabase backend + คัดลอกรูป

**Files:** Create `supabase/schema.sql`, `supabase/functions/copy-assets/index.ts`, `js/config.js`

**Produces:** ตาราง `public.krathongs(id uuid pk default gen_random_uuid(), created_at timestamptz default now(), name text, wish text, style text, hidden boolean default false)`; Storage public bucket `assets` มีไฟล์ `products/1.png..6.png`, `logos/tcc.png`, `logos/chaokoh.png`, `logos/maeploy.png`, `logos/yoddoi.png`; `config.js` export `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ASSET_BASE`

- [ ] **Step 1:** สร้าง Supabase project ใหม่ `loy-krathong-2569` (free, region ap-southeast-1) ผ่าน connector — ยืนยัน cost กับผู้ใช้
- [ ] **Step 2:** apply migration `schema.sql`: ตาราง + CHECK `char_length(name) between 1 and 60`, `char_length(wish) between 1 and 300` (เผื่อ grapheme > code point), `style in ('banana','lotus','bread','coconut')`; RLS เปิด; policy anon INSERT `with check (hidden = false)`; policy anon SELECT `using (hidden = false)`; ไม่มี UPDATE/DELETE สำหรับ anon; index บน `created_at`
- [ ] **Step 3:** ทดสอบ RLS ด้วย SQL ในบทบาท anon: insert ผ่าน, insert `hidden=true` ล้ม, update ล้ม, select ไม่เห็นแถวที่ admin ตั้ง hidden
- [ ] **Step 4:** หา URL รูป: สินค้า og:image จาก `products/view/{1,114,112,28,42,165}`; โลโก้แบรนด์จากหน้า brand/หน้าแรก (`uploads/brands/big/...`) — ถ้าหาโลโก้ใดไม่เจอ แจ้งผู้ใช้ ไม่เดา
- [ ] **Step 5:** deploy edge function `copy-assets` (verify_jwt) รับรายการ `{url, path}` → fetch → upload เข้า bucket `assets` (upsert); เรียกครั้งเดียว แล้วตรวจว่า public URL ทุกไฟล์ได้ 200
- [ ] **Step 6:** เขียน `config.js` ด้วย URL + publishable key; `git init`, commit

### Task 2: Logic (pure functions)

**Files:** Create `js/logic.js`, `tests/logic.test.js`

**Produces:**
- `countChars(s: string): number` — grapheme ด้วย `Intl.Segmenter('th',{granularity:'grapheme'})`
- `validateEntry({name, wish, style}): {ok: boolean, errors: {name?: string, wish?: string, style?: string}}` — trim ก่อน, ข้อความ error: `'ใส่ชื่อก่อนนะ'`, `'ชื่อยาวเกิน 30 ตัวอักษร'`, `'เขียนคำอธิษฐานก่อนนะ'`, `'คำอธิษฐานยาวเกิน 100 ตัวอักษร'`, `'เลือกกระทงก่อนนะ'`
- `placeFor(id: string, w: number, h: number): {x: number, y: number, lane: number}` — ตำแหน่งคงที่จาก hash ของ id, y อยู่ในโซนแม่น้ำ (`h*0.62 .. h*0.95`), 6 lanes
- `mergeNew(existing: Krathong[], incoming: Krathong[]): {all: Krathong[], added: Krathong[]}` — ไม่ซ้ำ id, เรียงตาม `created_at`
- `getMine(storage): string|null`, `setMine(storage, id): void` — key `tcc-lk-2569-mine`, ห่อ try/catch (private mode → null / no-op)

- [ ] **Step 1: tests ล้มก่อน** — `countChars('ก้')===1`, `countChars('abc')===3`, `countChars('ก้'.repeat(100))===100` (code units = 200); validateEntry: ชื่อว่าง/ช่องว่างล้วน → error name, wish 101 grapheme → error, 100 → ok, style `'x'` → error; placeFor: id เดิม → ผลเดิม, y อยู่ในช่วง, 200 id สุ่ม ใช้ lane ครบ 6; mergeNew: id ซ้ำไม่เพิ่ม, `added` มีเฉพาะใหม่; getMine/setMine กับ fake storage ที่ throw → ไม่ throw
- [ ] **Step 2:** `node --test tests/` → FAIL
- [ ] **Step 3:** implement
- [ ] **Step 4:** `node --test tests/` → PASS ทั้งหมด
- [ ] **Step 5:** commit

### Task 3: ฉาก (ตึก, พระจันทร์, มะพร้าว, แม่น้ำ, บิลบอร์ด)

**Files:** Create `index.html` (ส่วน `<svg id="scene">`), `css/style.css`, `js/scene.js`

**Consumes:** `ASSET_BASE` จาก config
**Produces:** `<g id="river">` (ชั้นที่กระทงจะถูกใส่), `startBillboard(el: SVGGElement, assetBase: string): void`

- [ ] **Step 1:** SVG viewBox `0 0 390 720` preserveAspectRatio `xMidYMax slice`; ท้องฟ้ากลางคืน, ดาว, พระจันทร์เต็มดวงพร้อมแสงสะท้อนบนน้ำ
- [ ] **Step 2:** ตึก TCC จากรูปผู้ใช้ (`/mnt/user-data/uploads/eb08aa1a-image.png`): ระเบียงโค้งคลื่นซ้อน 6–7 ชั้นสีไม้ (#8A6A4A ขอบอุ่น), กระจกเปิดไฟอุ่น (#FAC775), เสาขาวสูง 2 ต้น, หลังคาทางเข้ายื่น, ต้นไม้ใหญ่ขวา; เงาสะท้อนลงน้ำ
- [ ] **Step 3:** ต้นมะพร้าว 2–3 ต้นริมน้ำ, บิลบอร์ดบนเสา: รูปสินค้าสลับทุก 3000 ms (fade), แถบโลโก้ 4 อันด้านล่าง; รูปโหลดไม่ได้ → ซ่อนช่องนั้นเงียบ ๆ
- [ ] **Step 4:** ตรวจด้วยสายตาใน browser ที่ 390×844 และ 1920×1080: ตึกจำได้, ไม่มีอะไรล้นจอ, บิลบอร์ดสลับ — แคปหน้าจอให้ผู้ใช้ดู
- [ ] **Step 5:** commit

### Task 4: กระทง, ฟอร์มลอย, พลุ, แสงเรือง, popup

**Files:** Create `js/krathong.js`, `js/fireworks.js`, `js/app.js`; Modify `index.html`, `css/style.css`

**Consumes:** ทุกอย่างจาก Task 1–3
**Produces:** `krathongSVG(style): string`; `launchFireworks(canvas: HTMLCanvasElement, x: number, y: number): void`; app ทำงานครบ

- [ ] **Step 1:** กระทง 4 แบบ (ใบตอง/ดอกบัว/ขนมปัง/กะลามะพร้าว) + เทียนไหว; animation ลอยขึ้นลง + เลื่อนซ้ายขวาช้า ๆ (CSS transform เท่านั้น เพื่อ performance)
- [ ] **Step 2:** ปุ่ม "ลอยกระทงของฉัน" → bottom sheet: เลือกแบบ 4 ช่อง, ช่องชื่อ, ช่องคำอธิษฐาน + ตัวนับ `n/100`, ปุ่ม "ลอยเลย"; แสดง error จาก `validateEntry` ใต้ช่อง; ถ้า `getMine()` มีค่า → ซ่อนปุ่ม แสดง "คุณลอยกระทงแล้ว"
- [ ] **Step 3:** ส่ง: lock ปุ่ม (ข้อความ "กำลังลอย…"), insert ด้วย `.select('id').single()`; สำเร็จ → `setMine`, ปิด sheet, กระทงใหม่ลอยเข้าจากซ้าย, พลุที่ตำแหน่งกระทง 3 ลูก; ล้มเหลว → ปลด lock, ข้อความ "ส่งไม่สำเร็จ ลองอีกครั้งนะ", ฟอร์มคงค่าเดิม
- [ ] **Step 4:** poll: โหลดครั้งแรก 500 แถวล่าสุด, จากนั้นทุก 3500 ms ดึง `created_at > lastSeen`; ซ่อนแล้ว → reload เต็มทุก 30 s เพื่อเอาที่ admin ซ่อนออก; ตัวนับ "ลอยแล้ว N ใบ"
- [ ] **Step 5:** กระทงของฉัน: แสงเรือง + ป้าย "ของฉัน"; แตะกระทงใดก็ได้ → popup ชื่อ + คำอธิษฐาน (`textContent`)
- [ ] **Step 6:** ทดสอบ Review Focus ใน browser: wish `<img src=x onerror=alert(1)>` แสดงเป็นข้อความ; กดลอยรัว 5 ครั้ง → DB ได้ 1 แถว; ตัดเน็ต (offline) แล้วกด → error + ฟอร์มคงอยู่; seed 250 แถวทดสอบ → แตะได้, ไม่กระตุก แล้วลบแถวทดสอบ
- [ ] **Step 7:** commit

### Task 5: Deploy + โปสเตอร์ QR

**Files:** Create `poster.html`, `README.md`

- [ ] **Step 1:** สร้าง repo `Chaokoh-ex/loy-krathong` (public), push, เปิด GitHub Pages
- [ ] **Step 2:** เปิด URL จริงบน browser: ลอยกระทง 1 ใบ end-to-end ได้, รูปบิลบอร์ดขึ้น
- [ ] **Step 3:** `poster.html`: หัว "ลอยกระทงออนไลน์ TCC 2569", QR ของ URL (qrcode lib จาก cdnjs), วิธีเล่น 3 ขั้น; ส่งเป็นรูป PNG ให้ผู้ใช้
- [ ] **Step 4:** README: วิธีซ่อนกระทงใน Supabase (Table editor → krathongs → ติ๊ก hidden), วิธี export CSV; ลบแถวทดสอบทั้งหมดก่อนส่ง
- [ ] **Step 5:** commit + push

### Task 6 (ถ้าทัน): โหมดจอใหญ่ + พลุเล็กเมื่อมีกระทงใหม่

- [ ] `?screen=1` ซ่อนปุ่ม/ฟอร์ม, ขยายฉาก, แสดง QR มุมจอ; ทุก `added` จาก poll → พลุลูกเล็ก 1 ลูกที่กระทงนั้น (สูงสุด 1 ลูก/วินาที)
- [ ] ตรวจบนจอ 1920×1080, commit + push
