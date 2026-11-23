# Catálogo de Componentes, Layouts y Sistema de Diseño

> Inventario técnico de todos los componentes, layouts, hooks y tokens visuales disponibles en `RutaSV-Frontend`, diseñado para que el equipo **reutilice las piezas ya construidas** y mantenga consistencia visual en las próximas integraciones de pantallas.

---

## 1. Sistema de Diseño y Tokens de Tema (`src/index.css`)

El proyecto utiliza **Tailwind CSS v4** (`@import 'tailwindcss';` + directiva `@theme`) con la fuente variable **Inter** (`@fontsource-variable/inter`).

### 1.1 Paleta Semántica de Colores

| Token CSS (`@theme`) | Clase Tailwind | Hexadecimal | Uso Principal en la Interfaz |
| :--- | :--- | :---: | :--- |
| `--color-brand` | `bg-brand`, `text-brand`, `border-brand` | `#087e9a` | Color primario de marca (botones primarios, enlaces activos, acentos). |
| `--color-brand-dark` | `hover:bg-brand-dark`, `text-brand-dark` | `#066a82` | Estado `:hover` de botones y enlaces primarios. |
| `--color-ink` | `text-ink`, `bg-ink` | `#102f3b` | Texto principal oscuro y fondos de alto contraste (`HeroSection`, `Footer`). |
| `--color-mist` | `border-mist`, `divide-mist`, `bg-mist` | `#dfe8eb` | Bordes de tarjetas, inputs, tablas y divisores sutiles. |
| `--color-muted` | `text-muted`, `placeholder:text-muted` | `#637780` | Texto secundario, subtítulos, etiquetas de metadatos y placeholders. |
| `--color-canvas` | `bg-canvas` | `#f8fafc` | Fondo general de la aplicación (`body`) y fondos de inputs/bloques secundarios. |
| `--color-surface` | `bg-surface` | `#ffffff` | Fondo de tarjetas, barra de navegación, modales y contenedores elevados. |
| `--color-success` | `text-success`, `border-success` | `#28634d` | Estado aprobado, verificado, confirmado o alerta de éxito. |
| `--color-success-soft` | `bg-success-soft` | `#edf5ef` | Fondo suave para píldoras/alertas de éxito y banner editorial. |
| `--color-info-soft` | `bg-info-soft` | `#e9f5f7` | Fondo suave para avatares, badges informativos, cupos y menú de usuario. |
| `--color-pending` | `text-pending` | `#9a641f` | Texto de advertencia o estado pendiente (combinado con `bg-amber-100`). |
| `--color-danger` | `text-danger`, `bg-danger`, `border-danger` | `#b42318` | Errores de validación, rechazo de solicitudes, suspensión y cerrar sesión. |
| `--color-danger-soft` | `bg-danger-soft` | `#fdecea` | Fondo suave para alertas de error y `:hover` de botones destructivos. |

> **Recomendación para nuevas pantallas:** Evitar escribir colores arbitrarios como `text-[#087E9A]`, `bg-stone-50` o `text-gray-700` (presentes en algunas vistas antiguas como `Login.jsx` u `OperatorRequestForm.jsx`) y utilizar siempre los tokens del tema (`text-brand`, `bg-canvas`, `text-ink`, `border-mist`).

---

## 2. Layouts de la Aplicación

| Layout | Archivo | Rutas que envuelve | Elementos que incluye |
| :--- | :--- | :--- | :--- |
| **`MainLayout`** | [`src/layouts/MainLayout.jsx`](../../src/layouts/MainLayout.jsx) | `/`, `/login`, `/registro`, `/verify-email`, `/perfil`, `/operador/solicitud`, `/sin-permiso`, `*` | Renderiza `<NavBar />` superior (conectado a `AuthContext`), `<main className="w-full max-w-none flex-1 py-10"><Outlet /></main>` y `<Footer />` inferior. |
| **`AdminLayout`** | [`src/layouts/AdminLayout.jsx`](../../src/layouts/AdminLayout.jsx) | `/admin`, `/admin/solicitudes`, `/admin/solicitudes/:id`, `/admin/usuarios`, `/admin/usuarios/nuevo` | Barra superior con logo `/admin`, buscador global (`SearchInput` sincronizado con `?q=` mediante `useAdminSearch`), `UserMenu`, barra secundaria de navegación en píldoras (`Resumen`, `Solicitudes`, `Usuarios`, `Empresas`, `Experiencias`) y `<Container className="py-8"><Outlet /></Container>`. |
| **`OperatorLayout`** | [`src/pages/Operators/OperatorLayout.jsx`](../../src/pages/Operators/OperatorLayout.jsx) | `/operador`, `/operador/experiencias`, `/operador/experiencias/nueva`, `/operador/cupos`, `/operador/reservas`, `/operador/resenas`, `/operador/configuracion` | Encabezado con logo `/`, `UserMenu`, subtítulo dinámico con el nombre del operador (`getOperatorDisplayName`), barra de 6 pestañas (`NavLink`), `<Outlet />` y pie de página compacto propio. |

---

## 3. Componentes Base y de Navegación (`src/components/`)

### 3.1 Botones, Enlaces y Controles de Formulario

| Componente | Archivo | Props Principales | Descripción y Cuándo Usarlo |
| :--- | :--- | :--- | :--- |
| **`Button`** | [`src/components/Button.jsx`](../../src/components/Button.jsx) | `variant` (`'primary'` \| `'outline'`), `type` (def: `'button'`), `className`, `...props` | Botón estándar con bordes redondeados (`rounded-xl`) y anillo de foco accesible. Usa `buttonClass()` de `buttonStyles.js`. |
| **`LinkButton`** | [`src/components/LinkButton.jsx`](../../src/components/LinkButton.jsx) | `to`, `variant` (`'primary'` \| `'outline'`), `className`, `...props` | Enlace `<Link>` de React Router con la misma apariencia visual que `Button`. Ideal para CTAs que navegan a otra ruta. |
| **`buttonStyles`** | [`src/components/buttonStyles.js`](../../src/components/buttonStyles.js) | `buttonClass(variant, extra)` | Función utilitaria por si se requiere aplicar estilos de botón a un `<a>` externo o elemento personalizado. |
| **`FormField`** | [`src/components/FormField.jsx`](../../src/components/FormField.jsx) | `id`, `label`, `hint`, `...inputProps` | Campo `<input>` con `<label>` asociado y texto de ayuda opcional (`hint`) debajo. Usado en `Profile.jsx`, `CreateUser.jsx` y `NewsletterSection.jsx`. |
| **`SelectField`** | [`src/components/SelectField.jsx`](../../src/components/SelectField.jsx) | `id`, `label`, `options` (`string[]`), `...selectProps` | Selector `<select>` con `<label>` para formularios. *Nota: actualmente espera un arreglo de strings en `options`; para objetos `{ value, label }` se puede usar `FilterSelect.jsx` o extender `SelectField.jsx`.* |
| **`Input`** | [`src/components/Input.jsx`](../../src/components/Input.jsx) | *(Archivo vacío - 0 bytes)* | **Pendiente:** El archivo existe vacío en el repositorio. Debe eliminarse o implementarse como primitiva de input reutilizable. |

### 3.2 Estructura, Navegación, Sesión y Feedback

| Componente | Archivo | Props Principales | Descripción y Cuándo Usarlo |
| :--- | :--- | :--- | :--- |
| **`Container`** | [`src/components/Container.jsx`](../../src/components/Container.jsx) | `className`, `...props` | Contenedor horizontal con `w-full px-6`. *(Nota: ver brecha sobre `mx-none` en documento de brechas).* |
| **`SectionHeading`** | [`src/components/SectionHeading.jsx`](../../src/components/SectionHeading.jsx) | `eyebrow`, `title`, `description`, `action`, `eyebrowClassName` | Encabezado de sección estandarizado con antetítulo en mayúsculas (`eyebrow`), título `h2`, descripción opcional y slot a la derecha para un botón/enlace (`action`). |
| **`AuthCard`** | [`src/components/AuthCard.jsx`](../../src/components/AuthCard.jsx) | `eyebrow`, `title`, `subtitle`, `children` | Contenedor centrado (`max-w-md`) con encabezado y tarjeta blanca (`rounded-2xl border-mist bg-surface p-8`) pensado para pantallas de autenticación (`/forgot-password`, `/reset-password`, etc.). |
| **`Icon`** | [`src/components/Icon.jsx`](../../src/components/Icon.jsx) | `name` (`'pin'` \| `'users'` \| `'heart'`), `className` (def: `'h-6 w-6'`) | Iconos SVG inline ligeros. Se puede ampliar el diccionario `paths` para añadir iconos de calendario, estrella, filtro, reloj o mapa. |
| **`NavBar`** | [`src/components/NavBar.jsx`](../../src/components/NavBar.jsx) | `user`, `onLogout`, `onMenuOpen` | Barra superior pública: logo `RutaSV`, buscador rápido que redirige a `/experiencias?q=`, enlace `Explorar`, selector visual `ES / EN` y `UserMenu` (o botones `Iniciar sesión` / `Registro`). |
| **`Footer`** | [`src/components/Footer.jsx`](../../src/components/Footer.jsx) | *(Sin props)* | Pie de página institucional con 3 columnas de enlaces (`Descubre`, `Comunidad`, `Te acompañamos`). |
| **`UserMenu`** | [`src/components/UserMenu.jsx`](../../src/components/UserMenu.jsx) | `label`, `items` (`{ to, label }[]`), `onOpen`, `onLogout`, `className` | Menú desplegable accesible (`role="menu"`, cierre con `Escape` y clic fuera). Se alimenta de `getUserMenuLabel(user)` y `getUserMenuItems(user)` en `src/lib/userMenu.js`. Se usa de forma idéntica en `MainLayout`, `AdminLayout` y `OperatorLayout`. |
| **`ProtectedRoute`** | [`src/components/ProtectedRoute.jsx`](../../src/components/ProtectedRoute.jsx) | `roles` (`string[]` opcional), `children` | Guardián de rutas: si no hay sesión redirige a `/login` (guardando `state.from`); si `roles` está definido y `user.role` no coincide, redirige a `/sin-permiso`. |
| **`Notifications`** | [`src/components/Notifications.jsx`](../../src/components/Notifications.jsx) | *(Sin props)* | Configuración visual de `<Toaster />` (`sonner`) con estilos del sistema de diseño (`success` y `error`). Se dispara mediante `notify.success()`, `notify.error()` y `notify.apiError()` de `src/lib/notify.js`. *(Pendiente montarlo en `App.jsx`)*. |

---

## 4. Componentes de Tarjetas del Catálogo Público (`src/components/`)

Estos componentes ya existen y están listos para reutilizarse directamente en la futura pantalla **`/experiencias`** y en el perfil público de empresas:

| Componente | Archivo | Props Actuales | Qué Muestra y Qué Ajustar al Conectar con `ExperiencesController` |
| :--- | :--- | :--- | :--- |
| **`ExperienceCard`** | [`src/components/ExperienceCard.jsx`](../../src/components/ExperienceCard.jsx) | `slug`, `image`, `location`, `rating`, `title`, `details`, `price`, `spots` | Tarjeta que enlaza a `/experiencias/${slug}`. Muestra imagen `aspect-[2/1]`, ubicación, `★ rating`, título, subtítulo (`details`), `${price} USD / persona` y badge `{spots} cupos`.<br>**Ajuste al conectar con `ExperienceSummaryDto` del backend:**<br>- Mapear `coverImageUrl` -> `image` (con imagen placeholder si es `null`).<br>- Mapear `${municipalityName}, ${departmentName}` -> `location`.<br>- Mapear `averageRating` -> `rating`.<br>- Mapear `shortDescription` (o `${primaryCategoryName} · ${durationMinutes} min`) -> `details`.<br>- Soportar `hasLimitedCapacity === false` mostrando `"Cupo abierto"` o `"Hasta ${maxPeople} personas"` en lugar de `{spots} cupos` cuando no haya fecha seleccionada. |
| **`CategoryCard`** | [`src/components/CategoryCard.jsx`](../../src/components/CategoryCard.jsx) | `title`, `count`, `image`, `to` (def: `'/experiencias'`) | Tarjeta de categoría con imagen `aspect-[3/2]`, título y conteo de experiencias.<br>**Ajuste al conectar con `GET /api/categories`:** Pasar `to={`/experiencias?categoryId=${category.id}`}`. |
| **`DestinationCard`** | [`src/components/DestinationCard.jsx`](../../src/components/DestinationCard.jsx) | `title`, `description`, `image`, `to` (def: `'/experiencias'`) | Tarjeta horizontal `aspect-[2/1]` para departamentos o rutas turísticas.<br>**Ajuste al conectar con `GET /api/departments`:** Pasar `to={`/experiencias?departmentId=${dept.id}`}`. |
| **`TestimonialCard`** | [`src/components/TestimonialCard.jsx`](../../src/components/TestimonialCard.jsx) | `quote`, `author`, `trip` | Tarjeta de reseña verificada con 5 estrellas. Puede reutilizarse (añadiendo prop `rating` dinámico y `date`) en la sección de reseñas de `/experiencias/:slug`. |

---

## 5. Componentes de UI Administrativa y de Listados (`src/components/admin/`)

Aunque están ubicados en la subcarpeta `src/components/admin/`, **estos 9 componentes son completamente genéricos** y deben reutilizarse en las próximas pantallas de Catálogo Público (`/experiencias`), Mis Reservas (`/mis-reservas`), Panel de Operador y nuevas secciones de Admin:

| Componente | Archivo | Props Principales | Cómo Reutilizarlo en Próximas Pantallas |
| :--- | :--- | :--- | :--- |
| **`AdminCard`** | [`src/components/admin/AdminCard.jsx`](../../src/components/admin/AdminCard.jsx) | `title`, `action`, `className`, `children` | Contenedor de tarjeta blanca con borde `border-mist`, encabezado opcional `title` y slot `action`. Ideal para bloques de detalle en `/experiencias/:slug`, `/mis-reservas/:id` y paneles de gestión. |
| **`AdminPageHeader`** | [`src/components/admin/AdminPageHeader.jsx`](../../src/components/admin/AdminPageHeader.jsx) | `title`, `subtitle`, `action` | Encabezado estándar para todas las vistas de `/admin/*` (`/admin/empresas`, `/admin/experiencias`, `/admin/catalogos`, `/admin/auditoria`). |
| **`Avatar`** | [`src/components/admin/Avatar.jsx`](../../src/components/admin/Avatar.jsx) | `name` | Círculo de `36x36px` (`size-9`) con las 2 iniciales del nombre. Útil para listas de viajeros en reservas, autores de reseñas y operadores. |
| **`Dialog`** | [`src/components/admin/Dialog.jsx`](../../src/components/admin/Dialog.jsx) | `title`, `onClose`, `children` | Modal accesible (`role="dialog"`, `aria-modal="true"`, cierre con tecla `Escape` y backdrop oscuro). Ya se usa tanto en `RequestDetail.jsx` (Admin) como en `MyOperatorRequest.jsx` (Visitante). **Reutilizar para:** confirmar/rechazar reservas, cancelar reserva (`RN-08`), cancelar sesión (`RF-O13`), resolver incidencia (`RN-21`) y previsualizar imágenes. |
| **`FilterSelect`** | [`src/components/admin/FilterSelect.jsx`](../../src/components/admin/FilterSelect.jsx) | `label`, `options` (`(string \| { value, label })[]`), `className`, `...props` | Selector `<select>` compacto con `aria-label` que soporta tanto arreglos de strings como objetos `{ value, label }`. **Reutilizar en `/experiencias`** para los filtros de Categoría, Departamento, Municipio, Dificultad y Ordenamiento (`sortBy`). |
| **`Notice`** | [`src/components/admin/Notice.jsx`](../../src/components/admin/Notice.jsx) | `tone` (`'success'` \| `'warning'` \| `'error'`), `children` | Banner de alerta inline con `role="status"` o `role="alert"`. Ideal para mostrar errores de validación del backend (como la lista `missingFields` del error `422` en `RN-23`) o avisos de estado. |
| **`Pagination`** | [`src/components/admin/Pagination.jsx`](../../src/components/admin/Pagination.jsx) | `summary`, `pages`, `currentPage`, `totalPages`, `onPageChange` | Paginador completo compatible con `PagedResponse<T>` del backend (`currentPage`, `totalPages`, `totalRecords`). **Reutilizar directamente en:** `/experiencias`, `/operador/experiencias`, `/mis-reservas` y `/admin/usuarios`. |
| **`Pill`** | [`src/components/admin/Pill.jsx`](../../src/components/admin/Pill.jsx) | `tone` (`'pending'` \| `'success'` \| `'info'` \| `'danger'` \| `'neutral'`), `className`, `children` | Badge/etiqueta de estado redondeada. Ya se usa en `Profile.jsx`, `MyOperatorRequest.jsx` y `Admin/*`. **Reutilizar para:** estados de experiencia (`BORRADOR`, `PUBLICADA`, `PAUSADA`, `ARCHIVADA`), estados de reserva y nivel de dificultad (`FACIL`, `MODERADA`, `DIFICIL`). |
| **`SearchInput`** | [`src/components/admin/SearchInput.jsx`](../../src/components/admin/SearchInput.jsx) | `label`, `className`, `...props` | Input `type="search"` estilizado. **Reutilizar en `/experiencias`** para el buscador principal del catálogo. |

---

## 6. Componentes Internos en Páginas que Conviene Extraer para Reutilizar

Durante el análisis del código se identificaron componentes muy útiles que hoy están declarados como funciones privadas dentro de archivos de páginas. **Extraerlos a `src/components/` ahorrará trabajo significativo en las siguientes integraciones:**

| Componente Interno Actual | Ubicación Actual | Por qué extraerlo y dónde reutilizarlo |
| :--- | :--- | :--- |
| **`FileUpload`** | [`src/pages/Operators/OperatorRequestForm.jsx`](../../src/pages/Operators/OperatorRequestForm.jsx#L173-L233) | Dropzone/selector de imagen con vista previa en miniatura, validación de formato/peso y botón `×` para quitar archivo. **Reutilizar en:** subida de galería de imágenes de experiencias (`OperatorExperienceForm.jsx`), logo de empresa (`OperatorSettings.jsx`) y foto de perfil (`Profile.jsx`). |
| **`DocumentItem` / `VisitorDocumentCard`** | [`src/pages/Admin/RequestDetail.jsx`](../../src/pages/Admin/RequestDetail.jsx#L31-L100) y [`src/pages/Operators/MyOperatorRequest.jsx`](../../src/pages/Operators/MyOperatorRequest.jsx#L27-L84) | Ambos componentes son prácticamente idénticos: renderizan una tarjeta de imagen/documento de MinIO con manejo de error de carga (`imageError`), botón `"Ampliar"` que abre `Dialog` y enlace externo. **Unificar en un solo componente `DocumentPreviewCard.jsx`**. |
| **`ReservationStatus`** | [`src/pages/Operators/ReservationStatus.jsx`](../../src/pages/Operators/ReservationStatus.jsx) | Muestra el badge de estado de una reserva (`Confirmada`, `Pendiente`, `Completada`). Si se amplía con todos los estados del dominio (`CONFIRMADA`, `PENDIENTE`, `PENDIENTE_DECISION`, `CANCELADA`, `RECHAZADA`, `COMPLETADA`, `EXPIRADA`) o se unifica con `Pill.jsx`, servirá también para `/mis-reservas` (Turista) y `/admin/reservas` (Admin). |
| **`PreferenceToggle`** | [`src/pages/Operators/OperatorSettings.jsx`](../../src/pages/Operators/OperatorSettings.jsx#L8-L29) | Switch/toggle accesible (`<input type="checkbox" className="sr-only" />`). **Reutilizar en `OperatorExperienceForm.jsx`** para los campos booleanos `hasLimitedCapacity` ("¿Tiene cupo limitado?"), `autoConfirmation` ("Confirmación automática de reservas") y `publishImmediately` ("Publicar inmediatamente"). |

---

## 7. Guía Rápida: ¿Qué Componentes Usar en las Próximas Pantallas?

| Próxima Pantalla a Construir / Integrar | Componentes Existentes Recomendados | Nuevos Componentes por Crear |
| :--- | :--- | :--- |
| **Catálogo Público (`/experiencias`)** | `MainLayout`, `Container`, `SectionHeading`, `SearchInput`, `FilterSelect` (categoría, depto, municipio, dificultad, orden), `ExperienceCard`, `Pagination`, `Notice`, `Pill` (filtros activos). | `ExperienceFiltersPanel.jsx` (panel lateral/colapsable para rango de precios `minPrice`/`maxPrice`, duración y calificación mínima). |
| **Detalle de Experiencia (`/experiencias/:slug`)** | `MainLayout`, `Container`, `Pill` (categorías y dificultad), `Avatar` (empresa/operador), `AdminCard` (bloques de información y políticas), `Button` / `LinkButton`, `TestimonialCard` (reseñas), `Dialog` (visor de galería a pantalla completa). | `ExperienceGallery.jsx` (grilla de fotos con portada `isCover`), `ExperienceMap.jsx` (mapa **React Leaflet** con marcador en `latitude`/`longitude`), `BookingSidebarCard.jsx` (selector de fecha/turno y personas). |
| **Formulario de Experiencia Conectado (`/operador/experiencias/nueva`)** | `OperatorLayout`, `FormField`, `FilterSelect` / `SelectField`, `Notice` (para mostrar lista `missingFields` cuando el backend responda `422`), `Pill`, `Button`, `PreferenceToggle` (extraído), `FileUpload` (extraído). | `LocationPickerMap.jsx` (mapa interactivo **React Leaflet** donde el operador hace clic para fijar `latitude` y `longitude` dentro de El Salvador), `ExperienceImagesManager.jsx` (subida múltiple a `/api/experiences/images/upload`, orden y radio button para elegir `isCover`). |
| **Mis Reservas del Turista (`/mis-reservas` y `/mis-reservas/:id`)** | `MainLayout`, `Container`, `SectionHeading`, `FilterSelect`, `Pill` / `ReservationStatus`, `AdminCard`, `Dialog` (confirmar cancelación o elegir reagendado/reembolso `RN-21`), `Pagination`, `Notice`. | `ReservationTimeline.jsx` (línea de tiempo de `reservation_history`), `ReviewFormModal.jsx` (estrellas interactivas 1..5 + comentario para reservas `COMPLETADA`). |
| **Recuperación de Contraseña (`/forgot-password`, `/reset-password`)** | `MainLayout`, `AuthCard` (ya construido en `src/components/AuthCard.jsx`), `FormField`, `Button`, `Notice`. | Ninguno adicional; todas las primitivas ya existen. |
