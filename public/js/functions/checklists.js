const { ipcRenderer, TouchBarSegmentedControl } = require('electron')
const fs = require('fs')

const { switchTab } = require('./tabs')
const { notify, notifyFull, closeNotifyFull } = require('./notify')
const { openChecklist } = require('./openChecklist')

const URL = 'https://testing.thechecklistsproproject.tk'
const checklistsproDir = `${require('os').homedir}/Documents/ChecklistsPro`
const checklistsDir = `${checklistsproDir}/Checklists`

const categoriesList = document.querySelector('.categories')
const searchInput = document.getElementById('input-checklistSearch')

const manufacturers = []

const downloadChecklists = async () => {

  // Delete current checklists
  const categoriesDirs = await fs.readdirSync(checklistsDir)

  let downloadError = false

  await categoriesDirs.forEach(async cat => {
    // ChecklistsPro/Checklists/[Category Name]
    const catDir = `${checklistsDir}/${cat}`

    // Delete folder if the category is not Custom Checklists
    try {
      if (cat !== 'Custom Checklists' && cat !== 'Thumbnails') await fs.rmdir(catDir, { recursive: true }, (error) => {

        if (error) downloadError = true
      })
    } catch (error) {
      console.error(error)
      downloadError = true
    }
  })


  // Get apps.json file
  const response = await fetch(`${URL}/apps.json`)
  const appsData = await response.json()

  // Loop through categories and make a directory for that category. Then do the same for each checklist in that category.
  appsData.checklistspro.checklists.forEach(async cat => {
    const { category, checklists } = cat
    const catDir = `${checklistsDir}/${category}`

    // Created folder for category
    await fs.mkdir(catDir, (error) => {
      if (error) {
        downloadError = true
      }
    })

    await checklists.forEach(async check => {

      const { name, checklist } = check

      const checkDir = `${catDir}/${name}`
      // Create folder for checklist and write Checklist.json file inside it
      await fs.mkdir(checkDir, async (error) => {
        if (error) {
          downloadError = true
        } else {
          const checkRes = await fetch(`${URL}/Checklists/${category}/${name}/Checklist.json`)
          const checkData = await checkRes.json()
          await fs.writeFileSync(`${checkDir}/Checklist.json`, JSON.stringify(checkData, null, 4))

          checkData.manufacturer && manufacturers.push(checkData.manufacturer)

          if (checkData.emergency.length > 0) {
            // If checklist contains emergency procedures then create an Emergency folder
            fs.mkdirSync(`${checkDir}/Emergency`)
            checkData.emergency.forEach(async emergency => {
              const emergencyDir = `${checkDir}/Emergency/${emergency}`
              const emergencyRes = await fetch(`${URL}/Checklists/${category}/${name}/Emergency/${emergency}/Checklist.json`)
              const emergencyData = await emergencyRes.json()

              // Created folder for emergency procedure
              await fs.mkdir(emergencyDir, async (error) => {
                // Log error and notify user if there is an error
                if (error) {
                  downloadError = true
                } else {
                  await fs.writeFileSync(`${emergencyDir}/Checklist.json`, JSON.stringify(emergencyData, null, 4))
                }
              })
            })
          }
        }
      })
    })
  })

  // Log error and notify user if there is an error
  if (downloadError) {
    notify({
      title: 'There was a problem',
      description: 'ChecklistsPro encountered an error whilst trying to update checklists.',
      icon: 'error',
    })
  }
}

const loadChecklists = async () => {
  await downloadChecklists()

  setTimeout(async () => {

    // Get all category folders
    const categories = await fs.readdirSync(checklistsDir)

    // Loop through categories 
    categories.forEach(async cat => {
      if (cat == 'Thumbnails') return
      const catDir = `${checklistsDir}/${cat}`

      // Show category in list
      const categoryDiv = document.createElement('div')
      categoryDiv.classList.add('category')
      categoryDiv.innerHTML += `<h1>${cat}</h1>`

      const checklistsList = document.createElement('ul')
      checklistsList.classList.add('checklists-list')

      categoryDiv.appendChild(checklistsList)

      if (cat !== 'Custom Checklists') categoriesList.appendChild(categoryDiv)
      else categoriesList.prepend(categoryDiv)

      // Get all checklists within this category
      const checklists = await fs.readdirSync(catDir)

      // Loop through checklists and display them
      checklists.forEach(async checklist => {
        const checkDir = `${catDir}/${checklist}`
        const checklistData = await JSON.parse(fs.readFileSync(`${checkDir}/Checklist.json`))
        const thumbFile = `${checklistsDir}/Thumbnails/${checklistData.name}.png`

        // Create list item for each checklist
        const li = document.createElement('li')
        li.classList.add('checklist-option', 'fill-animation')
        li.setAttribute('data-manufacturer', checklistData.manufacturer)

        li.innerHTML +=
          `
          <h2>${checklistData.name}</h2>
          <p>${checklistData.author ? `Created by ${checklistData.author}` : 'Creator Unknown'}</p>
          <div class="options">
            <div class="option upload-image" onclick="uploadImage('Custom Checklists', '${checklistData.name}')">
              <svg class="option">
                <use class="option" href="#svg-uploadImage"></use>
              </svg>
            </div>
          ${cat === 'Custom Checklists' ?
            `<div class="option delete-checklist" onclick="deleteChecklist('Custom Checklists', '${checklist}')">
          <svg class="option">
          <use class="option" href="#svg-delete"></use>
          </svg>
          </div>` : ''
          }
          </div>
        `

        // Check if thumbnail exists and add it to list item if it does
        if (fs.existsSync(thumbFile)) {
          li.setAttribute('data-background-image', 'true')
          const thumb = document.createElement('img')
          thumb.classList.add('thumb')
          thumb.src = thumbFile

          li.appendChild(thumb)
        }

        li.addEventListener('click', (e) => {
          e.preventDefault()

          if (!e.target.classList.contains('option')) openChecklist(cat, checklistData)
        })


        checklistsList.appendChild(li)
      })

    })

    const unique = [...new Set(manufacturers)].sort()
    document.querySelector('.manufacturers').innerHTML += unique.map((manufacturer, index) => `<li class="manufacturer" onclick="filterChecklists(${index}, '${manufacturer}')">${manufacturer}</li>`).join('')
  }, 1000)

}

// Upload Image
const uploadImage = (category, checklist) => {
  ipcRenderer.send('upload-image', ({ category, checklist }))
}

ipcRenderer.on('image-uploaded', () => {
  notify({
    title: 'Success!',
    description: 'Congratulations on setting a brand new shiny thumbnail for this checklist! Please note that in some cases you might need to reload ChecklistsPro before you can see the new thumbnail.',
    icon: 'info',
  })
})

// Delete Checklist

const deleteChecklist = (category, checklist) => {
  notifyFull({
    title: 'Are you sure you want to delete this checklist?',
    description: `${checklist} will be deleted forever... lost in the endless void of <span class="strikethrough">space</span> your recycle bin.`,
    actions: [
      {
        text: 'Cancel',
        primary: true,
        click: 'close'
      },
      {
        text: 'Delete',
        warning: true,
        click: async () => {
          const dir = `${checklistsDir}/${category}/${checklist}`
          closeNotifyFull()

          await fs.rmdir(dir, { recursive: true }, (error) => {

            if (error) {
              console.error(error)
              notify({
                title: 'There was a problem',
                icon: 'error',
                description: `ChecklistsPro was not able to delete ${checklist} at [${dir}].`,
              })
            } else {
              notify({
                title: 'Success!',
                description: `${checklist} was successfully deleted.`,
                icon: 'info',
              })
            }
          })
        }
      }
    ]
  })
}

// Filter
searchInput.addEventListener('keyup', () => {
  const term = searchInput.value.toLowerCase()

  document.querySelectorAll('.checklist-option').forEach(option => {
    if (option.querySelector('h2').innerText.toLowerCase().includes(term)) option.style.display = 'flex'
    else option.style.display = 'none'

    const parent = option.parentElement.parentElement
    const parentUl = Array.from(parent.querySelector('ul').querySelectorAll('li')).filter(li => li.style.display !== 'none')

    if (parentUl.length < 1) parent.style.display = 'none'
    else parent.style.display = 'block'
  })
})

module.exports = {
  loadChecklists,
  uploadImage,
  deleteChecklist
}