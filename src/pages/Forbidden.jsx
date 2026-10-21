import LinkButton from '../components/LinkButton.jsx'

function Forbidden() {
  return (
    <section>
      <h1 className="text-3xl font-extrabold text-ink">Sin permiso</h1>
      <p className="mt-2 text-muted">
        Tu cuenta no tiene acceso a esta sección.
      </p>
      <LinkButton to="/" className="mt-6">
        Volver al inicio
      </LinkButton>
    </section>
  )
}

export default Forbidden
