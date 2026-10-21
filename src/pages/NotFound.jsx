import LinkButton from '../components/LinkButton.jsx'

function NotFound() {
  return (
    <section>
      <h1 className="text-3xl font-extrabold text-ink">Página no encontrada</h1>
      <p className="mt-2 text-muted">La ruta que buscas no existe.</p>
      <LinkButton to="/" className="mt-6">
        Volver al inicio
      </LinkButton>
    </section>
  )
}

export default NotFound
