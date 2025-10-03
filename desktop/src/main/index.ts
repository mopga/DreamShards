import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';
import url from 'node:url';

const isDev = !app.isPackaged;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, '..', 'public', 'index.html'),
        protocol: 'file:',
        slashes: true,
      }),
    );
  }

  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url: externalUrl }) => {
    shell.openExternal(externalUrl);
    return { action: 'deny' };
  });
};

app.whenReady().then(() => {
  app.on('web-contents-created', (_event, contents) => {
    contents.once('dom-ready', () => {
      if (!contents.getURL().startsWith('devtools://')) {
        return;
      }

      contents.on('console-message', (event, level, message) => {
        if (
          level >= 2 &&
          (message.includes("'Autofill.enable' wasn't found") ||
            message.includes("'Autofill.setAddresses' wasn't found"))
        ) {
          event.preventDefault?.();
        }
      });
    });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
