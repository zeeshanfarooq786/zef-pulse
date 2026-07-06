import { useEffect, useState } from 'react';
import { Loader2, ExternalLink, CheckCircle2, Sparkles } from 'lucide-react';

export default function Settings({ connected, profile, onConnected, onDisconnect }) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const [aiKey, setAiKey] = useState('');
  const [hasAiKey, setHasAiKey] = useState(false);
  const [savingAiKey, setSavingAiKey] = useState(false);

  useEffect(() => {
    window.zefPulse.aiStatus().then((res) => setHasAiKey(res.hasKey));
  }, []);

  const handleSaveAiKey = async () => {
    if (!aiKey.trim()) return;
    setSavingAiKey(true);
    await window.zefPulse.setAiKey(aiKey.trim());
    setHasAiKey(true);
    setAiKey('');
    setSavingAiKey(false);
  };

  const handleClearAiKey = async () => {
    await window.zefPulse.clearAiKey();
    setHasAiKey(false);
  };

  const handleConnect = async () => {
    if (!clientId.trim() || !clientSecret.trim()) return;
    setConnecting(true);
    setError(null);
    try {
      const result = await window.zefPulse.login(clientId.trim(), clientSecret.trim());
      if (result.success) {
        onConnected(result.profile);
      } else {
        setError(result.error || 'Could not connect.');
      }
    } catch (err) {
      setError(err.message || 'Could not connect.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto max-w-2xl">
      <h1 className="font-display text-2xl text-ink mb-1">Settings</h1>
      <p className="text-sm text-ink/50 mb-6">Connect the LinkedIn account you want to post as.</p>

      {connected ? (
        <div className="bg-paper border border-line rounded-lg p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-ok" size={20} />
            <div>
              <div className="text-sm font-semibold text-ink">{profile?.name || 'Connected'}</div>
              <div className="text-xs text-ink/50">Ready to publish</div>
            </div>
          </div>
          <button
            onClick={onDisconnect}
            className="text-sm text-err font-medium hover:underline"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <>
          <div className="bg-paper border border-line rounded-lg p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">1. Bring your own LinkedIn app</h2>
            <p className="text-xs text-ink/55 leading-relaxed mb-3">
              To keep your account credentials yours alone, Zef Pulse asks you to create a free
              LinkedIn Developer app once. It takes about two minutes.
            </p>
            <ol className="text-xs text-ink/60 leading-relaxed list-decimal list-inside space-y-1 mb-3">
              <li>Open the LinkedIn Developer Portal and create an app</li>
              <li>Under Products, request "Share on LinkedIn"</li>
              <li>
                Under Auth, add this exact redirect URL:{' '}
                <code className="bg-canvas px-1.5 py-0.5 rounded font-mono text-[11px]">
                  http://127.0.0.1:4321/callback
                </code>
              </li>
              <li>Copy the Client ID and Client Secret into the fields below</li>
            </ol>
            <a
              href="https://www.linkedin.com/developers/apps/new"
              onClick={(e) => {
                e.preventDefault();
                window.zefPulse.openExternal('https://www.linkedin.com/developers/apps/new');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-dim hover:underline"
            >
              Open LinkedIn Developer Portal <ExternalLink size={12} />
            </a>
          </div>

          <div className="bg-paper border border-line rounded-lg p-5 mt-4 space-y-3">
            <h2 className="text-sm font-semibold text-ink mb-1">2. Connect</h2>
            <div>
              <label className="text-xs font-medium text-ink/60">Client ID</label>
              <input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full mt-1 rounded border border-line bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                placeholder="86xxxxxxxxxxxx"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60">Client Secret</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full mt-1 rounded border border-line bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                placeholder="••••••••••••••••"
              />
            </div>
            {error && <div className="text-xs text-err font-medium">{error}</div>}
            <button
              onClick={handleConnect}
              disabled={!clientId.trim() || !clientSecret.trim() || connecting}
              className="flex items-center gap-2 px-4 py-2 rounded bg-ink text-canvas text-sm font-medium hover:bg-ink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {connecting && <Loader2 size={14} className="animate-spin" />}
              {connecting ? 'Waiting for LinkedIn…' : 'Connect LinkedIn account'}
            </button>
            <p className="text-[11px] text-ink/40">
              Stored encrypted on this device only. Never sent anywhere but LinkedIn.
            </p>
          </div>
        </>
      )}

      <div className="bg-paper border border-line rounded-lg p-5 mt-6">
        <h2 className="text-sm font-semibold text-ink mb-1 flex items-center gap-2">
          <Sparkles size={15} className="text-brand-dim" />
          AI polish (optional)
        </h2>
        <p className="text-xs text-ink/55 leading-relaxed mb-3">
          Adds a "Punch it up" button on the Create Post screen that rewrites your draft
          with more personality and emoji, using your own Anthropic API key.
        </p>

        {hasAiKey ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-ok font-medium">
              <CheckCircle2 size={16} />
              API key saved
            </div>
            <button onClick={handleClearAiKey} className="text-sm text-err font-medium hover:underline">
              Remove key
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="password"
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full rounded border border-line bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            />
            <div className="flex items-center justify-between">
              <a
                href="https://console.anthropic.com/settings/keys"
                onClick={(e) => {
                  e.preventDefault();
                  window.zefPulse.openExternal('https://console.anthropic.com/settings/keys');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-dim hover:underline"
              >
                Get an API key <ExternalLink size={12} />
              </a>
              <button
                onClick={handleSaveAiKey}
                disabled={!aiKey.trim() || savingAiKey}
                className="flex items-center gap-2 px-4 py-2 rounded bg-ink text-canvas text-sm font-medium hover:bg-ink-600 disabled:opacity-40 transition-colors"
              >
                {savingAiKey && <Loader2 size={14} className="animate-spin" />}
                Save key
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
