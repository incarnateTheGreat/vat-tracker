// import { app, BrowserWindow } from "electron";
// import isDev from "electron-is-dev";
// import path from "path";

const { app, BrowserWindow } = require("electron");
const electron = require("electron");

const path = require("path");
const isDev = require("electron-is-dev");
const url = require("url");

function createWindow() {
  var screenElectron = electron.screen;
  var mainScreen = screenElectron.getPrimaryDisplay();
  var { width, height } = mainScreen.size;

  // Create the browser window.
  const win = new BrowserWindow({
    width: width * 0.8,
    height: height * 0.8,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  // and load the index.html of the app.
  win.loadURL(
    isDev
      ? "http://localhost:4321"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // win.loadURL(
  //   isDev
  //     ? "http://localhost:4321"
  //     : url.format({
  //         pathname: path.join(__dirname, "/build/index.html"),
  //         protocol: "file",
  //         slashes: true,
  //       })
  // );

  // win.loadFile(`file://${path.join(__dirname, "../build/index.html")}`);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
