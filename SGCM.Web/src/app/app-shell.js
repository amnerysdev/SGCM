import { getSession } from '../shared/session.js'
import { createShell } from './shell-view.js'
import { bindShellEvents } from './shell-events.js'

export function mountAppShell() {
  if (document.querySelector('.app-shell')) return true
  const session = getSession()
  if (!session) { window.location.replace('/index.html'); return false }
  bindShellEvents(createShell(session))
  return true
}

mountAppShell()