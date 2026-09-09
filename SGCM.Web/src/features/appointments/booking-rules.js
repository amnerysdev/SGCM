export function formatDate(value) {
  return new Intl.DateTimeFormat('es-DO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(value)
}

export function formatTime(value) {
  return new Intl.DateTimeFormat('es-DO', { hour: '2-digit', minute: '2-digit' }).format(value)
}

export function getDay(value) {
  return ((new Date(`${value}T00:00:00`).getDay() + 6) % 7) + 1
}

export function toDateTime(date, time) {
  return new Date(`${date}T${time}`)
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
}

export function getOccupiedTimestamps(appointments, date) {
  const target = toDateTime(date, '00:00').toDateString()
  return new Set(appointments.filter((item) => item.status !== 4 && new Date(item.dateTime).toDateString() === target).map((item) => new Date(item.dateTime).getTime()))
}

export function computeAvailableSlots(date, availability, occupied, now = new Date()) {
  const available = []
  availability.filter((item) => item.day === getDay(date)).forEach((block) => {
    const cursor = toDateTime(date, block.startTime)
    const end = toDateTime(date, block.endTime)
    while (cursor < end) {
      if (cursor > now && !occupied.has(cursor.getTime())) available.push(new Date(cursor))
      cursor.setMinutes(cursor.getMinutes() + 30)
    }
  })
  return available
}