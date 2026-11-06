import { destinations } from '../../data/home.js'
import Container from '../Container.jsx'
import DestinationCard from '../DestinationCard.jsx'
import SectionHeading from '../SectionHeading.jsx'

function DestinationsSection() {
  return (
    <Container className="pt-16">
      <SectionHeading eyebrow="Cerca de ti, lejos de la rutina" title="Un país, mil maneras de sentirlo" />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {destinations.map((destination) => (
          <DestinationCard key={destination.id} {...destination} />
        ))}
      </div>
    </Container>
  )
}

export default DestinationsSection
