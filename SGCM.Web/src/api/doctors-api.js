import { requestJson } from './http-client.js'

const DOCTORS_URL = '/api/doctors'

export function getAllDoctors() {
  return requestJson(DOCTORS_URL, {}, 'Debes iniciar sesión para consultar el perfil.')
}

export function getDoctorById(id) {
  return requestJson(`${DOCTORS_URL}/${encodeURIComponent(id)}`)
}

export function getDoctorsBySpecialty(specialtyId) {
  return requestJson(`${DOCTORS_URL}/by-specialty/${encodeURIComponent(specialtyId)}`)
}

export function getCurrentDoctor() {
  return requestJson(`${DOCTORS_URL}/me`, {}, 'Debes iniciar sesión para consultar el perfil.')
}

export function createDoctor(dto) {
  return requestJson(DOCTORS_URL, { method: 'POST', body: JSON.stringify(dto) })
}

export function updateDoctor(id, dto) {
  return requestJson(`${DOCTORS_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ ...dto, id }),
  })
}

export function deleteDoctor(id) {
  return requestJson(`${DOCTORS_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}