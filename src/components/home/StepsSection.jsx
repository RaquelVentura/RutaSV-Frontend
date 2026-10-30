import { steps } from '../../data/home.js'
import Container from '../Container.jsx'
import SectionHeading from '../SectionHeading.jsx'

function StepsSection() {
  return (
    <Container className="pt-16">
      <SectionHeading eyebrow="Menos planear, más vivir" title="Tu próxima aventura en tres pasos" />
      <ol className="mt-8 grid gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <li key={step.number}>
            <p className="text-3xl font-extrabold text-brand">{step.number}</p>
            <h3 className="mt-3 text-lg font-bold text-ink">{step.title}</h3>
            <p className="mt-2 text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </Container>
  )
}

export default StepsSection
