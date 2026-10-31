import { Link, useNavigate } from 'react-router-dom'
import AdminCard from '../../components/admin/AdminCard.jsx'
import Pill from '../../components/admin/Pill.jsx'
import Button from '../../components/Button.jsx'
import FormField from '../../components/FormField.jsx'
import LinkButton from '../../components/LinkButton.jsx'
import SelectField from '../../components/SelectField.jsx'
import { roleDescriptions } from '../../data/admin.js'

const roleTones = { VISITANTE: 'neutral', OPERADOR: 'success', ADMIN: 'info' }
const roleOptions = ['Visitante', 'Operador', 'Admin']

function CheckField({ id, label, defaultChecked }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-ink">
      <input
        id={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-4 accent-brand"
      />
      {label}
    </label>
  )
}

function CreateUser() {
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const name = `${form.elements.firstName.value} ${form.elements.lastName.value}`.trim()
    
    navigate('/admin/usuarios', { state: { notice: `Usuario creado: ${name}.` } })
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
              <FormField id="user-first-name" name="firstName" label="Nombre" placeholder="Josue" required />
              <FormField id="user-last-name" name="lastName" label="Apellido" placeholder="Antonio" required />
            </div>
            <FormField
              id="user-email"
              name="email"
              type="email"
              label="Correo electrónico"
              placeholder="nombre@correo.com"
              required
            />
            <SelectField id="user-role" name="role" label="Rol" options={roleOptions} />
            <FormField
              id="user-password"
              name="password"
              type="text"
              label="Contraseña temporal"
              placeholder="Genera o escribe una contraseña segura"
              autoComplete="off"
              required
            />
            <div className="space-y-2">
              <CheckField id="user-force-change" label="Pedir que cambie la contraseña en su primer inicio de sesión" defaultChecked />
              <CheckField id="user-send-verification" label="Enviar correo de verificación" defaultChecked />
            </div>
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-[1fr_2fr]">
              <LinkButton to="/admin/usuarios" variant="outline">
                Cancelar
              </LinkButton>
              <Button type="submit">Crear usuario</Button>
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
            Los operadores normalmente llegan por solicitud. Usa «Operador» solo para casos
            excepcionales.
          </p>
        </AdminCard>
      </div>
    </div>
  )
}

export default CreateUser
