import { formatDate, formatTime, escapeHtml } from './booking-rules.js'

export const ICONS = {
  success: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m14 24 7 7 14-16"/></svg>',
  calendar: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="7" width="22" height="20" rx="2"/><path d="M10 4v6m12-6v6M5 13h22m-12 5v6m-3-3h6"/></svg>',
  stethoscope: '<svg viewBox="0 0 42 42" aria-hidden="true"><path d="M14 6v10a7 7 0 0 0 14 0V6m-14 0h-3m3 0h3m11 0h3m-3 0h-3M21 23v6a6 6 0 0 0 12 0v-3"/><circle cx="33" cy="22" r="3"/></svg>',
  professional: '<svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="11" r="6"/><path d="M10 34v-4c0-5 5-9 11-9s11 4 11 9v4"/><path d="M28 23v11m-4-7h8m-8 4h8"/></svg>',
  time: '<svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="14"/><path d="M21 13v9l6 4"/></svg>',
  history: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 15a10 10 0 1 1 3 7"/><path d="M6 22v-6h6m4-7v7l-4-2"/></svg>',
  appointmentStatus: '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
}

const icon = (name) => ICONS[name]

export function setupConfirmationShell() {
  document.body.classList.add('appointment-confirmation-shell')
  document.querySelector('.app-shell')?.classList.add('appointment-confirmation-shell')
}

export function setError(field, message = '') {
  const errorElement = document.getElementById(`${field}-error`)
  if (errorElement) errorElement.textContent = message
  document.getElementById(field === 'date' ? 'appointment-date' : field)?.setAttribute('aria-invalid', String(Boolean(message)))
}

export function clearFeedback(error) {
  error.hidden = true
  error.textContent = ''
}

export function showError(error, message) {
  error.textContent = message
  error.hidden = false
  error.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

export function setCurrentStep(steps, index) {
  steps.forEach((step, position) => {
    const completed = position < index
    const current = position === index
    step.classList.toggle('is-complete', completed)
    step.classList.toggle('is-current', current)
    if (current) step.setAttribute('aria-current', 'step')
    else step.removeAttribute('aria-current')
  })
}

export function resetSlots(ui, message = 'Selecciona un profesional y una fecha para consultar horarios.') {
  ui.state.selectedSlot = null
  ui.slots.replaceChildren()
  ui.summary.textContent = message
  ui.selection.textContent = 'Aún no has seleccionado un horario.'
  ui.submit.disabled = true
  setError('time')
}

export function renderDoctorOptions(ui) {
  const specialtyId = ui.specialty.value
  ui.doctor.replaceChildren(new Option(specialtyId ? 'Selecciona un profesional' : 'Selecciona primero una especialidad', ''))
  ui.state.doctors.filter((item) => item.specialtyId === specialtyId).forEach((item) => ui.doctor.add(new Option(`Profesional · Lic. ${item.medicalLicense || 'No disponible'}`, item.id)))
  ui.doctor.disabled = !specialtyId
  ui.dateInput.disabled = true
  resetSlots(ui)
}

export function renderSlotGrid(ui, available) {
  const grid = document.createElement('div')
  grid.className = 'booking-slot-grid'
  available.forEach((slot) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'booking-slot'
    button.textContent = formatTime(slot)
    button.setAttribute('aria-pressed', 'false')
    button.addEventListener('click', () => {
      ui.state.selectedSlot = slot
      grid.querySelectorAll('button').forEach((item) => {
        item.classList.remove('is-selected')
        item.setAttribute('aria-pressed', 'false')
      })
      button.classList.add('is-selected')
      button.setAttribute('aria-pressed', 'true')
      ui.selection.textContent = `${formatDate(slot)} · ${formatTime(slot)}`
      ui.submit.disabled = !ui.reason.value.trim()
      setCurrentStep(ui.steps, 2)
      setError('time')
    })
    grid.append(button)
  })
  ui.slots.append(grid)
}

export function renderConfirmation(ui, { doctorLabel, specialtyLabel, slot }) {
  const confirmation = document.getElementById('booking-confirmation')
  confirmation.innerHTML = `<div class="confirmation-success"><div class="confirmation-burst" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="confirmation-icon">${icon('success')}</div><h2>¡Cita registrada con éxito!</h2><p>Hemos recibido tu solicitud y te notificaremos cuando sea confirmada.</p></div><section class="appointment-details" aria-labelledby="appointment-details-title"><div class="appointment-details-heading"><span></span><h3 id="appointment-details-title">${icon('calendar')}Detalles de tu cita</h3><span></span></div><dl class="appointment-details-card"><div class="appointment-detail"><div class="appointment-detail-icon">${icon('stethoscope')}</div><dt>Especialidad</dt><dd>${escapeHtml(specialtyLabel)}</dd></div><div class="appointment-detail"><div class="appointment-detail-icon">${icon('professional')}</div><dt>Profesional</dt><dd>${escapeHtml(doctorLabel)}</dd></div><div class="appointment-detail"><div class="appointment-detail-icon">${icon('time')}</div><dt>Fecha y hora</dt><dd>${escapeHtml(formatDate(slot))}</dd><time>${icon('history')}${escapeHtml(formatTime(slot))}</time></div></dl></section><a class="appointment-status-link" href="/mis-citas.html">${icon('appointmentStatus')}<span>Ver estado de mi cita</span></a>`
  confirmation.hidden = false
  document.querySelector('.booking-page')?.classList.add('is-confirmed')
  ui.form.hidden = true
  setCurrentStep(ui.steps, 2)
  confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' })
}