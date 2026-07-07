import logoUrl from '/logo.svg';

export { logoUrl };

export default function AppLogo({ size = 'md', showWordmark = false, subtitle, className = '' }) {
  const sizes = {
    xs: { img: 'w-4 h-4 rounded-[3px]', title: 'text-[13px]', sub: 'text-[9px]' },
    sm: { img: 'w-8 h-8 rounded-lg', title: 'text-sm', sub: 'text-[10px]' },
    md: { img: 'w-10 h-10 rounded-xl shadow-lg shadow-black/20', title: 'text-base', sub: 'text-[10px]' },
    lg: { img: 'w-16 h-16 rounded-2xl shadow-xl shadow-brand/20', title: 'text-2xl', sub: 'text-xs' },
  };
  const s = sizes[size] || sizes.md;

  if (!showWordmark) {
    return <img src={logoUrl} alt="Zef Pulse" className={`${s.img} ${className}`} />;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0">
        <img src={logoUrl} alt="" className={s.img} />
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-soft border-2 border-ink" />
      </div>
      <div className="min-w-0">
        <div className={`font-display font-semibold leading-tight text-canvas ${s.title}`}>Zef Pulse</div>
        {subtitle && (
          <div className={`tracking-[0.18em] uppercase text-canvas/40 ${s.sub}`}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}
