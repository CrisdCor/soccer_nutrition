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

**`SUPABASE_SERVICE_ROLE_KEY`** es distinta: bypassa RLS por completo y nunca
lleva prefijo `NEXT_PUBLIC_`. Solo la usa `lib/supabase/admin.ts`, exclusivamente
en Server Actions, para el módulo de Usuarios (Admin API de Supabase Auth).
Cópiala desde Project Settings → API → **service_role secret** — nadie más
debería tenerla ni debe llegar nunca al bundle del navegador.

## Despliegue en Vercel

Al importar este repositorio en Vercel, configura estas variables de entorno
(Project Settings → Environment Variables):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret del proyecto Supabase (Production **y** Preview) |

## Estructura

```
app/login/                     Ruta pública (única) — formulario de acceso
app/(app)/dashboard/           Stats + filtro por categoría y sexo
app/(app)/jugadores/           CRUD de jugadores + perfil con histórico y gráfico
app/(app)/valoraciones/        Listado, detalle y edición (admin) de valoraciones
app/(app)/catalogos/           CRUD de posiciones/categorías (admin)
app/(app)/configuracion/       Umbrales de referencia por métrica (admin)
app/(app)/usuarios/            CRUD de usuarios vía Admin API (solo admin)
components/layout/             Shell de la app (sidebar + header), sensible al rol
lib/calculations/               Fórmulas antropométricas como funciones puras
lib/{jugadores,valoraciones,   Queries + server actions por dominio
    catalogos,configuracion,
    usuarios}/
lib/supabase/                  Clientes de Supabase: browser/server (RLS) y admin (service_role)
lib/auth/                      Perfil de usuario, sesión de servidor, logout
proxy.ts                       Protección de rutas y refresco de sesión en cada request
```

## Autenticación y roles

No hay registro público: solo `admin` crea usuarios, desde `/usuarios`, con la
Admin API de Supabase (`auth.admin.createUser` — nunca el signup público).
Para crear el primer `admin` de prueba (antes de que exista ningún admin):

1. Supabase Dashboard → **Authentication → Add user**, con **User Metadata**:
   ```json
   { "role": "admin", "full_name": "Nombre Apellido" }
   ```
   Un trigger (`on_auth_user_created`) crea automáticamente la fila en
   `user_profiles` con ese rol y organización (por defecto, Independiente
   Medellín). Sin metadata, el rol por defecto es `nutricionista`.
2. Inicia sesión en `/login` con ese correo/contraseña.
3. De ahí en adelante, usa `/usuarios` para crear al resto — no hace falta
   volver al dashboard de Supabase.

`proxy.ts` (el middleware, renombrado según la convención de Next.js 16)
exige sesión en toda ruta salvo `/login`, y exige además `role = 'admin'`
(verificado contra `user_profiles`, no contra el JWT) para `/usuarios`,
`/catalogos` y `/configuracion` — igual que sus políticas RLS.

Como jugadores y valoraciones, los usuarios nunca se borran: "Inactivar"
bloquea el login (Supabase Auth `ban_duration`) y marca `user_profiles.status
= 'inactive'`. Un admin no puede inactivarse a sí mismo (el botón ni siquiera
aparece en su propia fila).

## Cálculos antropométricos

`lib/calculations/` implementa cada fórmula (Suma 6 Pliegues, perímetros
corregidos, Rocha, Lee 2000, Yuhasz, masa adiposa/residual, IMC, AKS) como una
función pura e independiente — nunca traducción literal del Excel. Regla
transversal: si falta un dato de entrada, el indicador queda `null` ("dato
insuficiente"), nunca se asume `0` ni se propaga en cascada. `lib/format.ts`
muestra esos `null` como "Dato insuficiente" en toda la UI.

## Esquema de base de datos

8 tablas con RLS activo: `organizations`, `user_profiles`, `races`, `positions`,
`categories`, `reference_thresholds`, `players`, `assessments`. Multi-tenant vía
`organization_id`. `players` no borra físicamente (solo se inactiva);
`assessments` es insert-only para `nutricionista` (solo `admin` puede editar).
Ver `lib/supabase/database.types.ts` para los tipos completos.
