import { getSession, register } from './api.js'
import { setFieldError, setFieldValid, setLoading, setupPasswordToggle, showAlert, validateEmail, validatePassword, validateRequired } from './auth-form.js'

if (getSession()) window.location.replace('/dashboard.html')

const form = document.getElementById('register-form')
const feedbackEl = document.getElementById('feedback')
const { fullName, email, phoneNumber, password, confirmPassword, role } = form

function getPhoneValidationMessage(value) {
  const trimmed = value.trim()
  if (!trimmed) return 'El teléfono es obligatorio.'
  if (!/^\+?[\d() .-]+$/.test(trimmed) || (trimmed.includes('+') && !trimmed.startsWith('+'))) return 'Usa solo dígitos; se permiten espacios, guiones, paréntesis y el prefijo +1.'

  let digits = trimmed.replace(/\D/g, '')
  if (trimmed.startsWith('+')) {
    if (!digits.startsWith('1')) return 'El único código de país admitido es +1.'
    digits = digits.slice(1)
  }
  if (digits.length !== 10) return 'Ingresa 10 dígitos, con o sin el prefijo +1.'
  if (/^(.)\1{9}$/.test(digits)) return 'Ingresa un número de teléfono válido.'
  if (!['809', '829', '849'].includes(digits.slice(0, 3))) return 'El código de área debe ser 809, 829 o 849.'
  if (!/[2-9]/.test(digits[3])) return 'El número telefónico no tiene una estructura válida.'
  return ''
}

function formatPhone(value) {
  const countryCode = value.trim().startsWith('+') ? '+1 ' : ''
  let digits = value.replace(/\D/g, '')
  if (countryCode && digits.startsWith('1')) digits = digits.slice(1)
  return digits.length === 10 ? `${countryCode}(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : value
}

function validatePhone() {
  const message = getPhoneValidationMessage(phoneNumber.value)
  if (message) setFieldError(phoneNumber, message)
  else setFieldValid(phoneNumber)
  return !message
}

function validateConfirmation() {
  const message = !confirmPassword.value ? 'Confirma tu contraseña.' : confirmPassword.value !== password.value ? 'Las contraseñas no coinciden.' : ''
  setFieldError(confirmPassword, message)
  return !message
}

setupPasswordToggle(form.querySelectorAll('.password-toggle')[0], password)
setupPasswordToggle(form.querySelectorAll('.password-toggle')[1], confirmPassword)
fullName.addEventListener('blur', () => validateRequired(fullName, 'El nombre completo'))
email.addEventListener('blur', () => validateEmail(email))
phoneNumber.addEventListener('input', () => {
  const original = phoneNumber.value
  const sanitized = original.replace(/(?!^)\+|[^\d+() .-]/g, '')
  if (original !== sanitized) {
    phoneNumber.value = sanitized
    setFieldError(phoneNumber, 'Usa solo dígitos; se permiten espacios, guiones, paréntesis y el prefijo +1.')
    return
  }

  const digits = sanitized.replace(/\D/g, '')
  if (phoneNumber.dataset.touched === 'true' || digits.length >= 10) validatePhone()
  else setFieldError(phoneNumber, '')
})
phoneNumber.addEventListener('blur', () => {
  phoneNumber.dataset.touched = 'true'
  if (validatePhone()) phoneNumber.value = formatPhone(phoneNumber.value)
})
role.addEventListener('change', () => validateRequired(role, 'El tipo de cuenta'))
password.addEventListener('blur', () => {
  password.dataset.touched = 'true'
  validatePassword(password)
})
confirmPassword.addEventListener('blur', validateConfirmation)
form.addEventListener('input', (event) => {
  if (!event.target.matches('input')) return
  if (event.target === password && password.dataset.touched === 'true') {
    validatePassword(password)
    return
  }
  if (event.target !== phoneNumber) setFieldError(event.target, '')
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  feedbackEl.hidden = true

  const isValid = [
    validateRequired(fullName, 'El nombre completo'),
    validateEmail(email),
    validatePhone(),
    validateRequired(role, 'El tipo de cuenta'),
    validatePassword(password),
    validateConfirmation(),
  ].every(Boolean)
  if (!isValid) return

  const dto = {
    fullName: fullName.value.trim(),
    email: email.value.trim(),
    phoneNumber: phoneNumber.value.trim(),
    password: password.value,
    confirmPassword: confirmPassword.value,
    role: role.value,
  }

  setLoading(form, true)
  const result = await register(dto)
  setLoading(form, false)

  if (!result.success) {
    showAlert(feedbackEl, result.message ?? 'No se pudo crear la cuenta.')
    return
  }

  form.reset()
  showAlert(feedbackEl, result.message ?? 'Tu cuenta fue creada correctamente. Ya puedes iniciar sesión.', 'success')
})
