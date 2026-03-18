export function EcmLogo({ size = 36 }: { size?: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="8" fill="#050810"/>
      <rect x="0.5" y="0.5" width="35" height="35" rx="7.5" stroke="#00C274" strokeOpacity="0.55" strokeWidth="1"/>
      <rect x="5.5" y="18" width="5" height="11" rx="1.2" fill="#CF304A"/>
      <rect x="7.7" y="14" width="1.6" height="4.5" rx="0.8" fill="#CF304A"/>
      <rect x="7.7" y="29" width="1.6" height="3.5" rx="0.8" fill="#CF304A"/>
      <rect x="13.5" y="11" width="5" height="13" rx="1.2" fill="#00C274"/>
      <rect x="15.7" y="7" width="1.6" height="4.5" rx="0.8" fill="#00C274"/>
      <rect x="15.7" y="24" width="1.6" height="3.5" rx="0.8" fill="#00C274"/>
      <rect x="21.5" y="6" width="5" height="16" rx="1.2" fill="#02C076"/>
      <rect x="23.7" y="2.5" width="1.6" height="4" rx="0.8" fill="#02C076"/>
      <rect x="23.7" y="22" width="1.6" height="3.5" rx="0.8" fill="#02C076"/>
      <polyline points="3,31 16.5,17 24.5,13 33,5" stroke="#00C274" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45"/>
    </svg>
  );
}
