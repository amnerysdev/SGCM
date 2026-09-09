const BASE_URL = '/api/account'

async function postJson(path, body) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = await response.json().catch(() => null)
    if (response.status === 429) return { success: false, message: 'Demasiados intentos. Espera un momento antes de volver a intentarlo.' }
    if (!payload) return { success: false, message: 'El servidor no pudo procesar la solicitud. Inténtalo de nuevo.' }
    return payload
  } catch {
    return { success: false, message: 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.' }
  }
}

export function register(dto) {
  return postJson('/register', dto)
}

export function login(dto) {
  return postJson('/login', dto)
}

export async function confirmEmail(userId, token) {
  const params = new URLSearchParams({ userId, token })
  const response = await fetch(`${BASE_URL}/confirm-email?${params.toString()}`)
  return response.json()
}

export function forgotPassword(email) {
  return postJson('/forgot-password', { email })
}

export function resetPassword(userId, token, newPassword, confirmPassword) {
  return postJson('/reset-password', { userId, token, newPassword, confirmPassword })
}
