import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import heroImage from '../../assets/home/hero.jpg'
import { searchCategories } from '../../data/home.js'
import Container from '../Container.jsx'
import Icon from '../Icon.jsx'

function HeroSection() {
  const navigate = useNavigate()
  const [search, setSearch] = useState({
    zone: '',
    category: searchCategories[0],
    date: '',
    people: '2',
  })

  return (
    <Container className="">
      <section className="relative overflow-hidden bg-ink text-white py-6">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-y-0 right-0 h-full w-full object-cover [mask-image:linear-gradient(to_right,transparent,black_22%)] md:w-[62%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/40 to-transparent" />

        <div className="relative px-6 pt-16 sm:px-12 sm:py-6">
          <p className="text-xs font-bold uppercase tracking-wide text-white/90">
            Hecho de olas, café y buenas historias
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight sm:text-6xl">
            El Salvador se vive, no solo se visita.
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/90">
            Encuentra experiencias auténticas, conoce a guías locales y vuelve con algo más que
            fotografías.
          </p>
          <p className="mt-5 flex items-center gap-2 text-sm text-white/90">
            <Icon name="pin" className="h-4 w-4" />
            El Tunco · La Libertad · El Salvador
          </p>
        </div>
      </section>
    </Container>
  )
}

export default HeroSection
