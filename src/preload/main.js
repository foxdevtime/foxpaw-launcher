const { app, BrowserWindow } = require('electron');
const path = require('path');
const { checkForUpdates } = require('../core/update/autoUpdate');
const packageJson = require('../../package.json');

let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/preload.js'),
        },
        icon: path.join(__dirname, '../../assets/icons/icon.png'),
    });

    mainWindow.loadFile(path.join(__dirname, '../windows/main/index.html'));

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('version', packageJson.version);
        checkForUpdates(mainWindow); // Проверяем обновления после загрузки
    });

    // mainWindow.webContents.openDevTools(); // Уберите, если не нужно
}

app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});