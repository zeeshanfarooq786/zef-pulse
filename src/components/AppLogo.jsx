import iconUrl from '/icon.png';
import wordmarkSmallUrl from '/wordmark-small.png';
import wordmarkFullUrl from '/wordmark-full.png';

export { iconUrl, wordmarkSmallUrl, wordmarkFullUrl };

const VARIANTS = {
  icon: iconUrl,
  'wordmark-small': wordmarkSmallUrl,
  'wordmark-full': wordmarkFullUrl,
};

const SIZES = {
  xs: {
    icon: 'h-5 w-5 rounded-[4px] object-cover',
    'wordmark-small': 'h-4 w-auto max-w-[88px] object-contain',
    'wordmark-full': 'h-5 w-auto max-w-[120px] object-contain',
  },
  sm: {
    icon: 'h-9 w-9 rounded-lg object-cover',
    'wordmark-small': 'h-7 w-auto max-w-[140px] object-contain',
    'wordmark-full': 'h-9 w-auto max-w-[180px] object-contain',
  },
  md: {
    icon: 'h-11 w-11 rounded-xl object-cover shadow-lg shadow-black/20',
    'wordmark-small': 'h-8 w-auto max-w-[160px] object-contain',
    'wordmark-full': 'h-11 w-auto max-w-[220px] object-contain',
  },
  lg: {
    icon: 'h-16 w-16 rounded-2xl object-cover shadow-xl shadow-brand/20',
    'wordmark-small': 'h-10 w-auto max-w-[200px] object-contain',
    'wordmark-full': 'h-14 w-auto max-w-[280px] object-contain',
  },
};

export default function AppLogo({
  variant = 'icon',
  size = 'md',
  subtitle,
  className = '',
}) {
  const src = VARIANTS[variant] || VARIANTS.icon;
  const sizeClass = SIZES[size]?.[variant] || SIZES.md.icon;

  if (variant === 'icon' && subtitle) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img src={src} alt="Zef Pulse" className={sizeClass} />
        {subtitle && (
          <div className="text-[10px] tracking-[0.18em] uppercase text-canvas/40">{subtitle}</div>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Zef Pulse"
      className={`${sizeClass} ${className}`}
    />
  );
}
