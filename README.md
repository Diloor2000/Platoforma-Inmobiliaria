# Elite Estate

Plataforma web de análisis comercial inmobiliario. Permite a asesores registrar propiedades, gestionar leads y citas, y a administradores aprobar cuentas y administrar el inventario. Enfocada en el mercado de Ecuador (Guayaquil, Quito, Manta, Cuenca).

---

## Tecnologías

- **Next.js** (App Router) — React, SSR y Server Actions
- **TypeScript**
- **Tailwind CSS** — estilos
- **Supabase** — autenticación, base de datos (PostgreSQL) y almacenamiento de archivos
- **Lucide React** — iconos

---

## Funcionalidades

- **Público:** ver propiedades, solicitar citas y enviar leads desde la ficha de cada propiedad.
- **Registro de asesores:** registro con validación de contraseña (mín. 8 caracteres, mayúscula, número y símbolo). Las cuentas quedan en revisión hasta aprobación.
- **Página de espera:** usuarios con cuenta en revisión ven un mensaje informativo en `/espera`.
- **Dashboard (acceso solo con cuenta aprobada):**
  - Resumen
  - Citas
  - Leads
  - Gestión de asesores (aprobar/rechazar perfiles)
  - Inventario de propiedades (listado y alta desde modal o desde `/properties/new`)
- **Nueva propiedad:** formulario con subida de imagen al bucket `property-images` de Supabase Storage; solo usuarios con rol **admin** y **status approved** (o super admin) pueden subir archivos.
- **Super administrador:** email configurado en `lib/constants.ts` tiene acceso total sin depender del perfil.

---

## Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)

---

## Instalación

1. Clonar el repositorio e instalar dependencias:

```bash
git clone <url-del-repo>
cd "Plataforma Web de Análisis Comercial Inmobiliario"
npm install
```

2. Configurar variables de entorno. Crear `.env.local` en la raíz con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

Las claves se obtienen en el Dashboard de Supabase → **Settings** → **API**.

3. Crear en Supabase el bucket de Storage **`property-images`** (Storage → New bucket) si vas a subir imágenes desde la app.

4. Ejecutar la base de datos. En el proyecto hay un archivo `supabase-schema.sql` con tablas y políticas de ejemplo; ejecútalo en el SQL Editor de Supabase si aún no tienes el esquema.

5. Arrancar en desarrollo:

```bash
npm run dev
```

La app quedará en [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Comando        | Descripción              |
|----------------|--------------------------|
| `npm run dev`  | Servidor de desarrollo   |
| `npm run build`| Build de producción      |
| `npm run start`| Servidor de producción   |
| `npm run lint` | Ejecutar ESLint          |

---

## Estructura del proyecto (resumen)

```
app/
  actions/       # Server Actions (auth, properties, profiles, leads, appointments)
  dashboard/      # Dashboard con pestañas
  espera/        # Página para cuentas en revisión
  login/         # Inicio de sesión
  register/      # Registro de asesores
  properties/    # Listado, detalle [id] y nueva propiedad (new)
components/      # Navbar, modales, formularios, tarjetas, etc.
lib/
  supabase/      # Cliente browser, servidor, admin (service role), middleware
  constants.ts   # SUPER_ADMIN_EMAIL, etc.
  locations.ts   # ECUADOR_LOCATIONS
types/           # Tipos (Property, Profile, Lead, Appointment, etc.)
```

---

## Despliegue en Vercel

1. Conectar el repositorio a [Vercel](https://vercel.com).
2. Añadir en el proyecto de Vercel las mismas variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Desplegar. Vercel detectará Next.js y usará `npm run build` por defecto.

---

## Licencia

Proyecto de uso educativo / universitario.
