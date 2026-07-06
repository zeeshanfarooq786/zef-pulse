const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('zefPulse', {
  authStatus: () => ipcRenderer.invoke('auth:status'),
  login: (clientId, clientSecret) => ipcRenderer.invoke('auth:login', { clientId, clientSecret }),
  logout: () => ipcRenderer.invoke('auth:logout'),
  publishPost: (text) => ipcRenderer.invoke('post:publish', { text }),
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
  aiStatus: () => ipcRenderer.invoke('ai:getStatus'),
  setAiKey: (apiKey) => ipcRenderer.invoke('ai:setKey', apiKey),
  clearAiKey: () => ipcRenderer.invoke('ai:clearKey'),
  punchUp: (text) => ipcRenderer.invoke('ai:punchUp', { text }),
  windowControls: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
});
