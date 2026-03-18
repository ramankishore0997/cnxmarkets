export function EcmLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00E68A"/>
          <stop offset="100%" stopColor="#00C274"/>
        </linearGradient>
        <linearGradient id="barGradDim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00C274" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#009A5C" stopOpacity="0.7"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="40" height="40" rx="10" fill="#050810"/>
      {/* Border */}
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="9.25"
        stroke="#00C274" strokeWidth="1.2" strokeOpacity="0.4"/>

      {/* ── Candle 1: left, shorter ── */}
      {/* top wick */}
      <line x1="10.5" y1="15.5" x2="10.5" y2="18" stroke="#00C274" strokeWidth="1.4"
        strokeLinecap="round" strokeOpacity="0.7"/>
      {/* body */}
      <rect x="7.5" y="18" width="6" height="10" rx="1.5" fill="url(#barGradDim)"/>
      {/* bottom wick */}
      <line x1="10.5" y1="28" x2="10.5" y2="31" stroke="#00C274" strokeWidth="1.4"
        strokeLinecap="round" strokeOpacity="0.7"/>

      {/* ── Candle 2: centre, medium ── */}
      {/* top wick */}
      <line x1="20" y1="10" x2="20" y2="13" stroke="#00C274" strokeWidth="1.4"
        strokeLinecap="round"/>
      {/* body */}
      <rect x="17" y="13" width="6" height="13" rx="1.5" fill="url(#barGrad)"/>
      {/* bottom wick */}
      <line x1="20" y1="26" x2="20" y2="29.5" stroke="#00C274" strokeWidth="1.4"
        strokeLinecap="round"/>

      {/* ── Candle 3: right, tallest ── */}
      {/* top wick */}
      <line x1="29.5" y1="5" x2="29.5" y2="7.5" stroke="#00C274" strokeWidth="1.4"
        strokeLinecap="round"/>
      {/* body */}
      <rect x="26.5" y="7.5" width="6" height="16" rx="1.5" fill="url(#barGrad)" filter="url(#glow)"/>
      {/* bottom wick */}
      <line x1="29.5" y1="23.5" x2="29.5" y2="27" stroke="#00C274" strokeWidth="1.4"
        strokeLinecap="round"/>

      {/* ── Rising trend line (connects mid-bodies) ── */}
      <polyline points="10.5,21 20,18.5 29.5,14.5"
        stroke="#00E68A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
        strokeOpacity="0.55"/>

      {/* ── Trend dots at top of each body ── */}
      <circle cx="10.5" cy="21" r="1.4" fill="#00C274" fillOpacity="0.6"/>
      <circle cx="20" cy="18.5" r="1.4" fill="#00C274" fillOpacity="0.8"/>
      <circle cx="29.5" cy="14.5" r="1.6" fill="#00E68A" filter="url(#glow)"/>
    </svg>
  );
}
