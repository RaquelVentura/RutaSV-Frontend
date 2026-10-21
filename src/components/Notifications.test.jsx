import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ApiError } from '../lib/ApiError.js'
import { notify } from '../lib/notify.js'
import Notifications from './Notifications.jsx'

describe('Notifications', () => {
  it('muestra un mensaje de éxito', async () => {
    render(<Notifications />)

    act(() => {
      notify.success('Solicitud aprobada')
    })

    expect(await screen.findByText('Solicitud aprobada')).toBeInTheDocument()
  })

  it('muestra el mensaje de un error de la API', async () => {
    render(<Notifications />)

    act(() => {
      notify.apiError(new ApiError(401, { detail: 'Correo o contraseña incorrectos.' }))
    })

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
  })
})
