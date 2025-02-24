const { autoUpdater } = require("electron-updater");
const { BrowserWindow, dialog } = require("electron");
const path = require("path");

let progressWindow;
let mainWindowRef;

function createProgressWindow() {
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
    progressWindow.loadFile(path.join(__dirname, "../../windows/progress/progress.html"));
}

function checkForUpdates(mainWindow) {
    mainWindowRef = mainWindow;
    autoUpdater.checkForUpdates();

    autoUpdater.on("checking-for-update", () => {
        console.log("Checking for updates...");
    });

    autoUpdater.on("update-available", () => {
        console.log("Update available!");
        showUpdateDialog(info);
    });

    autoUpdater.on("update-not-available", () => {
        console.log("No updates available.");
        mainWindow.show();
    });

    autoUpdater.on("download-progress", (progressObj) => {
        let percent = Math.floor(progressObj.percent);
        console.log(`Download progress: ${percent}%`);
        if (progressWindow) {
            progressWindow.webContents.send("update-progress", percent);
        }
    });

    autoUpdater.on("update-downloaded", () => {
        console.log("Update downloaded!");
        if (progressWindow) {
            progressWindow.close();
            progressWindow = null;
        }
        autoUpdater.quitAndInstall(); // Устанавливаем после загрузки
    });

    autoUpdater.on("error", (err) => {
        console.error("Update error:", err);
        if (progressWindow) {
            progressWindow.close();
            progressWindow = null;
        }
        mainWindow.show();
    });
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

    dialog.showMessageBox(mainWindowRef, options).then((response) => {
        if (response.response === 0) { // "Да"
            console.log("Пользователь согласился на обновление");
            createProgressWindow();
            mainWindowRef.hide();
            autoUpdater.downloadUpdate(); // Начинаем загрузку
        } else {
            console.log("Пользователь отказался от обновления");
            mainWindowRef.show();
        }
    });
}

module.exports = { checkForUpdates };