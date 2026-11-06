import { useState } from 'react'
import Button from '../Button.jsx'
import Container from '../Container.jsx'
import FormField from '../FormField.jsx'

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    // La suscripción se conectará al backend cuando exista el servicio de correo.
    setNotice(
      email.trim()
        ? 'Gracias por tu interés. La suscripción estará disponible muy pronto.'
        : 'Ingresa tu correo electrónico.',
    )
  }

  return (
    <section className="bg-info-soft py-12">
      <Container className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
            Que el próximo plan te encuentre.
          </h2>
          <p className="mt-2 text-muted">Nuevos destinos y buenas ideas, sin llenar tu bandeja.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <FormField
              id="newsletter-email"
              type="email"
              label="Tu correo electrónico"
              placeholder="nombre@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button type="submit" className="py-3.5">
            Quiero inspirarme
          </Button>
        </form>
        {notice && (
          <p role="status" className="text-sm text-muted md:col-span-2 md:text-right">
            {notice}
          </p>
        )}
      </Container>
    </section>
  )
}

export default NewsletterSection
