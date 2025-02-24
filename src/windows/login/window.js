// windows/login/window.js

const { BrowserWindow } = require('electron');
const path = require('path');

class LoginWindow {
    constructor() {
        this.window = new BrowserWindow({
            width: 440,
            height: 450,
            resizable: false,
            frame: false,
            transparent: true,
            webPreferences: {
                preload: path.join(__dirname, '../../preload/login.js'),
                contextIsolation: true,
                sandbox: true,
            },
        });

        this.window.loadFile(path.join(__dirname, '../../windows/login/index.html'));

        this.window.on('closed', () => {
            this.window = null;
        });
    }

    show() {
        this.window.show();
    }

    close() {
        if (this.window) {
            this.window.close();
        }
    }
}

module.exports = { LoginWindow };