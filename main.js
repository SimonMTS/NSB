const { app, BrowserWindow, globalShortcut  } = require('electron');

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

    win.removeMenu();
    win.loadFile('page/index.html');

    globalShortcut.register('num1', () => { win.webContents.executeJavaScript("playAudioGlobal(1)"); });
    globalShortcut.register('num2', () => { win.webContents.executeJavaScript("playAudioGlobal(2)"); }); 
    globalShortcut.register('num3', () => { win.webContents.executeJavaScript("playAudioGlobal(3)"); }); 
    globalShortcut.register('num4', () => { win.webContents.executeJavaScript("playAudioGlobal(4)"); }); 
    globalShortcut.register('num5', () => { win.webContents.executeJavaScript("playAudioGlobal(5)"); }); 
    globalShortcut.register('num6', () => { win.webContents.executeJavaScript("playAudioGlobal(6)"); }); 
    globalShortcut.register('num7', () => { win.webContents.executeJavaScript("playAudioGlobal(7)"); }); 
    globalShortcut.register('num8', () => { win.webContents.executeJavaScript("playAudioGlobal(8)"); }); 
    globalShortcut.register('num9', () => { win.webContents.executeJavaScript("playAudioGlobal(9)"); }); 


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

app.on('will-quit', () => {
    globalShortcut.unregisterAll()
});