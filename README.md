# Soccer Nutrition

Aplicación web para que la nutricionista del Independiente Medellín registre y
gestione las valoraciones antropométricas de los jugadores, reemplazando el
Excel actual.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS v4
- **Backend/DB:** Supabase (Postgres + Auth + Storage) — esquema con RLS ya aplicado
- **Formularios:** react-hook-form + zod
- **Gráficos:** recharts
- **Cliente Supabase:** @supabase/ssr (browser + server, con cookies de sesión)

## Desarrollo local

```bash
npm install
npm run dev
```

Copia `.env.example` a `.env.local` y completa las credenciales del proyecto
Supabase (Project Settings → API en el dashboard). La `anon key` es pública y
está protegida por Row Level Security en todas las tablas.

## Despliegue en Vercel

Al importar este repositorio en Vercel, configura estas variables de entorno
(Project Settings → Environment Variables):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key del proyecto Supabase |

## Estructura

```
app/login/            Ruta pública (única) — formulario de acceso
app/(app)/            Rutas autenticadas (dashboard, jugadores, valoraciones,
                      catálogos, configuración, usuarios) — comparten sidebar+header
components/layout/    Shell de la app (sidebar + header), sensible al rol
components/auth/      Formulario de login
lib/supabase/         Clientes de Supabase (browser/server) y tipos generados
lib/auth/             Contexto de perfil de usuario + server action de logout
proxy.ts              Protección de rutas y refresco de sesión en cada request
```

## Autenticación y roles

No hay registro público: solo `admin` crea usuarios (módulo de Usuarios,
pendiente). Para crear el primer `admin` de prueba:

1. Supabase Dashboard → **Authentication → Add user**, con **User Metadata**:
   ```json
   { "role": "admin", "full_name": "Nombre Apellido" }
   ```
   Un trigger (`on_auth_user_created`) crea automáticamente la fila en
   `user_profiles` con ese rol y organización (por defecto, Independiente
   Medellín). Sin metadata, el rol por defecto es `nutricionista`.
2. Inicia sesión en `/login` con ese correo/contraseña.

`proxy.ts` (el middleware, renombrado según la convención de Next.js 16)
exige sesión en toda ruta salvo `/login`, y exige además `role = 'admin'`
(verificado contra `user_profiles`, no contra el JWT) para `/usuarios`.

## Esquema de base de datos

8 tablas con RLS activo: `organizations`, `user_profiles`, `races`, `positions`,
`categories`, `reference_thresholds`, `players`, `assessments`. Multi-tenant vía
`organization_id`. `players` no borra físicamente (solo se inactiva);
`assessments` es insert-only para `nutricionista` (solo `admin` puede editar).
Ver `lib/supabase/database.types.ts` para los tipos completos.
