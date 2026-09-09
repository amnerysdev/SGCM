import { requestJson } from './http-client.js'

const APPOINTMENTS_URL = '/api/appointments'

export function getDoctorAppointments(doctorId) {
  return requestJson(`${APPOINTMENTS_URL}/doctor/${encodeURIComponent(doctorId)}`)
}

export function getPatientAppointments(patientId) {
  return requestJson(`${APPOINTMENTS_URL}/patient/${encodeURIComponent(patientId)}`)
}

export function createAppointment(dto) {
  return requestJson(APPOINTMENTS_URL, {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export function updateAppointment(id, dto) {
  return requestJson(`${APPOINTMENTS_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  })
}

export function cancelAppointment(id) {
  return requestJson(`${APPOINTMENTS_URL}/${encodeURIComponent(id)}/cancel`, {
    method: 'PATCH',
  })
}

export function changeAppointmentStatus(id, status) {
  return requestJson(`${APPOINTMENTS_URL}/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
