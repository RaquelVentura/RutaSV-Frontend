import hostImage from '../../assets/home/anfitrion-surf.jpg'
import Container from '../Container.jsx'
import LinkButton from '../LinkButton.jsx'

function OperatorCta() {
  return (
    <Container className="py-16">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-success">
            Tu conocimiento tiene un lugar aquí
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink sm:text-4xl">
            ¿Conoces un lugar que merece ser vivido?
          </h2>
          <p className="mt-4 text-muted">
            Haz crecer tu negocio compartiendo lo que amas. Tú pones la experiencia; nosotros te
            acercamos a los viajeros.
          </p>
          <LinkButton to="/registro" className="mt-6">
            Publicar experiencia →
          </LinkButton>
        </div>
        <img
          src={hostImage}
          alt="Anfitrión local con una tabla de surf en la playa"
          loading="lazy"
          className="aspect-[56/33] w-full rounded-2xl object-cover"
        />
      </section>
    </Container>
  )
}

export default OperatorCta
