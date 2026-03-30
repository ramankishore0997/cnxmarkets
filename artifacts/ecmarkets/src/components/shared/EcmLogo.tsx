/* ─── ECMarket Pro — Brand Assets (Custom Logo) ─── */
import logoSrc from '@assets/image_1774878156763.png';

/**
 * Small square icon-only mark — shows the circular icon part
 * Used inside sidebar, header badges etc.
 */
export function EcmLogo({ size = 36 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        overflow: 'hidden',
        background: '#FFFFFF',
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.14)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Show top portion of logo (circular icon) cropped via background */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${logoSrc})`,
          backgroundSize: '160%',
          backgroundPosition: 'center 8%',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
}

/**
 * Full brand logo — icon + "ECMARKET PRO" wordmark image
 * theme="dark"  → white pill wrapper (for dark navy sidebar/panels)
 * theme="light" → direct image (for white/light bg navbar, login)
 * size: "sm" | "md" | "lg"
 */
export function BrandLogo({
  theme = 'dark',
  size = 'md',
}: {
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}) {
  const heights = { sm: 32, md: 44, lg: 58 };
  const h = heights[size];

  if (theme === 'dark') {
    return (
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 8,
          padding: '4px 8px',
          display: 'inline-flex',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <img
          src={logoSrc}
          alt="ECMarket Pro"
          style={{ height: h, width: 'auto', display: 'block', objectFit: 'contain' }}
          draggable={false}
        />
      </div>
    );
  }

  // Light theme — logo directly (black logo on white/light bg)
  return (
    <img
      src={logoSrc}
      alt="ECMarket Pro"
      style={{ height: h, width: 'auto', display: 'block', objectFit: 'contain' }}
      draggable={false}
    />
  );
}
