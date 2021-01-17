const electron = require('electron');
const {app, BrowserWindow, Menu, dialog} = electron;

const {ipcMain} = electron;

require('electron-reload')(__dirname);

const isDev = require('electron-is-dev');

const path = require('path');
const url = require('url');

global.database = {ip: null, username: null, password: null};


// code to possibly fix Virtual Machine errors
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-software-rasterizer");
// end code to possibly fix Virtual Machine errors

let mainWindow;
let reportWindow;
let maintenanceWindow;

ipcMain.on("setDatabase", ( event, databaseVars ) => {
  global.database = databaseVars;

  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: `investments`,
      protocol: 'file',
      slashes: true,
  });
  // Load html into window
  mainWindow.loadURL(isDev ? `http://localhost:3000/#/investments` : fileURL);

} );


function createMainWindow() {
  // Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780,
    width: 1500,
    height: 900
  });

  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'connection',
      protocol: 'file',
      slashes: true,
  });

  // Load html into window
  mainWindow.loadURL(isDev ? 'http://localhost:3000/#/connection' : fileURL);

  mainWindow.on('closed', ()=> mainWindow=null);

  mainWindow.on('close', (e) => {
    let options  = {
     buttons: ["Yes","No"],
     message: 'Confirm close app?'
    }
    const confirmed = dialog.showMessageBoxSync(options)
    if (confirmed === 1) {
      e.preventDefault();
      return false;
    }
    mainWindow=null;
    app.exit();
  })

  // mainWindow.webContents.openDevTools();

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  // insert menu
  Menu.setApplicationMenu(mainMenu);
}

function createReportWindow() {
  // Create new window
  reportWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780,
    width: 1700,
    height: 1080
  });

  reportWindow.on('closed', ()=> reportWindow=null);
}

function createMaintenanceWindow() {
  // Create new window
  maintenanceWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780,
    width: 1700,
    height: 1000
  });

  maintenanceWindow.on('closed', ()=> maintenanceWindow=null);
}

function redirectToLogin() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'connection',
      protocol: 'file',
      slashes: true,
  });

  // Load html into window
  mainWindow.loadURL(isDev ? 'http://localhost:3000/#/connection' : fileURL);
}

ipcMain.on('viewLogin', (event, args) => {
  redirectToLogin();
})

app.on('ready', () => {
  let loading = new BrowserWindow({show: false, frame: false})

  loading.once('show', () => {
    createMainWindow();
    mainWindow.webContents.once('dom-ready', () => {
      // console.log('main loaded')
      mainWindow.show()
      loading.hide()
      loading.close()
    })
    // long loading html
    // mainWindow.loadURL('http://spacecrafts3d.org')
  })
  loading.loadURL('loading.html')
  loading.show()

});

ipcMain.on('viewEvents', (event, args) => {
  // Create new window
  let newWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780,
    width: 1500,
    height: 800
  });

  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: `events/${args.id}`,
      protocol: 'file',
      slashes: true,
  });

  const eventMenu = Menu.buildFromTemplate(eventMenuTemplate);
  newWindow.setMenu(eventMenu);

  // Load html into window
  newWindow.loadURL(isDev ? `http://localhost:3000/#/events/${args.id}` : fileURL);

  newWindow.on('closed', ()=> newWindow=null);

  // newWindow.webContents.openDevTools();
  newWindow.webContents.on('did-finish-load', () => {
    newWindow.webContents.send('message', args);
  });

});

ipcMain.on('viewTransfers', (event, args) => {
  // Create new window
  let newWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780,
    width: 1500,
    height: 800
  });


  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: `transfers/${args.id}`,
      protocol: 'file',
      slashes: true,
  });

  // Load html into window
  newWindow.loadURL(isDev ? `http://localhost:3000/#/transfers/${args.id}` : fileURL);

  newWindow.on('closed', ()=> newWindow=null);

  // newWindow.webContents.openDevTools();
  newWindow.webContents.on('did-finish-load', () => {
    newWindow.webContents.send('message', args);
  });

});

ipcMain.on('popupEvent', (event, args) => {
  console.log(args.dataID)
  let destURL = `popup/event/${args.investmentID}/${args.linkedInvestment}`;
  if (args.hasCommitment) {
    destURL = `popup/event/commitment/${args.investmentID}/${args.linkedInvestment}`
  }
  if (args.dataID !== undefined && args.hasCommitment) {
    destURL = `popup/event/commitment/edit/${args.investmentID}/${args.dataID}/${args.dataType}`;
  }
  if (args.dataID !== undefined && !args.hasCommitment) {
    destURL = `popup/event/edit/${args.investmentID}/${args.dataID}/${args.dataType}`;
  }
  console.log(destURL)
  // Create new window
  let newWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780,
    width: 1500,
    height: 800
  });

  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: `${destURL}`,
      protocol: 'file',
      slashes: true,
  });
  // Load html into window
  newWindow.loadURL(isDev ? `http://localhost:3000/#/${destURL}` : fileURL);

  newWindow.on('closed', ()=> newWindow=null);

  // newWindow.webContents.openDevTools();
  newWindow.webContents.on('did-finish-load', () => {
    newWindow.webContents.send('popupMessage', args);
  });

});

ipcMain.on('popupNAVEvent', (event, args) => {
  let destURL = `popup/NAVevent/${args.investmentID}`;
  if (args.dataID !== undefined) {
    destURL = `popup/NAVevent/edit/${args.investmentID}/${args.dataID}`;
  }


  // Create new window
  let newWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780,
    width: 1500,
    height: 800
  });

  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: destURL,
      protocol: 'file',
      slashes: true,
  });

  // Load html into window
  newWindow.loadURL(isDev ? `http://localhost:3000/#/${destURL}` : fileURL);

  newWindow.on('closed', ()=> newWindow=null);

  // newWindow.webContents.openDevTools();
  newWindow.webContents.on('did-finish-load', () => {
    newWindow.webContents.send('popupNAVMessage', args);
  });

});

ipcMain.on('popupTransfer', (event, args) => {
  // Create new window
  let newWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780,
    width: 1500,
    height: 800
  });

  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'popup/transfer',
      protocol: 'file',
      slashes: true,
  });

  // Load html into window
  newWindow.loadURL(isDev ? 'http://localhost:3000/#/popup/transfer' : fileURL);

  newWindow.on('closed', ()=> newWindow=null);
  // newWindow.webContents.openDevTools();
  newWindow.webContents.on('did-finish-load', () => {
    newWindow.webContents.send('popupTransferMessage', args);
  });

});

ipcMain.on('popupEditTransfer', (event, args) => {
  let destURL = `popup/transfer/edit/${args.dataID}`;

  // Create new window
  let newWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780,
    width: 1500,
    height: 800
  });

  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: destURL,
      protocol: 'file',
      slashes: true,
  });

  // Load html into window
  newWindow.loadURL(isDev ? `http://localhost:3000/#/${destURL}` : fileURL);

  newWindow.on('closed', ()=> newWindow=null);
  // newWindow.webContents.openDevTools();
  newWindow.webContents.on('did-finish-load', () => {
    newWindow.webContents.send('popupTransferMessage', args);
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

  if (maintenanceWindow === null || maintenanceWindow === undefined) {
    createMaintenanceWindow();
  }

  // Load html into window
  maintenanceWindow.loadURL(isDev ? 'http://localhost:3000/#/maintenance/accountInvestment' : fileURL);

};

function loadMaintenanceAssetsBenchmarksOwnersView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'maintenance/AssetsBenchmarksOwners',
      protocol: 'file',
      slashes: true,
  });

  if (maintenanceWindow === null || maintenanceWindow === undefined) {
    createMaintenanceWindow();
  }

  // Load html into window
  maintenanceWindow.loadURL(isDev ? 'http://localhost:3000/#/maintenance/AssetsBenchmarksOwners' : fileURL);

};

function takeScreenshot() {
  let window = BrowserWindow.getFocusedWindow();
  window.webContents.executeJavaScript("window.print()")
}

function loadBackupView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'backup',
      protocol: 'file',
      slashes: true,
  });

  if (maintenanceWindow === null || maintenanceWindow === undefined) {
    createMaintenanceWindow();
  }

  // Load html into window
  maintenanceWindow.loadURL(isDev ? 'http://localhost:3000/#/backup' : fileURL);

};

function loadTransferView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'transfers',
      protocol: 'file',
      slashes: true,
  });

  // Create new window
  let newWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 780,
    width: 1500,
    height: 900
  });

  // Load html into window
  newWindow.loadURL(isDev ? 'http://localhost:3000/#/transfers' : fileURL);

};

function loadAssetAllocationReportView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'report/assetAllocation',
      protocol: 'file',
      slashes: true,
  });

  if (reportWindow === null || reportWindow === undefined) {
    createReportWindow();
  }

  // Load html into window
  reportWindow.loadURL(isDev ? 'http://localhost:3000/#/report/assetAllocation' : fileURL);

};

function loadSummaryReportView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'report/summary',
      protocol: 'file',
      slashes: true,
  });

  if (reportWindow === null || reportWindow === undefined) {
    createReportWindow();
  }

  // Load html into window
  reportWindow.loadURL(isDev ? 'http://localhost:3000/#/report/summary' : fileURL);

};

function loadSummaryUnexplainedGainReportView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'report/summaryUnexplainedGainReport',
      protocol: 'file',
      slashes: true,
  });

  if (reportWindow === null || reportWindow === undefined) {
    createReportWindow();
  }

  // Load html into window
  reportWindow.loadURL(isDev ? 'http://localhost:3000/#/report/summaryUnexplainedGainReport' : fileURL);

};

function loadSummaryPL_LTDReportView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'report/summaryPL/LTD',
      protocol: 'file',
      slashes: true,
  });

  if (reportWindow === null || reportWindow === undefined) {
    createReportWindow();
  }

  // Load html into window
  reportWindow.loadURL(isDev ? 'http://localhost:3000/#/report/summaryPL/LTD' : fileURL);
};

function loadSummaryPL_MTDReportView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'report/summaryPL/MTD',
      protocol: 'file',
      slashes: true,
  });

  if (reportWindow === null || reportWindow === undefined) {
    createReportWindow();
  }

  // Load html into window
  reportWindow.loadURL(isDev ? 'http://localhost:3000/#/report/summaryPL/MTD' : fileURL);

};


function loadAccountBalanceReportView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'report/accountBalance',
      protocol: 'file',
      slashes: true,
  });

  if (reportWindow === null || reportWindow === undefined) {
    createReportWindow();
  }

  // Load html into window
  reportWindow.loadURL(isDev ? 'http://localhost:3000/#/report/accountBalance' : fileURL);

};

function loadOwnerBalanceReportView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'report/ownerBalance',
      protocol: 'file',
      slashes: true,
  });

  if (reportWindow === null || reportWindow === undefined) {
    createReportWindow();
  }

  // Load html into window
  reportWindow.loadURL(isDev ? 'http://localhost:3000/#/report/ownerBalance' : fileURL);

};

function loadInvestmentNAVReportView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'report/investmentNAV',
      protocol: 'file',
      slashes: true,
  });

  if (reportWindow === null || reportWindow === undefined) {
    createReportWindow();
  }

  // Load html into window
  reportWindow.loadURL(isDev ? 'http://localhost:3000/#/report/investmentNAV' : fileURL);

};

function loadCalendarView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'report/calendar',
      protocol: 'file',
      slashes: true,
  });

  if (reportWindow === null || reportWindow === undefined) {
    createReportWindow();
  }

  // Load html into window
  reportWindow.loadURL(isDev ? 'http://localhost:3000/#/report/calendar' : fileURL);

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

function loadQuickInsertNAVView() {
  const fileURL = url.format({
      pathname: path.join(__dirname,
      '../build/index.html'),
      hash: 'quickNAV',
      protocol: 'file',
      slashes: true,
  });

  if (maintenanceWindow === null || maintenanceWindow === undefined) {
    createMaintenanceWindow();
  }

  // Load html into window
  maintenanceWindow.loadURL(isDev ? 'http://localhost:3000/#/quickNAV' : fileURL);
};


const isMac = process.platform === 'darwin'


// https://www.electronjs.org/docs/api/menu
const mainMenuTemplate = [
  { role: 'appMenu' },
  { label: 'File',
    submenu: [
      {label: 'Print Window',
       click() {
         takeScreenshot();
      }},
      {role: 'close'},
      {role: 'quit'}

    ]
  },
  { role: 'editMenu' },
  { role: 'viewMenu' },
  { label: 'Investments',
    submenu: [
      {
        label: 'Investment View',
        click() {
          loadInvestmentView();
        }
      },
      {
        label: 'Insert NAV View',
        click() {
          loadQuickInsertNAVView();
        }
      }
    ]
  },
  { label: 'Transfers',
    submenu: [
      {
        label: 'Transfer List',
        click() {
          loadTransferView();
        }
      }
    ]
  },
  {label: 'Reports',
    submenu: [
      {
        label: 'Investment NAV Report',
        click() {
          loadInvestmentNAVReportView();
        }
      },
      {
        label: 'Asset Allocation Report',
        click() {
          loadAssetAllocationReportView();
        }
      },
      {
        label: 'Summary Report',
        click() {
          loadSummaryReportView();
        }
      },
      {
        label: 'Account Balance Report',
        click() {
          loadAccountBalanceReportView();
        }
      },
      {
        label: 'Owner Balance Report',
        click() {
          loadOwnerBalanceReportView();
        }
      },
      {
        label: 'Summary P/L Report (MTD)',
        click() {
          loadSummaryPL_MTDReportView();
        }
      },
      {
        label: 'Summary P/L Report (LTD)',
        click() {
          loadSummaryPL_LTDReportView();
        }
      },
      {
        label: 'Summary Unexplained Gain Report',
        click() {
          loadSummaryUnexplainedGainReportView();
        }
      },
    ]
  },
  {label: 'Calendar',
   submenu: [
     {
       label: 'View Contrib. And Distrib. in Calendar',
       click() {
         loadCalendarView();
       }
     },
   ]
 },
  { label: 'Maintenance',
    submenu: [
      {
        label: 'Maintain Accounts, Owners, and Investments',
        click() {
          loadMaintenanceAccountInvestmentView();
        }
      },
      {
        label: 'Maintain Benchmarks and Asset Classes',
        click() {
          loadMaintenanceAssetsBenchmarksOwnersView();
        }
      },
      {
        label: 'Backup View',
        click() {
          loadBackupView();
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


// https://www.electronjs.org/docs/api/menu
const eventMenuTemplate = [
  { role: 'appMenu' },
  { label: 'File',
    submenu: [
      {label: 'Print Window',
       click() {
         takeScreenshot();
      }},
      {role: 'close'},
      {role: 'quit'}

    ]
  },
  { role: 'editMenu' },
  { role: 'viewMenu' },
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
