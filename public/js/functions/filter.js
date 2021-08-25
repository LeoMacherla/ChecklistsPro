const { gsap } = require('gsap')
const filter = document.querySelector('.filter')
const filterSVG = filter.querySelector('svg')

const closeFilterMenu = () => {
  gsap.to('.manufacturers', {
    duration: 0.35,
    opacity: 0,
    top: '150%',
    overflow: 'hidden',
    pointerEvents: 'none'
  })
}

const filterToggle = (e) => {
  if (e.target.classList.contains('manufacturer')) return

  filter.classList.toggle('enabled')

  if (filter.classList.contains('enabled')) {
    gsap.to('.manufacturers', {
      duration: 0.35,
      opacity: 1,
      top: '120%',
      overflow: 'visible',
      pointerEvents: 'all'
    })
  } else {
    closeFilterMenu()
  }
}


const filterHover = (e) => {

  const scale = 1.5

  gsap.to('.filter-rect-1', {
    duration: 0.35,
    transformOrigin: 'center',
    scale: scale
  })

  gsap.to('.filter-rect-2', {
    duration: 0.35,
    delay: 0.15,
    transformOrigin: 'center',
    scale: scale
  })

  gsap.to('.filter-rect-3', {
    duration: 0.35,
    delay: 0.3,
    transformOrigin: 'center',
    scale: scale
  })
}

const filterLeave = (e) => {

  const scale = 1

  gsap.to('.filter-rect-1', {
    duration: 0.35,
    transformOrigin: 'center',
    scale: scale
  })

  gsap.to('.filter-rect-2', {
    duration: 0.35,
    delay: 0.15,
    transformOrigin: 'center',
    scale: scale
  })

  gsap.to('.filter-rect-3', {
    duration: 0.35,
    delay: 0.3,
    transformOrigin: 'center',
    scale: scale
  })
}

const removeFilter = () => {
  document.querySelectorAll('.checklist-option').forEach(checklist => {
    checklist.style.display = 'flex'
    const parent = checklist.parentElement.parentElement
    parent.style.display = 'block'
  })

  document.querySelectorAll('.manufacturer').forEach(m => m.classList.remove('selected'))
  closeFilterMenu()
}

const filterChecklists = (i, m) => {
  let remove = false

  document.querySelectorAll('.manufacturer').forEach((ma, index) => {
    if (index === i && !ma.classList.contains('selected')) ma.classList.add('selected')
    else if (index === i) {
      remove = true
      removeFilter()
    }
    else ma.classList.remove('selected')
  })

  if (remove) return

  closeFilterMenu()

  document.querySelectorAll('.checklist-option').forEach(checklist => {
    const manufacturer = checklist.getAttribute('data-manufacturer')

    if (manufacturer !== m) checklist.style.display = 'none'
    else checklist.style.display = 'flex'

    const parent = checklist.parentElement.parentElement
    const parentUl = Array.from(parent.querySelector('ul').querySelectorAll('li')).filter(li => li.style.display !== 'none')

    if (parentUl.length < 1) parent.style.display = 'none'
    else parent.style.display = 'block'
  })
}


filter.addEventListener('mouseover', filterHover)
filter.addEventListener('mouseleave', filterLeave)
filter.addEventListener('click', filterToggle)

module.exports = {
  filterToggle,
  filterChecklists
}