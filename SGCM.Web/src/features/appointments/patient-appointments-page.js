import { getPatientAppointments } from '../../api/appointments-api.js'
import { getCurrentPatient } from '../../api/profile-api.js'
import { createFeedback, renderAppointments } from './patient-appointments-view.js'

const form = document.getElementById('appointments-form')
const patientIdInput = document.getElementById('patient-id')
const list = document.getElementById('appointments-list')
const feedback = createFeedback(document.getElementById('error'), document.getElementById('message'))

async function loadAppointments(patientId) {
  try {
    const appointments = await getPatientAppointments(patientId)
    renderAppointments(list, appointments || [], { ...feedback, reload: () => loadAppointments(patientId) })
  } catch (error) {
    list.replaceChildren()
    feedback.showError(error.message)
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const patientId = patientIdInput.value.trim()
  if (!patientId) {
    feedback.showError('Escribe el identificador de tu perfil de paciente.')
    return
  }
  loadAppointments(patientId)
})

async function init() {
  try {
    const patient = await getCurrentPatient()
    patientIdInput.value = patient.id
    await loadAppointments(patient.id)
  } catch (error) {
    list.replaceChildren()
    feedback.showError(error.message || 'No se pudo identificar tu perfil de paciente.')
  }
}

init()