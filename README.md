# Soccer Nutrition

Aplicación web para que la nutricionista del Independiente Medellín registre y
gestione las valoraciones antropométricas de los jugadores, reemplazando el
Excel actual.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS v4
- **Backend/DB:** Supabase (Postgres + Auth + Storage) — esquema con RLS ya aplicado
- **Formularios:** react-hook-form + zod
- **Gráficos:** recharts
- **Cliente Supabase:** @supabase/supabase-js

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
app/                  Rutas (App Router)
components/layout/    Shell de la app (sidebar + header)
lib/supabase/         Cliente de Supabase y tipos generados del esquema
```

## Esquema de base de datos

8 tablas con RLS activo: `organizations`, `user_profiles`, `races`, `positions`,
`categories`, `reference_thresholds`, `players`, `assessments`. Multi-tenant vía
`organization_id`. `players` no borra físicamente (solo se inactiva);
`assessments` es insert-only para `nutricionista` (solo `admin` puede editar).
Ver `lib/supabase/database.types.ts` para los tipos completos.
