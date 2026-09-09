import logoUrl from '../assets/logo-simple.png'
import { buildNavigationLinks, buildNavigationMarkup, roleLabel } from './navigation.js'

export function createShell(session) {
  const links = buildNavigationLinks(session)
  const name = session.fullName?.trim() || 'Usuario'
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const content = [...document.body.children].filter((element) => element.tagName !== 'SCRIPT')
  const shell = document.createElement('div')
  shell.className = 'app-shell'

  shell.innerHTML = `<aside id="app-sidebar" class="app-shell-sidebar"><a class="app-shell-brand" href="/dashboard.html"><img src="${logoUrl}" alt="Sistema de Gestión de Citas Médicas" />SGCM</a><nav aria-label="Navegación principal">${buildNavigationMarkup(links)}</nav><button id="app-logout" class="app-shell-logout" type="button"><span class="app-shell-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M10 5H5v14h5m4-4 5-3-5-3m5 3H9"/></svg></span>Cerrar sesión</button></aside><div id="app-backdrop" class="app-shell-backdrop" hidden></div><header class="app-shell-header"><button id="app-menu-button" class="app-shell-menu" type="button" aria-label="Abrir menú" aria-expanded="false"><span></span><span></span><span></span></button><p>${new Intl.DateTimeFormat('es-DO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</p><div class="app-user-summary"><span class="app-shell-avatar" aria-hidden="true">${initials}</span><span><strong>${name}</strong><small>${roleLabel(session.roles)}</small></span></div></header><main class="app-shell-main"></main>`

  document.body.prepend(shell)
  const main = shell.querySelector('.app-shell-main')
  content.forEach((element) => main.append(element))
  return shell
}