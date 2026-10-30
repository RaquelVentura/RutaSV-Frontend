import { useLocation } from 'react-router-dom'
import Container from '../components/Container.jsx'
import CategoriesSection from '../components/home/CategoriesSection.jsx'
import DestinationsSection from '../components/home/DestinationsSection.jsx'
import EditorialBanner from '../components/home/EditorialBanner.jsx'
import FeaturedExperiencesSection from '../components/home/FeaturedExperiencesSection.jsx'
import HeroSection from '../components/home/HeroSection.jsx'
import NewsletterSection from '../components/home/NewsletterSection.jsx'
import OperatorCta from '../components/home/OperatorCta.jsx'
import StepsSection from '../components/home/StepsSection.jsx'
import TestimonialsSection from '../components/home/TestimonialsSection.jsx'
import ValuePropsSection from '../components/home/ValuePropsSection.jsx'

function Home() {
  const location = useLocation()

  return (
    <>
      {location.state?.notice && (
        <Container className="pt-6">
          <p
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            {location.state.notice}
          </p>
        </Container>
      )}
      <HeroSection />
      <ValuePropsSection />
      <CategoriesSection />
      <FeaturedExperiencesSection />
      <DestinationsSection />
      <EditorialBanner />
      <StepsSection />
      <TestimonialsSection />
      <OperatorCta />
      <NewsletterSection />
    </>
  )
}

export default Home
