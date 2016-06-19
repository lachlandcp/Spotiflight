const electron = require("electron")
const Player = require("mpris-service")
const path = require("path")
const fs = require("fs")
const {BrowserWindow, Menu, MenuItem, app, ipcMain} = electron

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, appIcon, webContents = null
let shouldQuit = false

let activeTrack = {
  track: "",
  artist: "",
  art: "",
  time: 0, // seconds
  isPaused: true
}

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

let getContextMenu = () => {
  let menu = new electron.Menu()

  if (activeTrack.track) {
    menu.append(new MenuItem({
      label: activeTrack.track + " by " + activeTrack.artist,
      enabled: false
    }))

    menu.append(new MenuItem({
      type: "separator"
    }))

    menu.append(new MenuItem({
      label: (activeTrack.isPaused ? "Play" : "Pause"),
      click() {
        playback("toggle")
      }
    }))

    menu.append(new MenuItem({
      label: "Next",
      click() {
        playback("next")
      }
    }))

    menu.append(new MenuItem({
      label: "Previous",
      click() {
        playback("prev")
      }
    }))

    menu.append(new MenuItem({
      type: "separator"
    }))
  }
  menu.append(new electron.MenuItem({
    label: "Quit",
    click() {
      shouldQuit = true
      mainWindow.close()
    }
  }))

  return menu
}

let player = Player({
	name: 'Spotiflight',
	identity: 'Spotiflight',
	supportedInterfaces: ['player'],
  canSeek: false
});
player.canSeek = false

player.on("play", () => {
  playback("play")
})

player.on("pause", () => {
  playback("pause")
})

player.on("playpause", () => {
  playback("toggle")
})

player.on("next", () => {
  playback("next")
})

player.on("previous", () => {
  playback("prev")
})

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
      allowDisplayingInsecureContent: true,
      preload: path.join(__dirname, "src/main.js")
    }
  })

  webContents = mainWindow.webContents

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
  appIcon.setContextMenu(getContextMenu())

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

ipcMain.on("set-track", (event, arg) => {
  if ((activeTrack.track != arg.track && activeTrack.artist != arg.artist && activeTrack.art != arg.art && activeTrack.time != arg.time) || activeTrack.isPaused != arg.isPaused) {
    activeTrack.track = arg.track
    activeTrack.artist = arg.artist
    activeTrack.isPaused = arg.isPaused
    activeTrack.art = arg.art
    activeTrack.time = arg.time

    player.metadata = {
    	'mpris:trackid': player.objectPath('track/0'),
    	'mpris:length': activeTrack.time * 1000 * 1000, // In microseconds
    	'mpris:artUrl': activeTrack.art,
    	'xesam:title': activeTrack.track,
    	'xesam:artist': activeTrack.artist
    }

    player.playbackStatus = (activeTrack.isPaused ? "Paused" : "Playing")

    appIcon.setContextMenu(getContextMenu())
  }
  console.log(activeTrack)
})

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

function playback(action) {
  if (action == "pause" && !activeTrack.isPaused) {
    webContents.send("pause")
  } else if (action == "play" && activeTrack.isPaused) {
    webContents.send("play")
  } else if (action =="next") {
    webContents.send("next")
  } else if (action =="prev") {
    webContents.send("prev")
  } else if (action == "toggle") {
    if (activeTrack.isPaused) {
      playback("play")
    } else {
      playback("pause")
    }
  }
}
