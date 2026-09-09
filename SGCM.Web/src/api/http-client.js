import { getSession } from '../shared/session.js'

export async function requestJson(url, options = {}, unauthenticatedMessage = 'Debes iniciar sesión para continuar.') {
  const session = getSession()
  const token = session?.jwToken || session?.jwtToken || session?.token
  if (!token) throw new Error(unauthenticatedMessage)

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
      signal: controller.signal,
    })

    const body = await response.text()
    let payload = null
    try {
      payload = body ? JSON.parse(body) : null
    } catch {
      throw new Error('El servidor devolvió una respuesta no válida.')
    }

    if (response.status === 401) throw new Error('Tu sesión no es válida o ha expirado.')
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.message || `No se pudo completar la solicitud (${response.status}).`)
    }

    return payload?.data ?? payload
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('La solicitud tardó demasiado. Intenta nuevamente.')
    if (error instanceof TypeError) throw new Error('No se pudo conectar con el servidor.')
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}
