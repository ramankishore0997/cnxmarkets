/* ─── ECMarket Pro — Brand Assets ─── */

/** Square icon mark (chart + ECM) */
export function EcmLogo({ size = 36 }: { size?: number }) {
  const id = `ecm_${size}`;
  const r  = size / 44; // scale ratio
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}_bg`} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0B3C5D"/>
          <stop offset="100%" stopColor="#061E30"/>
        </linearGradient>
        <linearGradient id={`${id}_line`} x1="0" y1="0" x2="44" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1F77B4" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#60C0F0"/>
        </linearGradient>
        <linearGradient id={`${id}_area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1F77B4" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#1F77B4" stopOpacity="0"/>
        </linearGradient>
        <filter id={`${id}_glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id={`${id}_clip`}><rect width="44" height="44" rx="11"/></clipPath>
      </defs>

      {/* background */}
      <rect width="44" height="44" rx="11" fill={`url(#${id}_bg)`}/>
      {/* subtle border */}
      <rect x="0.75" y="0.75" width="42.5" height="42.5" rx="10.25"
        stroke="#1F77B4" strokeWidth="1" strokeOpacity="0.4"/>

      <g clipPath={`url(#${id}_clip)`}>
        {/* chart area fill */}
        <path d="M7 34 L14 24 L20 27 L27 15 L37 8 L37 36 L7 36 Z"
          fill={`url(#${id}_area)`}/>
        {/* chart line */}
        <path d="M7 34 L14 24 L20 27 L27 15 L37 8"
          stroke={`url(#${id}_line)`} strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* highlight dot */}
        <circle cx="37" cy="8" r="3.5" fill="#1F77B4" filter={`url(#${id}_glow)`}/>
        <circle cx="37" cy="8" r="1.8" fill="#FFFFFF" fillOpacity="0.95"/>
        {/* ECM micro label at bottom */}
        <text x="7" y="43" fontFamily="system-ui, sans-serif"
          fontSize="7" fontWeight="900" letterSpacing="0.5"
          fill="#FFFFFF" fillOpacity="0.55">ECM</text>
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Full brand wordmark — use this everywhere
   theme="dark"  → white text  (navbar / sidebar)
   theme="light" → navy text   (login, cards)
   size: sm=28 md=36 lg=44
───────────────────────────────────────────── */
export function BrandLogo({
  theme = 'dark',
  size  = 'md',
}: {
  theme?: 'dark' | 'light';
  size?:  'sm' | 'md' | 'lg';
}) {
  const iconSizes = { sm: 28, md: 34, lg: 44 };
  const textSizes = { sm: 15, md: 18, lg: 23 };
  const badgeSizes= { sm: 9,  md: 10, lg: 12 };
  const gaps      = { sm: 7,  md: 9,  lg: 11 };

  const iconPx  = iconSizes[size];
  const textPx  = textSizes[size];
  const badgePx = badgeSizes[size];
  const gap     = gaps[size];

  const mainColor = theme === 'dark' ? '#FFFFFF' : '#0B3C5D';
  const subColor  = theme === 'dark' ? 'rgba(255,255,255,0.65)' : '#374151';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, userSelect: 'none' }}>
      {/* Icon mark */}
      <EcmLogo size={iconPx} />

      {/* Wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        {/* Main brand name row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, lineHeight: 1 }}>
          {/* "EC" bold accent */}
          <span style={{
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            fontSize: textPx,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: '#1F77B4',
            lineHeight: 1,
          }}>EC</span>
          {/* "Market" regular bold */}
          <span style={{
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            fontSize: textPx,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: mainColor,
            lineHeight: 1,
          }}>Market</span>

          {/* PRO badge */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            marginLeft: 5,
            marginBottom: 1,
            fontSize: badgePx,
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#1F77B4',
            background: 'rgba(31,119,180,0.12)',
            border: '1px solid rgba(31,119,180,0.4)',
            borderRadius: 4,
            padding: '1px 5px',
            lineHeight: 1.6,
          }}>PRO</span>
        </div>

        {/* Tagline (md and lg only) */}
        {size !== 'sm' && (
          <span style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: badgePx - 1,
            fontWeight: 500,
            letterSpacing: '0.12em',
            color: subColor,
            marginTop: 2,
            textTransform: 'uppercase',
          }}>Forex · Crypto · CFDs</span>
        )}
      </div>
    </div>
  );
}
