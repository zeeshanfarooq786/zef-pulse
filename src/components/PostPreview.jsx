import { useState } from 'react';
import { ThumbsUp, MessageCircle, Repeat2, Send } from 'lucide-react';

export default function PostPreview({ text, profile }) {
  const [imgFailed, setImgFailed] = useState(false);
  const displayName = profile?.name || 'Your Name';
  const headline = profile?.headline || 'Your headline appears here';
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-[380px] shrink-0">
      <div className="text-xs font-medium text-ink/40 mb-2 px-1 uppercase tracking-wider">
        Preview
      </div>
      <div className="bg-paper border border-line rounded-lg shadow-sm overflow-hidden">
        <div className="p-3.5 flex gap-2.5">
          {profile?.picture && !imgFailed ? (
            <img
              src={profile.picture}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-tint flex items-center justify-center text-brand-dim font-semibold text-sm">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink truncate">{displayName}</div>
            <div className="text-xs text-ink/50 truncate">{headline}</div>
            <div className="text-xs text-ink/40 mt-0.5">Now · 🌐</div>
          </div>
        </div>

        <div className="px-3.5 pb-3 text-[14px] leading-[1.45] text-ink whitespace-pre-wrap break-words min-h-[3rem]">
          {text ? (
            text
          ) : (
            <span className="text-ink/30 italic">Your post will appear here as you type…</span>
          )}
        </div>

        <div className="border-t border-line px-3.5 py-2 flex items-center justify-between text-ink/50">
          {[
            [ThumbsUp, 'Like'],
            [MessageCircle, 'Comment'],
            [Repeat2, 'Repost'],
            [Send, 'Send'],
          ].map(([Icon, label]) => (
            <div key={label} className="flex items-center gap-1.5 text-xs">
              <Icon size={16} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
