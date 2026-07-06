import { Minus, Square, X } from 'lucide-react';

export default function TitleBar() {
  const controls = window.zefPulse?.windowControls;

  return (
    <div className="drag-region h-9 flex items-center justify-between pl-4 pr-2 bg-ink text-canvas/80 select-none">
      <div className="flex items-center gap-2 text-[13px] font-medium tracking-wide">
        <img src="/logo.png" alt="" className="w-4 h-4 rounded-[3px]" />
        Zef Pulse
      </div>
      <div className="no-drag flex items-center">
        <button
          onClick={() => controls?.minimize()}
          className="w-10 h-9 flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => controls?.maximize()}
          className="w-10 h-9 flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Maximize"
        >
          <Square size={11} />
        </button>
        <button
          onClick={() => controls?.close()}
          className="w-10 h-9 flex items-center justify-center hover:bg-err transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
