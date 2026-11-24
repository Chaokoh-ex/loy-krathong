export const STYLE_LABELS = { banana: 'ใบตอง', lotus: 'ดอกบัว', bread: 'ขนมปัง', coconut: 'กะลามะพร้าว' };

const candle = `<rect x="30" y="14" width="4" height="12" rx="1" fill="#FFF6E0"/>
<path class="flame" d="M32 4 C35 8 35 12 32 14 C29 12 29 8 32 4Z" fill="#FFC23D"/>
<circle cx="32" cy="11" r="1.6" fill="#FFF3C4"/>`;

const incense = `<line x1="24" y1="26" x2="22" y2="8" stroke="#C0392B" stroke-width="1.2"/><line x1="40" y1="26" x2="42" y2="8" stroke="#C0392B" stroke-width="1.2"/>`;

const ART = {
  banana: `<ellipse cx="32" cy="42" rx="28" ry="7" fill="#2F5E1E"/>
<path d="M6 40 L12 26 L18 38 L24 24 L30 38 L36 24 L42 38 L48 26 L54 38 L58 40 Z" fill="#3F7D27"/>
<path d="M12 40 L16 30 L20 39 L26 29 L32 39 L38 29 L44 39 L48 30 L52 40Z" fill="#5FA338"/>
<circle cx="20" cy="34" r="3" fill="#F7E7A1"/><circle cx="44" cy="34" r="3" fill="#F7E7A1"/><circle cx="32" cy="32" r="3.4" fill="#F2B544"/>
${incense}${candle}`,
  lotus: `<ellipse cx="32" cy="43" rx="26" ry="6" fill="#2F5E1E"/>
<path d="M32 22 C26 28 24 36 32 42 C40 36 38 28 32 22Z" fill="#F5B8CB"/>
<path d="M18 28 C16 36 22 42 32 42 C28 36 24 32 18 28Z" fill="#EE8FAE"/>
<path d="M46 28 C48 36 42 42 32 42 C36 36 40 32 46 28Z" fill="#EE8FAE"/>
<path d="M8 36 C10 42 20 44 30 42 C22 40 14 38 8 36Z" fill="#E06C93"/>
<path d="M56 36 C54 42 44 44 34 42 C42 40 50 38 56 36Z" fill="#E06C93"/>
${candle}`,
  bread: `<ellipse cx="32" cy="42" rx="27" ry="7.5" fill="#A8692C"/>
<ellipse cx="32" cy="38" rx="25" ry="8" fill="#D9A15A"/>
<ellipse cx="32" cy="36.5" rx="20" ry="5.5" fill="#E9BE7C"/>
<circle cx="22" cy="35" r="2.6" fill="#E85D75"/><circle cx="42" cy="35" r="2.6" fill="#F2B544"/><circle cx="32" cy="38" r="2.4" fill="#7CC36B"/>
${incense}${candle}`,
  coconut: `<path d="M6 34 C6 46 58 46 58 34 Z" fill="#6B4423"/>
<path d="M6 34 C6 40 58 40 58 34 Z" fill="#4E2F15"/>
<ellipse cx="32" cy="34" rx="26" ry="5" fill="#F4ECD8"/>
<g stroke="#8A5A2E" stroke-width=".8" opacity=".7"><path d="M14 40 l4 3M24 42 l3 2M38 42 l3 -2M48 40 l3 -3"/></g>
<path d="M14 33 L20 25 L24 32 Z M40 32 L44 25 L50 33 Z" fill="#5FA338"/>
<circle cx="24" cy="31" r="2.6" fill="#F7E7A1"/><circle cx="40" cy="31" r="2.6" fill="#F7E7A1"/>
${candle}`,
};

export function krathongSVG(style) {
  return `<svg viewBox="0 0 64 50" aria-hidden="true">${ART[style] || ART.banana}</svg>`;
}
