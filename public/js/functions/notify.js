const notificationsList = document.querySelector('.notifications ul')

const { gsap } = require('gsap')
const animDuration = 0.3

const notify = ({ title, icon, description }) => {
  const notification = document.createElement('li')

  notification.classList.add('notification')

  notification.innerHTML = `
    <div class="notification-header">
      <svg>
        <use href="#svg-${icon}"></use>
      </svg>
      <h1>${title}</h1>
    </div>
    <div class="notification-description">
      <p>${description}</p>
    </div>
  `

  notificationsList.appendChild(notification)

  gsap.to(notification, {
    duration: animDuration,
    delay: 0.5,
    x: '0%'
  })

  gsap.to(notification, {
    duration: 5,
    delay: 5,
    opacity: 0
  })

  gsap.to(notification, {
    duration: animDuration,
    delay: 8,
    x: '110%',
    onComplete: () => {
      notification.remove()
    }
  })
}

const closeNotifyFull = () => {
  const notificationWrap = document.querySelector('.notification-full-wrap')
  const notification = document.querySelector('.notification-full')

  gsap.to(notification, {
    duration: animDuration,
    transform: 'scale(0)'
  })

  gsap.to(notificationWrap, {
    duration: animDuration,
    delay: 0.2,
    opacity: 0,
    display: 'none'
  })
}

const notifyFull = ({ title, description, actions }) => {
  const notificationWrap = document.querySelector('.notification-full-wrap')
  const notification = document.querySelector('.notification-full')
  const notificationActions = notification.querySelector('.notification-actions')

  notification.querySelector('h1').innerHTML = title
  notification.querySelector('p').innerHTML = description

  while (notificationActions.firstChild) notificationActions.removeChild(notificationActions.firstChild)

  notificationActions.innerHTML += `${actions.map(action => `<button class="${action.primary ? 'primary' : action.warning ? 'warning' : ''}">${action.text}</button>`).join('')
    }`

  notification.querySelectorAll('button').forEach((button, index) => {
    button.addEventListener('click', () => {
      const action = actions[index].click

      if (action === 'close') closeNotifyFull()
      else action()
    })
  })

  gsap.to(notificationWrap, {
    duration: animDuration,
    opacity: 1,
    display: 'grid'
  })

  gsap.to(notification, {
    duration: animDuration,
    delay: 0.2,
    transform: 'scale(1)'
  })
}


module.exports = { notify, notifyFull, closeNotifyFull }