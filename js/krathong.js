export const STYLE_LABELS = { banana: 'ใบตอง', lotus: 'ดอกบัว', bread: 'ขนมปัง', coconut: 'กะลามะพร้าว' };

const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="kLeaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8BD150"/><stop offset="1" stop-color="#2F6E1F"/></linearGradient>
<linearGradient id="kLeafB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5FA535"/><stop offset="1" stop-color="#1D4A14"/></linearGradient>
<linearGradient id="kTrunk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4EFD4"/><stop offset="1" stop-color="#BFB487"/></linearGradient>
<radialGradient id="kMari" cx=".45" cy=".4"><stop offset="0" stop-color="#FFE07A"/><stop offset=".6" stop-color="#FFA726"/><stop offset="1" stop-color="#E06A10"/></radialGradient>
<linearGradient id="kPetal" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFF4F8"/><stop offset=".55" stop-color="#F9A8C6"/><stop offset="1" stop-color="#E44D86"/></linearGradient>
<linearGradient id="kPetalB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#F6C3D6"/><stop offset="1" stop-color="#C93A72"/></linearGradient>
<radialGradient id="kPad" cx=".5" cy=".35"><stop offset="0" stop-color="#6DB64E"/><stop offset="1" stop-color="#2A5A1F"/></radialGradient>
<radialGradient id="kBread" cx=".45" cy=".35"><stop offset="0" stop-color="#F7D49A"/><stop offset=".7" stop-color="#D99A4E"/><stop offset="1" stop-color="#A9672A"/></radialGradient>
<linearGradient id="kHusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9A6635"/><stop offset="1" stop-color="#3E230E"/></linearGradient>
<radialGradient id="kGlow"><stop offset="0" stop-color="#FFE7A0" stop-opacity=".75"/><stop offset=".45" stop-color="#FFC24A" stop-opacity=".28"/><stop offset="1" stop-color="#FFB547" stop-opacity="0"/></radialGradient>
<linearGradient id="kWax" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E8DFC8"/></linearGradient>
</defs></svg>`;

if (typeof document !== 'undefined' && !document.getElementById('kDefs')) {
  const d = document.createElement('div');
  d.id = 'kDefs';
  d.innerHTML = DEFS;
  document.body.appendChild(d);
}

const glowAndReflect = `<ellipse cx="32" cy="47.8" rx="14" ry="1.5" fill="#FFB547" opacity=".22"/><ellipse cx="32" cy="47.8" rx="6" ry=".9" fill="#FFE7A0" opacity=".35"/>
<circle cx="32" cy="9" r="13" fill="url(#kGlow)"/>`;

const candle = `<rect x="30.3" y="13" width="3.4" height="11" rx=".8" fill="url(#kWax)"/>
<ellipse cx="32" cy="13.2" rx="1.7" ry=".6" fill="#F3EBD6"/>
<line x1="32" y1="13" x2="32" y2="11.6" stroke="#3A2A18" stroke-width=".5"/>
<g class="flame"><path d="M32 3.5 C34.6 7.2 34.4 10.4 32 12 C29.6 10.4 29.4 7.2 32 3.5Z" fill="#FFB52E"/>
<path d="M32 6.5 C33.3 8.4 33.2 10.2 32 11.2 C30.8 10.2 30.7 8.4 32 6.5Z" fill="#FFF3C4"/></g>`;

const incense = `<g stroke="#8B2F1E" stroke-width=".7" stroke-linecap="round">
<line x1="38" y1="26" x2="40.2" y2="11"/><line x1="39.4" y1="26" x2="42.4" y2="12"/><line x1="36.6" y1="26" x2="38" y2="11.6"/></g>
<g fill="#FF5A2A"><circle cx="40.2" cy="11" r=".75"/><circle cx="42.4" cy="12" r=".75"/><circle cx="38" cy="11.6" r=".75"/></g>`;

function marigold(x, y, r) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#kMari)"/>
<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#E87A14" stroke-width=".7" stroke-dasharray="1 .8"/>
<circle cx="${x}" cy="${y}" r="${(r * 0.35).toFixed(2)}" fill="#F7B733"/>`;
}
function jasmine(x, y) {
  return `<circle cx="${x}" cy="${y}" r="1.4" fill="#FFFFFF"/><circle cx="${x}" cy="${y}" r=".5" fill="#F4E9A8"/>`;
}
function bud(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
<path d="M0 -11 C4.5 -6 4.5 -1 0 2 C-4.5 -1 -4.5 -6 0 -11Z" fill="url(#kPetal)"/>
<path d="M0 -11 C1.8 -6 1.8 -1 0 2" fill="none" stroke="#D63F78" stroke-width=".5" opacity=".6"/>
<path d="M-3.4 -2 C-6 -5 -6 -8 -4.6 -9 C-3.2 -6 -2.6 -4 -3.4 -2Z M3.4 -2 C6 -5 6 -8 4.6 -9 C3.2 -6 2.6 -4 3.4 -2Z" fill="#7FC24A"/></g>`;
}
function folds(y0, tipY, from, to, n, grad, edge) {
  let out = '';
  const w = (to - from) / n;
  for (let i = 0; i < n; i++) {
    const x = from + i * w;
    const mid = x + w / 2;
    const lift = Math.abs(mid - 32) / 24;
    const ty = tipY + lift * 4;
    out += `<path d="M${x.toFixed(1)} ${y0} L${mid.toFixed(1)} ${ty.toFixed(1)} L${(x + w).toFixed(1)} ${y0} Z" fill="url(#${grad})" stroke="${edge}" stroke-width=".5" stroke-linejoin="round"/>`;
    out += `<line x1="${mid.toFixed(1)}" y1="${(ty + 1.5).toFixed(1)}" x2="${mid.toFixed(1)}" y2="${y0 - 0.5}" stroke="#B5E38A" stroke-width=".45" opacity=".7"/>`;
  }
  return out;
}

const ART = {
  banana: `${glowAndReflect}
<path d="M9 37 L55 37 L54 43.5 Q32 48.5 10 43.5 Z" fill="url(#kTrunk)"/>
<path d="M10 43.5 Q32 48.5 54 43.5" fill="none" stroke="#A89B6A" stroke-width=".6"/>
<g stroke="#D8CFA6" stroke-width=".4" opacity=".7"><line x1="16" y1="38" x2="16" y2="45"/><line x1="24" y1="38" x2="24" y2="46.5"/><line x1="32" y1="38" x2="32" y2="47"/><line x1="40" y1="38" x2="40" y2="46.5"/><line x1="48" y1="38" x2="48" y2="45"/></g>
${folds(37.5, 24, 8, 56, 8, 'kLeafB', '#173D10')}
${folds(38.5, 28.5, 10, 54, 7, 'kLeaf', '#24561A')}
<ellipse cx="32" cy="36.5" rx="20" ry="3.4" fill="#2F6E1F"/>
${marigold(19, 34, 3.4)}${marigold(45, 34, 3.4)}${marigold(26.5, 36, 2.8)}${marigold(37.5, 36, 2.8)}
${jasmine(22.5, 31.5)}${jasmine(41.5, 31.5)}${jasmine(15, 35.5)}${jasmine(49, 35.5)}
${incense}${candle}${bud(25, 33, 0.9)}`,

  lotus: `${glowAndReflect}
<path d="M5 42 Q32 50 59 42 Q60 38 50 37 L32 41 L14 37 Q4 38 5 42Z" fill="url(#kPad)"/>
<path d="M32 41 L30 46" stroke="#2A5A1F" stroke-width=".8"/>
<g stroke="#9C2E5C" stroke-width=".4" stroke-linejoin="round">
<path d="M10 39 C12 32 18 30 24 33 C20 36 15 39 10 39Z" fill="url(#kPetalB)"/>
<path d="M54 39 C52 32 46 30 40 33 C44 36 49 39 54 39Z" fill="url(#kPetalB)"/>
<path d="M16 38 C15 28 21 24 27 27 C25 32 21 36 16 38Z" fill="url(#kPetal)"/>
<path d="M48 38 C49 28 43 24 37 27 C39 32 43 36 48 38Z" fill="url(#kPetal)"/>
<path d="M22 39 C19 29 24 21 32 20 C30 28 27 35 22 39Z" fill="url(#kPetal)"/>
<path d="M42 39 C45 29 40 21 32 20 C34 28 37 35 42 39Z" fill="url(#kPetal)"/>
<path d="M14 41 C20 37 26 37 32 40 C38 37 44 37 50 41 C42 43 22 43 14 41Z" fill="url(#kPetalB)"/>
</g>
<ellipse cx="32" cy="36" rx="7" ry="2.6" fill="#F6D24A"/>
<g fill="#E8A51E"><circle cx="29" cy="35.6" r=".6"/><circle cx="32" cy="35" r=".6"/><circle cx="35" cy="35.6" r=".6"/><circle cx="30.5" cy="37" r=".6"/><circle cx="33.5" cy="37" r=".6"/></g>
${candle}`,

  bread: `${glowAndReflect}
<path d="M7 36 Q7 45.5 32 46.5 Q57 45.5 57 36 Z" fill="#9A5B22"/>
<ellipse cx="32" cy="36" rx="25" ry="7" fill="url(#kBread)"/>
<ellipse cx="32" cy="36" rx="25" ry="7" fill="none" stroke="#8C4F1C" stroke-width=".6"/>
<g fill="#B97A36" opacity=".55"><circle cx="15" cy="37" r=".7"/><circle cx="20" cy="40" r=".6"/><circle cx="45" cy="40" r=".6"/><circle cx="50" cy="37" r=".7"/><circle cx="28" cy="41.5" r=".6"/><circle cx="38" cy="41.5" r=".6"/></g>
<g stroke="#C9A06A" stroke-width=".4">
<path d="M14 36 L18 28.5 L22 35.5 Z" fill="#F8E3B8"/><path d="M42 35.5 L46 28.5 L50 36 Z" fill="#F8E3B8"/>
<path d="M20 37.5 L25 29 L29 37 Z" fill="#F6C9D6"/><path d="M35 37 L39 29 L44 37.5 Z" fill="#CDE8B4"/>
<path d="M27 38 L32 30.5 L37 38 Z" fill="#F8E3B8"/></g>
<circle cx="18" cy="31.5" r="1.1" fill="#E85D75"/><circle cx="46" cy="31.5" r="1.1" fill="#7CC36B"/>
<circle cx="25" cy="33" r="1" fill="#F2B544"/><circle cx="39" cy="33" r="1" fill="#E85D75"/>
${incense}${candle}`,

  coconut: `${glowAndReflect}
<path d="M5 33.5 Q5 47.5 32 47.5 Q59 47.5 59 33.5 Z" fill="url(#kHusk)"/>
<g stroke="#C08A52" stroke-width=".45" opacity=".55" fill="none">
<path d="M9 36 Q12 42 18 45"/><path d="M15 36 Q17 42 22 46"/><path d="M22 36.5 Q23 42 27 47"/><path d="M42 36.5 Q41 42 37 47"/><path d="M49 36 Q47 42 42 46"/><path d="M55 36 Q52 42 46 45"/></g>
<ellipse cx="32" cy="33.5" rx="27" ry="5.2" fill="#FBF6EA"/>
<ellipse cx="32" cy="33.8" rx="24.5" ry="4" fill="#E9DFC7"/>
${folds(34, 26, 12, 52, 6, 'kLeaf', '#24561A')}
<ellipse cx="32" cy="34" rx="18" ry="2.6" fill="#2F6E1F"/>
${marigold(20, 32.5, 3)}${marigold(44, 32.5, 3)}${marigold(27, 34, 2.4)}${marigold(37, 34, 2.4)}
${jasmine(24, 30.5)}${jasmine(40, 30.5)}
${candle}`,
};

export function krathongSVG(style) {
  return `<svg viewBox="0 0 64 50" aria-hidden="true">${ART[style] || ART.banana}</svg>`;
}
