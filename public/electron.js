const electron = require('electron');
const {app, BrowserWindow, Menu} = electron;

const {ipcMain} = electron;

require('electron-reload')(__dirname);

const isDev = require('electron-is-dev');

const path = require('path');
const url = require('url');


let mainWindow;

function createMainWindow() {
  // Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780
  });

  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'investments',
      protocol: 'file',
      slashes: true,
  });
  console.log(isDev);
  // Load html into window
  mainWindow.loadURL(isDev ? 'http://localhost:3000/#/investments' : fileURL);

  mainWindow.on('closed', ()=> mainWindow=null);

  mainWindow.webContents.openDevTools();

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  // insert menu
  Menu.setApplicationMenu(mainMenu);
}

app.on('ready', createMainWindow);

ipcMain.on('viewEvents', () => {
  console.log('HELLO EVENTS');
  // Create new window
  let newWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780
  });

  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'events',
      protocol: 'file',
      slashes: true,
  });
  console.log(isDev);
  // Load html into window
  newWindow.loadURL(isDev ? 'http://localhost:3000/#/events' : fileURL);

  newWindow.on('closed', ()=> newWindow=null);

  newWindow.webContents.openDevTools();

});

ipcMain.on('viewTransactions', () => {
  // Create new window
  let newWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780
  });

  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'transactions',
      protocol: 'file',
      slashes: true,
  });

  // Load html into window
  newWindow.loadURL(isDev ? 'http://localhost:3000/#/transactions' : fileURL);

  newWindow.on('closed', ()=> newWindow=null);

  newWindow.webContents.openDevTools();

});

ipcMain.on('popup', (event, args) => {
  // Create new window
  let newWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780
  });

  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'popup',
      protocol: 'file',
      slashes: true,
  });

  // Load html into window
  newWindow.loadURL(isDev ? 'http://localhost:3000/#/popup' : fileURL);

  newWindow.on('closed', ()=> newWindow=null);

  newWindow.webContents.openDevTools();
  newWindow.webContents.on('did-finish-load', () => {
    newWindow.webContents.send('message', args);
  });

});

function loadMaintenanceAccountInvestmentView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'maintenance/accountInvestment',
      protocol: 'file',
      slashes: true,
  });

  // Load html into window
  mainWindow.loadURL(isDev ? 'http://localhost:3000/#/maintenance/accountInvestment' : fileURL);

};

function loadMaintenanceAssetsBenchmarksOwnersView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'maintenance/AssetsBenchmarksOwners',
      protocol: 'file',
      slashes: true,
  });

  // Load html into window
  mainWindow.loadURL(isDev ? 'http://localhost:3000/#/maintenance/AssetsBenchmarksOwners' : fileURL);

};


function loadCalendarView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'calendar',
      protocol: 'file',
      slashes: true,
  });

  // Load html into window
  mainWindow.loadURL(isDev ? 'http://localhost:3000/#/calendar' : fileURL);

};

function loadInvestmentView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'investments',
      protocol: 'file',
      slashes: true,
  });

  // Load html into window
  mainWindow.loadURL(isDev ? 'http://localhost:3000/#/investments' : fileURL);
};


const isMac = process.platform === 'darwin'


// https://www.electronjs.org/docs/api/menu
const mainMenuTemplate = [
  { role: 'appMenu' },
  { role: 'fileMenu' },
  { role: 'editMenu' },
  {label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      {
        label: 'Investment View',
        click() {
          loadInvestmentView();
        }
      },
      {
        label: 'Maintain Accounts and Investments',
        click() {
          loadMaintenanceAccountInvestmentView();
        }
      },
      {
        label: 'Maintain Owners, Benchmarks, and Asset Classes',
        click() {
          loadMaintenanceAssetsBenchmarksOwnersView();
        }
      },
      {
        label: 'Calendar View',
        click() {
          loadCalendarView();
        }
      }
    ]
  },
  { role: 'windowMenu' },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});
