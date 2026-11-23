# Documentación Técnica del Frontend – RutaSV (`RutaSV-Frontend`)

> **Propósito de este índice:** Servir como punto de referencia único para el equipo de desarrollo, documentando con exactitud **qué existe hoy en el frontend**, **qué pantallas están a medias (con datos locales o mocks)**, **qué componentes reutilizables están disponibles**, **qué falta integrar con `RutaSV-Backend`** (tanto con los endpoints que el backend ya tiene listos como con los que siguen pendientes) y **qué brechas técnicas existen en lo ya desarrollado**.

---

## 1. Resumen Ejecutivo del Estado Actual

El repositorio **RutaSV-Frontend** (carpeta local `RutaSV-Fronted`) es una Single Page Application (SPA) construida con **React 19 + Vite 8 + Tailwind CSS 4 + React Router 7 + Axios + `@react-oauth/google` + Sonner + Vitest**.

Actualmente, el proyecto cuenta con:
1. **Infraestructura transversal operativa:** Enrutamiento con control de acceso por roles (`ProtectedRoute` para `VISITANTE`, `OPERADOR`, `ADMIN`), gestión de sesión JWT con decodificación de claims de .NET y refresco automático (`AuthContext`), cliente HTTP con interceptor Bearer (`axios.js`) y tres layouts diferenciados (`MainLayout`, `AdminLayout`, `OperatorLayout`).
2. **Flujos 100 % integrados con `RutaSV-Backend`:**
   * **Autenticación (`Identity`):** Registro local (`POST /api/auth/register`), inicio de sesión local (`POST /api/auth/login`), autenticación con Google OAuth (`POST /api/auth/google`), verificación de correo por token (`POST /api/auth/verify-email`), reenvío de correo (`POST /api/auth/resend-verification-email`) y sincronización de sesión (`GET /api/auth/me`).
   * **Solicitudes de Operador (`Identity`):** Consulta de solicitud propia (`GET /api/operator-requests/my`), creación en 2 pasos (`POST /api/operator-requests`), edición/reenvío de solicitudes pendientes o rechazadas (`PUT /api/operator-requests/{id}`), subida y visualización de documentos en MinIO (`POST /api/operator-requests/documents/upload`, `GET /api/operator-requests/documents/file`), cola paginada de administración (`GET /api/operator-requests`) y aprobación/rechazo transaccional (`POST /api/operator-requests/{id}/review`).
3. **Flujos a medias (UI maquetada con datos estáticos o `localStorage`, sin conectar al backend):**
   * **Portada (`Home.jsx`):** 10 secciones construidas con datos estáticos (`src/data/home.js`).
   * **Panel de Operador (`/operador/*`):** 6 pantallas completas (`Resumen`, `Mis experiencias`, `Publicar/Editar experiencia`, `Cupos`, `Historial de Reservas`, `Reseñas`, `Configuración`) que persisten temporalmente en `localStorage` mediante `operatorRepository.js`. **Nota crítica:** El backend ya tiene listos los endpoints de **Catálogo y Experiencias** (`CatalogController` y `ExperiencesController`), pero el frontend aún no los consume.
   * **Panel de Administración parcial (`/admin`, `/admin/usuarios`, `/admin/usuarios/nuevo`):** El listado de usuarios usa datos estáticos (`src/data/admin.js`); la creación de usuarios usa `/api/auth/register` como solución temporal (solo crea rol `VISITANTE`); el dashboard combina el conteo real de solicitudes pendientes con métricas estáticas.
   * **Perfil de Usuario (`/perfil`):** Formulario funcional en memoria local, aún sin endpoint en el backend (`PUT /api/users/me`).
4. **Flujos pendientes de construir en el Frontend:**
   * Catálogo público de experiencias (`/experiencias`) y ficha de detalle (`/experiencias/:slug`) — **el backend ya tiene sus endpoints listos**.
   * Flujo de reservas del turista, pagos demo, `/mis-reservas`, cancelaciones, resolución de incidencias (`RN-21`), `/favoritos`, reseñas de turista y recuperación de contraseña.
   * Módulos de administración restantes: Empresas, Moderación de Experiencias/Fotos/Reseñas, Catálogos, Reservas, Cola de Correos y Auditoría.

---

### Métricas Globales de Avance del Frontend

| Dimensión | Total Estimado / Especificado | Implementado e Integrado | Maquetado Parcial (Mock / `localStorage`) | Pendiente de Construir | % Avance UI | % Avance Integración API |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Pantallas / Vistas (`src/pages/`)** | ~32 vistas | **7** (`Login`, `Registration`, `EmailVerification`, `MyOperatorRequest`, `OperatorRequestForm`, `RequestsQueue`, `RequestDetail`) | **13** (`Home`, `VerificationResult`, `Profile`, `AdminDashboard`, `UsersList`, `CreateUser`, 6 vistas de `Operators`, `Forbidden`/`NotFound`) | ~12 vistas | **~62.5 %** | **~28.1 %** |
| **Consumo de Endpoints Existentes en Backend** | **28** endpoints hoy en `RutaSV-Backend` | **12** endpoints consumidos | — | **16** endpoints listos en backend sin consumir aún | — | **42.9 %** (de lo ya disponible en API) |
| **Requisitos Funcionales (`RF`)** | 40 (`RF-P`, `RF-V`, `RF-O`, `RF-A`) | **5** completos | **11** parciales (UI o flujo parcial) | **24** sin pantalla | **~40.0 %** | **~17.5 %** |
| **Componentes y Layouts (`src/components/`, `src/layouts/`)** | — | **30** componentes + **3** layouts (1 archivo vacío `Input.jsx`) | — | Mapa Leaflet, Galería, Calendario, Checkout | Base sólida de UI | — |
| **Pruebas Automatizadas (`Vitest`)** | — | **89 tests pasando** en **15 suites** (`*.test.js` / `*.test.jsx`) | — | Tests de catálogo público y reservas | Cobertura alta en vistas actuales | — |

---

## 2. Estructura de la Documentación (`./docs`)

### Documentos de Especificación Base (Compartidos con Backend)
* [`RutaSV_Funcionalidades_y_BD.md`](./RutaSV_Funcionalidades_y_BD.md) — Especificación funcional maestra (`40 RF`), reglas de negocio (`RN-01` a `RN-23`) y diccionario de datos (`21 tablas`).
* [`arquitectura-api.md`](./arquitectura-api.md) — Guía de arquitectura del backend y contratos generales.
* [`login-response.json`](./login-response.json) — Ejemplo de respuesta JSON de autenticación y estructura del JWT.

### Documentación Técnica de Auditoría y Continuación del Frontend
1. **Estado Funcional y Pantallas (`./docs/estado-actual/`)**
   * [`01-matriz-funcionalidades-y-pantallas.md`](./estado-actual/01-matriz-funcionalidades-y-pantallas.md): Análisis detallado de **qué existe y está integrado**, **qué está a medias (mocks / `localStorage`)**, **qué pantallas faltan por crear**, inventario de rutas en `src/router.jsx` (incluyendo enlaces rotos actuales) y matriz comparativa de los **40 Requisitos Funcionales** (Frontend vs. Backend).
2. **Catálogo de Componentes y Sistema de Diseño (`./docs/componentes/`)**
   * [`01-catalogo-componentes-y-layouts.md`](./componentes/01-catalogo-componentes-y-layouts.md): Inventario completo de tokens de diseño (Tailwind v4), los **3 layouts**, los **30 componentes existentes** (`props`, variantes, dónde se usan), componentes internos de páginas que conviene extraer y **guía de reutilización para las próximas pantallas**.
3. **Integración con el Backend (`./docs/integracion-backend/`)**
   * [`01-estado-integracion-y-contratos.md`](./integracion-backend/01-estado-integracion-y-contratos.md): Cruce exacto entre `RutaSV-Frontend` y los **28 endpoints ya construidos en `RutaSV-Backend`**. Detalla los **12 endpoints ya conectados**, los **16 endpoints listos en el backend que faltan por integrar de inmediato** (Catálogos y Experiencias con React Leaflet y validación `RN-23`), y las pantallas bloqueadas por endpoints aún pendientes en el backend.
4. **Brechas Técnicas, Testing y Hoja de Ruta (`./docs/brechas-y-roadmap/`)**
   * [`01-brechas-tecnicas-y-plan-accion.md`](./brechas-y-roadmap/01-brechas-tecnicas-y-plan-accion.md): Auditoría de **12 brechas técnicas y de UX** en el código actual (con ubicación exacta y solución), estado de las **15 suites de pruebas en Vitest (89 tests)** y plan de trabajo priorizado por fases.

---

## 3. Fotografía Rápida de la Arquitectura Actual (`src/`)

```text
src/
├── main.jsx                         # Punto de entrada: GoogleOAuthProvider + BrowserRouter + App
├── App.jsx                          # Proveedores globales (GoogleOAuthProvider + AuthProvider) + AppRoutes
├── router.jsx                       # Declaración centralizada de rutas públicas, de visitante, operador y admin
├── index.css                        # Tema Tailwind CSS v4 (colores de marca, estados y tipografía Inter)
├── config/
│   └── axios.js                     # Instancia Axios con baseURL '/api' e interceptor Bearer JWT
├── context/
│   ├── AuthContext.jsx              # Estado global de sesión, decodeJwtPayload, refreshSession (/api/auth/me)
│   └── AuthContext.test.jsx
├── lib/
│   ├── roles.js                     # Enum Roles (ADMIN, OPERADOR, VISITANTE)
│   ├── userMenu.js                  # Generación dinámica de opciones del menú de usuario según rol y verificación
│   ├── operatorRequests.js          # Servicio API y normalizador DTO para Solicitudes de Operador y Documentos
│   ├── useAdminSearch.js            # Hook para sincronizar búsqueda del Admin con query param (?q=)
│   ├── ApiError.js                  # Clase de error estructurado RFC 7807 (ProblemDetails)
│   ├── errors.js                    # Formateador de mensajes de error HTTP
│   └── notify.js                    # Wrapper de notificaciones toast con Sonner
├── data/
│   ├── home.js                      # Datos estáticos temporales para las secciones de la portada
│   └── admin.js                     # Datos estáticos temporales para métricas, actividad y lista de usuarios Admin
├── layouts/
│   ├── MainLayout.jsx               # Layout público y de visitante (NavBar + Outlet + Footer)
│   └── AdminLayout.jsx              # Layout del administrador (Buscador global + Píldoras de sección + Outlet)
├── components/
│   ├── Button.jsx / LinkButton.jsx / buttonStyles.js
│   ├── FormField.jsx / SelectField.jsx / Input.jsx (vacío)
│   ├── Container.jsx / SectionHeading.jsx / AuthCard.jsx / Icon.jsx
│   ├── NavBar.jsx / Footer.jsx / UserMenu.jsx / Notifications.jsx / ProtectedRoute.jsx
│   ├── CategoryCard.jsx / DestinationCard.jsx / ExperienceCard.jsx / TestimonialCard.jsx
│   ├── home/                        # 10 secciones modulares de la página de inicio
│   └── admin/                       # 9 componentes de UI administrativa (AdminCard, Dialog, Pagination, Pill, etc.)
└── pages/
    ├── Home.jsx / Forbidden.jsx / NotFound.jsx
    ├── Auth/                        # Login, Registration, EmailVerification, VerificationResult
    ├── Profile/                     # Profile.jsx (Mi perfil)
    ├── Operators/                   # MyOperatorRequest, OperatorRequestForm + Panel de Operador (6 vistas + OperatorLayout + operatorRepository en localStorage)
    └── Admin/                       # AdminDashboard, RequestsQueue, RequestDetail, UsersList, CreateUser
```

---

## 4. Principales Hallazgos y Prioridades Inmediatas

1. **Integración inmediata disponible con `RutaSV-Backend` (Módulo `Catalog`):**
   * El backend **ya tiene implementados** `CatalogController` (4 endpoints de categorías, departamentos y municipios) y `ExperiencesController` (10 endpoints para catálogo público, detalle por `slug`/`id`, listado `/api/experiences/my`, creación, edición, publicación con regla `RN-23`, pausa, borrado lógico y subida de imágenes a MinIO).
   * En el frontend falta:
     1. Construir las vistas públicas `/experiencias` y `/experiencias/:slug`.
     2. Conectar `Home.jsx` a las categorías y experiencias destacadas reales.
     3. Conectar `OperatorRequestForm.jsx` al catálogo real de departamentos/municipios (`municipalityId`).
     4. Actualizar `OperatorExperiences.jsx` y `OperatorExperienceForm.jsx` para dejar de usar `localStorage` (`operatorRepository.js`), instalando **`leaflet` + `react-leaflet`** para las coordenadas del mapa y agregando los campos exigidos por `RN-23`.
2. **Correcciones rápidas de alto impacto en lo ya desarrollado:**
   * Montar `<Notifications />` en `App.jsx` (hoy `notify.success` / `notify.error` en `Profile.jsx` no muestra ningún toast porque el `<Toaster />` no está renderizado en la app).
   * Corregir `nginx.conf.template` (la regla `rewrite ^/api/(.*)$ /$1 break;` elimina el prefijo `/api` que `RutaSV-Backend` requiere en todas sus rutas).
   * Eliminar el `<GoogleOAuthProvider>` duplicado entre `src/main.jsx` y `src/App.jsx`.
   * Corregir el doble encabezado/footer en `/login`, `/registro`, `/verify-email` y `/operador/solicitud/formulario`.
