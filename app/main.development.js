// @flow
import { app, BrowserWindow } from 'electron';
import MenuBuilder from './menu';
const expressApp = require('./server')


/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

require('electron-debug')();

if (process.env.NODE_ENV === 'development') {
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer');

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];

    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

    // TODO: Use async interation statement.
    //       Waiting on https://github.com/tc39/proposal-async-iteration
    //       Promises will fail silently, which isn't what we want in development
    return Promise
      .all(extensions.map(name => installer.default(installer[name], forceDownload)))
      .catch(console.log);
  }
};



app.on('ready', async () => {
  await installExtensions();

  mainWindow = new BrowserWindow({
    show: false,
    width: 520,
    height: 640,
    fullscreenable: false,
    resizable: false
  });
  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    expressApp.startServer()
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('close', function (e) {
    var dialog = require('electron').dialog
    var choice = dialog.showMessageBox(this, {
      type: 'question',
      buttons: ['Ano', 'Ne'],
      title: 'Ukončení aplikace',
      message: 'Opravdu chcete ukončit aplikaci?'
    })
    if (choice == 1) {
      e.preventDefault()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null;
    expressApp.stopServer()
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
