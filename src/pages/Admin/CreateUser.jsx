import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminCard from '../../components/admin/AdminCard.jsx'
import Notice from '../../components/admin/Notice.jsx'
import Pill from '../../components/admin/Pill.jsx'
import Button from '../../components/Button.jsx'
import FormField from '../../components/FormField.jsx'
import LinkButton from '../../components/LinkButton.jsx'
import SelectField from '../../components/SelectField.jsx'
import api from '../../config/axios'
import { roleDescriptions } from '../../data/admin.js'
import { extractBackendErrorMessage } from '../../lib/operatorRequests.js'

const roleTones = { VISITANTE: 'neutral', OPERADOR: 'success', ADMIN: 'info' }

// El backend crea siempre cuentas con rol Visitante (POST /api/auth/register).
// Operador y Admin requieren un endpoint de administración que aún no existe.
const roleOptions = ['Visitante']

const passwordRules = 'Mínimo 8 caracteres, con mayúscula, minúscula y número.'

function getPasswordError(password) {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (!/[A-Z]/.test(password)) return 'La contraseña debe contener al menos una letra mayúscula.'
  if (!/[a-z]/.test(password)) return 'La contraseña debe contener al menos una letra minúscula.'
  if (!/[0-9]/.test(password)) return 'La contraseña debe contener al menos un número.'
  return ''
}

function CreateUser() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const firstName = form.elements.firstName.value.trim()
    const lastName = form.elements.lastName.value.trim()
    const email = form.elements.email.value.trim()
    const password = form.elements.password.value

    const passwordError = getPasswordError(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setError('')
    setIsLoading(true)

    try {
      // Se usa el mismo endpoint que el registro público. La respuesta trae el token de
      // la cuenta nueva: no se guarda, para no reemplazar la sesión del administrador.
      await api.post('/auth/register', { email, password, firstName, lastName })

      const name = `${firstName} ${lastName}`.trim()
      navigate('/admin/usuarios', {
        state: {
          notice: `Usuario creado: ${name}. Se envió un correo de verificación a ${email}.`,
        },
      })
    } catch (err) {
      setError(
        extractBackendErrorMessage(err, 'No se pudo crear el usuario. Inténtalo de nuevo.'),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/usuarios" className="text-xs font-semibold text-brand">
        ← Usuarios
      </Link>

      <header>
        <h1 className="text-3xl font-extrabold text-ink">Crear usuario</h1>
        <p className="mt-2 text-sm text-muted">
          Crea una cuenta directamente. La persona recibirá un correo para verificarla.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <AdminCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="user-first-name" name="firstName" label="Nombre" placeholder="Josue" maxLength={80} required />
              <FormField id="user-last-name" name="lastName" label="Apellido" placeholder="Antonio" maxLength={80} required />
            </div>
            <FormField
              id="user-email"
              name="email"
              type="email"
              label="Correo electrónico"
              placeholder="nombre@correo.com"
              maxLength={150}
              required
            />
            <div>
              <SelectField id="user-role" name="role" label="Rol" options={roleOptions} disabled />
              <p className="mt-1.5 text-xs text-muted">
                Las cuentas creadas desde aquí son de Visitante.
              </p>
            </div>
            <FormField
              id="user-password"
              name="password"
              type="text"
              label="Contraseña temporal"
              placeholder="Escribe una contraseña segura"
              hint={passwordRules}
              autoComplete="off"
              maxLength={100}
              required
            />
            <p className="text-xs text-muted">
              Se enviará un correo de verificación a la dirección indicada.
            </p>

            {error && <Notice tone="error">{error}</Notice>}

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-[1fr_2fr]">
              <LinkButton to="/admin/usuarios" variant="outline">
                Cancelar
              </LinkButton>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear usuario'}
              </Button>
            </div>
          </form>
        </AdminCard>

        <AdminCard title="¿Qué puede hacer cada rol?" className="self-start">
          <ul className="space-y-3">
            {roleDescriptions.map((item) => (
              <li key={item.role}>
                <Pill tone={roleTones[item.role]}>{item.role}</Pill>
                <p className="mt-1 text-xs text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-pending">
            Los operadores llegan por solicitud. El rol Admin se asigna directamente en la base
            de datos hasta que el backend lo permita.
          </p>
        </AdminCard>
      </div>
    </div>
  )
}

export default CreateUser
