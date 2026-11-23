# Matriz de Funcionalidades, Pantallas y Estado Actual del Frontend

> Radiografía completa de lo que existe en `RutaSV-Frontend`, clasificado en **tres niveles de madurez**: (1) Implementado e integrado con el backend, (2) Construido a medias (interfaz lista con datos estáticos o `localStorage`), y (3) Pendiente de construir, seguido del cruce contra los **40 Requisitos Funcionales** de [`RutaSV_Funcionalidades_y_BD.md`](../RutaSV_Funcionalidades_y_BD.md) y el estado real de `RutaSV-Backend`.

---

## 1. Inventario de Rutas Actuales (`src/router.jsx`)

### 1.1 Rutas Declaradas y Operativas

| Ruta | Componente / Vista | Layout | Protección (`ProtectedRoute`) | Estado de Datos / Integración |
| :--- | :--- | :---: | :---: | :--- |
| `/` | [`Home.jsx`](../../src/pages/Home.jsx) | `MainLayout` | Público | **A medias:** Saludo y avisos usan `AuthContext`, pero las 10 secciones consumen mocks de `src/data/home.js`. |
| `/login` *(y `/auth/login`)* | [`Login.jsx`](../../src/pages/Auth/Login.jsx) | `MainLayout` | Público | **Integrado:** Conectado a `POST /api/auth/login` y `POST /api/auth/google`. |
| `/registro` *(y `/auth/register`)* | [`Registration.jsx`](../../src/pages/Auth/Registration.jsx) | `MainLayout` | Público | **Integrado:** Conectado a `POST /api/auth/register` y `POST /api/auth/google`. |
| `/verify-email` *(y `/registro/verificar`)* | [`EmailVerification.jsx`](../../src/pages/Auth/EmailVerification.jsx) | `MainLayout` | Público / Autenticado | **Integrado:** Conectado a `POST /api/auth/verify-email` y `POST /api/auth/resend-verification-email`. |
| `/registro/verificacion/aceptada` | [`VerificationResult.jsx`](../../src/pages/Auth/VerificationResult.jsx) | `MainLayout` | Público | **Huérfana:** Vista estática heredada; `EmailVerification` redirige directo a `/`. |
| `/registro/verificacion/rechazada` | [`VerificationResult.jsx`](../../src/pages/Auth/VerificationResult.jsx) | `MainLayout` | Público | **Huérfana:** Vista estática heredada. |
| `/perfil` | [`Profile.jsx`](../../src/pages/Profile/Profile.jsx) | `MainLayout` | Cualquier rol autenticado | **A medias:** Lee datos del JWT en `AuthContext`; guardar solo actualiza estado en memoria local. |
| `/operador/solicitud` *(y `/solicitar-operador`)* | [`MyOperatorRequest.jsx`](../../src/pages/Operators/MyOperatorRequest.jsx) | `MainLayout` | `VISITANTE`, `OPERADOR` | **Integrado:** Conectado a `GET /api/operator-requests/my`, previsualización de archivos MinIO y refresco automático de rol a `OPERADOR`. |
| `/operador/solicitud/formulario` | [`OperatorRequestForm.jsx`](../../src/pages/Operators/OperatorRequestForm.jsx) | `MainLayout` | `VISITANTE` | **Integrado:** Wizard de 2 pasos conectado a `POST /api/operator-requests/documents/upload`, `POST /api/operator-requests` y `PUT /api/operator-requests/{id}`. |
| `/operador` | [`OperatorDashboard.jsx`](../../src/pages/Operators/OperatorDashboard.jsx) | `OperatorLayout` | `OPERADOR`, `ADMIN` | **A medias:** Calcula estadísticas, ingresos y ocupación sobre `localStorage` (`operatorRepository.js`). |
| `/operador/experiencias` | [`OperatorExperiences.jsx`](../../src/pages/Operators/OperatorExperiences.jsx) | `OperatorLayout` | `OPERADOR`, `ADMIN` | **A medias:** Lista, busca y filtra experiencias desde `localStorage`. *(Backend ya tiene `GET /api/experiences/my`)*. |
| `/operador/experiencias/nueva` *(y `?editar=id`)* | [`OperatorExperienceForm.jsx`](../../src/pages/Operators/OperatorExperienceForm.jsx) | `OperatorLayout` | `OPERADOR`, `ADMIN` | **A medias:** Crea y edita en `localStorage` con 7 campos básicos. *(Backend ya tiene `POST/PUT /api/experiences` pero exige más campos y mapa Leaflet)*. |
| `/operador/cupos` *(y `/operador/calendario`)* | [`OperatorAvailability.jsx`](../../src/pages/Operators/OperatorAvailability.jsx) | `OperatorLayout` | `OPERADOR`, `ADMIN` | **A medias:** Agrega y edita fechas/horas/cupos en `localStorage`. |
| `/operador/reservas` | [`OperatorReservations.jsx`](../../src/pages/Operators/OperatorReservations.jsx) | `OperatorLayout` | `OPERADOR`, `ADMIN` | **A medias:** Lista y filtra reservas de muestra desde `localStorage` (solo lectura, sin botones de acción). |
| `/operador/resenas` | [`OperatorReviews.jsx`](../../src/pages/Operators/OperatorReviews.jsx) | `OperatorLayout` | `OPERADOR`, `ADMIN` | **A medias:** Lista reseñas de muestra y guarda respuesta pública del operador en `localStorage`. |
| `/operador/configuracion` | [`OperatorSettings.jsx`](../../src/pages/Operators/OperatorSettings.jsx) | `OperatorLayout` | `OPERADOR`, `ADMIN` | **A medias:** Maqueta de perfil comercial, contactos y preferencias; al enviar avisa que aún no está conectada al backend. |
| `/admin` | [`AdminDashboard.jsx`](../../src/pages/Admin/AdminDashboard.jsx) | `AdminLayout` | `ADMIN` | **Parcialmente integrado:** Carga conteo y top 3 de solicitudes pendientes reales (`GET /api/operator-requests`), pero las otras 3 métricas y la actividad reciente son mocks (`src/data/admin.js`). |
| `/admin/solicitudes` *(y `/admin/solicitudes-operador`)* | [`RequestsQueue.jsx`](../../src/pages/Admin/RequestsQueue.jsx) | `AdminLayout` | `ADMIN` | **Integrado:** Cola paginada conectada a `GET /api/operator-requests` con filtro de estado, ordenamiento y búsqueda sincronizada con `?q=`. |
| `/admin/solicitudes/:id` | [`RequestDetail.jsx`](../../src/pages/Admin/RequestDetail.jsx) | `AdminLayout` | `ADMIN` | **Integrado:** Detalle completo, visor de documentos MinIO y aprobación/rechazo con `POST /api/operator-requests/{id}/review`. |
| `/admin/usuarios` | [`UsersList.jsx`](../../src/pages/Admin/UsersList.jsx) | `AdminLayout` | `ADMIN` | **A medias:** Filtra y busca sobre la lista estática `users` de `src/data/admin.js`; los botones de acción no tienen manejadores. |
| `/admin/usuarios/nuevo` | [`CreateUser.jsx`](../../src/pages/Admin/CreateUser.jsx) | `AdminLayout` | `ADMIN` | **Parcialmente integrado:** Crea cuentas `VISITANTE` invocando `POST /api/auth/register` sin reemplazar la sesión del Admin. |
| `/sin-permiso` | [`Forbidden.jsx`](../../src/pages/Forbidden.jsx) | `MainLayout` | Público | **Implementado:** Vista `403` mostrada por `ProtectedRoute` cuando el rol no está autorizado. |
| `*` | [`NotFound.jsx`](../../src/pages/NotFound.jsx) | `MainLayout` | Público | **Implementado:** Vista `404` para rutas inexistentes. |

---

### 1.2 Enlaces Rotos o Sin Ruta Actualmente Presentes en la UI

Existen enlaces activos en distintos componentes que hoy llevan a la página `404 NotFound` o no ejecutan ninguna navegación porque sus pantallas aún no han sido creadas:

| Enlace / Destino | Dónde se renderiza hoy | Estado Actual |
| :--- | :--- | :--- |
| `/experiencias` y `/experiencias?q=...` | `NavBar.jsx` ("Explorar" y barra de búsqueda), `Footer.jsx`, `CategoryCard.jsx`, `DestinationCard.jsx`, `EditorialBanner.jsx`, `FeaturedExperiencesSection.jsx` | **Cae en 404 (`NotFound`)** — Falta crear la página de catálogo público y registrarla en `router.jsx`. |
| `/experiencias/:slug` | `ExperienceCard.jsx` (en `FeaturedExperiencesSection`) | **Cae en 404 (`NotFound`)** — Falta crear la página de detalle de experiencia. |
| `/mis-reservas` | Menú lateral de `Profile.jsx` | **Cae en 404 (`NotFound`)** — Falta crear la vista de reservas del visitante. |
| `/favoritos` | Menú lateral de `Profile.jsx` | **Cae en 404 (`NotFound`)** — Falta crear la vista de favoritos del visitante. |
| `/perfil/configuracion` | Menú lateral de `Profile.jsx` | **Cae en 404 (`NotFound`)** — Falta crear la vista de configuración/cambio de contraseña. |
| `/perfil/notificaciones` | Menú lateral de `Profile.jsx` | **Cae en 404 (`NotFound`)** — No existe vista de notificaciones. |
| `/ayuda` | Menú lateral de `Profile.jsx` | **Cae en 404 (`NotFound`)** — No existe centro de ayuda. |
| `#` ("Olvidé mi contraseña") | `Login.jsx` (línea 205) | **No hace nada** — Falta crear flujo `/forgot-password` y `/reset-password`. |
| Botones `Empresas` y `Experiencias` en `AdminLayout` | `AdminLayout.jsx` (líneas 17-18) | Renderizados como `<button type="button">` sin ruta `to`. |
| Enlaces `/registro` en `OperatorCta.jsx` ("Publicar experiencia →") | `src/components/home/OperatorCta.jsx` (línea 20) | Lleva siempre a `/registro` incluso si el usuario ya inició sesión (debería llevar a `/operador/solicitud` o `/operador/experiencias/nueva` según el rol). |

---

## 2. Clasificación Detallada del Estado del Frontend

### 2.1 ¿Qué existe y está completamente integrado con el Backend?

1. **Gestión de Sesión y Autorización (`AuthContext.jsx` + `ProtectedRoute.jsx`):**
   * Decodificación nativa de payloads JWT en Base64URL (`decodeJwtPayload`, `extractUserFromToken`) soportando claims estándar de .NET (`http://schemas.microsoft.com/ws/2008/06/identity/claims/role`, `given_name`, `family_name`, `email_verified`, `sub`, `exp`).
   * Sincronización automática de sesión en segundo plano (`refreshSession` contra `GET /api/auth/me`) al iniciar la app, al recuperar el foco de la ventana (`window.onfocus`), al volver a la pestaña (`visibilitychange`) y al abrir el menú de usuario (`NavBar`). Esto permite que cuando un Admin aprueba una solicitud de operador, el visitante obtenga un nuevo JWT con rol `OPERADOR` sin necesidad de cerrar sesión.
2. **Autenticación Local y Google OAuth (`Login.jsx`, `Registration.jsx`, `EmailVerification.jsx`):**
   * Registro con validación de campos y longitud de contraseña, envío a `POST /api/auth/register`, autologin y redirección a `/verify-email`.
   * Inicio de sesión con correo/contraseña (`POST /api/auth/login`) y botón oficial de Google (`<GoogleLogin />` -> `POST /api/auth/google`).
   * Verificación de correo electrónico leyendo `?token=` desde la URL o ingresándolo manualmente (`POST /api/auth/verify-email`) y botón de reenvío (`POST /api/auth/resend-verification-email`).
3. **Flujo Completo de Solicitudes de Operador (Visitante y Administrador):**
   * **Visitante (`MyOperatorRequest.jsx` + `OperatorRequestForm.jsx`):**
     * Consulta `GET /api/operator-requests/my` (maneja tanto `200 OK` como `204 No Content`).
     * Formulario en 2 pasos con subida real de imágenes (`DUI_FRENTE`, `DUI_REVERSO`, `FOTO_NEGOCIO`, `REGISTRO_TURISMO`) a MinIO mediante `POST /api/operator-requests/documents/upload` y enlace `ENLACE_REDES`.
     * Soporta tanto creación (`POST /api/operator-requests`) como edición y reenvío de solicitudes `PENDIENTE` o `RECHAZADA` (`PUT /api/operator-requests/{id}`).
   * **Administrador (`RequestsQueue.jsx` + `RequestDetail.jsx`):**
     * Tabla paginada conectada a `GET /api/operator-requests` con filtros por estado, ordenamiento y búsqueda por texto sincronizada con la barra superior (`?q=`).
     * Vista de detalle con visor y modal de ampliación de documentos descargados desde `/api/operator-requests/documents/file?objectKey=...`.
     * Aprobación y rechazo con motivo obligatorio en modal (`Dialog.jsx`) conectado a `POST /api/operator-requests/{id}/review`.

---

### 2.2 ¿Qué se tiene a medias (UI construida pero sin integración real o incompleta)?

1. **Portada (`Home.jsx` y `src/components/home/*`):**
   * Todas las tarjetas de categorías, experiencias destacadas y destinos leen datos fijos de `src/data/home.js`.
   * El formulario de boletín (`NewsletterSection.jsx`) muestra un mensaje local sin enviar datos al servidor.
2. **Panel de Operador Completo (`src/pages/Operators/*`):**
   * Cuenta con un diseño limpio y responsivo (`OperatorLayout.jsx`) y un repositorio local en `localStorage` (`operatorRepository.js`) que aísla los datos por usuario (`rutasv:operator:<id>:<collection>`).
   * **`OperatorExperiences.jsx` y `OperatorExperienceForm.jsx`:** Permiten listar, buscar, filtrar (`Todas`, `Publicada`, `Borrador`), crear y editar experiencias en `localStorage`, pero **su modelo de datos local (7 campos) está muy por debajo del contrato real que `RutaSV-Backend` ya exige en `ExperiencesController`** (faltan coordenadas con React Leaflet, municipio del catálogo, duración, dificultad, edad mínima, idioma, cupo limitado/ilimitado `minPeople`/`maxPeople`, confirmación automática, múltiples categorías, galería de imágenes en MinIO y acciones de publicar/pausar/archivar).
   * **`OperatorAvailability.jsx`:** Permite agregar y editar cupos por fecha y hora en `localStorage`, pero aún no contempla plantillas semanales (`experience_schedule`), precios especiales (`special_price`), bloqueo de fechas ni cancelación de sesión con motivo (`RF-O13`).
   * **`OperatorReservations.jsx`:** Muestra tarjetas de reservas filtrables por estado (`Pendiente`, `Confirmada`, `Completada`), pero **carece de botones de acción** para que el operador pueda confirmar, rechazar con motivo, marcar como completada, cancelar o registrar una reserva presencial (`RF-O08`, `RF-O12`).
   * **`OperatorReviews.jsx`:** Permite filtrar reseñas por experiencia y escribir/editar una respuesta pública en `localStorage`. Su interfaz está casi lista para conectarse cuando exista el endpoint en el backend (`POST /api/reviews/{id}/reply`).
   * **`OperatorSettings.jsx`:** Muestra campos para editar el perfil de la empresa, contactos y preferencias de idioma/alertas, pero los botones "Editar", "Borrar" y "+ Agregar contacto" son estáticos y el `onSubmit` solo muestra un aviso informativo.
3. **Gestión de Usuarios y Dashboard en Administración (`AdminDashboard.jsx`, `UsersList.jsx`, `CreateUser.jsx`):**
   * En `AdminDashboard.jsx`, solo la tarjeta "Solicitudes pendientes" y la lista "Solicitudes de operador pendientes" provienen del backend; las tarjetas "Usuarios nuevos", "Empresas activas", "Experiencias por revisar" y la lista "Actividad reciente" son estáticas (`src/data/admin.js`).
   * En `UsersList.jsx`, los 6 usuarios listados y el texto de paginación (`"Mostrando 1–6 de 48 usuarios"`) son estáticos y los botones de cada fila (`Editar`, `Cambiar rol`, `Suspender`, `Reactivar`, `Reenviar correo`, `Restablecer contraseña`) no ejecutan ninguna acción.
   * En `CreateUser.jsx`, el selector de rol está bloqueado en `Visitante` porque consume `/api/auth/register`.
4. **Perfil de Usuario (`Profile.jsx`):**
   * Permite editar `firstName`, `lastName` y `publicName` con validación en cliente, pero solo guarda en un `useState` local (`saved`). Además, el backend define en la tabla `app_user` los campos `first_name`, `last_name`, `phone`, `preferred_language` y `photo_url` (no existe el campo `publicName` en el esquema de base de datos de `RutaSV_Funcionalidades_y_BD.md`).

---

### 2.3 ¿Qué falta por construir desde cero en el Frontend?

1. **Vistas Públicas del Catálogo (`RF-P01` a `RF-P06`):**
   * Página de exploración y búsqueda `/experiencias` (barra de filtros laterales/superiores, selector de ordenamiento, grilla de `ExperienceCard`, paginación conectada a `GET /api/experiences`).
   * Página de detalle de experiencia `/experiencias/:slug` (galería de fotos, descripción, detalles técnicos, mapa React Leaflet de solo lectura con el marcador de `latitude`/`longitude`, tarjeta de la empresa operadora, selector de fecha/turno disponible, botón de reservar, botón de favoritos y listado de reseñas).
   * Página de perfil público de empresa/operador (con sus datos comerciales y todas sus experiencias publicadas).
2. **Vistas del Turista / Visitante Autenticado (`RF-V01` a `RF-V12`):**
   * Pantallas de recuperación de contraseña: `/forgot-password` (solicitar enlace/token por correo) y `/reset-password` (definir nueva contraseña con token).
   * Pantalla o modal de **Checkout / Reserva** (`RF-V03`, `RF-V04`): selección de fecha/horario abierto, cantidad de personas (`minPeople`..`maxPeople`), notas del visitante, resumen de precios congelados y confirmación de pago simulado (demo).
   * Pantalla **Mis Reservas** (`/mis-reservas`) y **Detalle de Reserva** (`/mis-reservas/:id`) (`RF-V06`, `RF-V07`, `RF-V12`): filtro por estado, historial de cambios (`reservation_history`), botón de cancelación mostrando el porcentaje de reembolso estimado (`100%`, `50%` o `0%` según `RN-08`), botón para dejar reseña cuando está `COMPLETADA` y flujo de resolución de sesión cancelada (`PENDIENTE_DECISION` -> elegir nueva fecha del mismo precio o reembolso del 100 % según `RN-21`).
   * Pantalla **Favoritos** (`/favoritos`) (`RF-V10`): listado de experiencias guardadas por el turista.
   * Pantalla **Configuración de la cuenta** (`/perfil/configuracion`) (`RF-V02`): cambio de contraseña actual, teléfono, idioma preferido y subida de foto de perfil.
3. **Vistas y Modales Faltantes del Panel de Administrador (`RF-A02` a `RF-A08`):**
   * `/admin/empresas` — Listado de empresas registradas, aprobación de empresas adicionales y suspensión administrativa (`CompanyStatus.SUSPENDIDA`).
   * `/admin/experiencias` — Moderación posterior de experiencias publicadas (retirar experiencia o eliminar fotografía inapropiada con motivo obligatorio) (`RF-A03`).
   * `/admin/catalogos` — Gestión CRUD de Categorías, Departamentos y Municipios (`RF-A04`).
   * `/admin/reservas` — Consulta global e intervención administrativa de reservas y reembolsos (`RF-A05`).
   * `/admin/resenas` — Moderación de reseñas (ocultar/restaurar) (`RF-A06`).
   * `/admin/correos` — Monitoreo de `email_notification` y botón de reintento para envíos fallidos (`RF-A07`).
   * `/admin/auditoria` — Visor de la bitácora `audit_log` con filtros por usuario, entidad, acción y fecha (`RF-A08`).

---

## 3. Matriz Comparativa de los 40 Requisitos Funcionales (Frontend vs. Backend)

**Leyenda:**
* **Integrado**: UI construida y conectada al endpoint real de `RutaSV-Backend`.
* **UI Parcial (Mock/Local)**: Existe pantalla o prototipo en el frontend, pero usa datos locales o le faltan campos/acciones.
* **Listo en Backend**: El endpoint ya existe en `RutaSV-Backend`, solo falta conectarlo o crear la vista en el frontend.
* **Pendiente**: No existe aún en ese repositorio.

### 3.1 Visitante sin cuenta (Público)

| ID | Requisito Funcional | Estado en Frontend | Estado en Backend (`RutaSV-Backend`) | Acción Requerida para Completar |
| :--- | :--- | :---: | :---: | :--- |
| **RF-P01** | Listar catálogo | **Pendiente** *(Solo 3 tarjetas fijas en `Home.jsx`)* | **Listo en Backend** (`GET /api/experiences`) | Crear vista `/experiencias` y conectar `Home.jsx` y `/experiencias` con `GET /api/experiences`. |
| **RF-P02** | Búsqueda por texto | **UI Parcial** *(Input en `NavBar.jsx` redirige a `/experiencias?q=`)* | **Listo en Backend** (`GET /api/experiences?search=`) | Leer `?q=` en la nueva vista `/experiencias` y enviarlo como parámetro `search` al backend. |
| **RF-P03** | Filtros combinables | **Pendiente** | **Parcial en Backend** *(Soporta `categoryId`, `departmentId`, `municipalityId`, `minPrice`, `maxPrice`, `minRating`, `difficulty`, `min/maxDurationMinutes`, `hasLimitedCapacity`; falta filtro por fecha de disponibilidad)* | Construir barra/panel de filtros en `/experiencias` consumiendo `GET /api/categories`, `GET /api/departments` y `GET /api/municipalities`. |
| **RF-P04** | Ordenamiento | **Pendiente** | **Listo en Backend** (`sortBy`: `recent`, `price_asc`, `price_desc`, `rating`) | Agregar `FilterSelect` de ordenamiento en `/experiencias`. |
| **RF-P05** | Ver ficha de detalle | **Pendiente** | **Listo en Backend** (`GET /api/experiences/{slugOrId}`) | Crear vista `/experiencias/:slug` con galería, datos de empresa y mapa React Leaflet. |
| **RF-P06** | Ver disponibilidad pública | **Pendiente** | **Pendiente** *(Falta tabla `availability`)* | Construir selector de fechas en `/experiencias/:slug` cuando el backend exponga `GET /api/experiences/{id}/availability`. |
| **RF-P07** | Invitación a registro | **Integrado** | **Implementado** (`[Authorize]` -> `401`) | `ProtectedRoute.jsx` ya redirige a `/login` guardando `state.from`. Agregar modal/CTA en el botón "Reservar" de `/experiencias/:slug`. |
| **RF-P08** | Registro de cuenta | **Integrado** | **Implementado** (`POST /api/auth/register`) | Ninguna. `Registration.jsx` ya está conectado y probado. |

### 3.2 Visitante con cuenta (Turista)

| ID | Requisito Funcional | Estado en Frontend | Estado en Backend (`RutaSV-Backend`) | Acción Requerida para Completar |
| :--- | :--- | :---: | :---: | :--- |
| **RF-V01** | Iniciar / cerrar sesión y recuperar contraseña | **Parcial** *(Login local, Google, verificación y logout integrados)* | **Parcial** *(Faltan `forgot-password` y `reset-password`)* | Crear pantallas `/forgot-password` y `/reset-password` y conectarlas cuando el backend habilite los endpoints. |
| **RF-V02** | Gestionar perfil | **UI Parcial** (`Profile.jsx` en memoria local) | **Pendiente** *(Falta `UsersController` `/api/users/me`)* | Reemplazar el campo `publicName` por `phone` e `idioma` según BD, agregar subida de foto/cambio de clave y conectar a `PUT /api/users/me`. |
| **RF-V03** | Crear reserva | **Pendiente** | **Pendiente** *(Módulo `Bookings`)* | Crear flujo de reserva validando primero que `user.emailVerified === true` (`RN-20`). |
| **RF-V04** | Pago simulado (demo) | **Pendiente** | **Pendiente** | Incluir paso de confirmación de pago demo en el checkout de reserva. |
| **RF-V05** | Correo de reserva | **N/A (Backend)** | **Pendiente** | Mostrar confirmación en pantalla indicando el envío del correo al visitante. |
| **RF-V06** | Mis reservas | **Pendiente** *(Enlace roto en `Profile.jsx`)* | **Pendiente** | Crear páginas `/mis-reservas` y `/mis-reservas/:id` con línea de tiempo de estados. |
| **RF-V07** | Cancelar reserva | **Pendiente** | **Pendiente** | Añadir modal de cancelación en `/mis-reservas/:id` informando las reglas de reembolso (`RN-08`: 48h=100%, 24-48h=50%, <24h=0%). |
| **RF-V08** | Reseñar | **Pendiente** | **Pendiente** *(Módulo `Reviews`)* | Añadir formulario de calificación (1..5 estrellas + comentario) en reservas con estado `COMPLETADA`. |
| **RF-V09** | Editar/eliminar su reseña | **Pendiente** | **Pendiente** | Permitir editar o borrar la reseña propia desde la ficha de la experiencia o desde `/mis-reservas`. |
| **RF-V10** | Favoritos | **Pendiente** *(Enlace roto en `Profile.jsx`)* | **Pendiente** | Añadir botón de corazón (`Icon name="heart"`) en `ExperienceCard` y crear vista `/favoritos`. |
| **RF-V11** | Solicitar ser operador | **Integrado** (`MyOperatorRequest.jsx` y `OperatorRequestForm.jsx`) | **Implementado** (`POST/GET/PUT /api/operator-requests`) | Falta únicamente conectar el selector de municipio a `GET /api/municipalities` y añadir el botón para **cancelar/retirar** una solicitud `PENDIENTE` cuando el backend agregue el endpoint. |
| **RF-V12** | Resolver sesión cancelada | **Pendiente** | **Pendiente** *(Tabla `reservation_incident`)* | Crear vista/modal en `/mis-reservas/:id` para elegir entre reagendar al mismo precio o reembolso del 100 % (`RN-21`). |

### 3.3 Operador

| ID | Requisito Funcional | Estado en Frontend | Estado en Backend (`RutaSV-Backend`) | Acción Requerida para Completar |
| :--- | :--- | :---: | :---: | :--- |
| **RF-O01** | Alta como operador | **Integrado** | **Implementado** | `MyOperatorRequest.jsx` y `AuthContext.refreshSession` ya actualizan el rol a `OPERADOR` y habilitan `/operador`. |
| **RF-O02** | Gestionar empresas | **UI Parcial** (`OperatorSettings.jsx` estático) | **Parcial** *(Falta `CompaniesController`)* | Conectar `OperatorSettings.jsx` a `GET / PUT /api/companies` cuando el backend exponga el controlador. |
| **RF-O03** | CRUD de experiencias | **UI Parcial** (`OperatorExperiences.jsx` y `OperatorExperienceForm.jsx` en `localStorage`) | **Listo en Backend** (`ExperiencesController`: `GET /my`, `POST`, `PUT`, `DELETE`, `publish`, `pause`) | **Prioridad 1:** Reemplazar `operatorRepository.js` por llamadas a `/api/experiences`, ampliar el formulario con todos los campos de `RN-23`, integrar mapa **React Leaflet** y manejar errores `422` (`missingFields`). |
| **RF-O04** | Galería de imágenes | **UI Parcial** *(Input de 1 archivo sin subir)* | **Listo en Backend** (`POST /api/experiences/images/upload` y `GET .../file`) | **Prioridad 1:** Reutilizar el patrón de subida de `OperatorRequestForm.jsx` para subir múltiples fotos a `/api/experiences/images/upload`, ordenar y marcar portada (`isCover`). |
| **RF-O05** | Horarios semanales | **Pendiente** | **Pendiente** | Agregar sección de plantillas semanales (`Lunes..Domingo`) en `/operador/cupos`. |
| **RF-O06** | Gestionar disponibilidad | **UI Parcial** (`OperatorAvailability.jsx` en `localStorage`) | **Pendiente** | Añadir generación por rango de fechas, bloqueo/apertura de fechas y `specialPrice`, y conectar al backend. |
| **RF-O07** | Calendario | **Pendiente** *(`/operador/calendario` redirige a `/operador/cupos`)* | **Pendiente** | Añadir vista mensual/semanal de ocupación en `/operador/cupos` o `/operador/calendario`. |
| **RF-O08** | Gestionar reservas recibidas | **UI Parcial** (`OperatorReservations.jsx` solo lectura en `localStorage`) | **Pendiente** | Añadir botones de acción (Confirmar, Rechazar con motivo, Completar, Cancelar con motivo) y conectar al backend. |
| **RF-O09** | Confirmación automática | **Pendiente en Form** | **Listo en Backend** *(Campo `autoConfirmation` en `Experience`)* | Añadir toggle `autoConfirmation` en `OperatorExperienceForm.jsx`. |
| **RF-O10** | Responder reseñas | **UI Parcial** (`OperatorReviews.jsx` guarda respuesta en `localStorage`) | **Pendiente** | Conectar el formulario de respuesta de `OperatorReviews.jsx` a `POST /api/reviews/{id}/reply` cuando exista. |
| **RF-O11** | Panel de métricas | **UI Parcial** (`OperatorDashboard.jsx` calcula sobre `localStorage`) | **Pendiente** | Conectar `OperatorDashboard.jsx` a los datos reales de experiencias y al futuro endpoint de métricas del operador. |
| **RF-O12** | Reserva presencial | **Pendiente** | **Pendiente** | Añadir botón "+ Registrar reserva presencial" y modal/formulario en `OperatorReservations.jsx` (`RN-19`). |
| **RF-O13** | Cancelar una sesión | **Pendiente** | **Pendiente** | Añadir botón "Cancelar sesión" con motivo obligatorio en cada turno de `OperatorAvailability.jsx` (`RN-21`). |

### 3.4 Administrador

| ID | Requisito Funcional | Estado en Frontend | Estado en Backend (`RutaSV-Backend`) | Acción Requerida para Completar |
| :--- | :--- | :---: | :---: | :--- |
| **RF-A01** | Gestión de usuarios | **UI Parcial** (`UsersList.jsx` con mocks; `CreateUser.jsx` crea solo `VISITANTE`) | **Pendiente** *(Falta `UsersController`)* | Conectar `UsersList.jsx` y sus botones de acción (suspender, reactivar, cambiar rol, reset password) y habilitar selector de rol en `CreateUser.jsx` cuando exista `/api/admin/users`. |
| **RF-A02** | Aprobación de solicitudes de operador y empresas | **Integrado** (`RequestsQueue.jsx` y `RequestDetail.jsx`) | **Implementado** (`GET /api/operator-requests` y `POST .../review`) | Falta únicamente la vista `/admin/empresas` para listar y suspender empresas ya aprobadas. |
| **RF-A03** | Moderación de experiencias | **Pendiente** *(Botón sin ruta en `AdminLayout.jsx`)* | **Pendiente** *(El Admin ya puede usar `GET/DELETE /api/experiences`, pero faltan endpoints de `withdraw`/`restore` con motivo y moderación de fotos)* | Crear `/admin/experiencias` para revisar experiencias publicadas, retirar con motivo o eliminar fotos inapropiadas. |
| **RF-A04** | Gestión de catálogos | **Pendiente** | **Parcial** *(Existen `GET /api/categories`, `departments`, `municipalities`; falta CRUD Admin)* | Crear vista `/admin/catalogos` para administrar categorías, departamentos y municipios. |
| **RF-A05** | Gestión de reservas | **Pendiente** | **Pendiente** | Crear vista `/admin/reservas` para listar reservas globales y gestionar reembolsos. |
| **RF-A06** | Moderación de reseñas | **Pendiente** | **Pendiente** | Crear vista `/admin/resenas` para ocultar (`OCULTA`) o restaurar (`VISIBLE`) reseñas reportadas. |
| **RF-A07** | Monitoreo de correos | **Pendiente** | **Pendiente** *(Tabla `email_notification` ya existe)* | Crear vista `/admin/correos` para consultar la cola de correos y reintentar envíos fallidos. |
| **RF-A08** | Auditoría | **Pendiente** | **Pendiente** | Crear vista `/admin/auditoria` para consultar `audit_log` con filtros. |
| **RF-A09** | Dashboard global | **Parcial** (`AdminDashboard.jsx` mezcla solicitudes reales con 3 KPIs estáticos) | **Pendiente** | Conectar las tarjetas restantes y la actividad reciente de `AdminDashboard.jsx` a `/api/admin/dashboard` y `/api/admin/audit-logs`. |
