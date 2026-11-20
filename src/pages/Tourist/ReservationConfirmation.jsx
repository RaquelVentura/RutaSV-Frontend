import { Link, useLocation } from 'react-router-dom';
import Container from '';
import { assets, defaultBooking, formatUsd } from '../../data/turista';

export default function ReservaConfirmacion() {
  const { state } = useLocation();
  const booking = state?.booking ?? defaultBooking;
  const { experience, people } = booking;
  const firstName = booking.contactName.split(' ')[0];
  const total = experience.price * people;

  const nextSteps = [
    {
      icon: assets.mail,
      title: 'Guarda tu confirmación',
      text: `Correo de referencia: ${booking.contactEmail}.`,
    },
    {
      icon: assets.mapPin,
      title: 'Nos vemos en la playa',
      text: `${experience.operator} · Acceso principal. Llega a las 14:45 con tu código de reserva.`,
    },
    {
      icon: assets.backpack,
      title: 'Prepara lo esencial',
      text: 'Traje de baño, toalla y protector solar. Nosotros ponemos la tabla y las ganas.',
    },
  ];

  return (
    <Container className="py-10 sm:py-12">
      <div className="mx-auto flex max-w-[960px] flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-[#EDF5EF]">
            <img src={assets.check} alt="" className="size-8" />
          </span>
          <span className="rounded-full bg-[#EDF5EF] px-2.5 py-1.5 text-[12px] font-semibold text-[#28634D]">
            Reserva confirmada
          </span>
          <h1 className="text-[28px] font-bold leading-[1.2] text-[#102F3B] sm:text-[38px]">
            ¡Tu próxima historia ya tiene fecha!
          </h1>
          <p className="text-[16px] leading-[1.45] text-[#637780]">
            {firstName}, tu plan en El Tunco está listo. Guarda estos detalles para tu viaje.
          </p>
        </header>

        <section className="flex flex-col gap-6 rounded-xl border border-[#DFE8EB] bg-white p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <p className="text-[12px] leading-[1.45] text-[#637780]">CÓDIGO DE RESERVA</p>
              <p className="break-all text-[22px] font-bold leading-[1.45] text-[#087E9A] sm:text-[25px]">{booking.reference}</p>
            </div>
            <span className="self-start rounded-full bg-[#EDF5EF] px-2.5 py-1.5 text-[12px] font-semibold text-[#28634D] sm:self-auto">
              Activa · Confirmada
            </span>
          </div>
          <hr className="border-[#DFE8EB]" />
          <div className="flex flex-col gap-5 sm:flex-row sm:gap-7">
            <img src={experience.image} alt="" className="h-[215px] w-full rounded-xl object-cover sm:w-[290px] sm:shrink-0" />
            <div className="flex flex-col gap-3 leading-[1.45]">
              <h2 className="text-[22px] font-bold text-[#102F3B] sm:text-[25px]">{experience.title}</h2>
              <p className="text-[14px] text-[#637780]">
                {experience.location} · {experience.operator}
              </p>
              <p className="text-[15px] text-[#102F3B]">{booking.date}</p>
              <p className="text-[15px] text-[#102F3B]">
                {booking.time} · {people} personas
              </p>
              <p className="text-[18px] font-bold text-[#102F3B]">Total: {formatUsd(total)} USD</p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-5 rounded-xl bg-[#E9F5F7] p-5 sm:p-7">
          <h2 className="text-[22px] font-bold leading-[1.45] text-[#102F3B] sm:text-2xl">Ahora, solo queda disfrutar</h2>
          <ul className="grid gap-6 md:grid-cols-3 md:gap-7">
            {nextSteps.map((step) => (
              <li key={step.title} className="flex flex-col gap-2.5">
                <img src={step.icon} alt="" className="size-6" />
                <p className="text-[16px] font-bold leading-[1.45] text-[#102F3B]">{step.title}</p>
                <p className="text-[13px] leading-[1.45] text-[#637780]">{step.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/turista/mi-actividad/reservas" className="inline-flex h-[50px] items-center justify-center rounded-xl border border-[#087E9A] bg-[#087E9A] px-5 text-[15px] font-semibold text-white hover:bg-cyan-800">
            Ver Mis Reservas
          </Link>
          <Link to="/turista/explorar" className="inline-flex h-[50px] items-center justify-center rounded-xl border border-[#DFE8EB] bg-white px-5 text-[15px] font-semibold text-[#102F3B] hover:bg-[#F8FAFC]">
            Seguir explorando
          </Link>
        </div>

        <p className="text-center text-[12px] leading-[1.45] text-[#637780]">
          ¿Necesitas ayuda? Contacta a {experience.operator} · {booking.operatorPhone}
        </p>
      </div>
    </Container>
  );
}
