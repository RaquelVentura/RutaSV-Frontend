import { featuredExperiences } from '../../data/home.js'
import Container from '../Container.jsx'
import ExperienceCard from '../ExperienceCard.jsx'
import LinkButton from '../LinkButton.jsx'
import SectionHeading from '../SectionHeading.jsx'

function FeaturedExperiencesSection() {
  return (
    <Container className="pt-16">
      <SectionHeading
        eyebrow="Pequeños planes, grandes recuerdos"
        title="Experiencias destacadas"
        description="Favoritas de quienes ya se animaron a explorar."
        action={
          <LinkButton to="/experiencias" variant="outline">
            Ver todas las experiencias →
          </LinkButton>
        }
      />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {featuredExperiences.map((experience) => (
          <ExperienceCard key={experience.slug} {...experience} />
        ))}
      </div>
    </Container>
  )
}

export default FeaturedExperiencesSection
