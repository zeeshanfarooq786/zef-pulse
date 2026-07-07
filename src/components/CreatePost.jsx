import { useEffect, useRef, useState } from 'react';
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ImagePlus,
  X,
} from 'lucide-react';
import PostPreview from './PostPreview.jsx';
import AppLogo from './AppLogo.jsx';

const MAX_LEN = 3000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export default function CreatePost({ connected, profile, goToSettings }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
    };
  }, [image?.previewUrl]);

  const clearImage = () => {
    if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setStatus({ type: 'error', message: 'Use a JPG, PNG, or GIF image.' });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setStatus({ type: 'error', message: 'Image must be 10 MB or smaller.' });
      return;
    }

    setStatus(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      const base64 = result.split(',')[1];
      setImage((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return {
          previewUrl: URL.createObjectURL(file),
          data: base64,
          mimeType: file.type,
          name: file.name,
        };
      });
    };
    reader.onerror = () => {
      setStatus({ type: 'error', message: 'Could not read that image.' });
    };
    reader.readAsDataURL(file);
  };

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
    if ((!text.trim() && !image) || publishing) return;
    setPublishing(true);
    setStatus(null);
    try {
      const payload = image ? { data: image.data, mimeType: image.mimeType } : null;
      const result = await window.zefPulse.publishPost(text, payload);
      if (result.success) {
        setStatus({ type: 'success', message: 'Published to LinkedIn.' });
        setText('');
        clearImage();
      } else {
        setStatus({ type: 'error', message: result.error || 'Publish failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Publish failed.' });
    } finally {
      setPublishing(false);
    }
  };

  const canPublish = (text.trim() || image) && !publishing;

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-5">
            <AppLogo size="lg" />
          </div>
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
      <div className="flex items-center gap-3 mb-6">
        <AppLogo size="sm" />
        <div>
          <h1 className="font-display text-2xl text-ink leading-tight">Create post</h1>
          <p className="text-sm text-ink/50">Write on the left, see exactly what ships on the right.</p>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        <div className="flex-1 flex flex-col">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
            placeholder="What do you want to share with your network?"
            className="w-full h-64 resize-none rounded-lg border border-line bg-paper p-4 text-[14px] leading-[1.5] text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
            onChange={handleImageSelect}
          />

          {image ? (
            <div className="mt-3 relative inline-block max-w-full">
              <img
                src={image.previewUrl}
                alt="Post attachment preview"
                className="max-h-44 rounded-lg border border-line object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 p-1 rounded-full bg-ink/75 text-canvas hover:bg-ink transition-colors"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
              <div className="mt-1 text-[11px] text-ink/45 truncate max-w-xs">{image.name}</div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-line bg-paper text-sm text-ink/70 hover:border-brand/40 hover:text-brand-dim hover:bg-brand-tint/40 transition-colors"
            >
              <ImagePlus size={16} />
              Add image from your PC
            </button>
          )}

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
              disabled={!canPublish}
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

        <PostPreview text={text} imageUrl={image?.previewUrl} profile={profile} />
      </div>
    </div>
  );
}
