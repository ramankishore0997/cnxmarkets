/* ─── ECMarket Pro — Brand Assets (SVG Recreation) ─── */

/**
 * Standalone icon mark — thick circle ring with horizontal bar passing through.
 * Transparent background, works on any bg with theme color.
 */
export function EcmLogo({ size = 36, color = '#111111' }: { size?: number; color?: string }) {
  const cx = 24, cy = 24, r = 15, sw = 5;
  const lx1 = cx - r, lx2 = cx + r;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top half arc */}
      <path
        d={`M ${lx1},${cy} A ${r},${r} 0 0,1 ${lx2},${cy}`}
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"
      />
      {/* Bottom half arc */}
      <path
        d={`M ${lx1},${cy} A ${r},${r} 0 0,0 ${lx2},${cy}`}
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"
      />
      {/* Horizontal bar — extends further right (like in logo) */}
      <line x1="5" y1={cy} x2="44" y2={cy} stroke={color} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
}

/**
 * Full wordmark logo — icon + "ECMARKET PRO" text with red accents.
 * theme="dark"  → white elements (for dark navy sidebar/panels)
 * theme="light" → black elements (for light backgrounds)
 */
export function BrandLogo({
  theme = 'dark',
  size  = 'md',
}: {
  theme?: 'dark' | 'light';
  size?:  'sm' | 'md' | 'lg';
}) {
  const wMap = { sm: 104, md: 130, lg: 168 };
  const hMap = { sm:  72, md:  90, lg: 116 };
  const W = wMap[size];
  const H = hMap[size];

  const ink  = theme === 'dark' ? '#FFFFFF' : '#111111';
  const red  = '#CC0000';

  // Icon geometry (viewBox 260 x 180, icon centered at top)
  const icx = 130, icy = 78, icr = 55, sw = 10.5;
  const lx1 = icx - icr; // 75
  const lx2 = icx + icr; // 185

  // Text baseline
  const ty = 158;
  const fs = 32; // font-size
  const lspc = 1.5; // letter-spacing px

  // Approximate character widths at Arial Black 32px (rough)
  // E≈20 C≈21 M≈28 A≈23 R≈20 K≈20 E≈20 T≈19 sp≈10 P≈20 R≈20 O≈23
  // Total ≈ 244px  — center offset from 130 → starts at ~8
  const txtStart = 8; // approx start x
  // E: 8→28  C:28→49  M:49→77  A:77→100  R:100→120  K:120→140  E:140→160  T:160→179  sp  P:189→209  R:209→229  O:229→252

  // K center ≈ x=130, y baseline=158, top of char ≈ y=158-fs+4=130
  const kCenterX = 130;
  const kMidY    = ty - fs * 0.5; // ~142

  // E starts at ~8, three bars at E glyph heights
  const eX   = txtStart + 1;
  const eBarW = 14;
  const eBar1Y = ty - fs + 4;       // ~130 top bar
  const eBar2Y = ty - fs * 0.5 - 2; // ~140 mid bar
  const eBar3Y = ty - 4;            // ~154 bottom bar

  return (
    <svg
      width={W} height={H}
      viewBox="0 0 260 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── ICON ── */}
      {/* Top arc */}
      <path
        d={`M ${lx1},${icy} A ${icr},${icr} 0 0,1 ${lx2},${icy}`}
        stroke={ink} strokeWidth={sw} strokeLinecap="round" fill="none"
      />
      {/* Bottom arc */}
      <path
        d={`M ${lx1},${icy} A ${icr},${icr} 0 0,0 ${lx2},${icy}`}
        stroke={ink} strokeWidth={sw} strokeLinecap="round" fill="none"
      />
      {/* Bar — left flush at circle edge, extends further right */}
      <line x1={lx1 - 8} y1={icy} x2={lx2 + 22} y2={icy}
        stroke={ink} strokeWidth={sw} strokeLinecap="round"/>

      {/* ── TEXT ── */}
      {/* Red accent on "E" — 3 horizontal bars overlaid */}
      <rect x={eX}     y={eBar1Y} width={eBarW} height={3.5} rx={1} fill={red}/>
      <rect x={eX}     y={eBar2Y} width={eBarW} height={3.5} rx={1} fill={red}/>
      <rect x={eX + 2} y={eBar3Y} width={eBarW - 2} height={3.5} rx={1} fill={red}/>

      {/* Red accent on "K" — small upward triangle at character junction */}
      <polygon
        points={`${kCenterX},${kMidY - 9} ${kCenterX - 7},${kMidY + 5} ${kCenterX + 7},${kMidY + 5}`}
        fill={red}
      />

      {/* Main text */}
      <text
        x="130" y={ty}
        textAnchor="middle"
        fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
        fontSize={fs}
        fontWeight="900"
        letterSpacing={lspc}
        fill={ink}
      >
        ECMARKET PRO
      </text>
    </svg>
  );
}

/**
 * Inline navbar logo — icon on left, "ECMARKET PRO" text on right.
 * Fits perfectly inside a ~52px tall pill navbar.
 * theme="light" → black (for white/light pill)
 * theme="dark"  → white (for dark sidebar/panel)
 */
export function NavbarLogo({ theme = 'light' }: { theme?: 'dark' | 'light' }) {
  const ink = theme === 'dark' ? '#FFFFFF' : '#111111';
  const red = '#CC0000';

  const icx = 22, icy = 22, icr = 14, sw = 5;
  const lx1 = icx - icr; // 8
  const lx2 = icx + icr; // 36

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none' }}>
      {/* Icon: circle ring + bar */}
      <svg width={44} height={44} viewBox="0 0 44 44" fill="none">
        <path d={`M ${lx1},${icy} A ${icr},${icr} 0 0,1 ${lx2},${icy}`}
          stroke={ink} strokeWidth={sw} strokeLinecap="round" fill="none"/>
        <path d={`M ${lx1},${icy} A ${icr},${icr} 0 0,0 ${lx2},${icy}`}
          stroke={ink} strokeWidth={sw} strokeLinecap="round" fill="none"/>
        <line x1={lx1 - 5} y1={icy} x2={lx2 + 10} y2={icy}
          stroke={ink} strokeWidth={sw} strokeLinecap="round"/>
      </svg>

      {/* Wordmark with red accents */}
      <div style={{ position: 'relative', lineHeight: 1 }}>
        {/* Small red accent marks at E start */}
        <span style={{
          position: 'absolute', left: 0, top: '8%',
          display: 'flex', flexDirection: 'column', gap: '2.5px',
        }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: 'block', width: 6, height: 2.5,
              background: red, borderRadius: 1,
            }}/>
          ))}
        </span>

        <span style={{
          fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: '1.5px',
          color: ink,
          paddingLeft: 8,
          display: 'block',
          position: 'relative',
        }}>
          ECMARKET PRO
          {/* Small red triangle at K position (approx char 6) */}
          <span style={{
            position: 'absolute',
            left: 56, top: -5,
            width: 0, height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderBottom: `6px solid ${red}`,
          }}/>
        </span>
      </div>
    </div>
  );
}
