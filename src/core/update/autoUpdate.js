const { autoUpdater } = require("electron-updater");
const { BrowserWindow, app } = require("electron");
const path = require("path");

let progressWindow;

async function createProgressWindow() {
    console.log('Creating progress window');
    if (progressWindow && !progressWindow.isDestroyed()) {
        console.log('Closing existing progress window');
        progressWindow.close();
    }
    progressWindow = new BrowserWindow({
        width: 400,
        height: 200,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    const filePath = path.join(__dirname, "../../windows/progress/progress.html");
    console.log('Loading progress file:', filePath);
    await progressWindow.loadFile(filePath);
    console.log('Progress window loaded');
    progressWindow.show();
}

function checkForUpdates(updaterWindow, callback) {
    autoUpdater.autoDownload = false;
    autoUpdater.checkForUpdates();

    autoUpdater.on("checking-for-update", () => {
        console.log("Проверка обновлений...");
        updaterWindow.webContents.send('update-status', 'Проверка обновлений...');
    });

    autoUpdater.on("update-available", (info) => {
        console.log("Доступно обновление:", info.version);
        callback({ isUpdateAvailable: true, version: info.version });
    });

    autoUpdater.on("update-not-available", (info) => {
        console.log("Обновлений нет. Текущая версия:", app.getVersion());
        callback({ isUpdateAvailable: false });
    });

    autoUpdater.on("download-progress", (progressObj) => {
        let percent = Math.floor(progressObj.percent);
        console.log(`Прогресс загрузки: ${percent}%`);
        if (progressWindow && !progressWindow.isDestroyed()) {
            progressWindow.webContents.send("update-progress", percent);
        }
    });

    autoUpdater.on("update-downloaded", () => {
        console.log("Обновление загружено!");
        if (progressWindow && !progressWindow.isDestroyed()) {
            progressWindow.close();
            progressWindow = null;
        }
        autoUpdater.quitAndInstall();
    });

    autoUpdater.on("error", (err) => {
        console.error("Ошибка обновления:", err);
        if (progressWindow && !progressWindow.isDestroyed()) {
            progressWindow.close();
            progressWindow = null;
        }
        updaterWindow.webContents.send('update-status', 'Ошибка обновления');
        callback({ isUpdateAvailable: false, error: err });
    });
}

module.exports = { checkForUpdates, createProgressWindow };