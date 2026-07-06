import { PenLine, Settings as SettingsIcon, Circle } from 'lucide-react';

export default function Sidebar({ view, setView, connected, profile }) {
  const items = [
    { id: 'create', label: 'Create post', icon: PenLine },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="w-56 shrink-0 bg-ink text-canvas/90 flex flex-col justify-between pb-4">
      <div className="pt-5">
        <nav className="px-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                  active
                    ? 'bg-white/10 text-canvas'
                    : 'text-canvas/60 hover:text-canvas/90 hover:bg-white/5'
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-4 pt-3 border-t border-white/10 mx-3">
        <div className="flex items-center gap-2 mt-3 text-xs text-canvas/60">
          <Circle
            size={8}
            className={connected ? 'text-ok fill-ok' : 'text-canvas/30 fill-canvas/30'}
          />
          {connected ? (profile?.name || 'Connected') : 'Not connected'}
        </div>
        <div className="mt-3 text-[10px] tracking-wide text-canvas/30 uppercase">
          Powered by Zef Technology
        </div>
      </div>
    </div>
  );
}
