const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function setFieldError(input, message) {
  const error = document.getElementById(`${input.id}-error`)
  input.setAttribute('aria-invalid', String(Boolean(message)))
  input.closest('.field')?.classList.toggle('has-error', Boolean(message))
  input.closest('.field')?.classList.remove('is-valid')
  if (error) error.textContent = message || ''
}

export function setFieldValid(input) {
  input.setAttribute('aria-invalid', 'false')
  const field = input.closest('.field')
  field?.classList.remove('has-error')
  field?.classList.add('is-valid')
  const error = document.getElementById(`${input.id}-error`)
  if (error) error.textContent = ''
}

export function validateEmail(input) {
  const value = input.value.trim()
  const message = !value ? 'El correo electrónico es obligatorio.' : !EMAIL_PATTERN.test(value) ? 'Ingresa un correo electrónico válido.' : ''
  setFieldError(input, message)
  return !message
}

export function validateRequired(input, label) {
  const message = input.value ? '' : `${label} es obligatoria.`
  setFieldError(input, message)
  return !message
}

export function validatePassword(input) {
  const value = input.value
  let message = ''
  if (!value) message = 'La contraseña es obligatoria.'
  else if (value.length < 12) message = 'La contraseña debe tener al menos 12 caracteres.'
  else if (!/[A-Z]/.test(value)) message = 'Incluye al menos una letra mayúscula.'
  else if (!/[a-z]/.test(value)) message = 'Incluye al menos una letra minúscula.'
  else if (!/\d/.test(value)) message = 'Incluye al menos un número.'
  else if (!/[^a-zA-Z\d]/.test(value)) message = 'Incluye al menos un símbolo.'
  else if (new Set(value).size < 6) message = 'Usa al menos 6 caracteres distintos.'
  setFieldError(input, message)
  return !message
}

export function showAlert(element, message, type = 'error') {
  element.textContent = message
  element.className = `alert alert--${type}`
  element.hidden = false
  window.clearTimeout(element._dismissTimer)
  const duration = type === 'error' ? 7000 : type === 'warning' ? 6000 : 5000
  element._dismissTimer = window.setTimeout(() => { element.hidden = true }, duration)
}

export function setLoading(form, isLoading) {
  const submit = form.querySelector('[type="submit"]')
  submit.disabled = isLoading
  submit.setAttribute('aria-busy', String(isLoading))
  submit.querySelector('.button-label').hidden = isLoading
  submit.querySelector('.button-loading').hidden = !isLoading
}

export function setupPasswordToggle(button, input) {
  button.addEventListener('click', () => {
    const show = input.type === 'password'
    input.type = show ? 'text' : 'password'
    button.classList.toggle('is-visible', show)
    button.setAttribute('aria-label', `${show ? 'Ocultar' : 'Mostrar'} contraseña`)
    button.setAttribute('aria-pressed', String(show))
  })
}
