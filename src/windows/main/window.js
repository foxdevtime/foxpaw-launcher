// windows/main/window.js
const { BrowserWindow } = require('electron');
const path = require('path');

function createMainWindow() {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../../preload/preload.js'),
        },
        icon: path.join(__dirname, '../../assets/icons/icon.png'),
    });
    window.loadFile(path.join(__dirname, 'index.html'));
    return window;
}

module.exports = { createMainWindow };