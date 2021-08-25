const pdfjs = require('pdfjs-dist')
pdfjs.GlobalWorkerOptions.workerSrc = '../node_modules/pdfjs-dist/build/pdf.worker.js'
const { gsap } = require('gsap')
const { notify, closeNotifyFull } = require('./notify')
const { renameTab } = require('./tabs')
const { ipcRenderer, shell } = require('electron')

const canvas = document.getElementById('flightplan')
const context = canvas.getContext('2d')
const pageNumber = document.getElementById('currentPage')
const totalPages = document.getElementById('totalPages')
const zoomPercentage = document.getElementById('currentZoom')
const flightplanName = document.getElementById('flightplanName')
const flightplanPagination = document.querySelector('.flightplan-pagination')
const downloadDestination = document.querySelector('#downloadDestination')
const downloadOptionsWrap = document.querySelector('.download-options-wrap')

let simbriefData = null

// TODO this should be changed to read the user's settings
const config = {
  simbrief: {
    username: 'Leo Macherla'
  }
}

let flightplan = null
let currentPage = 1
let numOfPages = 0
let scale = 125

const animDuration = 0.2

const initFlightplan = (source) => {
  console.log(source)
  const loadingTask = pdfjs.getDocument(source)
  loadingTask.promise.then(pdf => {
    console.log(pdf._pdfInfo)

    flightplan = pdf
    numOfPages = pdf.numPages

    totalPages.innerText = numOfPages
    pageNumber.innerText = currentPage
    zoomPercentage.innerText = `${scale}%`


    pdf.getPage(1).then(page => {
      const viewport = page.getViewport({ scale: scale / 100 })

      canvas.height = viewport.height
      canvas.width = viewport.width

      page.render({
        canvasContext: context,
        viewport: viewport
      })
    })

    gsap.to('.flightplan-loader', {
      display: 'none',
      onComplete: () => {
        gsap.to('.flightplan-viewer', {
          display: 'flex'
        })
      }
    })

  }).catch(error => {
    console.log(error)
    notify({
      title: 'There was a problem',
      description: 'ChecklistsPro encountered an error whilst trying to display your flight plan.',
      icon: 'error'
    })
  })
}

const changePage = (next) => {
  if (next && currentPage >= numOfPages) return
  else if (!next && currentPage == 1) return

  if (next) currentPage++
  else currentPage--

  renderPage(currentPage)
}

const renderPage = (n) => {
  flightplan.getPage(n).then(page => {
    gsap.to(canvas, {
      duration: animDuration,
      opacity: 0,
      onComplete: () => {
        const viewport = page.getViewport({ scale: scale / 100 })

        canvas.height = viewport.height
        canvas.width = viewport.width

        page.render({
          canvasContext: context,
          viewport: viewport
        })

        pageNumber.innerText = n

        gsap.to(canvas, {
          duration: animDuration,
          opacity: 1
        })
      }
    })

  })
}

const changeZoom = (increase) => {
  increase ? scale += 5 : scale -= 5
  renderPage(currentPage)
  zoomPercentage.innerText = `${scale}%`
}

// Get pdf data from file 
const getFile = () => {
  ipcRenderer.send('get-pdf')
}

ipcRenderer.on('pdf-file', (e, arg) => {
  initFlightplan(arg)

  const title = arg.split('\\').pop().split('.pdf')[0]

  flightplanName.innerText = title
  renameTab('flightplan', `${title}`)
  document.querySelector('.flightplan-secondary-options').style.display = ' none'
})

// Get SimBrief Username
const getSimBriefUsername = () => {
  notifyFull({
    title: 'SimBrief Credentials Required',
    description: '',
    actions: [
      {
        text: 'Cancel',
        click: 'close'
      },
      {
        text: 'Done',
        click: getSimBrief,
        primary: true
      },
    ]
  })
}

// Get pdf data from SimBrief
const getSimBrief = async () => {
  closeNotifyFull()
  const username = document.getElementById('simbriefUsername').value

  const response = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?username=${username}&json=1`)

  const data = await response.json()

  simbriefData = data

  const directory = data.files.directory
  const fileName = data.files.pdf.link

  initFlightplan(`${directory}/${fileName}`)

  const flightNumber = `${data.general.icao_airline ? data.general.icao_airline : ''}${data.general.flight_number ? data.general.flight_number : ''}`

  flightplanName.innerText = `${data.origin.icao_code} - ${data.destination.icao_code} | ${flightNumber}`

  downloadDestination.innerHTML += `<option value="${data.files.pdf.link}">${data.files.pdf.name}</option>`

  downloadDestination.innerHTML += data.files.file.map(file => `<option value="${file.link}">${file.name}</option>`)

  renameTab('flightplan', `${flightNumber} - Flight Plan`)
}

// Download
const downloadFlightplanOptions = () => {
  gsap.to('.download-options-wrap', {
    duration: 0.35,
    opacity: 1,
    display: 'grid'
  })

  gsap.to('.download-options', {
    duration: 0.35,
    delay: 0.1,
    transform: 'scale(1)'
  })
}

const downloadFlightplanOptionsClose = () => {
  gsap.to('.download-options-wrap', {
    duration: 0.35,
    delay: 0.1,
    opacity: 0,
    display: 'none'
  })

  gsap.to('.download-options', {
    duration: 0.35,
    transform: 'scale(0)'
  })
}

const downloadFlightplan = () => {
  const file = downloadDestination.value

  const a = document.createElement('a')
  a.href = `${simbriefData.files.directory}/${file}`
  a.download = file

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  downloadFlightplanOptionsClose()
}

downloadOptionsWrap.addEventListener('click', (e) => {
  e.preventDefault()

  if (e.target !== downloadOptionsWrap) return

  downloadFlightplanOptionsClose()
})

module.exports = {
  changePage,
  changeZoom,
  getFile,
  getSimBriefUsername,
  downloadFlightplan,
  downloadFlightplanOptions,
  downloadFlightplanOptionsClose
}