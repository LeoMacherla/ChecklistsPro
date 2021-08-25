// Require Electron
const { BrowserWindow, app, ipcMain, dialog } = require('electron')

//  isDev
const isDev = !app.isPackaged

// Electron Remote
require('@electron/remote/main').initialize()

// Electron reload
if (isDev) require('electron-reload')(__dirname)

// Auto Update
const autoUpdater = require('update-electron-app')
autoUpdater()

// Fetch API
const fetch = require('node-fetch')

// Documents/ChecklistsPro
const fs = require('fs')

const home = require('os').homedir
const cpDataDir = `${home}/Documents/ChecklistsPro`

// Main window
let main
const createMain = () => {
  main = new BrowserWindow({
    minWidth: 925,
    minHeight: 700,
    width: 1600,
    height: 900,
    frame: false,
    title: 'ChecklistsPro',
    icon: './public/assets/icons/icon.ico',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })

  main.loadFile('./views/index.html')

  if (isDev) main.webContents.toggleDevTools()

  if (process.platform === 'darwin') {
    app.dock.setIcon('./assets/icons/icon.png')
  }

  // Show main window
  main.webContents.on('did-finish-load', () => main.show())

  // Tries to quit the application when main window is closed
  main.on('closed', () => app.quit())
}

app.setAppUserModelId('ChecklistsPro')


// Once the Electron application is initialised (when it is ready) the function createMain is called
app.whenReady()
  .then(checkForUpdates)
  .then(createMain)
  .then(console.log(`Starting ChecklistsPro ${app.getVersion()}...`))

// When the application is launched, if it has no windows open then it will call the createMain function
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMain()
})

// Upload Image
ipcMain.on('upload-image', (e, arg) => {
  const { category, checklist } = arg

  dialog.showOpenDialog({
    title: `Image Upload | ${checklist}`,
    buttonLabel: 'Upload',
    properties: ['openFile']
  }).then(async result => {
    const { canceled, filePaths } = result

    if (canceled) return

    const thumbDir = `${cpDataDir}/Checklists/Thumbnails`
    const thumbPath = `${thumbDir}/${checklist}.png`

    if (!fs.existsSync(thumbDir)) await fs.mkdirSync(thumbDir)

    fs.copyFile(filePaths[0], thumbPath, (error) => {
      if (error) console.log(error)

      main.webContents.send('image-uploaded')
    })
  })
})

ipcMain.on('get-pdf', () => {
  dialog.showOpenDialog({
    title: 'Choose Your Flightplan',
    properties: ['openFile'],
    filters: [
      {
        name: 'PDF Files',
        extensions: ['pdf']
      }
    ]
  }).then(result => {
    if (result.canceled) return

    main.webContents.send('pdf-file', result.filePaths[0])
  })
})