import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/';

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

  async function handleSubmit(event) {
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

    try {
      const response = await api.post('/auth/login', {
        email: form.elements.email.value,
        password: form.elements.password.value,
      });

      const loginData = response.data;

      login(loginData.token);

      navigate(redirectTarget, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      setNotice('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    const { credential } = credentialResponse || {};

    if (!credential) {
      setNotice('No se pudo obtener la credencial de Google.');
      return;
    }

    try {
      setNotice('');
      const response = await api.post('/auth/google', {
        idToken: credential,
      });

      const token =
        typeof response.data === 'string'
          ? response.data
          : response.data?.token;

      login(token);
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      console.error('Google login failed:', error);
      const backendMessage =
        typeof error?.response?.data === 'string'
          ? error.response.data
          : error?.response?.data?.message || error?.response?.data?.error;

      setNotice(
        backendMessage ||
          'Error al iniciar sesión con Google. Inténtalo de nuevo.',
      );
    }
  }

  function handleGoogleError() {
    setNotice('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
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
    <div className="flex h-full flex-col">
      {/* Bienvenida */}
      <div className="mb-8">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
          Tu próxima historia empieza aquí
        </span>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">Qué bueno verte de nuevo</h1>
        <p className="mt-2 text-sm text-muted">Ingresa para seguir descubriendo El Salvador.</p>
      </div>

      {notice && (
        <p
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          role="status"
        >
          {notice}
        </p>
      )}

      {/* Formulario: campos arriba y acciones ancladas abajo */}
      <form className="flex flex-1 flex-col justify-between gap-8" noValidate onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-ink">
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
              className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-brand ${
                errors.email ? 'border-red-500' : 'border-mist'
              }`}
            />
            {errors.email && (
              <p id="login-email-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-ink">
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
              className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-brand ${
                errors.password ? 'border-red-500' : 'border-mist'
              }`}
            />
            {errors.password && (
              <p id="login-password-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex cursor-pointer items-center text-muted">
              <input type="checkbox" className="mr-2 h-4 w-4 rounded border-mist text-brand focus:ring-brand" />
              Recordarme
            </label>
            <Link to="#" className="font-medium text-brand hover:underline">
              Olvidé mi contraseña
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
          >
            Iniciar sesión
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-mist" />
            <span className="bg-surface px-3 text-xs uppercase text-muted">o</span>
            <div className="w-full border-t border-mist" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          </div>

          <p className="pt-1 text-center text-xs text-muted">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-brand hover:underline">
              Crear una cuenta
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
