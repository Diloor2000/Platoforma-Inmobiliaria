# Documentación para el reporte (Rúbricas)

Usa estos puntos en tu reporte escrito para que el profesor vea que cubriste las rúbricas.

---

## Selección Cloud (DBaaS) – Análisis de modelo cloud

**Justificación:** Se eligió Supabase (PostgreSQL) como DBaaS porque ofrece escalabilidad automática y manejo nativo de identidad (Auth), cumpliendo con el análisis de modelo cloud. La base de datos está alojada en la nube con respaldo, réplicas y políticas de seguridad gestionadas por el proveedor.

---

## Seguridad – Documentación de seguridad

**Modelo AAA (Authentication, Authorization, Accounting):**

- **Authentication:** Login en `app/login/page.tsx` con Supabase Auth (email/contraseña). La sesión se valida con JWT y cookies.
- **Authorization:** Se usan roles en la base de datos (`profiles.role`: `admin` o `user`) y políticas RLS (Row Level Security). Un usuario común no puede borrar o modificar propiedades de otro ni acceder a datos restringidos. Solo el rol `admin` puede acceder a `/dashboard`.
- **Accounting:** El middleware (`middleware.ts`) comprueba la sesión y el rol antes de permitir el acceso al panel. Si un usuario no admin intenta entrar a `/dashboard`, se le redirige al inicio.

---

## Innovación – Real-time leads

**Arquitectura:** Sistema de leads en tiempo real donde el administrador gestiona inventario y clientes en un solo panel centralizado. Los usuarios registrados envían mensajes de interés desde la ficha de cada propiedad; los mensajes se guardan en la tabla `leads` vinculando usuario y propiedad. El admin ve en el dashboard: *"El usuario X está interesado en la propiedad Y"* con el mensaje y la fecha.

---

## Complejidad técnica

- **Auth y roles:** Página de login, verificación de rol en `profiles`, redirección según rol (admin → dashboard, user → inicio).
- **Middleware de seguridad:** Protección de rutas por rol; solo admins acceden a `/dashboard`.
- **Sistema de leads:** Formulario en la vista de detalle de propiedad (solo usuarios logueados), inserción en `leads` con `user_id` y `property_id`.
- **Dashboard admin:** Métricas (propiedades, valor total, precio medio, cantidad de leads) y lista de mensajes con usuario y propiedad.

---

## Presentación

- **Estados de carga:** Spinners en `app/loading.tsx`, `app/dashboard/loading.tsx`, `app/properties/[id]/loading.tsx` y `app/login/loading.tsx`.
- **Notificaciones Toast:** Al enviar un mensaje (lead) se muestra un toast de confirmación (“Mensaje enviado correctamente…”). Errores también se muestran en toast.
