const tabsList = document.querySelector('.tabs')
const tabs = []

const defaultTabs = {
  home: {
    tab: document.querySelector('.home-tab'),
    display: document.querySelector('.home-display')
  },
  browse: {
    tab: document.querySelector('.browse-tab'),
    display: document.querySelector('.browse-display')
  },
  create: {
    tab: document.querySelector('.create-tab'),
    display: document.querySelector('.create-display')
  },
  flightplan: {
    tab: document.querySelector('.flightplan-tab'),
    display: document.querySelector('.flightplan-display')
  },
  settings: {
    tab: document.querySelector('.settings-tab'),
    display: document.querySelector('.settings-display')
  }
}

const defaultTabNames = ['home', 'browse', 'create', 'flightplan', 'settings']

const createTab = (title, svg, display) => {
  const tabID = tabs.length

  const tab = document.createElement('div')
  tab.classList.add('tab', 'active')
  tab.innerHTML = `
    <svg draggable="false">
      <use href="${svg}"></use>
    </svg>
    <span class="title">${title}</span>
    <div class="close-tab">
      <svg class="close-tab">
        <use class="close-tab" href="#svg-close"></use>
      </svg>
    </div>
  `

  tab.addEventListener('click', (e) => {
    e.preventDefault()

    if (e.target.classList.contains('close-tab')) closeTab(tabID)
    else switchTab(tabID)
  })

  document.body.appendChild(display)

  tabsList.appendChild(tab)
  tabs.push({
    tab,
    display,
    tabID
  })

  switchTab(tabID)
}

const switchTab = (tab) => {

  const displays = document.querySelectorAll('.display')
  displays.forEach(d => d.classList.remove('active-display'))

  const allTabs = document.querySelectorAll('.tab')
  allTabs.forEach(t => {
    t.classList.remove('active')
  })

  if (defaultTabNames.includes(tab)) {
    defaultTabs[tab].tab.classList.add('active')
    defaultTabs[tab].tab.classList.remove('hidden')
    defaultTabs[tab].display.classList.add('active-display')
  } else {

    let TAB

    tabs.forEach(t => {
      if (t.tabID == tab) TAB = t
    })

    TAB.tab.classList.add('active')
    TAB.tab.classList.remove('hidden')
    TAB.display.classList.add('active-display')
  }
}

const openTab = (tab) => {
  const displays = document.querySelectorAll('.display')
  displays.forEach(display => display.classList.remove('active-display'))

  const allTabs = document.querySelectorAll('.tab')
  allTabs.forEach(t => t.classList.remove('active'))

  defaultTabs[tab].tab.classList.add('active')
  defaultTabs[tab].tab.classList.remove('hidden')
  defaultTabs[tab].display.classList.add('active-display')
}

const closeTab = (tab) => {
  if (defaultTabNames.includes(tab)) {
    defaultTabs[tab].tab.classList.remove('active')
    defaultTabs[tab].tab.classList.add('hidden')
    defaultTabs[tab].display.classList.remove('active-display')
  } else {
    let TAB

    tabs.forEach(t => {
      if (t.tabID == tab) TAB = t
    })

    TAB.tab.remove()
    TAB.display.remove()
  }
  switchTab('home')
}

const renameTab = (tab, text) => {
  if (defaultTabNames.includes(tab)) {
    console.log(tab, text)
    defaultTabs[tab].tab.querySelector('.title').innerText = text
  } else {
    let TAB

    tabs.forEach(t => {
      if (t.tabID == tab) TAB = t
    })

    TAB.tab.querySelector('.title').innerText = text

  }
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.preventDefault()

    const tabName = tab.getAttribute('data-tab-name')

    if (e.target == tab.querySelector('.close-tab svg')) closeTab(tabName)
    else switchTab(tabName)
  })
})


module.exports = {
  createTab,
  openTab,
  switchTab,
  closeTab,
  renameTab
}