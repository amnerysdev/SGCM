import { buildAppointmentActions } from './appointment-actions.js'

export function formatDateTime(value) {
  return new Date(value).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' })
}

export function statusLabel(status) {
  return ({ 1: 'Pendiente', 2: 'Confirmada', 3: 'Completada', 4: 'Cancelada' })[status] ?? 'Sin estado'
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

export function renderAppointments(list, appointments, deps) {
  list.replaceChildren()
  if (!appointments.length) {
    list.textContent = 'No tienes citas registradas.'
    return
  }

  appointments.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).forEach((appointment) => {
    const row = document.createElement('div')
    row.className = 'appointment-item'

    const detail = document.createElement('p')
    detail.className = 'appointment-meta'
    detail.textContent = `${formatDateTime(appointment.dateTime)} — ${appointment.reason} · ${statusLabel(appointment.status)}`
    row.append(detail)

    const reload = () => deps.reload()

    if (appointment.status === 1 || appointment.status === 2) {
      const { actions, rescheduleForm } = buildAppointmentActions(appointment, { ...deps, reload })
      row.append(actions, rescheduleForm)
    }

    list.append(row)
  })
}