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
- **UI headless:** @radix-ui/react-dropdown-menu, @radix-ui/react-tabs (estilizados a mano con el Design System, sin librería de componentes completa)

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

## Pruebas E2E (Playwright)

`e2e/` verifica interacciones de UI (hover, menús, modales) que un
`tsc`/`build`/`lint` no puede detectar — corren contra tu propio
`localhost:3000`, nunca contra producción.

**Configuración (una sola vez):**

1. Crea un usuario de prueba desde `/usuarios` (mismo flujo real de alta —
   ej. `qa.testing@soccernutrition.local`, rol `nutricionista`).
2. Agrega a tu `.env.local` (nunca al repo):
   ```
   E2E_TEST_EMAIL=qa.testing@soccernutrition.local
   E2E_TEST_PASSWORD=lo-que-hayas-definido
   ```

**Correr las pruebas:**

```bash
npm run test:e2e
```

Si `next dev` no está corriendo, Playwright lo levanta solo (y lo apaga al
terminar); si ya está corriendo, lo reutiliza. Un jugador de prueba
("Jugador E2E (no borrar)", sin valoraciones) se crea la primera vez que
corren los tests, vía el propio formulario "Nuevo jugador" — no se escribe
directo a la base — y se reutiliza en corridas siguientes (nunca se duplica).

`e2e/fixtures/auth.ts` trae el helper de login; `e2e/fixtures/test-player.ts`
el del jugador de prueba. Antes de dar por terminado un flujo de UI (como el
menú "•••" o el encabezado del perfil), corre `npm run test:e2e` y revisa el
reporte HTML (`playwright-report/index.html`, con capturas automáticas de
lo que falló) en vez de asumir que se ve bien.

## Estructura

```
e2e/                            Playwright: config, fixtures y specs de UI
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
(verificado contra `user_profiles`, no contra el JWT) para `/usuarios` y
`/catalogos` — igual que sus políticas RLS. `/configuracion` ya **no** es
admin-only a nivel de ruta: los umbrales de referencia siguen siendo solo
admin (gating dentro de la página), pero los catálogos del Plan de
Alimentación (`diet_types`, `food_groups`) son editables por cualquier rol,
igual que su política RLS.

Como jugadores y valoraciones, los usuarios nunca se borran: "Inactivar"
bloquea el login (Supabase Auth `ban_duration`) y marca `user_profiles.status
= 'inactive'`. Un admin no puede inactivarse a sí mismo (el botón ni siquiera
aparece en su propia fila).

Toda acción de "inactivar/desactivar" (jugadores, usuarios, posiciones,
categorías) pide confirmación explícita antes de ejecutar el `UPDATE`, vía
`components/ui/confirm-action-button.tsx` — modal neutro (gris/blanco, nunca
rojo: el riesgo ya está mitigado con la confirmación misma). Reactivar no la
pide, al no tener una consecuencia real.

## Fotografía de jugadores

Bucket de Storage **privado** (`player-photos`, `public = false`, 5 MB, solo
JPEG/PNG/WEBP) — varias categorías incluyen menores de edad, así que ninguna
foto es accesible por URL directa. Tanto la subida como la lectura pasan
exclusivamente por `lib/supabase/admin.ts` (service_role) en servidor:

- Al guardar, solo se persiste el `path` en `players.photo_path`, nunca una URL.
- Al mostrarla, se genera una **signed URL** de 5 minutos al vuelo
  (`getPlayerPhotoUrl`) — no hay policies de `storage.objects` para este
  bucket a propósito: con RLS habilitado por defecto y cero policies, el
  cliente anon/autenticado no puede leerlo directo bajo ninguna circunstancia.
- Se gestiona desde el perfil (`/jugadores/[id]`) y desde "Editar" — no desde
  "Nuevo jugador", porque el path de Storage necesita un `id` de jugador que
  todavía no existe en ese punto del flujo.
- Carga hover-to-edit (`components/jugadores/player-photo-uploader.tsx`): sin
  botón ni input visible — el círculo de la foto es el control. Al hover
  aparece un scrim (`bg-black/40`, mismo lenguaje que el modal de
  confirmación) con un ícono de editar; el clic dispara un
  `<input type="file" className="hidden">` vía `ref`, y `onChange` hace
  `requestSubmit()` del formulario automáticamente (no hace falta botón).

## Perfil de jugador

Encabezado unificado (una sola card): foto con badge del año de nacimiento
superpuesto (`<span>`, no interactivo) → nombre + badge "Inactivo" si
corresponde + subtítulo `Categoría · Cantera` → dos filas de datos
(Posición/Edad/Peso/Talla, luego IMC/%Grasa/IAKS). Peso, Talla, IMC, %Grasa y
AKS salen de la valoración más reciente del jugador (no son campos propios
del jugador) — si todavía no tiene ninguna, esos 5 campos muestran "Dato
insuficiente" sin romper el layout. Sexo y Raza se retiraron de esta vista
(siguen editables desde "Editar"); Estado ya no es una card más, es el badge
"Inactivo" junto al nombre (no se muestra nada cuando el jugador está activo).

Las acciones "Editar"/"Inactivar" viven en un menú "•••"
(`components/jugadores/player-actions-menu.tsx`, Radix DropdownMenu), en la
esquina superior derecha de esa card, en vez de botones sueltos — pensado
para que quepan más acciones a futuro sin saturarla. "Nueva valoración" queda
fuera, junto a los tabs de valoraciones, por ser la más frecuente.

La sección de valoraciones tiene dos tabs:

- **Evolución**: lo que ya existía — gráfico + tabla comparativa en el tiempo.
- **Reporte**: selector de una valoración puntual + encabezado tipo informe
  (foto, IMC, %Grasa Yuhasz y AKS con su clasificación contra los umbrales
  configurables de `reference_thresholds`) + el detalle completo de mediciones
  (`components/valoraciones/assessment-detail-groups.tsx`, compartido con
  `/valoraciones/[id]` para no duplicar el desglose) + el Plan de Alimentación
  completo de esa valoración (ver sección siguiente).

La clasificación de %Grasa reutiliza el umbral de `skinfold_sum` (no hay un
umbral separado para el porcentaje: al derivarse monótonamente de la Suma 6
Pliegues, clasificar por ese umbral equivale a clasificar el %Grasa). Ver
`classifyByThreshold` en `lib/format.ts`.

## Plan de alimentación

Un plan por valoración (`nutrition_plans.assessment_id` es único). A
diferencia de `assessments` (insert-only, solo admin edita), es un documento
clínico vivo: **cualquier rol** lo crea y edita libremente (política RLS sin
restricción), directo desde el tab "Reporte" del perfil — "Crear plan" si no
existe, "Editar plan" si ya existe.

- `components/nutricion/nutrition-plan-form.tsx`: las 7 secciones (diagnóstico,
  tipo de dieta, requerimiento energético, distribución de macros, porciones
  por grupo de alimento × comida, ejemplo de menú, recomendaciones). No usa
  react-hook-form como el resto del proyecto — la tabla de porciones depende
  de catálogos dinámicos (`food_groups` × `meal_types`), así que se maneja
  como estado de componente, con el mismo schema de zod revalidando en
  servidor (`lib/validation/nutrition-plan.ts`).
- El ajuste calórico se captura como dirección (Déficit/Superávit) + magnitud
  positiva en la UI, y se guarda como un solo valor con signo
  (`caloric_adjustment_kcal`) — más claro de escribir, mismo dato en BD.
- La columna "Porciones" de la tabla nunca se guarda: se suma al vuelo (en el
  formulario y en el reporte) a partir de las porciones por comida, igual que
  los demás indicadores derivados del proyecto.
- `lib/nutricion/diagnosis.ts`: `buildSuggestedDiagnosis()` genera el párrafo
  inicial del diagnóstico a partir de la valoración (sexo, edad a la fecha de
  la valoración, peso, talla, IMC, AKS y %Grasa con su clasificación) — es
  función pura, y es solo un punto de partida: la nutricionista lo edita o
  borra libremente, sin bloquear el guardado.
- `components/nutricion/nutrition-plan-report.tsx`: vista de solo lectura con
  el layout del PDF de referencia — pensada para pantalla completa, no como
  un formulario crudo (eventualmente proyectable a directivas).
- `diet_types`/`food_groups` son catálogos editables por cualquier rol (a
  diferencia de `positions`/`categories`) desde `/configuracion`, mismo patrón
  visual (`CatalogSection`) que Posiciones/Categorías.
- `meal_types` es catálogo cerrado (Desayuno, Post entreno, Almuerzo, Algo,
  Cena — orden fijo por `sort_order`), sin CRUD.
- Fuera de alcance a propósito: exportar a PDF, fórmulas automáticas de
  distribución de macros, carga de fotos en el ejemplo de menú, clasificación
  de IMC (pendiente definir tabla de referencia OMS).

## Cálculos antropométricos

`lib/calculations/` implementa cada fórmula (Suma 6 Pliegues, perímetros
corregidos, Rocha, Lee 2000, Yuhasz, masa adiposa/residual, IMC, AKS) como una
función pura e independiente — nunca traducción literal del Excel. Regla
transversal: si falta un dato de entrada, el indicador queda `null` ("dato
insuficiente"), nunca se asume `0` ni se propaga en cascada. `lib/format.ts`
muestra esos `null` como "Dato insuficiente" en toda la UI.

## Esquema de base de datos

15 tablas con RLS activo: `organizations`, `user_profiles`, `races`, `positions`,
`categories`, `reference_thresholds`, `players`, `assessments`, `diet_types`,
`food_groups`, `meal_types`, `nutrition_plans`, `nutrition_plan_diet_types`,
`nutrition_plan_food_portions`, `nutrition_plan_menu_examples`. Multi-tenant vía
`organization_id`. `players` no borra físicamente (solo se inactiva);
`assessments` es insert-only para `nutricionista` (solo `admin` puede editar);
`nutrition_plans` sí es editable libremente por cualquier rol. Ver
`lib/supabase/database.types.ts` para los tipos completos.
