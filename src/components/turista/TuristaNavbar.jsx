import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Container from './Container';

const links = [
  { to: '/turista/explorar', label: 'Explorar' },
  { to: '/turista/reservar', label: 'Reservar' },
  { to: '/turista/mi-actividad', label: 'Mi Actividad' },
];

const navClass = ({ isActive }) =>
  `text-[14px] ${isActive ? 'font-bold text-[#087E9A]' : 'font-medium text-[#102F3B] hover:text-[#087E9A]'}`;

export default function TuristaNavbar({ user }) {
  const [open, setOpen] = useState(false);
  const name = user?.name ?? 'Ana López';
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="border-b border-[#DFE8EB] bg-white">
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-5">
        <Link to="/turista/explorar" className="text-[26px] font-extrabold text-[#087E9A] sm:text-[28px]">
          RutaSV
        </Link>

        <button
          type="button"
          className="rounded-lg border border-[#DFE8EB] px-3 py-2 text-[14px] font-semibold text-[#102F3B] lg:hidden"
          aria-expanded={open}
          aria-controls="menu-turista"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Cerrar' : 'Menú'}
        </button>

        <div
          id="menu-turista"
          className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-4 lg:flex lg:w-auto lg:flex-1 lg:flex-row lg:items-center lg:justify-between lg:gap-6`}
        >
          <label className="flex min-h-[44px] w-full items-center gap-2 rounded-full border border-[#DFE8EB] bg-[#F8FAFC] px-[18px] text-[14px] text-[#637780] lg:w-[340px]">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Buscar experiencias</span>
            <input
              type="search"
              placeholder="¿A dónde quieres ir?"
              className="w-full bg-transparent outline-none placeholder:text-[#637780]"
            />
          </label>

          <nav aria-label="Principal" className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <button type="button" className="text-[13px] font-semibold text-[#087E9A]">
              ES / EN ▾
            </button>
            <button
              type="button"
              className="rounded-full bg-[#E9F5F7] px-4 py-2.5 text-[12px] font-semibold text-[#087E9A]"
            >
              {initials} · {name} ▾
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
