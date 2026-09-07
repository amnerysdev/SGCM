import { login, saveSession, getSession } from './api.js'
import { setFieldError, setLoading, setupPasswordToggle, showAlert, validateEmail, validateRequired } from './auth-form.js'

if (getSession()) {
  window.location.replace('/dashboard.html')
}

const form = document.getElementById('login-form')
const feedbackEl = document.getElementById('feedback')
const email = form.email
const password = form.password
setupPasswordToggle(form.querySelector('.password-toggle'), password)
email.addEventListener('blur', () => validateEmail(email))
password.addEventListener('blur', () => validateRequired(password, 'La contraseña'))
form.addEventListener('input', (event) => { if (event.target.matches('input')) setFieldError(event.target, '') })

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  feedbackEl.hidden = true
  const validEmail = validateEmail(email)
  const validPassword = validateRequired(password, 'La contraseña')
  if (!validEmail || !validPassword) return

  const dto = {
    email: email.value.trim(),
    password: password.value,
  }

  setLoading(form, true)
  const result = await login(dto)
  setLoading(form, false)

  if (!result.success) {
    showAlert(feedbackEl, result.message ?? 'No se pudo iniciar sesión.')
    return
  }

  saveSession(result.data)
  window.location.replace('/dashboard.html')
})
