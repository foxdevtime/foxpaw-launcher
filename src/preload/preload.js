const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded');

contextBridge.exposeInMainWorld('electronAPI', {
    onApiData: (callback) => ipcRenderer.on('api-data', callback),
    onVersion: (callback) => ipcRenderer.on('version', (event, version) => callback(version)),
});