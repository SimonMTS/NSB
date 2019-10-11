const { app, BrowserWindow, globalShortcut  } = require('electron');
const ioHook = require('iohook');

// to build : npm run dist

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
            nodeIntegration: true
        },
        icon: './page/logo.png'
    });

    win.removeMenu();
    win.loadFile('page/index.html');


    numpadNumbers = [ // https://github.com/kwhat/libuiohook/blob/master/include/uiohook.h
        82, // VC_KP_0 0x0052 82
        79, // VC_KP_1 0x004F 79
        80, // VC_KP_2 0x0050 80
        81, // VC_KP_3 0x0051 81
        75, // VC_KP_4 0x004B 75
        76, // VC_KP_5 0x004C 76
        77, // VC_KP_6 0x004D 77
        71, // VC_KP_7 0x0047 71
        72, // VC_KP_8 0x0048 72
        73  // VC_KP_9 0x0049 73
    ];

    for ( i = 1; i <= 9; i++ ) {

        ioHook.registerShortcut([82, numpadNumbers[i]], (keys) => {
            win.webContents.executeJavaScript("playAudioGlobal("+numpadNumbers.indexOf(parseInt(keys[0]))+")");
        });

    }

    ioHook.registerShortcut([82, 83], (keys) => {
        win.webContents.executeJavaScript("stopAudio()");
    });

    ioHook.start();

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