import { forgotPassword } from './api/account-api.js'
import { getSession } from './shared/session.js'
import { setFieldError, setLoading, showAlert, validateEmail } from './auth-form.js'

if (getSession()) {
  window.location.replace('/dashboard.html')
}

const form = document.getElementById('forgot-password-form')
const feedbackEl = document.getElementById('feedback')

const email = form.email
email.addEventListener('blur', () => validateEmail(email))
email.addEventListener('input', () => setFieldError(email, ''))

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  feedbackEl.hidden = true
  if (!validateEmail(email)) return

  setLoading(form, true)
  const result = await forgotPassword(email.value.trim())
  setLoading(form, false)

  if (result.success) form.reset()
  showAlert(
    feedbackEl,
    result.message ?? 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
    result.success ? 'success' : 'error',
  )
})
