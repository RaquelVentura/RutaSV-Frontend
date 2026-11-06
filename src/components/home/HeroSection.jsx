import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import heroImage from '../../assets/home/hero.jpg'
import { searchCategories } from '../../data/home.js'
import Button from '../Button.jsx'
import Container from '../Container.jsx'
import FormField from '../FormField.jsx'
import Icon from '../Icon.jsx'
import SelectField from '../SelectField.jsx'

function HeroSection() {
  const navigate = useNavigate()
  const [search, setSearch] = useState({
    zone: '',
    category: searchCategories[0],
    date: '',
    people: '2',
  })

  function handleChange(event) {
    const { name, value } = event.target
    setSearch((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (search.zone.trim()) params.set('zona', search.zone.trim())
    if (search.category !== searchCategories[0]) params.set('categoria', search.category)
    if (search.date) params.set('fecha', search.date)
    if (search.people) params.set('personas', search.people)
    const query = params.toString()
    navigate(query ? `/experiencias?${query}` : '/experiencias')
  }

  return (
    <Container className="pt-6">
      <section className="relative overflow-hidden rounded-3xl bg-ink text-white">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-y-0 right-0 h-full w-full object-cover [mask-image:linear-gradient(to_right,transparent,black_22%)] md:w-[62%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/40 to-transparent" />

        <div className="relative px-6 pt-16 sm:px-12 sm:pt-20">
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

        <form
          onSubmit={handleSubmit}
          aria-label="Buscar experiencias"
          className="relative mx-4 mb-6 mt-24 grid gap-4 rounded-2xl bg-surface p-5 text-ink shadow-lg sm:mx-12 sm:mb-8 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end"
        >
          <FormField
            id="search-zone"
            name="zone"
            label="Zona"
            placeholder="Todo El Salvador"
            value={search.zone}
            onChange={handleChange}
          />
          <SelectField
            id="search-category"
            name="category"
            label="Categoría"
            options={searchCategories}
            value={search.category}
            onChange={handleChange}
          />
          <FormField
            id="search-date"
            name="date"
            type="date"
            label="Fecha"
            value={search.date}
            onChange={handleChange}
          />
          <FormField
            id="search-people"
            name="people"
            type="number"
            min="1"
            label="Personas"
            value={search.people}
            onChange={handleChange}
          />
          <Button type="submit" className="py-3.5 sm:col-span-2 lg:col-span-1">
            Buscar experiencias
          </Button>
        </form>
      </section>
    </Container>
  )
}

export default HeroSection
