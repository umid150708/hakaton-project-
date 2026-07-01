/**
 * Logo.tsx — Bozorboy brand mark.
 *
 * A "bozorboy" (market lad): the classic silhouette avatar wearing an Uzbek
 * Chust do'ppi cocked to one side — black cap with white qalampir embroidery
 * and a tumor-arch band — on a dark circular badge with a warm gold ring.
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
      </defs>

      {/* Badge */}
      <circle cx="24" cy="24" r="23" fill="#26262c" />

      {/* Silhouette (clipped to the badge) */}
      <g clipPath="url(#bb-clip)">
        <path d="M9 48 C9 38 15.5 33.5 24 33.5 C32.5 33.5 39 38 39 48 Z" fill="#bcbcc4" />
        <circle cx="24" cy="24" r="8.6" fill="#d2d2d9" />
      </g>

      {/* Do'ppi — cocked to one side on the crown */}
      <g transform="translate(22.5 15) rotate(-15)">
        {/* dome + band */}
        <path d="M-10 4 C-10 -6 -5 -10 0 -10 C5 -10 10 -6 10 4 Z" fill="#15152a" />
        <rect x="-10.5" y="3" width="21" height="4.6" rx="1.6" fill="#101024" />
        {/* qalampir (almond) embroidery */}
        <path d="M0 -8 C-2.6 -6 -2.6 -1.4 0 0.6 C2.6 -1.4 2.6 -6 0 -8 Z" fill="#f5f0e6" />
        <circle cx="0" cy="-3.6" r="0.9" fill="#15152a" />
        <circle cx="-4.6" cy="-3" r="0.85" fill="#f5f0e6" />
        <circle cx="4.6" cy="-3" r="0.85" fill="#f5f0e6" />
        {/* tumor-arch band */}
        <g stroke="#f5f0e6" strokeWidth="1.1" fill="none" strokeLinecap="round">
          <path d="M-7.5 6.4 q1.7 -2.1 3.4 0" />
          <path d="M-2.4 6.4 q1.7 -2.1 3.4 0" />
          <path d="M2.7 6.4 q1.7 -2.1 3.4 0" />
        </g>
      </g>

      {/* Warm gold ring */}
      <circle cx="24" cy="24" r="22.4" fill="none" stroke="#d9a441" strokeWidth="1.4" />
    </svg>
  );
}

/** Logo + wordmark. */
export function Brand({ size = 32, className = '', animated = false }: { size?: number; className?: string; animated?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo size={size} animated={animated} />
      <span className="font-black text-white tracking-tight" style={{ fontSize: size * 0.56 }}>
        Bozor<span className="text-amber-400">boy</span>
      </span>
    </div>
  );
}

export default Logo;
