import LinkButton from '../components/LinkButton.jsx'

function Home() {
  return (
    <section className="rounded-3xl bg-ink px-8 py-16 text-white md:px-14 md:py-24">
      <p className="text-xs font-bold uppercase tracking-wide text-white/80">
        Hecho de olas, café y buenas historias
      </p>
      <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">
        El Salvador se vive, no solo se visita.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-white/80">
        Encuentra experiencias auténticas, conoce a guías locales y vuelve con
        algo más que fotografías.
      </p>
      <LinkButton to="/experiencias" className="mt-8">
        Buscar experiencias
      </LinkButton>
    </section>
  )
}

export default Home
