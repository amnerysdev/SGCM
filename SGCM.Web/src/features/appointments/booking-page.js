import { serializeLocalDateTime } from '../../appointment-utils.js'
import { requestJson } from '../../api/http-client.js'
import { createBookingState } from './booking-state.js'
import { computeAvailableSlots, formatDate, getOccupiedTimestamps, toDateTime } from './booking-rules.js'
import { clearFeedback, renderConfirmation, renderDoctorOptions, renderSlotGrid, resetSlots, setCurrentStep, setError, setupConfirmationShell, showError } from './booking-view.js'

setupConfirmationShell()

const state = createBookingState()

const ui = {
  state,
  form: document.getElementById('booking-form'),
  specialty: document.getElementById('specialty'),
  doctor: document.getElementById('doctor'),
  dateInput: document.getElementById('appointment-date'),
  reason: document.getElementById('reason'),
  slots: document.getElementById('slots'),
  error: document.getElementById('booking-error'),
  submit: document.getElementById('submit-booking'),
  selection: document.getElementById('booking-selection'),
  summary: document.getElementById('slot-summary'),
  steps: [...document.querySelectorAll('.booking-steps li')],
}

function request(url, options = {}) {
  return requestJson(url, options, 'Debes iniciar sesión para agendar una cita.')
}

async function loadSlots() {
  clearFeedback(ui.error)
  setError('date')
  resetSlots(ui, 'Consultando horarios disponibles…')
  if (!ui.doctor.value || !ui.dateInput.value) return
  try {
    const [availability, appointments] = await Promise.all([
      request(`/api/availability/doctor/${encodeURIComponent(ui.doctor.value)}`),
      request(`/api/appointments/doctor/${encodeURIComponent(ui.doctor.value)}`),
    ])
    const occupied = getOccupiedTimestamps(appointments, ui.dateInput.value)
    const available = computeAvailableSlots(ui.dateInput.value, availability, occupied)
    if (!available.length) {
      ui.summary.textContent = 'No hay horarios libres en esta fecha.'
      ui.slots.innerHTML = '<p class="booking-empty">Prueba con otra fecha o selecciona otro profesional.</p>'
      return
    }
    ui.summary.textContent = `${available.length} horario${available.length === 1 ? '' : 's'} disponible${available.length === 1 ? '' : 's'} el ${formatDate(toDateTime(ui.dateInput.value, '00:00'))}.`
    renderSlotGrid(ui, available)
  } catch (exception) {
    resetSlots(ui, 'No fue posible consultar los horarios.')
    showError(ui.error, exception.message)
  }
}

async function initialize() {
  ui.dateInput.min = new Date().toISOString().slice(0, 10)
  try {
    const [patient, specialtyList, doctorList] = await Promise.all([
      request('/api/patients/me'),
      request('/api/specialties'),
      request('/api/doctors'),
    ])
    state.patientId = patient.id
    state.doctors = doctorList
    ui.specialty.replaceChildren(new Option('Selecciona una especialidad', ''))
    specialtyList.forEach((item) => ui.specialty.add(new Option(item.name, item.id)))
    ui.specialty.disabled = false
  } catch (exception) {
    showError(ui.error, exception.message || 'No se pudo preparar el formulario de agendamiento.')
  }
}

ui.specialty.addEventListener('change', () => {
  setError('specialty')
  renderDoctorOptions(ui)
  setCurrentStep(ui.steps, 0)
})

ui.doctor.addEventListener('change', () => {
  setError('doctor')
  ui.dateInput.disabled = !ui.doctor.value
  resetSlots(ui, ui.doctor.value ? 'Selecciona una fecha para consultar horarios.' : undefined)
  if (ui.doctor.value) setCurrentStep(ui.steps, 1)
})

ui.dateInput.addEventListener('change', loadSlots)

ui.reason.addEventListener('input', () => {
  document.getElementById('reason-count').textContent = `${ui.reason.value.length}/500`
  setError('reason')
  ui.submit.disabled = !state.selectedSlot || !ui.reason.value.trim()
})

ui.form.addEventListener('submit', async (event) => {
  event.preventDefault()
  clearFeedback(ui.error)
  let valid = true
  if (!ui.specialty.value) { setError('specialty', 'Selecciona una especialidad.'); valid = false }
  if (!ui.doctor.value) { setError('doctor', 'Selecciona un profesional.'); valid = false }
  if (!ui.dateInput.value) { setError('date', 'Selecciona una fecha.'); valid = false }
  if (!state.selectedSlot) { setError('time', 'Selecciona un horario disponible.'); valid = false }
  if (!ui.reason.value.trim()) { setError('reason', 'Describe brevemente el motivo de tu consulta.'); valid = false }
  if (!valid || !state.patientId) return
  ui.submit.disabled = true
  ui.submit.textContent = 'Agendando cita…'
  try {
    await request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        patientId: state.patientId,
        doctorId: ui.doctor.value,
        dateTime: serializeLocalDateTime(state.selectedSlot),
        reason: ui.reason.value.trim(),
      }),
    })
    renderConfirmation(ui, {
      doctorLabel: ui.doctor.selectedOptions[0].textContent,
      specialtyLabel: ui.specialty.selectedOptions[0].textContent,
      slot: state.selectedSlot,
    })
  } catch (exception) {
    showError(ui.error, exception.message)
    ui.submit.disabled = false
    ui.submit.textContent = 'Confirmar cita'
  }
})

initialize()