import { categories } from '../../data/home.js'
import CategoryCard from '../CategoryCard.jsx'
import Container from '../Container.jsx'
import SectionHeading from '../SectionHeading.jsx'

function CategoriesSection() {
  return (
    <Container className="pt-16">
      <SectionHeading eyebrow="Encuentra tu forma de viajar" title="¿Qué te mueve hoy?" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} {...category} />
        ))}
      </div>
    </Container>
  )
}

export default CategoriesSection
