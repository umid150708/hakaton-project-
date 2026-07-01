/**
 * Logo.tsx — Bozorboy brand mark: silhouette avatar in an Uzbek Chust do'ppi.
 * NOTE: keep public/bozorboy.svg (the favicon) in sync with this SVG.
 */

export function Logo({ size = 32, className = '', animated = false }: { size?: number; className?: string; animated?: boolean }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 48 48" fill="none"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bozorboy"
      className={`${animated ? 'logo-float' : ''} ${className}`}
    >
      <defs>
        <clipPath id="bb-clip"><circle cx="24" cy="24" r="23" /></clipPath>
        <linearGradient id="bb-dome" x1="0" y1="-10" x2="0" y2="7" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2a2a52" />
          <stop offset="0.55" stopColor="#191934" />
          <stop offset="1" stopColor="#0e0e22" />
        </linearGradient>
        <linearGradient id="bb-band" x1="0" y1="3" x2="0" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#14142c" />
          <stop offset="1" stopColor="#0a0a1c" />
        </linearGradient>
        <radialGradient id="bb-badge" cx="0.35" cy="0.28" r="0.9">
          <stop offset="0" stopColor="#2f2f37" />
          <stop offset="1" stopColor="#212127" />
        </radialGradient>
      </defs>

      {/* Badge */}
      <circle cx="24" cy="24" r="23" fill="url(#bb-badge)" />

      {/* Silhouette (clipped to the badge) */}
      <g clipPath="url(#bb-clip)">
        <path d="M9 48 C9 38 15.5 33.5 24 33.5 C32.5 33.5 39 38 39 48 Z" fill="#bcbcc4" />
        <circle cx="24" cy="24" r="8.6" fill="#d2d2d9" />
        {/* soft contact shadow under the cap */}
        <ellipse cx="23" cy="18.5" rx="10" ry="3.2" fill="#000000" opacity="0.16" />
      </g>

      {/* Do'ppi — cocked to one side on the crown */}
      <g transform="translate(22.5 15) rotate(-15)">
        {/* dome + band (shaded) */}
        <path d="M-10 4 C-10 -6 -5 -10 0 -10 C5 -10 10 -6 10 4 Z" fill="url(#bb-dome)" />
        <rect x="-10.5" y="3" width="21" height="4.8" rx="1.7" fill="url(#bb-band)" />
        {/* crown highlight for a rounded, real feel */}
        <path d="M-7 -1.5 C-6 -6.5 -2.4 -8.8 0.6 -8.8" stroke="#3d3d70" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.7" />

        {/* qalampir (pepper almonds) — fanned across the dome, gold-veined */}
        <g>
          {[-5, 0, 5].map((x, i) => (
            <g key={i} transform={`translate(${x} -3.4) rotate(${x * 2.4})`}>
              <path d="M0 -4.4 C-1.9 -2.6 -1.9 1.1 0 2.6 C1.9 1.1 1.9 -2.6 0 -4.4 Z" fill="#f5f0e6" />
              <path d="M0 -3.4 L0 1.7" stroke="#c99a34" strokeWidth="0.5" strokeLinecap="round" />
            </g>
          ))}
        </g>

        {/* tumor-arch band with gold stitch dots */}
        <g stroke="#f5f0e6" strokeWidth="1" fill="none" strokeLinecap="round">
          <path d="M-8.6 6.6 q1.5 -1.9 3 0" />
          <path d="M-4 6.6 q1.5 -1.9 3 0" />
          <path d="M0.6 6.6 q1.5 -1.9 3 0" />
          <path d="M5.2 6.6 q1.5 -1.9 3 0" />
        </g>
        <g fill="#d9a441">
          <circle cx="-7.1" cy="6.7" r="0.5" />
          <circle cx="-2.5" cy="6.7" r="0.5" />
          <circle cx="2.1" cy="6.7" r="0.5" />
          <circle cx="6.7" cy="6.7" r="0.5" />
        </g>
      </g>

      {/* Warm gold ring */}
      <circle cx="24" cy="24" r="22.4" fill="none" stroke="#d9a441" strokeWidth="1.4" />
    </svg>
  );
}

/** Logo + wordmark. The 3rd "o" of Bozorboy is fused with a "$" sign. */
export function Brand({ size = 32, className = '', animated = false }: { size?: number; className?: string; animated?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo size={size} animated={animated} />
      <span className="font-black text-ink tracking-tight" style={{ fontSize: size * 0.56 }}>
        Bozor<span className="text-gold">b<span className="dollar-o">o</span>y</span>
      </span>
    </div>
  );
}

export default Logo;
