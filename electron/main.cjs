const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const store = require('./store.cjs');
const oauth = require('./oauth.cjs');
const linkedin = require('./linkedinApi.cjs');
const aiPolish = require('./aiPolish.cjs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 860,
    minHeight: 560,
    frame: false,
    backgroundColor: '#F6F4EF',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: process.env.NODE_ENV === 'development',
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Electron has no native right-click menu by default. Build a minimal one
  // ourselves so Cut/Copy/Paste/Select All work in text fields, without
  // pulling in a third-party package (electron-context-menu is ESM-only in
  // recent versions and breaks when required from compiled/CommonJS code).
  mainWindow.webContents.on('context-menu', (_event, params) => {
    const menu = Menu.buildFromTemplate([
      { role: 'cut', enabled: params.editFlags.canCut },
      { role: 'copy', enabled: params.editFlags.canCopy },
      { role: 'paste', enabled: params.editFlags.canPaste },
      { type: 'separator' },
      { role: 'selectAll', enabled: params.editFlags.canSelectAll },
    ]);
    menu.popup();
  });
}

app.whenReady().then(() => {
  createWindow();
  // Checks your GitHub Releases for a newer published version and installs
  // it in the background; the update applies next time the app restarts.
  // No-ops harmlessly during local development.
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---- Window controls (custom title bar) ----
ipcMain.handle('window:minimize', () => mainWindow.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle('window:close', () => mainWindow.close());
ipcMain.handle('app:openExternal', (_e, url) => shell.openExternal(url));

// ---- Auth ----
ipcMain.handle('auth:status', () => {
  const saved = store.load();
  if (!saved?.accessToken) return { connected: false };
  return { connected: true, profile: saved.profile };
});

ipcMain.handle('auth:login', async (_e, { clientId, clientSecret }) => {
  try {
    const code = await oauth.waitForAuthorizationCode(clientId);
    const tokenResponse = await oauth.exchangeCodeForToken({ code, clientId, clientSecret });
    const userInfo = await linkedin.fetchUserInfo(tokenResponse.access_token);

    store.patch({
      accessToken: tokenResponse.access_token,
      personUrn: userInfo.urn,
      clientId,
      clientSecret,
      profile: { name: userInfo.name, picture: userInfo.picture },
    });

    return { success: true, profile: { name: userInfo.name, picture: userInfo.picture } };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('auth:logout', () => {
  store.remove(['accessToken', 'personUrn', 'clientId', 'clientSecret', 'profile']);
  return { success: true };
});

// ---- AI polish ----
ipcMain.handle('ai:getStatus', () => {
  const saved = store.load();
  return {
    hasKey: !!saved?.aiApiKey,
    provider: saved?.aiProvider || 'anthropic',
  };
});

ipcMain.handle('ai:setKey', (_e, { provider, apiKey }) => {
  store.patch({ aiProvider: provider || 'anthropic', aiApiKey: apiKey });
  return { success: true };
});

ipcMain.handle('ai:clearKey', () => {
  store.remove(['aiApiKey', 'aiProvider']);
  return { success: true };
});

ipcMain.handle('ai:punchUp', async (_e, { text }) => {
  const saved = store.load();
  if (!saved?.aiApiKey) {
    return { success: false, error: 'Add an AI API key in Settings first.' };
  }
  const provider = saved.aiProvider || 'anthropic';
  try {
    const rewritten = await aiPolish.punchUp({ provider, apiKey: saved.aiApiKey, text });
    return { success: true, text: rewritten };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ---- Posting ----
ipcMain.handle('post:publish', async (_e, { text, image }) => {
  const saved = store.load();
  if (!saved?.accessToken) {
    return { success: false, error: 'Not connected to LinkedIn.' };
  }
  if (!text?.trim() && !image?.data) {
    return { success: false, error: 'Add some text or an image before publishing.' };
  }
  try {
    const { postId } = await linkedin.publishPost({
      accessToken: saved.accessToken,
      personUrn: saved.personUrn,
      text: text || '',
      image,
    });
    return { success: true, postId };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
