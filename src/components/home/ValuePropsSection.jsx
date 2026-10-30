import { valueProps } from '../../data/home.js'
import Container from '../Container.jsx'
import Icon from '../Icon.jsx'

function ValuePropsSection() {
  return (
    <Container className="pt-8">
      <ul className="grid gap-6 sm:grid-cols-3">
        {valueProps.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <Icon name={item.icon} className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
            <div>
              <p className="font-bold text-ink">{item.title}</p>
              <p className="text-sm text-muted">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  )
}

export default ValuePropsSection
