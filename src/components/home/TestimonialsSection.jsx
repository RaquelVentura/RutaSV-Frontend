import { testimonials } from '../../data/home.js'
import Container from '../Container.jsx'
import SectionHeading from '../SectionHeading.jsx'
import TestimonialCard from '../TestimonialCard.jsx'

function TestimonialsSection() {
  return (
    <section className="mt-16 bg-surface py-14">
      <Container>
        <SectionHeading eyebrow="Lo mejor del viaje es compartirlo" title="Lo dicen quienes ya fueron" />
        <div className="mt-8 grid items-start gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} {...testimonial} />
          ))}
        </div>
      </Container>
    </section>
  )
}

export default TestimonialsSection
