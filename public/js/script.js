const { shell, app } = require("@electron/remote")

const { createTab, openTab, switchTab, closeTab } = require('../public/js/functions/tabs')
const { loadChecklists, uploadImage, deleteChecklist } = require('../public/js/functions/checklists')
const { showCategory, openProcedure } = require('../public/js/functions/openChecklist')
const { quitApplication, minimiseApplication, maximiseApplication } = require('../public/js/functions/winctrl')
const { notify } = require('../public/js/functions/notify')
const { filterToggle, filterChecklists } = require('../public/js/functions/filter')
const { changePage, changeZoom, getFile, getSimBrief, downloadFlightplan, downloadFlightplanOptions, downloadFlightplanOptionsClose } = require('../public/js/functions/flightplan')

// Console message if app is not packaged
if (app.isPackaged) {

  console.log(
    `
      %c Hey there, welcome to ChecklistsPro! %c If you have no idea what you\'ve just done and want to close this, just press Ctrl+Shift+I and enjoy the rest of your day 😃.

      %c If you DO know what you're doing then welcome to the dev tools.

      %c I do not recommend that you play around with stuff here. But hey, I can't stop you. But if you break anything, I'm not helping 😂
    `,
    `
      font-family: 'Segoe UI', sans-serif;
      font-weight: 500;
      font-size: 3em;
      text-align: center;
      color: #3da1ff;
      padding-bottom: 0.75em;
    `,
    `
      font-family: 'Segoe UI', sans-serif;
      font-size: 1.25em;
      text-align: center;
      padding-bottom: 0.75em;
    `,
    `
      font-family: 'Segoe UI', sans-serif;
      font-size: 1.25em;
      text-align: center;
    `,
    `
      font-family: 'Segoe UI', sans-serif;
      font-weight: bold;
      font-size: 1.25em;
      text-align: center;
      color: red;
    `
  )
}

const anchors = document.querySelectorAll('a')
anchors.forEach(a => {
  const href = a.href

  a.addEventListener('click', (e) => {
    e.preventDefault()
    if (href.startsWith('https://') || href.startsWith('http://') || href.startsWith('www.')) shell.openExternal(href)
    else window.location.href = href
  })
})

document.querySelectorAll('.gradient-hover').forEach(el => el.addEventListener('mousemove', (e) => {
  const x = e.pageX - e.target.offsetLeft
  const y = e.pageY - e.target.offsetTop

  el.style.setProperty('--x', `${x}px`)
  el.style.setProperty('--y', `${y}px`)
}))

document.querySelectorAll('.input-label').forEach(inputLabel => {

  const input = inputLabel.querySelector('input')

  if (!input) return

  input.addEventListener('focusin', () => {
    inputLabel.classList.add('focused')
  })

  input.addEventListener('focusout', () => {
    if (input.value == '') inputLabel.classList.remove('focused')
  })

})

loadChecklists()
