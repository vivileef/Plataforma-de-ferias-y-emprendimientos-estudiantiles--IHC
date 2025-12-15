# 🛍️ Plataforma de Ferias y Emprendimientos Estudiantiles (IHC)

Este repositorio contiene una aplicación Next.js (app router) para una plataforma de ferias artesanales y emprendimientos estudiantiles. Está preparada como demo/local — la persistencia de usuarios y sesiones se realiza en `localStorage` para facilitar pruebas en desarrollo.

##  🧩  Contenido principal

- `app/` — páginas de la aplicación (Next.js App Router).
- `components/` — componentes React reutilizables (UI, auth, comprador, vendedor, admin, shared, etc.).
- `hooks/` — hooks personalizados (`use-toast`, `use-mobile`, ...).
- `lib/` — utilidades del proyecto.
- `public/` — assets públicos.
- `styles/` — estilos globales.


## 🧰 Instalación y dependencias

Requisitos mínimos:
- Node.js >= 18
- npm (o pnpm/yarn)

Instalación (recomendado en PowerShell para Windows):

```powershell
npm install --legacy-peer-deps
npm run dev
```

Notas:
- Usamos `--legacy-peer-deps` debido a un conflicto de peer-dependencies entre `vaul@0.9.9` y `react@19` observado en el repositorio. Esto permite instalar en entornos de desarrollo sin bloquear la instalación.
- Opciones alternativas:
  - Degradar `react`/`react-dom` a la serie 18.x y ajustar `@types/react`.
  - Reemplazar `vaul` por otro drawer compatible.

Scripts útiles:
- `npm run dev` — arranca Next.js en modo desarrollo
- `npm run build` — genera build de producción
- `npm start` — arranca servidor de producción
- `npm run lint` — ejecuta linter

Instalar dependencias (PowerShell):

```powershell
npm install --legacy-peer-deps
```

Arrancar en modo desarrollo:

```powershell
npm run dev
```

Build de producción:

```powershell
npm run build
npm start
```

Lint:

```powershell
npm run lint
```

---


## 🚀 Tecnologías principales

- Next.js (App Router) — `next@16.0.0`
- React — `react@19.2.0`, `react-dom@19.2.0`
- TypeScript — `typescript@^5`
- Tailwind CSS — `tailwindcss@^4.1.9`
- Radix UI — `@radix-ui/react-*` (componentes accesibles)
- Vaul — `vaul@^0.9.9` (drawer; ver nota de compatibilidad)
- react-hook-form + @hookform/resolvers — formularios
- zod — validación de esquemas
- sonner / sistema de toasts — notificaciones
- lucide-react — iconos

> Consulta `package.json` para la lista completa y versiones exactas.


## Nota sobre peer-dependencies (vaul + React)

Al instalar dependencias se detectó un conflicto: `vaul@0.9.9` declara peer dependency para React `^16.8 || ^17 || ^18` y el proyecto usa `react@19.2.0`. npm 9+ falla por defecto en estos casos.

Opciones para resolverlo:

1. Solución rápida (usada en este repositorio): instalar con `--legacy-peer-deps`.
	 - Pros: instalación inmediata y desarrollo rápido.
	 - Contras: oculta incompatibilidades; `vaul` podría no funcionar correctamente con React 19.

2. Solución conservadora: degradar `react` y `react-dom` a la serie 18.x y actualizar `@types/react` a `^18`.

3. Solución a largo plazo: reemplazar `vaul` por otro componente/implementación de drawer compatible o actualizar `vaul` si existe una versión que soporte React 19.

Recomendación: Para desarrollo rápido puedes mantener `--legacy-peer-deps`, pero antes de pasar a producción o CI, escoge una de las opciones 2 o 3 y valida la compatibilidad.


## Qué hace cada perfil (features por role)

1. Vendedor
	 - Acceso a `/vendedor/dashboard`.
	 - Añadir/editar/listar productos (UI disponible: `components/vendedor/*`).
	 - Editar perfil en `/vendedor/perfil` (nombre, email, teléfono, contraseña).
	 - Atajos: `n` abre diálogo "Añadir producto" (si está en dashboard).

2. Comprador
	 - Acceso a `/comprador/dashboard`.
	 - Navegar catálogo y ver detalle de producto (`components/comprador/*`, `product-grid`, `product-detail-dialog`).
	 - Añadir al carrito y ver carrito (UI demo: `components/comprador/cart-sheet.tsx`).
	 - Editar perfil en `/comprador/perfil`.

3. Admin
	 - Acceso a `/admin/dashboard`.
	 - Gestión de usuarios y productos (UI: `components/admin/users-table.tsx`, `components/admin/products-table.tsx`).
	 - Funciones administrativas demo (no hay backend real por defecto).

## Funcionamiento general del sistema

- Autenticación y sesión:
	- No hay backend por defecto: el sistema guarda usuarios en `localStorage` (`marketplace_users_v1`) y la sesión en `marketplace_session_v1`.
	- `components/auth/users.ts` contiene utilidades: crear usuario (`addUser`), validar credenciales (`validateCredentials`), solicitar/resetear contraseña (`requestPasswordReset`, `resetPassword`), gestionar sesión (`setSession`, `getSession`).

- Flujo de registro/login:
	1. El usuario se registra (o el admin se crea automáticamente por `ensureAdminExists()`).
	2. Al iniciar sesión, la sesión se escribe en `localStorage` y el header muestra el nombre.
	3. El role del usuario determina rutas y acciones disponibles (vendedor/comprador/admin).

- Edición de perfil:
	- Las páginas `/vendedor/perfil` y `/comprador/perfil` usan `components/shared/profile-form.tsx`.
	- El formulario validará con `zod`, actualizará el usuario en `localStorage` mediante `updateUserProfile` y actualizará la sesión (`setSession`) para reflejar cambios inmediatos.

- Persistencia y límites actuales:
	- Todo el almacenamiento es local: `localStorage`.
	- Esto facilita pruebas pero no es seguro ni escalable. Para producción hay que implementar API routes y una base de datos.

## Modelo Entidad-Relación (ER)

Descripción textual del modelo de datos que la aplicación usa o debería usar cuando se implemente backend/DB.

1. USUARIO
   - id_usuario (PK)
   - nombre
   - email (único)
   - contraseña (almacenar hashed en backend real)
   - telefono
   - direccion
   - Descripción: representa la cuenta de una persona en el sistema; puede tener un perfil específico (cliente, repartidor o vendedor).

2. CLIENTE
   - id_cliente (PK)
   - id_usuario (FK -> USUARIO)
   - fecha_registro
   - Descripción: perfil que representa a compradores que realizan pedidos.

3. REPARTIDOR
   - id_repartidor (PK)
   - id_usuario (FK -> USUARIO)
   - vehiculo
   - licencia_conducir
   - Descripción: perfil responsable de la entrega de pedidos.

4. VENDEDOR
   - id_vendedor (PK)
   - id_usuario (FK -> USUARIO)
   - nombre_tienda
   - cuenta_bancaria
   - Descripción: perfil que publica productos y recibe ventas.

5. PRODUCTO
   - id_producto (PK)
   - nombre
   - descripcion
   - precio
   - stock
   - id_vendedor (FK -> VENDEDOR)
   - Descripción: items que los vendedores publican para la venta.

6. PEDIDO
   - id_pedido (PK)
   - fecha
   - total
   - direccion_envio
   - id_cliente (FK -> CLIENTE)
   - id_repartidor (FK -> REPARTIDOR)
   - estado (enum)
   - Descripción: representa una orden realizada por un cliente que contiene uno o más detalles de pedido.

7. DETALLE_PEDIDO
   - id_detalle (PK)
   - id_pedido (FK -> PEDIDO)
   - id_producto (FK -> PRODUCTO)
   - cantidad
   - precio_unitario
   - subtotal
   - Descripción: línea de pedido que relaciona un producto con una cantidad y precio en un pedido.

8. PAGO
   - id_pago (PK)
   - id_pedido (FK -> PEDIDO)
   - monto
   - fecha
   - confirmado_por_repartidor (boolean)
   - pagado_a_vendedor (boolean)
   - fecha_pago_vendedor
   - metodo (enum)
   - metodo_pago_vendedor (enum)
   - Descripción: información de pago asociada a un pedido.

9. HISTORIAL_VENTA
   - id_historial (PK)
   - id_vendedor (FK -> VENDEDOR)
   - id_pedido (FK -> PEDIDO)
   - fecha
   - total
   - Descripción: registro de ventas por vendedor (resumen/registro contable).

---

### 🔗 Relaciones clave (redactadas)

- Un `USUARIO` puede tener exactamente un `CLIENTE`, `REPARTIDOR` o `VENDEDOR` (perfiles 1-a-1 según el tipo de cuenta).
- Un `CLIENTE` puede realizar muchos `PEDIDO` (1 a N).
- Un `REPARTIDOR` puede entregar muchos `PEDIDO` (1 a N).
- Un `VENDEDOR` publica muchos `PRODUCTO` (1 a N).
- Un `PEDIDO` contiene muchos `DETALLE_PEDIDO` (1 a N); cada `DETALLE_PEDIDO` está asociado a un único `PRODUCTO`.
- Un `PEDIDO` puede tener uno o más `PAGO` asociados (según flujo), y un `PAGO` pertenece a un único `PEDIDO`.
- Un `VENDEDOR` tiene muchos registros en `HISTORIAL_VENTA` (1 a N), y cada registro apunta a un `PEDIDO`.

---

erDiagram
    USUARIO {
        int id_usuario PK
        string nombre
        string email
        string contrasena
        string telefono
        string direccion
    }

    CLIENTE {
        int id_cliente PK
        int id_usuario FK
        datetime fecha_registro
    }

    REPARTIDOR {
        int id_repartidor PK
        int id_usuario FK
        string vehiculo
        string licencia_conducir
    }

    VENDEDOR {
        int id_vendedor PK
        int id_usuario FK
        string nombre_tienda
        string cuenta_bancaria
    }

    PRODUCTO {
        int id_producto PK
        string nombre
        string descripcion
        float precio
        int stock
        int id_vendedor FK
    }

    PEDIDO {
        int id_pedido PK
        datetime fecha
        float total
        string direccion_envio
        string estado
        int id_cliente FK
        int id_repartidor FK
    }

    DETALLE_PEDIDO {
        int id_detalle PK
        int id_pedido FK
        int id_producto FK
        int cantidad
        float precio_unitario
        float subtotal
    }

    PAGO {
        int id_pago PK
        int id_pedido FK
        float monto
        datetime fecha
        boolean confirmado_por_repartidor
        boolean pagado_a_vendedor
        datetime fecha_pago_vendedor
        string metodo
        string metodo_pago_vendedor
    }

    HISTORIAL_VENTA {
        int id_historial PK
        int id_vendedor FK
        int id_pedido FK
        datetime fecha
        float total
    }

    %% Relaciones
    USUARIO ||--|| CLIENTE : tiene
    USUARIO ||--|| REPARTIDOR : tiene
    USUARIO ||--|| VENDEDOR : tiene

    CLIENTE ||--o{ PEDIDO : realiza
    REPARTIDOR ||--o{ PEDIDO : entrega
    VENDEDOR ||--o{ PRODUCTO : publica

    PEDIDO ||--o{ DETALLE_PEDIDO : contiene
    PRODUCTO ||--o{ DETALLE_PEDIDO : aparece_en

    PEDIDO ||--o{ PAGO : genera

    VENDEDOR ||--o{ HISTORIAL_VENTA : registra
    PEDIDO ||--|| HISTORIAL_VENTA : asociado
---






