import { requestJson } from './http-client.js'

const RECORDS_URL = '/api/medical-records'

export function getRecordsByPatient(patientId) {
  return requestJson(`${RECORDS_URL}/patient/${encodeURIComponent(patientId)}`, {}, 'Debes iniciar sesión para consultar los expedientes.')
}

export function createMedicalRecord(dto) {
  return requestJson(RECORDS_URL, {
    method: 'POST',
    body: JSON.stringify(dto),
  }, 'Debes iniciar sesión para consultar los expedientes.')
}