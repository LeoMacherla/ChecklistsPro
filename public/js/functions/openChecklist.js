const { createTab } = require("./tabs")
const fs = require('fs')

const checklistsproDir = `${require('os').homedir}/Documents/ChecklistsPro`
const checklistsDir = `${checklistsproDir}/Checklists`

const openChecklist = (category, checklistData) => {
  // Create a display for this checklist
  const display = document.createElement('div')
  display.classList.add('display', 'checklist-display', 'active-display')
  display.innerHTML = document.querySelector('.checklist-example-display').innerHTML

  const displayContents = display.querySelector('.display-contents')

  // Create categories menu
  const categoriesMenuWrap = document.createElement('div')
  categoriesMenuWrap.classList.add('menu', 'categories-menu')

  const categoriesList = document.createElement('div')
  categoriesList.classList.add('categories', 'active-menu')

  categoriesMenuWrap.appendChild(categoriesList)
  display.querySelector('.menu-wrap').appendChild(categoriesMenuWrap)

  // Set inner HTML to the same as the example checklist
  display.querySelector('#checklistTitle').innerText = checklistData.name
  display.querySelector('#checklistAuthor').innerText = checklistData.author ? `Created by ${checklistData.author}` : 'Creator Unknown'

  const proceduresList = display.querySelector('.procedures')

  const procedureWrap = document.createElement('div')
  procedureWrap.classList.add('procedure-wrap', 'active-procedure')
  procedureWrap.id = `${checklistData.name.replace(' ', '-')}-Standard-Procedures-0`

  displayContents.appendChild(procedureWrap)

  // Loop through categories
  checklistData.checklist.forEach((cat, index) => {
    const { category, items } = cat

    // Create list item for category and add to categories list
    const categoryListItem = document.createElement('div')
    if (index === 0) categoryListItem.classList.add('active')
    categoryListItem.innerText = category

    // Show category table when category list item is clicked
    categoryListItem.addEventListener('click', () => {
      categoriesList.querySelectorAll('div').forEach(div => div.classList.remove('active'))
      categoryListItem.classList.add('active')

      const tables = display.querySelectorAll('table')

      tables.forEach(table => table.classList.remove('active-checklist'))

      tables[index].classList.add('active-checklist')
    })

    categoriesList.appendChild(categoryListItem)

    // Create a table for each category and add the items from that category to the table
    const categoryTable = document.createElement('table')
    const tableBody = categoryTable.appendChild(document.createElement('tbody'))
    if (index === 0) categoryTable.classList.add('active-checklist')

    items.forEach((item, i) => {
      tableBody.innerHTML += `
        <tr onclick="this.classList.toggle('complete')">
          <td>${item.item}</td>
          <td>${item.action ? item.action : ''}</td>
        </tr>
      `
    })

    procedureWrap.appendChild(categoryTable)
  })

  const openProcedure = (name, index) => {
    console.log(name, index)

    const proceduresListDivs = proceduresList.querySelectorAll('div')
    proceduresListDivs.forEach(d => d.classList.remove('active'))
    proceduresListDivs[index].classList.add('active')

    const categoryMenus = document.querySelectorAll('.categories')
    categoryMenus.forEach(cm => cm.classList.remove('active-menu'))
    categoryMenus[index + 1].classList.add('active-menu')

    const procedureWraps = document.querySelectorAll('.procedure-wrap')
    procedureWraps.forEach(pw => pw.classList.remove('active-procedure'))

    procedureWraps[index].classList.add('active-procedure')

    procedureWrap.querySelectorAll('table')[0].classList.add('active-checklist')

  }

  const createProcedure = (name, index) => {
    const proc = document.createElement('div')
    name === 'Standard Procedures' ? proc.classList.add('primary-text', 'active') : proc.classList.add('red-text')
    proc.textContent = name

    proc.addEventListener('click', () => {
      openProcedure(name, index)
    })

    proceduresList.appendChild(proc)

    if (name == 'Standard Procedures') return

    const procWrap = document.createElement('div')
    procWrap.classList.add('procedure-wrap')
    procWrap.id = `${checklistData.name.replace(' ', '-')}-${name.replace(' ', '-')}-${index}`

    displayContents.appendChild(procWrap)


    const procData = JSON.parse(fs.readFileSync(`${checklistsDir}/${category}/${checklistData.name}/Emergency/${name}/Checklist.json`))

    console.log(procData)

    const categoriesList = document.createElement('div')
    categoriesList.classList.add('categories')

    categoriesMenuWrap.appendChild(categoriesList)

    procData.checklist.forEach((cat, index) => {
      const { category, items } = cat

      // Create list item for category and add to categories list
      const categoryListItem = document.createElement('div')
      if (index === 0) categoryListItem.classList.add('active')
      categoryListItem.innerText = category

      // Show category table when category list item is clicked
      categoryListItem.addEventListener('click', () => {
        categoriesList.querySelectorAll('div').forEach(div => div.classList.remove('active'))
        categoryListItem.classList.add('active')

        const arr = Array.from(categoriesList.querySelectorAll('div'))
        const i = arr.indexOf(categoryListItem)
        const tables = procWrap.querySelectorAll('table')

        tables.forEach(t => t.classList.remove('active-checklist'))
        tables[i].classList.add('active-checklist')

        console.log(tables[i])
      })

      categoriesList.appendChild(categoryListItem)

      const categoryTable = document.createElement('table')
      const tableBody = categoryTable.appendChild(document.createElement('tbody'))
      if (index === 0) categoryTable.classList.add('active-checklist')

      items.forEach((item, i) => {
        tableBody.innerHTML += `
        <tr onclick="this.classList.toggle('complete')">
          <td>${item.item}</td>
          <td>${item.action ? item.action : ''}</td>
        </tr>
      `
      })

      procWrap.appendChild(categoryTable)
    })
  }

  createProcedure('Standard Procedures', 0)

  // Loop through procedures
  checklistData.emergency && checklistData.emergency.forEach((procedure, i) => createProcedure(procedure, i + 1))

  // Create new tab for checklist
  createTab(checklistData.name, '#svg-checklist', display)
}

module.exports = { openChecklist }