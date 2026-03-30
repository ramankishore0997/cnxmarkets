/* ─── ECMarket Pro — Brand New Logo Design ─── */

/**
 * Standalone icon mark — rising bar chart inside a navy rounded square.
 * size: pixel size of the icon
 * variant: "dark" = navy bg (default), "light" = white bg with navy bars
 */
export function EcmLogo({
  size = 36,
  variant = 'dark',
}: {
  size?: number;
  variant?: 'dark' | 'light';
}) {
  const bg   = variant === 'dark' ? '#0B1929' : '#FFFFFF';
  const bar  = variant === 'dark' ? '#FFFFFF' : '#0B1929';
  const line = '#1F77B4';

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill={bg}/>
      {/* Rising bars */}
      <rect x="6"  y="26" width="6" height="8"  rx="1.5" fill={bar}/>
      <rect x="15" y="20" width="6" height="14" rx="1.5" fill={bar}/>
      <rect x="24" y="13" width="6" height="21" rx="1.5" fill={bar}/>
      {/* Trend line */}
      <polyline
        points="9,26 18,20 27,13"
        stroke={line} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      {/* Live dot */}
      <circle cx="27" cy="13" r="2.5" fill={line}/>
    </svg>
  );
}

/**
 * Inline horizontal logo — icon + wordmark side by side.
 * For navbars, headers, any horizontal space.
 * theme="light" → dark text on light bg
 * theme="dark"  → white text on dark bg
 */
export function NavbarLogo({ theme = 'light' }: { theme?: 'dark' | 'light' }) {
  const textColor = theme === 'dark' ? '#FFFFFF' : '#0B1929';
  const proColor  = '#1F77B4';
  const iconVariant = theme === 'dark' ? 'light' : 'dark';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none' }}>
      <EcmLogo size={36} variant={iconVariant as 'dark' | 'light'}/>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: textColor,
          display: 'flex',
          alignItems: 'baseline',
          gap: 4,
        }}>
          ECMARKET
          <span style={{ color: proColor, fontWeight: 700, fontSize: 13, letterSpacing: '0.08em' }}>
            PRO
          </span>
        </span>
        <span style={{
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: '0.12em',
          color: theme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(11,25,41,0.45)',
          textTransform: 'uppercase',
        }}>
          UAE Regulated Broker
        </span>
      </div>
    </div>
  );
}

/**
 * Stacked logo — icon on top, wordmark below.
 * For footers, splash screens, login pages.
 */
export function BrandLogo({
  theme = 'dark',
  size = 'md',
}: {
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}) {
  const iconSize = { sm: 44, md: 56, lg: 72 }[size];
  const fontSize = { sm: 13, md: 16, lg: 20 }[size];
  const subSize  = { sm: 8,  md: 9,  lg: 11 }[size];
  const textColor = theme === 'dark' ? '#FFFFFF' : '#0B1929';
  const proColor  = '#1F77B4';
  const iconVariant = theme === 'dark' ? 'light' : 'dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, userSelect: 'none' }}>
      <EcmLogo size={iconSize} variant={iconVariant as 'dark' | 'light'}/>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          fontSize: fontSize,
          fontWeight: 800,
          letterSpacing: '0.05em',
          color: textColor,
          display: 'flex',
          alignItems: 'baseline',
          gap: 5,
        }}>
          ECMARKET
          <span style={{ color: proColor, fontWeight: 700, fontSize: fontSize - 2, letterSpacing: '0.1em' }}>
            PRO
          </span>
        </div>
        <span style={{
          fontSize: subSize,
          fontWeight: 500,
          letterSpacing: '0.15em',
          color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(11,25,41,0.4)',
          textTransform: 'uppercase',
        }}>
          UAE Regulated Broker
        </span>
      </div>
    </div>
  );
}
