import { serializeLocalDateTime } from '../../appointment-utils.js'
import { changeAppointmentStatus, updateAppointment } from '../../api/appointments-api.js'

export function changeStatus(id, status) {
  return changeAppointmentStatus(id, status)
}

function buildRescheduleForm(appointment, { showMessage, showError, reload }) {
  const form = document.createElement('form')
  form.className = 'reschedule-form'
  form.hidden = true

  const input = document.createElement('input')
  input.type = 'datetime-local'
  input.required = true

  const save = document.createElement('button')
  save.type = 'submit'
  save.textContent = 'Guardar nueva fecha'

  form.append(input, save)

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (!input.value) return
    try {
      await updateAppointment(appointment.id, {
        dateTime: serializeLocalDateTime(new Date(input.value)),
        reason: appointment.reason,
      })
      showMessage('La cita fue reprogramada y quedó pendiente de confirmación.')
      reload()
    } catch (error) {
      showError(error.message)
    }
  })

  return form
}

function createActionButton(label, className, onClick) {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = label
  if (className) button.className = className
  button.addEventListener('click', onClick)
  return button
}

export function buildAppointmentActions(appointment, deps) {
  const { reload, showMessage, showError } = deps
  const actions = document.createElement('div')
  actions.className = 'appointment-actions'
  const rescheduleForm = buildRescheduleForm(appointment, deps)

  if (appointment.status === 1) {
    actions.append(
      createActionButton('Confirmar', '', async () => {
        try {
          await changeStatus(appointment.id, 2)
          showMessage('La cita fue confirmada.')
          reload()
        } catch (error) {
          showError(error.message)
        }
      }),
      createActionButton('Rechazar', 'cancel-button', async () => {
        if (!confirm('¿Deseas rechazar esta solicitud de cita?')) return
        try {
          await changeStatus(appointment.id, 4)
          showMessage('La cita fue rechazada.')
          reload()
        } catch (error) {
          showError(error.message)
        }
      })
    )
  }

  if (appointment.status === 2) {
    actions.append(
      createActionButton('Marcar como completada', '', async () => {
        try {
          await changeStatus(appointment.id, 3)
          showMessage('La cita fue marcada como completada.')
          reload()
        } catch (error) {
          showError(error.message)
        }
      }),
      createActionButton('Cancelar cita', 'cancel-button', async () => {
        if (!confirm('¿Deseas cancelar esta cita?')) return
        try {
          await changeStatus(appointment.id, 4)
          showMessage('La cita fue cancelada.')
          reload()
        } catch (error) {
          showError(error.message)
        }
      })
    )
  }

  const rescheduleButton = createActionButton('Reprogramar', 'button-secondary', () => {
    rescheduleForm.hidden = !rescheduleForm.hidden
  })
  actions.append(rescheduleButton)

  return { actions, rescheduleForm }
}