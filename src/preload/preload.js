const { contextBridge, ipcRenderer } = require('electron');

// Экспонируем API для рендерера
contextBridge.exposeInMainWorld('electronAPI', {
    onApiData: (callback) => ipcRenderer.on('api-data', callback),
});