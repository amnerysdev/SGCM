import { requestJson } from './http-client.js'

const PATIENTS_URL = '/api/patients'

export function getAllPatients() {
  return requestJson(PATIENTS_URL, {}, 'Debes iniciar sesión para consultar el perfil.')
}

export function getPatientById(id) {
  return requestJson(`${PATIENTS_URL}/${encodeURIComponent(id)}`)
}

export function getCurrentPatient() {
  return requestJson(`${PATIENTS_URL}/me`, {}, 'Debes iniciar sesión para consultar el perfil.')
}

export function createPatient(dto) {
  return requestJson(PATIENTS_URL, { method: 'POST', body: JSON.stringify(dto) })
}

export function updatePatient(id, dto) {
  return requestJson(`${PATIENTS_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ ...dto, id }),
  })
}

export function deletePatient(id) {
  return requestJson(`${PATIENTS_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}