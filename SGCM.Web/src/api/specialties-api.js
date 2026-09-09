import { requestJson } from './http-client.js'

const SPECIALTIES_URL = '/api/specialties'

export function getAllSpecialties() {
  return requestJson(SPECIALTIES_URL, {}, 'Debes iniciar sesión para administrar las especialidades.')
}

export function getSpecialtyById(id) {
  return requestJson(`${SPECIALTIES_URL}/${encodeURIComponent(id)}`, {}, 'Debes iniciar sesión para administrar las especialidades.')
}

export function createSpecialty(dto) {
  return requestJson(SPECIALTIES_URL, { method: 'POST', body: JSON.stringify(dto) }, 'Debes iniciar sesión para administrar las especialidades.')
}

export function updateSpecialty(id, dto) {
  return requestJson(`${SPECIALTIES_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ ...dto, id }),
  }, 'Debes iniciar sesión para administrar las especialidades.')
}

export function deleteSpecialty(id) {
  return requestJson(`${SPECIALTIES_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' }, 'Debes iniciar sesión para administrar las especialidades.')
}