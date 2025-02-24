const { autoUpdater } = require("electron-updater");
const { BrowserWindow, dialog, app } = require("electron");
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
    // autoUpdater.allowPrerelease = true;
    autoUpdater.checkForUpdates();

    autoUpdater.on("checking-for-update", () => {
        console.log("Проверка обновлений...");
    });

    autoUpdater.on("update-available", (info) => { // Явно принимаем info
        console.log("Доступно обновление:", info.version);
        showUpdateDialog(info);
    });

    autoUpdater.on("update-not-available", (info) => { // Добавляем info для отладки
        console.log("Обновлений нет. Текущая версия:", app.getVersion(), "Доступная версия:", info?.version || "неизвестно");
        mainWindowRef.show();
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
        if (response.response === 0) {
            console.log("Пользователь согласился на обновление");
            createProgressWindow();
            mainWindowRef.hide();
            autoUpdater.downloadUpdate();
        } else {
            console.log("Пользователь отказался от обновления");
            mainWindowRef.show();
        }
    });
}

module.exports = { checkForUpdates };