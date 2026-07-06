import { useState } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import PostPreview from './PostPreview.jsx';

const MAX_LEN = 3000;

export default function CreatePost({ connected, profile, goToSettings }) {
  const [text, setText] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }

  const handlePunchUp = async () => {
    if (!text.trim() || polishing) return;
    setPolishing(true);
    setStatus(null);
    try {
      const result = await window.zefPulse.punchUp(text);
      if (result.success) {
        setText(result.text.slice(0, MAX_LEN));
      } else {
        setStatus({ type: 'error', message: result.error || 'Rewrite failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Rewrite failed.' });
    } finally {
      setPolishing(false);
    }
  };

  const handlePublish = async () => {
    if (!text.trim() || publishing) return;
    setPublishing(true);
    setStatus(null);
    try {
      const result = await window.zefPulse.publishPost(text);
      if (result.success) {
        setStatus({ type: 'success', message: 'Published to LinkedIn.' });
        setText('');
      } else {
        setStatus({ type: 'error', message: result.error || 'Publish failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Publish failed.' });
    } finally {
      setPublishing(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <h2 className="font-display text-xl text-ink mb-2">Connect your LinkedIn account</h2>
          <p className="text-sm text-ink/50 mb-5">
            You'll need to connect your LinkedIn account before you can draft and publish posts.
          </p>
          <button
            onClick={goToSettings}
            className="px-4 py-2 rounded bg-ink text-canvas text-sm font-medium hover:bg-ink-600 transition-colors"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-8 overflow-auto">
      <h1 className="font-display text-2xl text-ink mb-1">Create post</h1>
      <p className="text-sm text-ink/50 mb-6">Write on the left, see exactly what ships on the right.</p>

      <div className="flex gap-8 items-start">
        <div className="flex-1 flex flex-col">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
            placeholder="What do you want to share with your network?"
            className="w-full h-72 resize-none rounded-lg border border-line bg-paper p-4 text-[14px] leading-[1.5] text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-xs text-ink/40">
              {text.length} / {MAX_LEN}
            </span>
            {status && (
              <span
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  status.type === 'success' ? 'text-ok' : 'text-err'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}
                {status.message}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handlePublish}
              disabled={!text.trim() || publishing}
              className="flex items-center gap-2 px-5 py-2.5 rounded bg-brand text-white font-semibold text-sm hover:bg-brand-dim disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {publishing ? 'Publishing…' : 'Publish to LinkedIn'}
            </button>

            <button
              onClick={handlePunchUp}
              disabled={!text.trim() || polishing || publishing}
              className="flex items-center gap-2 px-4 py-2.5 rounded border border-line bg-paper text-ink font-medium text-sm hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {polishing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-brand-dim" />}
              {polishing ? 'Punching up…' : 'Punch it up'}
            </button>
          </div>
        </div>

        <PostPreview text={text} profile={profile} />
      </div>
    </div>
  );
}
