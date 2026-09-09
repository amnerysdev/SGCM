import { requestJson } from './http-client.js'

const AVAILABILITY_URL = '/api/availability'

export function getDoctorAvailability(doctorId) {
  return requestJson(`${AVAILABILITY_URL}/doctor/${encodeURIComponent(doctorId)}`)
}

export function createAvailability(dto) {
  return requestJson(AVAILABILITY_URL, {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export function deleteAvailability(id) {
  return requestJson(`${AVAILABILITY_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
