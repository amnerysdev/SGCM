import { clearSession, getSession } from './api.js'
import logoUrl from './assets/logo-simple.png'

const ICONS = {
  home: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18"/></svg>',
  profile: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6"/></svg>',
  availability: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM8 2v4m8-4v4M4 9h16"/><path d="m9 14 2 2 4-4"/></svg>',
  records: '<svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6zM9 12h6m-6 4h6"/></svg>',
  specialties: '<svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="8"/></svg>',
  booking: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4m-4 6v6m-3-3h6"/></svg>',
}
const LINK_GROUPS = { Doctor: [['/citas-doctor.html', 'Mi agenda', 'calendar'], ['/disponibilidad.html', 'Mi disponibilidad', 'availability'], ['/perfil-doctor.html', 'Mi perfil médico', 'profile'], ['/expediente-medico.html', 'Expedientes médicos', 'records']], Patient: [['/agendar-cita.html', 'Agendar cita', 'booking'], ['/mis-citas.html', 'Mis citas', 'calendar'], ['/perfil-paciente.html', 'Mi perfil', 'profile'], ['/expediente-medico.html', 'Mis expedientes', 'records']], Admin: [['/admin-especialidades.html', 'Especialidades', 'specialties']] }
const roleLabel = (roles) => roles.map((role) => ({ Doctor: 'Profesional de salud', Patient: 'Paciente', Admin: 'Administrador' })[role] || role).join(' · ')

export function mountAppShell() {
  if (document.querySelector('.app-shell')) return true
  const session = getSession()
  if (!session) { window.location.replace('/index.html'); return false }
  const links = [['/dashboard.html', 'Inicio', 'home'], ...session.roles.flatMap((role) => LINK_GROUPS[role] || [])]
  const name = session.fullName?.trim() || 'Usuario'; const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const content = [...document.body.children].filter((element) => element.tagName !== 'SCRIPT')
  const shell = document.createElement('div'); shell.className = 'app-shell'
  const nav = links.map(([href, title, icon]) => `<a class="app-shell-link${location.pathname === href ? ' is-current' : ''}" href="${href}"${location.pathname === href ? ' aria-current="page"' : ''}><span class="app-shell-icon" aria-hidden="true">${ICONS[icon]}</span>${title}</a>`).join('')
  shell.innerHTML = `<aside id="app-sidebar" class="app-shell-sidebar"><a class="app-shell-brand" href="/dashboard.html"><img src="${logoUrl}" alt="Sistema de Gestión de Citas Médicas" />SGCM</a><nav aria-label="Navegación principal">${nav}</nav><button id="app-logout" class="app-shell-logout" type="button"><span class="app-shell-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M10 5H5v14h5m4-4 5-3-5-3m5 3H9"/></svg></span>Cerrar sesión</button></aside><div id="app-backdrop" class="app-shell-backdrop" hidden></div><header class="app-shell-header"><button id="app-menu-button" class="app-shell-menu" type="button" aria-label="Abrir menú" aria-expanded="false"><span></span><span></span><span></span></button><p>${new Intl.DateTimeFormat('es-DO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</p><div class="app-user-summary"><span class="app-shell-avatar" aria-hidden="true">${initials}</span><span><strong>${name}</strong><small>${roleLabel(session.roles)}</small></span></div></header><main class="app-shell-main"></main>`
  document.body.prepend(shell); const main = shell.querySelector('.app-shell-main'); content.forEach((element) => main.append(element))
  const sidebar = shell.querySelector('#app-sidebar'), backdrop = shell.querySelector('#app-backdrop'), menu = shell.querySelector('#app-menu-button'), toggle = (open) => { sidebar.classList.toggle('is-open', open); backdrop.hidden = !open; menu.setAttribute('aria-expanded', String(open)) }
  menu.addEventListener('click', () => toggle(!sidebar.classList.contains('is-open'))); backdrop.addEventListener('click', () => toggle(false))
  shell.querySelector('#app-logout').addEventListener('click', () => { clearSession(); window.location.replace('/index.html') })
  return true
}

mountAppShell()
