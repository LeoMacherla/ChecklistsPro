const { app, BrowserWindow } = require('@electron/remote')

const quitApplication = (e) => app.quit()
const minimiseApplication = (e) => BrowserWindow.getFocusedWindow().minimize()
const maximiseApplication = (e) => BrowserWindow.getFocusedWindow().maximize()

module.exports = {
  quitApplication,
  minimiseApplication,
  maximiseApplication
}