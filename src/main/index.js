import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import { format as formatUrl } from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production';

const configFilter = { name: 'Picture', extensions: ['png', 'jpg', 'jpeg'] };
const darwinMenu = {
  label: 'License Plate Identifier',
  submenu: [
    { role: 'about' },
    { type: 'separator' },
    {
      role: 'services',
      submenu: [],
    },
    { type: 'separator' },
    { role: 'hide' },
    { role: 'hideothers' },
    { role: 'unhide' },
    { type: 'separator' },
    { role: 'quit' },
  ],
};
const menu = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File...',
        accelerator: 'CommandOrControl+O',
        click() { loadConfig(); },
      },
      { type: 'separator' },
      { role: 'close' },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'selectall' },
    ],
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'toggledevtools' },
    ],
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
    ],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Help',
        click() { shell.openExternal('https://github.com/iamkishann/license-plate-identifier'); },
      },
    ],
  },
];

let window;

function createMainWindow() {
  window = new BrowserWindow({
    title: 'NGCP Ground Control Station',
    show: false,
  });

  if (isDevelopment) {
    window.webContents.openDevTools();
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(formatUrl({
      pathname: path.resolve(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true,
    }));
  }

  // window.maximize();

  window.on('ready-to-show', () => {
    window.show();
    window.focus();
  });

  window.on('close', event => {
    event.preventDefault();
    window.hide();
  });

  window.on('closed', () => {
    window = null;
  });

  return window;
}

function createMenu() {
  if (process.platform === 'darwin') {
    menu.unshift(darwinMenu);
  } else {
    menu.push({ type: 'separator' }, { role: 'quit' });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

function loadConfig() {
  const filePaths = dialog.showOpenDialog(window, {
    title: 'Open Configuration',
    filters: [configFilter],
    properties: ['openFile', 'createDirectory'],
  });

  if (!filePaths || filePaths.length === 0) return;

  const data = fs.readFileSync(filePaths[0]);

  if (!data) return;

  window.webContents.send('loadConfig', data);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (window === null) {
    createMainWindow();
  } else {
    window.show();
  }
});

app.on('ready', () => {
  createMainWindow();
  createMenu();
});

ipcMain.on('post', (event, notification, data) => window.webContents.send(notification, data));
