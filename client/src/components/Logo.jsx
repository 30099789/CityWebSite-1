// Logo.jsx — CityLink brand mark
// Usage:
//   <Logo />                — full logo (icon + wordmark + tagline)
//   <Logo variant="mark" /> — icon square only (navbar mobile, favicon)
//   <Logo variant="compact" /> — icon + wordmark, no tagline
//   <Logo dark />           — white wordmark for dark backgrounds

export default function Logo({ variant = "full", dark = false, className = "" }) {
  if (variant === "mark") {
    return (
      <svg
        className={className}
        width="36" height="36"
        viewBox="0 0 64 64"
        role="img"
        aria-label="CityLink Initiatives"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="64" height="64" rx="14" fill="#185FA5"/>
        <rect x="10" y="40" width="7"  height="19" rx="1" fill="white" opacity="0.9"/>
        <rect x="19" y="33" width="9"  height="26" rx="1" fill="white" opacity="0.9"/>
        <rect x="30" y="27" width="11" height="32" rx="1" fill="white"/>
        <rect x="43" y="34" width="7"  height="25" rx="1" fill="white" opacity="0.9"/>
        <rect x="52" y="30" width="6"  height="29" rx="1" fill="white" opacity="0.9"/>
        <path d="M13 59 Q32 47 51 59" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
      </svg>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <svg width="36" height="36" viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="14" fill="#185FA5"/>
          <rect x="10" y="40" width="7"  height="19" rx="1" fill="white" opacity="0.9"/>
          <rect x="19" y="33" width="9"  height="26" rx="1" fill="white" opacity="0.9"/>
          <rect x="30" y="27" width="11" height="32" rx="1" fill="white"/>
          <rect x="43" y="34" width="7"  height="25" rx="1" fill="white" opacity="0.9"/>
          <rect x="52" y="30" width="6"  height="29" rx="1" fill="white" opacity="0.9"/>
          <path d="M13 59 Q32 47 51 59" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
        </svg>
        <div className="leading-tight">
          <p className={`text-sm font-bold ${dark ? "text-white" : "text-slate-900"}`}>
            City<span className="text-blue-600">Link</span>
          </p>
          <p className={`text-xs tracking-widest uppercase ${dark ? "text-white/50" : "text-slate-400"}`}>
            Initiatives
          </p>
        </div>
      </div>
    );
  }

  // full
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width="44" height="44" viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#185FA5"/>
        <rect x="10" y="40" width="7"  height="19" rx="1" fill="white" opacity="0.9"/>
        <rect x="19" y="33" width="9"  height="26" rx="1" fill="white" opacity="0.9"/>
        <rect x="30" y="27" width="11" height="32" rx="1" fill="white"/>
        <rect x="43" y="34" width="7"  height="25" rx="1" fill="white" opacity="0.9"/>
        <rect x="52" y="30" width="6"  height="29" rx="1" fill="white" opacity="0.9"/>
        <path d="M13 59 Q32 47 51 59" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
      </svg>
      <div className="leading-tight">
        <p className={`text-base font-bold ${dark ? "text-white" : "text-slate-900"}`}>
          City<span className="text-blue-600">Link</span>
          <span className={`ml-1 text-xs font-normal tracking-widest uppercase ${dark ? "text-white/50" : "text-slate-400"}`}>
            Initiatives
          </span>
        </p>
        <p className={`text-xs ${dark ? "text-white/40" : "text-slate-400"}`}>
          Smart Community Portal
        </p>
      </div>
    </div>
  );
}