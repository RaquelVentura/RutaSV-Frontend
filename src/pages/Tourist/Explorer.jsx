import { Link } from 'react-router-dom';
import Container from '../../components/turista/Container.jsx';

import SectionTitle from '../../components/turista/SectionTitle.jsx';
import ExperienceCard from '../../components/turista/ExperienceCard.jsx';
import { assets, benefits, categories, destinations, experiences, testimonials } from '../../data/turista';

const outlineButton =
  'inline-flex min-h-[50px] items-center justify-center rounded-xl border border-[#DFE8EB] bg-white px-5 py-2.5 text-[15px] font-semibold text-[#102F3B] hover:bg-[#F8FAFC]';

export default function Explorar() {
  const featured = experiences.slice(0, 3);

  return (
    <>
      <Container className="py-6 sm:py-8">
        <section className="relative flex min-h-[380px] items-center overflow-hidden rounded-[20px] md:min-h-[440px]">
          <img src={assets.hero} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#082B3B]/90 to-[#082B3B]/20 md:bg-gradient-to-r md:to-[#082B3B]/10" />
          <div className="relative flex max-w-[640px] flex-col gap-5 px-6 py-10 text-white sm:px-10 md:py-12">
            <p className="text-[12px] font-bold leading-[1.45] text-[#D6F4F5]">
              HECHO DE OLAS, CAFÉ Y BUENAS HISTORIAS
            </p>
            <h1 className="text-[32px] font-bold leading-[1.15] sm:text-[40px] lg:text-[48px]">
              El Salvador se vive, no solo se visita.
            </h1>
            <p className="text-[16px] font-bold leading-[1.45]">
              Encuentra experiencias auténticas, conoce a guías locales y vuelve con algo más que fotografías.
            </p>
            <p className="flex items-center gap-2 text-[12px] font-bold leading-[1.45]">
              <img src={assets.pin} alt="" className="size-4" />
              El Tunco · La Libertad · El Salvador
            </p>
          </div>
        </section>
      </Container>

      <Container className="py-8">
        <ul className="grid gap-6 sm:grid-cols-3 sm:gap-10">
          {benefits.map((benefit) => (
            <li key={benefit.title} className="flex items-center gap-3.5">
              <img src={benefit.icon} alt="" className="size-[26px] shrink-0" />
              <div className="leading-[1.45]">
                <p className="text-[15px] font-bold text-[#102F3B]">{benefit.title}</p>
                <p className="text-[13px] text-[#637780]">{benefit.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="flex flex-col gap-12 py-8 sm:gap-[48px]">
        <section className="flex flex-col gap-5">
          <SectionTitle eyebrow="Encuentra tu forma de viajar" title="¿Qué te mueve hoy?" />
          <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category.name} className="flex flex-col gap-2.5">
                <img src={category.image} alt="" loading="lazy" className="h-[110px] w-full rounded-xl object-cover sm:h-[140px]" />
                <p className="text-[15px] font-bold leading-[1.45] text-[#102F3B] sm:text-[17px]">{category.name}</p>
                <p className="text-[12px] leading-[1.45] text-[#637780]">{category.count} experiencias</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col items-center gap-5 text-center">
          <SectionTitle center eyebrow="Pequeños planes, grandes recuerdos" title="Experiencias destacadas">
            <p className="text-[15px] leading-[1.45] text-[#637780]">Favoritas de quienes ya se animaron a explorar.</p>
          </SectionTitle>
          <Link to="/experiencias" className={outlineButton}>
            Ver todas las experiencias →
          </Link>
          <div className="grid w-full gap-6 text-left md:grid-cols-2 lg:grid-cols-3">
            {featured.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} to="/turista/reservar" />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <SectionTitle eyebrow="Cerca de ti, lejos de la rutina" title="Un país, mil maneras de sentirlo" />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <li key={destination.name} className="flex flex-col gap-2.5">
                <img src={destination.image} alt="" loading="lazy" className="h-[210px] w-full rounded-xl object-cover" />
                <p className="text-[21px] font-bold leading-[1.2] text-[#102F3B]">{destination.name} →</p>
                <p className="text-[14px] leading-[1.45] text-[#637780]">{destination.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </Container>

      <div className="mt-8 bg-[#EDF5EF]">
        <Container className="grid items-center gap-6 py-8 md:grid-cols-2 md:gap-10">
          <img src={assets.plan} alt="" loading="lazy" className="h-[240px] w-full rounded-xl object-cover md:h-[300px]" />
          <div className="flex flex-col items-start gap-6">
            <p className="text-[12px] font-bold leading-[1.45] text-[#28634D]">LA ESCAPADA QUE NECESITABAS</p>
            <h2 className="text-2xl font-bold leading-[1.2] text-[#102F3B] sm:text-[30px]">
              Del primer café al último rayo de sol.
            </h2>
            <p className="text-[15px] leading-[1.45] text-[#637780]">
              Una mañana entre cafetales, una tarde de pueblos coloridos y una buena conversación sin mirar el reloj.
            </p>
            <p className="text-[14px] font-semibold leading-[1.45] text-[#102F3B]">
              Ruta de las Flores · Ideal para un fin de semana
            </p>
            <Link to="/experiencias" className={outlineButton}>
              Descubrir la ruta →
            </Link>
          </div>
        </Container>
      </div>

      <div className="bg-white">
        <Container className="flex flex-col gap-6 py-8">
          <SectionTitle eyebrow="Lo mejor del viaje es compartirlo" title="Lo dicen quienes ya fueron" />
          <ul className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <li key={testimonial.author} className="flex flex-col gap-4 rounded-xl bg-[#F8FAFC] p-5 leading-[1.45]">
                <p className="text-[19px] text-[#087E9A]" aria-label="5 de 5 estrellas">
                  ★★★★★
                </p>
                <blockquote className="text-[16px] text-[#102F3B]">“{testimonial.quote}”</blockquote>
                <div>
                  <p className="text-[14px] font-bold text-[#102F3B]">{testimonial.author}</p>
                  <p className="text-[12px] text-[#637780]">{testimonial.trip} · Viaje verificado</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </>
  );
}
