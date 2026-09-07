import { resetPassword } from './api.js'
import { setFieldError, setLoading, setupPasswordToggle, showAlert, validatePassword } from './auth-form.js'

const form = document.getElementById('reset-password-form')
const feedbackEl = document.getElementById('feedback')
const newPassword = form.newPassword
const confirmPassword = form.confirmPassword

function validateConfirmation() {
  const message = !confirmPassword.value ? 'Confirma la nueva contraseña.' : confirmPassword.value !== newPassword.value ? 'Las contraseñas no coinciden.' : ''
  setFieldError(confirmPassword, message)
  return !message
}

form.querySelectorAll('.password-toggle').forEach((button, index) => setupPasswordToggle(button, index ? confirmPassword : newPassword))
newPassword.addEventListener('blur', () => validatePassword(newPassword))
confirmPassword.addEventListener('blur', validateConfirmation)
form.addEventListener('input', (event) => { if (event.target.matches('input')) setFieldError(event.target, '') })

const params = new URLSearchParams(window.location.search)
const userId = params.get('userId')
const token = params.get('token')

if (!userId || !token) {
  showAlert(feedbackEl, 'El enlace de restablecimiento es inválido o está incompleto.')
  form.hidden = true
} else {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    feedbackEl.hidden = true
    if (!validatePassword(newPassword) || !validateConfirmation()) return

    setLoading(form, true)
    const result = await resetPassword(userId, token, newPassword.value, confirmPassword.value)
    setLoading(form, false)

    if (!result.success) {
      showAlert(feedbackEl, result.message ?? 'No se pudo restablecer la contraseña.')
      return
    }

    form.reset()
    form.hidden = true
    showAlert(feedbackEl, result.message ?? 'Tu contraseña fue restablecida. Ya puedes iniciar sesión.', 'success')
  })
}
