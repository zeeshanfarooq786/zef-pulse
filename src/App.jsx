import { useEffect, useState } from 'react';
import TitleBar from './components/TitleBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import CreatePost from './components/CreatePost.jsx';
import Settings from './components/Settings.jsx';

export default function App() {
  const [view, setView] = useState('create');
  const [connected, setConnected] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.zefPulse.authStatus().then((res) => {
      setConnected(res.connected);
      setProfile(res.profile || null);
      if (!res.connected) setView('settings');
      setLoading(false);
    });
  }, []);

  const handleConnected = (profile) => {
    setConnected(true);
    setProfile(profile);
    setView('create');
  };

  const handleDisconnect = async () => {
    await window.zefPulse.logout();
    setConnected(false);
    setProfile(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-canvas">
        <TitleBar />
        <div className="flex-1" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-canvas overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar view={view} setView={setView} connected={connected} profile={profile} />
        {view === 'create' ? (
          <CreatePost connected={connected} profile={profile} goToSettings={() => setView('settings')} />
        ) : (
          <Settings
            connected={connected}
            profile={profile}
            onConnected={handleConnected}
            onDisconnect={handleDisconnect}
          />
        )}
      </div>
    </div>
  );
}
