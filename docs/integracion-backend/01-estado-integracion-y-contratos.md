# Estado de Integración con `RutaSV-Backend` y Contratos de API

> Análisis detallado de la conexión entre **RutaSV-Frontend** y **RutaSV-Backend**. Actualmente el backend expone **28 endpoints funcionales** repartidos en 4 controladores (`AuthController`, `OperatorRequestsController`, `CatalogController` y `ExperiencesController`), de los cuales el frontend consume **12 endpoints (42.9 %)** y tiene **16 endpoints listos para integrar de inmediato**.

---

## 1. Arquitectura Actual de Comunicación HTTP en el Frontend

| Archivo | Rol en la Comunicación con el Backend | Estado / Observaciones |
| :--- | :--- | :--- |
| [`vite.config.js`](../../vite.config.js) | Configura el proxy de desarrollo para `/api` hacia `VITE_API_PROXY_TARGET` (por defecto `http://localhost:5000/api`) reescribiendo el prefijo `/api`. | Funcional en `npm run dev` siempre que `VITE_API_PROXY_TARGET` termine en `/api`. |
| [`nginx.conf.template`](../../nginx.conf.template) | Configura el proxy reverso `/api/` en el contenedor Docker de producción hacia `${API_UPSTREAM}`. | **Requiere corrección:** Tiene `rewrite ^/api/(.*)$ /$1 break;`, lo que quita `/api` al enviar al backend .NET y provoca `404` si `API_UPSTREAM` no incluye `/api/`. |
| [`src/config/axios.js`](../../src/config/axios.js) | Instancia principal `api` con `baseURL: '/api'` e interceptor de `request` que inyecta `Authorization: Bearer <token>` desde `localStorage.getItem('token')`. | Usado en `Login.jsx`, `Registration.jsx`, `EmailVerification.jsx`, `CreateUser.jsx` y `src/lib/operatorRequests.js`. Carece aún de interceptor de `response` para manejo centralizado de `401` o transformación a `ApiError`. |
| [`src/context/AuthContext.jsx`](../../src/context/AuthContext.jsx) | Gestiona el token JWT en `localStorage`, decodifica claims de .NET y ejecuta `refreshSession()` mediante `fetch('/api/auth/me')`. | Operativo y cubierto por tests. |
| [`src/lib/operatorRequests.js`](../../src/lib/operatorRequests.js) | Módulo de servicio para Solicitudes de Operador: encapsula llamadas HTTP, subida de archivos (`fetch('/api/operator-requests/documents/upload')`), normalización de DTOs (`normalizeOperatorRequest`) y extracción de errores (`extractBackendErrorMessage`). | Excelente patrón de referencia para crear los próximos módulos `src/lib/catalog.js` y `src/lib/experiences.js`. |
| [`src/lib/ApiError.js`](../../src/lib/ApiError.js), [`errors.js`](../../src/lib/errors.js) y [`notify.js`](../../src/lib/notify.js) | Clase de error estructurada para `ProblemDetails` (RFC 7807), extractor de mensajes por campo (`fieldErrors`) y wrapper de toasts con `sonner`. | Creados y probados unitariamente, pero **aún no conectados al interceptor de `axios.js`**. |

---

## 2. Endpoints del Backend YA Consumidos por el Frontend (12 de 28)

### 2.1 `AuthController` (6 de 7 endpoints consumidos)

| Método y Ruta en Backend | Dónde se consume en el Frontend | Estado |
| :--- | :--- | :---: |
| `POST /api/auth/register` | [`Registration.jsx`](../../src/pages/Auth/Registration.jsx#L105) (`api.post('/auth/register', payload)`) y [`CreateUser.jsx`](../../src/pages/Admin/CreateUser.jsx#L55) | **Integrado** |
| `POST /api/auth/login` | [`Login.jsx`](../../src/pages/Auth/Login.jsx#L44) (`api.post('/auth/login', { email, password })`) | **Integrado** |
| `POST /api/auth/google` | [`Login.jsx`](../../src/pages/Auth/Login.jsx#L71) y [`Registration.jsx`](../../src/pages/Auth/Registration.jsx#L130) (`api.post('/auth/google', { idToken })`) | **Integrado** |
| `POST /api/auth/verify-email` | [`EmailVerification.jsx`](../../src/pages/Auth/EmailVerification.jsx#L72) (`api.post('/auth/verify-email', { token })`) | **Integrado** |
| `POST /api/auth/resend-verification-email` | [`EmailVerification.jsx`](../../src/pages/Auth/EmailVerification.jsx#L101) (`api.post('/auth/resend-verification-email', payload)`) | **Integrado** |
| `GET /api/auth/me` | [`AuthContext.jsx`](../../src/context/AuthContext.jsx#L161) (`fetch('/api/auth/me')` en `refreshSession`) | **Integrado** |

### 2.2 `OperatorRequestsController` (6 de 6 endpoints consumidos)

| Método y Ruta en Backend | Dónde se consume en el Frontend | Estado |
| :--- | :--- | :---: |
| `POST /api/operator-requests` | [`src/lib/operatorRequests.js`](../../src/lib/operatorRequests.js#L212) (`createOperatorRequest`) -> llamado en `OperatorRequestForm.jsx` | **Integrado** |
| `GET /api/operator-requests/my` | [`src/lib/operatorRequests.js`](../../src/lib/operatorRequests.js#L204) (`getMyOperatorRequest`) -> llamado en `MyOperatorRequest.jsx` y `OperatorRequestForm.jsx` | **Integrado** |
| `PUT /api/operator-requests/{id}` | [`src/lib/operatorRequests.js`](../../src/lib/operatorRequests.js#L217) (`updateOperatorRequest`) -> llamado en `OperatorRequestForm.jsx` | **Integrado** |
| `POST /api/operator-requests/documents/upload` | [`src/lib/operatorRequests.js`](../../src/lib/operatorRequests.js#L186) (`uploadOperatorRequestDocument`) -> llamado en `OperatorRequestForm.jsx` | **Integrado** |
| `GET /api/operator-requests/documents/file` | [`src/lib/operatorRequests.js`](../../src/lib/operatorRequests.js#L172) (`resolveDocumentImageUrl`) -> usado en `<img src=...>` de `MyOperatorRequest.jsx` y `RequestDetail.jsx` | **Integrado** |
| `GET /api/operator-requests` | [`src/lib/operatorRequests.js`](../../src/lib/operatorRequests.js#L235) (`getOperatorRequests`) -> llamado en `AdminDashboard.jsx`, `RequestsQueue.jsx` y `RequestDetail.jsx` | **Integrado** |
| `POST /api/operator-requests/{id}/review` | [`src/lib/operatorRequests.js`](../../src/lib/operatorRequests.js#L254) (`reviewOperatorRequest`) -> llamado en `RequestDetail.jsx` | **Integrado** |

*(Nota: `OperatorRequestsController` expone 7 acciones incluyendo `upload` y `file`; todas están integradas en el frontend).*

---

## 3. Endpoints YA Construidos en `RutaSV-Backend` que Faltan Integrar en el Frontend (Prioridad Inmediata)

El backend **ya tiene terminados y probados** el `CatalogController` y el `ExperiencesController`, pero el frontend todavía utiliza datos estáticos (`src/data/home.js`) o `localStorage` (`src/pages/Operators/operatorRepository.js`).

### 3.1 Catálogos Geográficos y Categorías (`CatalogController`)

| Método y Ruta | Autorización | Respuesta del Backend | Dónde debe integrarse en el Frontend |
| :--- | :---: | :--- | :--- |
| `GET /api/categories` | Público | `CategoryDto[]` (`{ id, name, slug, description, icon, sortOrder }`) | 1. **`CategoriesSection.jsx` (`Home`):** Mostrar categorías reales.<br>2. **Nueva vista `/experiencias`:** Poblar filtro de categorías.<br>3. **`OperatorExperienceForm.jsx`:** Selección de categorías (`categoryIds` y `primaryCategoryId`). |
| `GET /api/departments` | Público | `DepartmentDto[]` (`{ id, code, name }` — 14 departamentos de El Salvador) | 1. **Nueva vista `/experiencias`:** Filtro por departamento.<br>2. **`OperatorRequestForm.jsx`:** Selector de departamento (reemplazando el input de texto libre `area`).<br>3. **`OperatorExperienceForm.jsx`:** Selector en cascada Departamento -> Municipio. |
| `GET /api/departments/{departmentId}/municipalities` | Público | `MunicipalityDto[]` (`{ id, departmentId, departmentName, name }`) | Selector dependiente de Municipio tras elegir un Departamento en `OperatorRequestForm.jsx`, `OperatorExperienceForm.jsx` y filtros de `/experiencias`. |
| `GET /api/municipalities?departmentId={opc}` | Público | `MunicipalityDto[]` | Consulta directa de municipios o resolución de `municipalityId` a nombre legible en `MyOperatorRequest.jsx` y `RequestDetail.jsx` (donde hoy se muestra `"Municipio ID: 14"`). |

---

### 3.2 Catálogo Público y Gestión de Experiencias (`ExperiencesController`)

| Método y Ruta | Autorización | Parámetros / Cuerpo | Respuesta | Dónde debe integrarse en el Frontend |
| :--- | :---: | :--- | :--- | :--- |
| `GET /api/experiences` | Público | Query: `pageNumber`, `pageSize`, `search`, `categoryId`, `departmentId`, `municipalityId`, `minPrice`, `maxPrice`, `minRating`, `difficulty`, `minDurationMinutes`, `maxDurationMinutes`, `hasLimitedCapacity`, `sortBy` (`recent`, `price_asc`, `price_desc`, `rating`) | `PagedResponse<ExperienceSummaryDto>` | 1. **Crear página `/experiencias`** con buscador, filtros combinables, ordenamiento y `Pagination.jsx`.<br>2. **`FeaturedExperiencesSection.jsx` (`Home`):** Cargar las 3 experiencias con mejor calificación (`?pageSize=3&sortBy=rating`). |
| `GET /api/experiences/{slugOrId}` | Público *(o Dueño/Admin si no está `PUBLICADA`)* | Route: `slug` (ej. `clases-de-surf-en-playa-el-tunco`) o `id` (GUID) | `ExperienceDto` completo (incluye `company`, `categories`, `images`, `latitude`, `longitude`, políticas, etc.) | 1. **Crear página `/experiencias/:slug`** para turistas.<br>2. **`OperatorExperienceForm.jsx`:** Cargar los datos completos de la experiencia al editar (`?editar={id}`). |
| `GET /api/experiences/my` | `OPERADOR`, `ADMIN` | Query: `pageNumber`, `pageSize`, `status?` (`BORRADOR`, `PUBLICADA`, `PAUSADA`, `ARCHIVADA`), `companyId?` | `PagedResponse<ExperienceDto>` | **`OperatorExperiences.jsx` y `OperatorDashboard.jsx`:** Reemplazar `readOperatorCollection(user, 'experiences')` por esta llamada paginada. |
| `POST /api/experiences` | `OPERADOR`, `ADMIN` | Body: `CreateExperienceRequest` | `201 Created` (`ExperienceDto`) o `422` (`RN-23`) | **`OperatorExperienceForm.jsx`:** Reemplazar guardado en `localStorage` al crear una experiencia nueva. |
| `PUT /api/experiences/{id:guid}` | `OPERADOR`, `ADMIN` | Body: `UpdateExperienceRequest` | `200 OK` (`ExperienceDto`) o `422` (`RN-23`) | **`OperatorExperienceForm.jsx`:** Reemplazar guardado en `localStorage` al editar una experiencia existente. |
| `POST /api/experiences/{id:guid}/publish` | `OPERADOR`, `ADMIN` | Route: `id` | `200 OK` (`ExperienceDto`) o `422 Unprocessable Entity` (con arreglo `missingFields`) | **`OperatorExperiences.jsx` y `OperatorExperienceForm.jsx`:** Botón para pasar de `BORRADOR` o `PAUSADA` a `PUBLICADA`. |
| `POST /api/experiences/{id:guid}/pause` | `OPERADOR`, `ADMIN` | Route: `id` | `200 OK` (`ExperienceDto`) | **`OperatorExperiences.jsx`:** Botón para pausar temporalmente una experiencia `PUBLICADA`. |
| `DELETE /api/experiences/{id:guid}` | `OPERADOR`, `ADMIN` | Route: `id` | `204 No Content` (borrado lógico -> `ARCHIVADA`) | **`OperatorExperiences.jsx`:** Botón para archivar/eliminar experiencia con confirmación en `Dialog.jsx`. |
| `POST /api/experiences/images/upload` | `OPERADOR`, `ADMIN` | `multipart/form-data` con campo `file` (máx. 5 MB, `image/jpeg`, `image/png`, `image/webp`) | `200 OK` (`{ objectKey, url }`) | **`OperatorExperienceForm.jsx`:** Subir cada imagen de la galería a MinIO antes de enviar el `POST`/`PUT` de la experiencia. |
| `GET /api/experiences/images/file` | Público | Query: `?objectKey=...` | Stream binario de la imagen | Renderizado automático en `<img src={image.url} />` en tarjetas y galerías. |

---

## 4. Guía de Adaptación de `OperatorExperienceForm.jsx` al Contrato Real del Backend

Actualmente [`OperatorExperienceForm.jsx`](../../src/pages/Operators/OperatorExperienceForm.jsx) solo captura 7 campos simples en `localStorage`. Para conectarlo con `POST /api/experiences` y `PUT /api/experiences/{id}` cumpliendo la regla de negocio **`RN-23`** del backend, se deben realizar los siguientes ajustes:

### 4.1 Comparativa de Campos: Prototipo Actual vs. Contrato `CreateExperienceRequest`

| Campo en Backend (`CreateExperienceRequest`) | Tipo y Regla en Backend (`RN-23`) | Estado en `OperatorExperienceForm.jsx` | Qué hacer en el Frontend |
| :--- | :--- | :---: | :--- |
| `title` | `string` (obligatorio, máx. 180) | Existe (`name="title"`) | Mantener. |
| `shortDescription` | `string?` (máx. 300) | **No existe** | Agregar campo de texto corto ("Resumen breve para tarjetas"). |
| `description` | `string?` (al publicar `RN-23`: **mín. 20 caracteres**) | Existe (`name="description"`) | Validar mínimo 20 caracteres cuando se quiera publicar. |
| `price` | `decimal` (`>= 0`) | Existe (`name="price"`, hoy `min="1"`) | Permitir `min="0"` (el backend admite experiencias gratuitas `>= 0`). |
| `currency` | `string` (def: `"USD"`) | No se envía | Enviar `"USD"` por defecto en el payload. |
| `durationMinutes` | `int?` (`> 0`) | **No existe** | Agregar input numérico ("Duración en minutos", ej. `120`). |
| `difficulty` | `string?` (`"FACIL"`, `"MODERADA"`, `"DIFICIL"`) | **No existe** | Agregar selector de dificultad con los valores del enum del backend. |
| `minAge` | `short?` (`>= 0`) | **No existe** | Agregar input numérico opcional ("Edad mínima"). |
| `serviceLanguage` | `string?` (ej. `"Español / Inglés"`) | **No existe** | Agregar campo de idioma del servicio. |
| `hasLimitedCapacity` | `bool` (def: `true`) | **No existe** | Agregar switch/toggle: **"Cupo limitado por sesión"** vs. **"Cupo ilimitado"**. |
| `minPeople` | `short` (`>= 1`, obligatorio) | **No existe** | Agregar input numérico (`defaultValue={1}`, `min="1"`). |
| `maxPeople` | `short?` (obligatorio y `>= minPeople` si `hasLimitedCapacity = true`; `null` si `false`) | Existe como `capacity` único | Si `hasLimitedCapacity` es `true`, mostrar y exigir `maxPeople >= minPeople`; si es `false`, ocultar/deshabilitar y enviar `null`. |
| `municipalityId` | `int?` (obligatorio al publicar `RN-23`) | Existe texto libre `location` | Reemplazar el input `location` por dos `<select>` conectados a `GET /api/departments` y `GET /api/departments/{id}/municipalities`. |
| `referenceAddress` | `string?` (máx. 300) | **No existe** | Agregar campo "Dirección o punto de encuentro". |
| `latitude` y `longitude` | `decimal?` (al publicar `RN-23`: dentro de El Salvador `lat 13.0..14.6`, `lng -90.3..-87.5`) | **No existe** | **Instalar `leaflet` y `react-leaflet`** e incrustar un mapa interactivo centrado en El Salvador (`[13.6929, -89.2182]`) para posicionar el pin y rellenar `latitude` y `longitude`. |
| `autoConfirmation` | `bool` (def: `false`, `RF-O09`) | **No existe** | Agregar toggle ("Confirmar reservas automáticamente"). |
| `cancellationPolicy` | `string?` | **No existe** | Agregar `<textarea>` opcional para políticas o recomendaciones. |
| `categoryIds` y `primaryCategoryId` | `int[]` y `int?` (al menos 1 categoría activa al publicar `RN-23`) | Existe `<select>` simple con strings fijos | Cargar opciones desde `GET /api/categories`, permitir seleccionar una o varias categorías (`categoryIds`) y marcar la principal (`primaryCategoryId`). |
| `images` | `ExperienceImageInputDto[]` (`{ objectKey, url, altText, sortOrder, isCover }`) | Input `<input type="file">` sin lógica | Subir archivos con `POST /api/experiences/images/upload` y armar el arreglo garantizando **exactamente una imagen con `isCover: true` (`RN-13`)** al publicar. |
| `publishImmediately` | `bool` | Existe `<select name="status">` (`Publicada` / `Borrador`) | Si el operador elige `"Publicada"`, enviar `publishImmediately: true`; si elige `"Borrador"`, enviar `publishImmediately: false`. |

### 4.2 Manejo de Errores `422 Unprocessable Entity` (`RN-23`)

Cuando un operador intenta crear con `publishImmediately: true` o llama a `POST /api/experiences/{id}/publish` sin cumplir todos los requisitos de completitud, `RutaSV-Backend` devuelve un código HTTP **`422 Unprocessable Entity`** con la estructura:

```json
{
  "type": "https://tools.ietf.org/html/rfc4918#section-11.2",
  "title": "Experiencia incompleta para publicación",
  "status": 422,
  "detail": "La experiencia no cumple con todos los requisitos para ser publicada: ...",
  "missingFields": [
    "La descripción detallada debe tener al menos 20 caracteres.",
    "Las coordenadas (latitud y longitud) deben estar dentro del territorio de El Salvador.",
    "Debe incluir al menos una imagen y marcar una portada (isCover = true)."
  ]
}
```

El frontend debe leer `error.response?.data?.missingFields` (si es un arreglo) y mostrarlo como una lista dentro de un componente `<Notice tone="warning">` o `<Notice tone="error">` para guiar al operador paso a paso.

---

## 5. Pantallas del Frontend en Espera de Nuevos Endpoints en `RutaSV-Backend`

Las siguientes pantallas ya cuentan con interfaz adelantada en `RutaSV-Frontend`, pero su integración completa depende de las próximas fases del backend (documentadas en `RutaSV-Backend/docs/roadmap/01-plan-continuacion-backend.md`):

| Pantalla en Frontend | Archivo | Endpoint(s) que necesita de `RutaSV-Backend` | Estado en Backend |
| :--- | :--- | :--- | :---: |
| **Mi Perfil** | [`src/pages/Profile/Profile.jsx`](../../src/pages/Profile/Profile.jsx) | `GET /api/users/me`, `PUT /api/users/me`, `POST /api/users/me/photo`, `POST /api/users/me/change-password` | Pendiente (Fase 0 de Backend) |
| **Configuración del Negocio (Operador)** | [`src/pages/Operators/OperatorSettings.jsx`](../../src/pages/Operators/OperatorSettings.jsx) | `GET /api/companies/my`, `PUT /api/companies/{id}` (`CompaniesController`) | Pendiente (Fase 0 de Backend) |
| **Cupos y Disponibilidad (Operador)** | [`src/pages/Operators/OperatorAvailability.jsx`](../../src/pages/Operators/OperatorAvailability.jsx) | `GET/POST/PUT/DELETE /api/operator/experiences/{id}/schedules`, `POST .../availability/generate`, `POST/PUT .../availability`, `POST /api/operator/availability/{id}/cancel` | Pendiente (Fase 2 y 4 de Backend) |
| **Historial de Reservas (Operador)** | [`src/pages/Operators/OperatorReservations.jsx`](../../src/pages/Operators/OperatorReservations.jsx) | `GET /api/operator/reservations`, `POST .../in-person`, `POST .../{id}/confirm`, `reject`, `complete`, `cancel` | Pendiente (Fase 3 de Backend) |
| **Reseñas recibidas (Operador)** | [`src/pages/Operators/OperatorReviews.jsx`](../../src/pages/Operators/OperatorReviews.jsx) | `GET /api/experiences/{id}/reviews`, `POST /api/reviews/{id}/reply` | Pendiente (Fase 5 de Backend) |
| **Resumen y Métricas (Operador)** | [`src/pages/Operators/OperatorDashboard.jsx`](../../src/pages/Operators/OperatorDashboard.jsx) | `GET /api/operator/metrics` *(Nota: la sección "Mis experiencias" ya puede conectarse a `GET /api/experiences/my`)* | Parcial (Experiencias listas; métricas en Fase 6) |
| **Gestión de Usuarios (Admin)** | [`src/pages/Admin/UsersList.jsx`](../../src/pages/Admin/UsersList.jsx) y [`CreateUser.jsx`](../../src/pages/Admin/CreateUser.jsx) | `GET / POST / PUT / PATCH /api/admin/users` (`UsersController`) | Pendiente (Fase 6 de Backend) |
| **Dashboard Global (Admin)** | [`src/pages/Admin/AdminDashboard.jsx`](../../src/pages/Admin/AdminDashboard.jsx) | `GET /api/admin/dashboard` y `GET /api/admin/audit-logs` *(Nota: solicitudes pendientes ya está integrado)* | Pendiente (Fase 6 de Backend) |
