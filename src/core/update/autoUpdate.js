const { autoUpdater } = require("electron-updater");
const { BrowserWindow } = require("electron");
const path = require("path");

let progressWindow;

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
    autoUpdater.checkForUpdates();

    autoUpdater.on("checking-for-update", () => {
        console.log("Checking for updates...");
    });

    autoUpdater.on("update-available", () => {
        console.log("Update available!");
        createProgressWindow();
        mainWindow.hide();
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
        }
        autoUpdater.quitAndInstall();
    });

    autoUpdater.on("error", (err) => {
        console.error("Update error:", err);
        if (progressWindow) {
            progressWindow.close();
        }
        mainWindow.show();
    });
}

module.exports = { checkForUpdates };