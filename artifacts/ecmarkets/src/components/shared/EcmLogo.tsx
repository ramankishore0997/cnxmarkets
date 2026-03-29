export function EcmLogo({ size = 36 }: { size?: number }) {
  const id = `ecm_${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}_bg`} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A1628"/>
          <stop offset="100%" stopColor="#050C1A"/>
        </linearGradient>
        <linearGradient id={`${id}_area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00C274" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#00C274" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id={`${id}_line`} x1="0" y1="0" x2="44" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00C274" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#00E68A"/>
        </linearGradient>
        <filter id={`${id}_glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id={`${id}_clip`}>
          <rect width="44" height="44" rx="12"/>
        </clipPath>
      </defs>

      <rect width="44" height="44" rx="12" fill={`url(#${id}_bg)`}/>
      <rect x="0.6" y="0.6" width="42.8" height="42.8" rx="11.4"
        stroke="#00C274" strokeWidth="1" strokeOpacity="0.35"/>

      <g clipPath={`url(#${id}_clip)`}>
        <path
          d="M7 33 L13 25 L19 27.5 L25 17 L37 9"
          stroke={`url(#${id}_line)`} strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M7 33 L13 25 L19 27.5 L25 17 L37 9 L37 36 L7 36 Z"
          fill={`url(#${id}_area)`}
        />
        <circle cx="37" cy="9" r="3" fill="#00E68A" filter={`url(#${id}_glow)`}/>
        <circle cx="37" cy="9" r="1.5" fill="#fff" fillOpacity="0.9"/>
      </g>
    </svg>
  );
}
