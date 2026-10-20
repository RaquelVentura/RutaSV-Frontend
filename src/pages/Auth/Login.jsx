import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Contenedor principal centrado */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-sm border border-gray-200/80 p-6 sm:p-8">
        
        {/* Cabecera: Logo y Selector de Idioma */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-cyan-700 tracking-tight">RutaSV</h1>
          <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
            ES / EN <span className="ml-1 text-xs">▼</span>
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="¿A dónde quieres ir?"
            className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white transition"
          />
        </div>

        {/* Botones de Explorar / Registro superior */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="w-full py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            Login
          </button>
          <button className="w-full py-2.5 bg-cyan-700 rounded-full text-sm font-medium text-white hover:bg-cyan-800 transition">
            Registro
          </button>
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* Sección de Bienvenida */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold tracking-wider text-cyan-700 uppercase">
            Tu próxima historia empieza aquí
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-2 mb-2">
            Qué bueno verte de nuevo
          </h2>
          <p className="text-sm text-gray-500">
            Ingresa para seguir descubriendo El Salvador.
          </p>
        </div>

        {/* Formulario de Inicio de Sesión */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="ana.lopez@correo.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 transition"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-cyan-700 focus:ring-cyan-600 mr-2 w-4 h-4" />
              Recordarme
            </label>
            <Link to="#" className="text-cyan-700 font-medium hover:underline">
              Olvidé mi contraseña
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-700 hover:bg-cyan-800 text-white font-medium rounded-xl text-sm transition shadow-sm mt-2"
          >
            Iniciar sesión
          </button>

          <div className="text-center pt-3">
            <span className="text-xs text-gray-500">¿Aún no tienes cuenta? </span>
            <Link to="#" className="text-xs text-cyan-700 font-semibold hover:underline">
              Crear una cuenta
            </Link>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 mt-8 space-x-1">
        <span>© 2026 RutaSV</span>
        <span>·</span>
        <a href="#" className="hover:underline">Privacidad</a>
        <span>·</span>
        <a href="#" className="hover:underline">Términos y condiciones</a>
      </footer>
    </div>
  );
}