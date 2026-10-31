import editorialImage from '../../assets/home/editorial-cafe.jpg'
import Container from '../Container.jsx'
import LinkButton from '../LinkButton.jsx'

function EditorialBanner() {
  return (
    <section className="mt-16 bg-success-soft py-14">
      <Container className="grid items-center gap-10 md:grid-cols-2">
        <img
          src={editorialImage}
          alt="Caficultor recolectando granos en un cafetal"
          loading="lazy"
          className="aspect-[3/2] w-full rounded-2xl object-cover"
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-success">
            La escapada que necesitabas
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink sm:text-4xl">
            Del primer café al último rayo de sol.
          </h2>
          <p className="mt-4 text-muted">
            Una mañana entre cafetales, una tarde de pueblos coloridos y una buena conversación
            sin mirar el reloj.
          </p>
          <p className="mt-4 text-sm font-semibold text-ink">
            Ruta de las Flores · Ideal para un fin de semana
          </p>
          <LinkButton to="/experiencias" variant="outline" className="mt-6">
            Descubrir la ruta →
          </LinkButton>
        </div>
      </Container>
    </section>
  )
}

export default EditorialBanner
