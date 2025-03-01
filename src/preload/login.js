// src/preload/login.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auth', {
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
});