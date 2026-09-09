import { getAllDoctors, getDoctorsBySpecialty } from './doctors-api.js'
import { getAllSpecialties, getSpecialtyById } from './specialties-api.js'

export function getDoctors() {
  return getAllDoctors()
}

export function getDoctorsBySpecialtyId(specialtyId) {
  return getDoctorsBySpecialty(specialtyId)
}

export function getSpecialties() {
  return getAllSpecialties()
}

export function getSpecialty(id) {
  return getSpecialtyById(id)
}