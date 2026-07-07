const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('zefPulse', {
  authStatus: () => ipcRenderer.invoke('auth:status'),
  login: (clientId, clientSecret) => ipcRenderer.invoke('auth:login', { clientId, clientSecret }),
  logout: () => ipcRenderer.invoke('auth:logout'),
  publishPost: (text, image) => ipcRenderer.invoke('post:publish', { text, image }),
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
  aiStatus: () => ipcRenderer.invoke('ai:getStatus'),
  setAiKey: (provider, apiKey) => ipcRenderer.invoke('ai:setKey', { provider, apiKey }),
  clearAiKey: () => ipcRenderer.invoke('ai:clearKey'),
  punchUp: (text) => ipcRenderer.invoke('ai:punchUp', { text }),
  windowControls: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
});
