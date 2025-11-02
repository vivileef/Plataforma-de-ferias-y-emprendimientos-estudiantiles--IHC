# Marketplace Artesanal — Atajos de teclado y comprobación de requisitos

Este README documenta los atajos de teclado detectados en el proyecto y proporciona una plantilla para completar los requisitos que enviaste en las 2 fotos (necesito que subas las fotos o pegues el texto de los requisitos para completar esa sección).

## Atajos de teclado detectados
A continuación se listan los atajos que encontré en el código, dónde se aplican y cómo probarlos.

- Ctrl/Cmd + B — Toggle (mostrar/ocultar) la barra lateral
  - Archivo: `components/ui/sidebar.tsx`
  - Dónde: en las páginas que usan el `SidebarProvider` / componente `Sidebar` (es la barra lateral principal en la interfaz de escritorio).
  - Cómo funciona: al pulsar Ctrl+B (Windows/Linux) o ⌘+B (Mac) se ejecuta la función `toggleSidebar()` y se alterna el estado expandido/colapsado.
  - Cómo probar: abrir una página con la barra lateral (por ejemplo la mayoría de pantallas administrativas o dashboard) y presionar Ctrl+B / ⌘+B.

- N — Abrir diálogo de “Añadir producto” (Vendedor)
  - Archivo: `components/vendedor/vendedor-dashboard.tsx`
  - Dónde: en el dashboard del vendedor (`/vendedor/dashboard` o el componente `VendedorDashboard`).
  - Cómo funciona: al pulsar la tecla `n` (sin Ctrl/Alt/Meta), se ejecuta `setShowAddProduct(true)` y se abre el diálogo `AddProductDialog`.
  - Cómo probar: iniciar sesión como vendedor en la app, ir al dashboard de vendedor y pulsar `n`.

- Flecha izquierda / Flecha derecha — Navegación del carrusel
  - Archivo: `components/ui/carousel.tsx`
  - Dónde: en cualquier componente que utilice el `Carousel` (por ejemplo galerías/slider de productos).
  - Cómo funciona: la función `handleKeyDown` escucha `ArrowLeft` y `ArrowRight` y llama a `scrollPrev()` / `scrollNext()` respectivamente.
  - Cómo probar: enfocar (click) el carrusel y presionar las flechas izquierda/derecha para moverse entre slides.

- Visualización de atajos en menús contextuales y dropdowns
  - Archivos: `components/ui/context-menu.tsx`, `components/ui/dropdown-menu.tsx`
  - Dónde: componentes de menú que usan `ContextMenuShortcut` o `DropdownMenuShortcut` para mostrar la tecla asociada junto a una acción.
  - Nota: estos componentes sólo muestran el atajo (UI) — el atajo real debe implementarse por la funcionalidad respectiva (por ejemplo, la búsqueda de atajos en `sidebar` y `vendedor-dashboard` ya implementa comportamiento).

## Requisitos de las 2 fotos — plantilla para completar
No he recibido las fotos en este repositorio. Para completar esta sección necesito que subas aquí las 2 fotos o pegues en el chat el texto/imagen de los requisitos. Cuando envíes las fotos, rellenaré por cada requisito lo siguiente:

- Requisito (texto extraído de la foto)
- ¿Por qué lo cumple el proyecto? (breve justificación)
- ¿Cómo se cumple? (archivos, funciones, componentes concretos)
- ¿Dónde probarlo? (ruta/página y pasos para verificar)

Ejemplo (plantilla rellenada):

- Requisito: "El sistema debe permitir iniciar sesión como administrador"
  - Por qué lo cumple: el proyecto contiene un usuario admin por defecto creado por `ensureAdminExists()` y existe un formulario de login reutilizable.
  - Cómo se cumple: función `ensureAdminExists()` en `components/auth/users.ts` crea el admin; el componente `components/auth/login-form.tsx` realiza la validación con `validateCredentials()`.
  - Dónde probarlo: abrir `/admin/login` y usar `admin@gmail.com` / `admin`.

Cuando subas las fotos haré lo siguiente por cada requisito detectado:
1. Extraeré el texto del requisito.
2. Buscaré en el código dónde está implementado o qué falta.
3. Añadiré una entrada con la justificación y los pasos para verificar.
4. Si algo falta, propondré e implementaré el cambio mínimo necesario (puedo aplicar los cambios si me das permiso).

## Cómo probar localmente
Instala dependencias y arranca en modo desarrollo (usa `pnpm`/`npm` según prefieras):

```powershell
# instalar
pnpm install
# ejecutar en dev
pnpm dev
```

O con npm:

```powershell
npm install
npm run dev
```

Páginas útiles:
- `/` — inicio
- `/admin/login` — login de admin
- `/vendedor/dashboard` — dashboard del vendedor (atajo `n` para añadir producto)
- `/forgot-password` — solicitar restablecimiento de contraseña (flujo implementado en localStorage)

## Notas finales
- Si quieres que complete automáticamente la sección de requisitos ahora, sube las 2 fotos o pega el texto aquí y me encargaré de extraerlos y explicar exactamente dónde y cómo se cumplen en el proyecto, y añadiré cualquier cambio pequeño necesario.
- Si quieres, también puedo añadir una sección adicional en este README con pruebas automáticas (unitarias) que verifiquen algunos de estos comportamientos.

## Cambios recientes implementados (rápidos y sin perjudicar el sistema)

Implementé varias mejoras sencillas solicitadas: bienvenida personalizada, mostrar nombre en el header y un footer informativo. A continuación se detallan qué se implementó, dónde y cómo probarlo.

- Bienvenida personalizada (Vendedor):
  - Dónde: `components/vendedor/vendedor-dashboard.tsx`
  - Qué hace: muestra "Hola {nombre}, ¡suerte en las ventas!" debajo del título del dashboard cuando el usuario ha iniciado sesión.
  - Cómo probar: Inicia sesión (por ejemplo con `admin@gmail.com`/`admin` o cualquier usuario registrado) en `/vendedor/login`, luego abre `/vendedor/dashboard`.

- Bienvenida personalizada (Comprador):
  - Dónde: `components/comprador/comprador-dashboard.tsx`
  - Qué hace: muestra "Hola {nombre}, ¡suerte en las compras!" debajo del título del dashboard cuando el usuario ha iniciado sesión.
  - Cómo probar: Inicia sesión y abre `/comprador/dashboard`.

- Mostrar nombre en el header y botón de cierre de sesión (demo):
  - Dónde: `components/shared/app-header.tsx`
  - Qué hace: si existe una sesión en localStorage, muestra "Hola, {nombre}" (oculto en pantallas pequeñas) y el botón Cerrar Sesión borra la sesión y recarga la página.
  - Cómo probar: iniciar sesión y observar el header; usar "Cerrar Sesión" para limpiar la sesión.

- Persistencia de sesión simple (demo-only):
  - Dónde: `components/auth/login-form.tsx` y `components/auth/users.ts`
  - Qué hace: al iniciar sesión se guarda una sesión simple en localStorage (clave `marketplace_session_v1`) con { email, role, name } para permitir mostrar el nombre en el header y dashboards.
  - Nota de seguridad: esto es únicamente para demo/local. No es seguro para producción.

- Footer global informativo:
  - Dónde: `components/shared/footer.tsx`, incluido en `app/layout.tsx`
  - Qué hace: muestra nombre del proyecto, email de soporte y enlaces a términos/política (enlace por ahora redirige al inicio).

### Qué quedó por implementar (no realizado ahora)

- Ver/Editar perfil (requiere página y formulario) — no implementado.
- Recordar usuario/gestión de sesiones segura (backend, cookies/JWT) — no implementado (ahora hay sólo sesión local de demo).
- Bloqueo temporal por intentos fallidos — no implementado.
- Submenú de accesibilidad y ayuda contextual completa — no implementado.
- Tabla de usuarios con DB real — UI existe (`components/admin/users-table.tsx`) pero no hay DB real.

Si quieres que implemente alguno de los pendientes (por ejemplo la página de perfil o la persistencia de sesión más segura mediante API route), dime cuál y lo hago a continuación.

---
Archivo generado automáticamente: `README.md`. Si quieres ajustes en formato, idioma o detalle (por ejemplo, incluir capturas de pantalla, enlaces o diagramas), dímelo y lo actualizo.