import { cancelAppointment } from '../../api/appointments-api.js'

export function formatDateTime(value) {
  return new Date(value).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' })
}

export function formatDateShort(value) {
  return new Date(value).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')
}

export function formatWeekday(value) {
  const weekday = new Date(value).toLocaleDateString('es-DO', { weekday: 'long' })
  return weekday.charAt(0).toUpperCase() + weekday.slice(1)
}

export function formatTime(value) {
  return new Date(value).toLocaleTimeString('es-DO', { hour: 'numeric', minute: '2-digit' })
}

export function statusLabel(status) {
  return ({ 1: 'Pendiente', 2: 'Confirmada', 3: 'Completada', 4: 'Cancelada' })[status] ?? 'Sin estado'
}

const STATUS_META = {
  1: { className: 'is-pending' },
  2: { className: 'is-confirmed' },
  3: { className: 'is-completed' },
  4: { className: 'is-cancelled' },
}

// NOTE: assumes each appointment includes a specialty name (specialtyName) and,
// optionally, a consultation type label. Adjust the field names below if your
// appointments-api.js response uses different keys.
const SPECIALTY_ICONS = [
  { match: /cardiolog/i, icon: 'stethoscope' },
  { match: /odontolog|dental/i, icon: 'tooth' },
  { match: /oftalmolog|visual|ojo/i, icon: 'eye' },
  { match: /neumolog|pulmon/i, icon: 'lungs' },
  { match: /general/i, icon: 'person' },
]

const ICONS = {
  stethoscope: '<path d="M6 3v6a3 3 0 0 0 6 0V3"/><path d="M9 9v3a5 5 0 0 0 10 0v-1.5"/><circle cx="19" cy="9.5" r="1.8"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  tooth: '<path d="M12 3c-1.7 0-2.7 1.1-3.7 1.1S6.4 3 5 3C3.6 3 2.6 4.4 2.6 6.3c0 1.9.9 3.7 1.4 5.5.5 1.9 1.4 8 3.2 8 1.2 0 1.1-2.8 1.9-5.1.4-1.2.9-1.9 2.8-1.9s2.4.7 2.8 1.9c.8 2.3.7 5.1 1.9 5.1 1.8 0 2.7-6.1 3.2-8 .5-1.8 1.4-3.6 1.4-5.5C21.4 4.4 20.4 3 19 3c-1.4 0-2.4 1.1-3.3 1.1S13.7 3 12 3z"/>',
  eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',
  lungs: '<path d="M12 3v7"/><path d="M12 10c-1 0-1.5.8-1.7 1.7L9 18c-.3 1.5-1.5 2.7-3 2.7-1.7 0-3-1.5-2.7-3.1L4 10.3c.3-1.9 1.5-3.3 3.4-3.7"/><path d="M12 10c1 0 1.5.8 1.7 1.7L15 18c.3 1.5 1.5 2.7 3 2.7 1.7 0 3-1.5 2.7-3.1L20 10.3c-.3-1.9-1.5-3.3-3.4-3.7"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
  document: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
}

function svg(name, extraClass = '') {
  return `<svg class="${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
}

function specialtyIconFor(specialtyName = '') {
  const found = SPECIALTY_ICONS.find((entry) => entry.match.test(specialtyName))
  return found ? found.icon : 'stethoscope'
}

export function createFeedback(errorEl, messageEl) {
  let feedbackTimeoutId = null
  return {
    showError(message) {
      show(errorEl, message)
    },
    showMessage(message) {
      show(messageEl, message)
    },
  }

  function show(element, message) {
    if (feedbackTimeoutId) {
      clearTimeout(feedbackTimeoutId)
      feedbackTimeoutId = null
    }
    element.textContent = message
    element.hidden = false
    feedbackTimeoutId = window.setTimeout(() => {
      element.hidden = true
      element.textContent = ''
      feedbackTimeoutId = null
    }, 4000)
  }
}

function updateCountBadge(countEl, countTextEl, count) {
  if (!countEl || !countTextEl) return
  if (!count) {
    countEl.hidden = true
    return
  }
  countTextEl.textContent = `${count} cita${count === 1 ? '' : 's'} encontrada${count === 1 ? '' : 's'}`
  countEl.hidden = false
}

function buildField({ icon, label, value, sub, modifier }) {
  const field = document.createElement('div')
  field.className = `appointment-field${modifier ? ` ${modifier}` : ''}`
  field.innerHTML = `
    <span class="appointment-field-icon">${svg(icon)}</span>
    <div class="appointment-field-content">
      <span class="appointment-field-label">${escapeHtml(label)}</span>
      <span class="appointment-field-value" title="${escapeHtml(value)}">${escapeHtml(value)}</span>
      ${sub ? `<span class="appointment-field-sub" title="${escapeHtml(sub)}">${escapeHtml(sub)}</span>` : ''}
    </div>
  `
  return field
}

function buildCard(appointment, deps) {
  const specialtyName = appointment.specialtyName || appointment.specialty || 'Consulta'
  const consultationType = appointment.consultationType || 'Consulta externa'
  const status = appointment.status
  const statusMeta = STATUS_META[status] ?? { className: 'is-unknown' }

  const card = document.createElement('div')
  card.className = 'appointment-card'

  card.append(
    buildField({ icon: specialtyIconFor(specialtyName), label: 'Especialidad', value: specialtyName, sub: consultationType, modifier: 'is-specialty' }),
    buildField({ icon: 'calendar', label: 'Fecha', value: formatDateShort(appointment.dateTime), sub: formatWeekday(appointment.dateTime) }),
    buildField({ icon: 'clock', label: 'Hora', value: formatTime(appointment.dateTime), modifier: 'is-time' }),
    buildField({ icon: 'document', label: 'Motivo', value: appointment.reason || '—', modifier: 'is-reason' }),
  )

  const statusBadge = document.createElement('span')
  statusBadge.className = `appointment-status-badge ${statusMeta.className}`
  statusBadge.innerHTML = `<span class="appointment-status-dot"></span>${statusLabel(status)}`
  card.append(statusBadge)

  const cancelButton = document.createElement('button')
  cancelButton.type = 'button'
  cancelButton.className = 'appointment-cancel-button'
  cancelButton.innerHTML = `${svg('trash')}<span>Cancelar cita</span>`
  if (status === 3) {
    cancelButton.disabled = true
  } else {
    cancelButton.addEventListener('click', async () => {
      if (!confirm('¿Deseas cancelar esta cita?')) return
      cancelButton.disabled = true
      try {
        await cancelAppointment(appointment.id)
        deps.showMessage('La cita fue cancelada.')
        deps.reload()
      } catch (error) {
        cancelButton.disabled = false
        deps.showError(error.message)
      }
    })
  }
  card.append(cancelButton)

  const chevron = document.createElement('span')
  chevron.className = 'appointment-chevron'
  chevron.innerHTML = svg('chevron')
  card.append(chevron)

  return card
}

export function renderAppointments(elements, appointments, deps) {
  const { list, countEl, countTextEl } = elements.list ? elements : { list: elements, countEl: null, countTextEl: null }
  list.replaceChildren()
  updateCountBadge(countEl, countTextEl, appointments.length)

  if (!appointments.length) {
    const empty = document.createElement('p')
    empty.className = 'empty-state'
    empty.textContent = 'No tienes citas registradas.'
    list.append(empty)
    return
  }

  appointments
    .slice()
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .forEach((appointment) => list.append(buildCard(appointment, deps)))
}