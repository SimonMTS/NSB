const { app, BrowserWindow } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
    win = new BrowserWindow({
        width: 600,
        height: 800,
        frame: false,
        backgroundColor: '#212121',
        webPreferences: {
            nodeIntegration: true,
            preload: './preload.js'
        },
        icon: './page/logo.png'
    });

    win.loadFile('page/index.html');
    win.removeMenu();

    // win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});