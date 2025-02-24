const { autoUpdater } = require("electron-updater");
const { BrowserWindow, app } = require("electron");
const path = require("path");

let progressWindow;

function createProgressWindow() {
    console.log('Creating progress window');
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
    progressWindow.loadFile(filePath).then(() => {
        console.log('Progress window loaded');
    }).catch(err => {
        console.error('Failed to load progress window:', err);
    });
    progressWindow.show(); // Явно показываем окно
}

function checkForUpdates(updaterWindow, callback) {
    autoUpdater.autoDownload = false;
    // autoUpdater.allowPrerelease = true; // Раскомментируйте для пререлизов
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
        console.log("Обновлений нет. Текущая версия:", app.getVersion(), "Доступная версия:", info?.version || "неизвестно");
        callback({ isUpdateAvailable: false });
    });

    autoUpdater.on("download-progress", (progressObj) => {
        let percent = Math.floor(progressObj.percent);
        console.log(`Прогресс загрузки: ${percent}%`);
        if (progressWindow) {
            progressWindow.webContents.send("update-progress", percent);
        }
    });

    autoUpdater.on("update-downloaded", () => {
        console.log("Обновление загружено!");
        if (progressWindow) {
            progressWindow.close();
            progressWindow = null;
        }
        autoUpdater.quitAndInstall();
    });

    autoUpdater.on("error", (err) => {
        console.error("Ошибка обновления:", err);
        if (progressWindow) {
            progressWindow.close();
            progressWindow = null;
        }
        updaterWindow.webContents.send('update-status', 'Ошибка обновления');
        callback({ isUpdateAvailable: false, error: err });
    });

    updaterWindow.webContents.on('did-finish-load', () => {
        console.log('Updater window ready for IPC');
        updaterWindow.webContents.on('ipc-message', (event, channel) => {
            if (channel === 'start-update') {
                console.log('Received start-update IPC message');
                console.log('Starting update download');
                createProgressWindow();
                if (updaterWindow && !updaterWindow.isDestroyed()) {
                    updaterWindow.hide();
                    console.log('Updater window hidden');
                } else {
                    console.log('Updater window already destroyed');
                }
                autoUpdater.downloadUpdate().then(() => {
                    console.log('Download started successfully');
                }).catch(err => {
                    console.error('Download failed:', err);
                });
            } else {
                console.log('Received unexpected IPC message:', channel);
            }
        });
    });
}

module.exports = { checkForUpdates };