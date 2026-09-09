export const ICONS = {
  home: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18"/></svg>',
  profile: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6"/></svg>',
  availability: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM8 2v4m8-4v4M4 9h16"/><path d="m9 14 2 2 4-4"/></svg>',
  records: '<svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6zM9 12h6m-6 4h6"/></svg>',
  specialties: '<svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="8"/></svg>',
  booking: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4m-4 6v6m-3-3h6"/></svg>',
}

export const LINK_GROUPS = {
  Doctor: [['/citas-doctor.html', 'Mi agenda', 'calendar'], ['/disponibilidad.html', 'Mi disponibilidad', 'availability'], ['/perfil-doctor.html', 'Mi perfil médico', 'profile'], ['/expediente-medico.html', 'Expedientes médicos', 'records']],
  Patient: [['/agendar-cita.html', 'Agendar cita', 'booking'], ['/mis-citas.html', 'Mis citas', 'calendar'], ['/perfil-paciente.html', 'Mi perfil', 'profile'], ['/expediente-medico.html', 'Mis expedientes', 'records']],
  Admin: [['/admin-especialidades.html', 'Especialidades', 'specialties']],
}

export function roleLabel(roles) {
  return roles.map((role) => ({ Doctor: 'Profesional de salud', Patient: 'Paciente', Admin: 'Administrador' })[role] || role).join(' · ')
}

export function buildNavigationLinks(session) {
  return [['/dashboard.html', 'Inicio', 'home'], ...session.roles.flatMap((role) => LINK_GROUPS[role] || [])]
}

export function buildNavigationMarkup(links) {
  return links.map(([href, title, icon]) => `<a class="app-shell-link${location.pathname === href ? ' is-current' : ''}" href="${href}"${location.pathname === href ? ' aria-current="page"' : ''}><span class="app-shell-icon" aria-hidden="true">${ICONS[icon]}</span>${title}</a>`).join('')
}