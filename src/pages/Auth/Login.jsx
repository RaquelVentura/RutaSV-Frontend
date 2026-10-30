import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');

  function getFieldError(input) {
    if (input.validity.valueMissing) {
      return input.name === 'email'
        ? 'Ingresa tu correo electrónico.'
        : 'Ingresa tu contraseña.';
    }

    if (input.name === 'email' && input.validity.typeMismatch) {
      return 'Ingresa un correo electrónico válido.';
    }

    return '';
  }

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const emailError = getFieldError(form.elements.email);
    const passwordError = getFieldError(form.elements.password);
    const nextErrors = { email: emailError, password: passwordError };

    setErrors(nextErrors);

    if (emailError || passwordError) {
      setNotice('');
      form.elements[emailError ? 'email' : 'password'].focus();
      return;
    }

    setNotice(
      'El inicio de sesión requiere conectar el backend. No se inició ninguna sesión.',
    );
  }

  function handleChange(event) {
    const input = event.target;

    if (errors[input.name]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [input.name]: getFieldError(input),
      }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Contenedor principal centrado */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-sm border border-gray-200/80 p-6 sm:p-8">
        
        {/* Cabecera: Logo y Selector de Idioma */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#087E9A] tracking-tight">RutaSV</h1>
          <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
            <span className="ml-1 text-xs"></span>
          </button>
        </div>

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

        {notice && (
          <p
            className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
            role="status"
          >
            {notice}
          </p>
        )}

        {/* Formulario de Inicio de Sesión */}
        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="ana.lopez@correo.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 transition ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.email && (
              <p id="login-email-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Contraseña
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 transition ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.password && (
              <p id="login-password-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.password}
              </p>
            )}
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
            <Link to="/registro" className="text-xs text-cyan-700 font-semibold hover:underline">
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