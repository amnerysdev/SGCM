import { clearSession } from '../shared/session.js'

export function bindShellEvents(shell) {
  const sidebar = shell.querySelector('#app-sidebar')
  const backdrop = shell.querySelector('#app-backdrop')
  const menu = shell.querySelector('#app-menu-button')
  const toggle = (open) => {
    sidebar.classList.toggle('is-open', open)
    backdrop.hidden = !open
    menu.setAttribute('aria-expanded', String(open))
  }
  menu.addEventListener('click', () => toggle(!sidebar.classList.contains('is-open')))
  backdrop.addEventListener('click', () => toggle(false))
  shell.querySelector('#app-logout').addEventListener('click', () => {
    clearSession()
    window.location.replace('/index.html')
  })
}