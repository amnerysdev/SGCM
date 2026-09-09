export function setProfileText(elementId, value) {
  const element = document.getElementById(elementId)
  if (!element) return

  element.textContent = value || 'No disponible'
  element.classList.remove('loading')
}

export function showProfileMessage(message, type = 'error') {
  const element = document.getElementById('profile-message')
  if (!element) return

  element.textContent = message
  element.className = `message visible ${type}`
}

export function calculateInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function setupProfileRetry(loadProfile) {
  document.getElementById('retry-profile')?.addEventListener('click', loadProfile)
}
