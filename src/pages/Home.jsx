import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Home({ user: propUser }) {
  const location = useLocation()
  const { user: authUser } = useAuth()
  const user = authUser ?? propUser ?? null

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
