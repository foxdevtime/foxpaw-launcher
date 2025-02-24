const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { checkForUpdates } = require('../core/update/autoUpdate');
const packageJson = require('../../package.json');
const { LoginWindow } = require('../windows/login/window');
const AuthManager = require('../core/auth/authManager');
const { createMainWindow: createLauncherMainWindow } = require('../windows/main/window');

let authManager;
let mainWindow;
let updaterWindow;

function createUpdaterWindow() {
    updaterWindow = new BrowserWindow({
        width: 300,
        height: 200,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    updaterWindow.loadFile(path.join(__dirname, '../windows/updater/updater.html'));

    updaterWindow.webContents.on('did-finish-load', () => {
        console.log('Updater window loaded, starting update check');
        checkForUpdates(updaterWindow, handleUpdateCheck);
    });

    return updaterWindow;
}

function createMainWindow() {
    mainWindow = createLauncherMainWindow();
    mainWindow.webPreferences = {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/preload.js'),
    };
    mainWindow.icon = path.join(__dirname, '../../assets/icons/icon.png');
    mainWindow.loadFile(path.join(__dirname, '../windows/main/index.html'));

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Main window loaded, sending version');
        mainWindow.webContents.send('version', packageJson.version);
    });

    return mainWindow;
}

function handleUpdateCheck(updateInfo) {
    console.log('Handle update check:', updateInfo);
    if (updateInfo && updateInfo.isUpdateAvailable) {
        showUpdateDialog(updateInfo);
    } else {
        console.log('No updates, closing updater window');
        updaterWindow.close();
        console.log('Updater window closed, proceeding to auth');
        proceedToAuth();
    }
}

function showUpdateDialog(updateInfo) {
    const options = {
        type: 'question',
        buttons: ['Да', 'Нет'],
        defaultId: 0,
        title: 'Обновление доступно',
        message: `Найдена новая версия: ${updateInfo.version}. Хотите установить её?`,
        detail: 'Приложение будет перезапущено после установки.',
    };

    console.log('Showing update dialog');
    dialog.showMessageBox(updaterWindow, options).then((response) => {
        if (response.response === 0) {
            console.log("Пользователь согласился на обновление");
            updaterWindow.webContents.send('start-update');
        } else {
            console.log("Пользователь отказался от обновления");
            updaterWindow.close();
            proceedToAuth();
        }
    });
}

function proceedToAuth() {
    console.log('Proceeding to auth, authenticated:', authManager.isAuthenticated());
    if (authManager.isAuthenticated()) {
        mainWindow = createMainWindow();
        console.log('Showing main window');
        mainWindow.show();
    } else {
        const loginWindow = new LoginWindow();
        console.log('Showing login window');
        loginWindow.show();
    }
}

app.whenReady().then(async () => {
    console.log('App ready, initializing auth manager');
    authManager = new AuthManager();
    await authManager.initialize();
    console.log('Auth manager initialized, creating updater window');
    updaterWindow = createUpdaterWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('auth:login', async (_, credentials) => {
    const result = await authManager.login(credentials);
    if (result.success) {
        const loginWindow = BrowserWindow.getAllWindows().find(win => win.isVisible());
        if (loginWindow) loginWindow.close();
        mainWindow = createMainWindow();
        mainWindow.show();
    }
    return result;
});

ipcMain.handle('auth:logout', async () => {
    const result = await authManager.logout();
    if (result.success) {
        if (mainWindow) mainWindow.close();
        const loginWindow = new LoginWindow();
        loginWindow.show();
    }
    return result;
});