import { getDoctorAppointments } from '../../api/appointments-api.js'
import { getCurrentDoctor } from '../../api/profile-api.js'
import { createFeedback, renderAppointments } from './doctor-appointments-view.js'

const list = document.getElementById('appointments-list')
const feedback = createFeedback(document.getElementById('error'), document.getElementById('message'))

async function loadAppointments(doctorId) {
  try {
    const appointments = await getDoctorAppointments(doctorId)
    renderAppointments(list, appointments || [], { ...feedback, reload: () => loadAppointments(doctorId) })
  } catch (error) {
    list.replaceChildren()
    feedback.showError(error.message)
  }
}

async function init() {
  try {
    const doctor = await getCurrentDoctor()
    await loadAppointments(doctor.id)
  } catch (error) {
    list.replaceChildren()
    feedback.showError(error.message || 'No se pudo identificar tu perfil médico.')
  }
}

init()