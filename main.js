const electron = require('electron')
const path = require("path")
const app = electron.app
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null
let appIcon = null
let shouldQuit = false

let pluginName
switch (process.platform) {
  case 'win32':
    pluginName = 'pepflashplayer.dll'
    break
  case 'darwin':
    pluginName = 'PepperFlashPlayer.plugin'
    break
  case 'linux':
    pluginName = 'libpepflashplayer.so'
    break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName))

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    title: "Spotiflight",
    icon: "./assets/icon.png",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      plugins: true,
      allowDisplayingInsecureContent: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(`https://play.spotify.com`)

  appIcon = new electron.Tray("./assets/icon.png")
  appIcon.setToolTip("Spotiflight")
  appIcon.on("click", (e) => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
  const contextMenu = electron.Menu.buildFromTemplate([{
    label: 'Now Playing: Cool SOng #1',
    enabled: false
  }, {
    type: 'separator'
  }, {
    label: 'Quit',
    click() {
      shouldQuit = true
      mainWindow.close()
    }
  }]);
  appIcon.setContextMenu(contextMenu);

  // Emitted when the window is closed.
  mainWindow.on('closed', (e) => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.on('close', (e) => {
    if (!shouldQuit) {
      e.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.on('page-title-updated', (e) => {
    e.preventDefault()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
