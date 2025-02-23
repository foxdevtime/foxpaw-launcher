const { app, BrowserWindow } = require("electron");
const path = require("path");
const { checkForUpdates } = require("../core/update/autoUpdate");

require("dotenv").config(); // Загружаем .env, если нужно

let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, "../../assets/icons/icon.png"),
    });

    mainWindow.loadFile(path.join(__dirname, "../windows/main/index.html"));

    // Проверяем обновления
    checkForUpdates(mainWindow);
}

app.whenReady().then(() => {
    createMainWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});