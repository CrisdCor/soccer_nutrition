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
app/(app)/jugadores/           CRUD de jugadores + perfil (valoraciones y plan en paneles laterales)
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

## Selector de filtros

`components/ui/filter-select.tsx` (`FilterSelect`, sobre `@radix-ui/react-select`)
es el componente compartido para todo selector que solo cambia qué se
MUESTRA en pantalla — filtros de `/jugadores`, de `/dashboard` y de las 5
visualizaciones del dashboard, selector de valoración del tab "Plan
Nutricional". Look de "chip" (referencia: la barra de filtros de Vercel --
"All Branches", "All Authors", etc: de ahí se toma solo la FORMA del
contenedor, no sus demás elementos como iconos de calendario o badges de
color): rectángulo blanco de esquinas moderadamente redondeadas (`rounded-md`,
el mismo radio que botones y el resto de controles compactos de la app --
nunca píldora/`rounded-full`) y ancho automático cerrado, fondo oscuro +
texto blanco abierto, menú flotante con ✓ en la opción elegida (nunca
relleno de color) y hover gris claro.

Deliberadamente **no** reemplaza los `<select>` nativos (clase `.select`)
de los campos de formulario reales atados a `react-hook-form` (Sexo/Raza/
Posición/Categoría de jugador, Rol de usuario, Métrica de umbral, ajuste
calórico del plan) — ahí un `<select>` nativo sigue siendo lo correcto
(accesible, funciona con el picker nativo, encaja visualmente en una grilla
de inputs) y cambiarlo requeriría reescribir esos formularios con
`Controller`. Si en algún momento se quiere el mismo look ahí también, es
un trabajo aparte.

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
para que quepan más acciones a futuro sin saturarla. "Nueva valoración" y
"Crear plan"/"Editar plan" quedan fuera, junto a los tabs, por ser las
acciones más frecuentes.

No existe una vista global de valoraciones (no hay `/valoraciones` en el
sidebar): todo se consulta y edita desde el perfil de cada jugador, en
paneles laterales (`components/ui/sheet.tsx`, envoltura de
`@radix-ui/react-dialog` con transición CSS — Radix mantiene el nodo
montado en `data-state="closed"` durante la transición, así que no hace
falta `forceMount`) en vez de pantallas separadas. Referencia de
comportamiento: el panel "Add Environment Variable" de Vercel (solo el
patrón de interacción, no su estilo — el diseño sigue el propio Design
System del proyecto).

La sección de valoraciones tiene dos tabs:

- **Valoraciones**: tabla comparativa en el tiempo. La fecha de cada fila
  abre un panel de solo lectura con el detalle completo de mediciones
  (`AssessmentDetailSheet` + `components/valoraciones/assessment-detail-groups.tsx`).
  Un menú "•••" por fila (`assessment-row-actions.tsx`) agrupa "Ver
  detalle" (mismo panel que la fecha), "Ver/crear plan nutricional" (el
  panel de plan del punto siguiente, fijado a la valoración de esa fila
  específica, no necesariamente la más reciente) y, solo para `admin`,
  "Editar valoración" — se mantiene como tercer ítem aunque no forma parte
  del pedido original porque `assessments` sigue siendo insert-only para
  `nutricionista` (UPDATE es admin-only por RLS); quitar la edición hubiera
  significado perder esa regla de negocio en vez de solo reubicarla.
- **Plan Nutricional**: selector de valoración (la más reciente que ya
  tenga plan por defecto; si ninguna tiene, cae en estado vacío con "Crear
  plan" para la última valoración) + `NutritionPlanReport` de solo lectura
  si existe, o placeholder + botón si no.

"Nueva valoración" y "Crear plan"/"Editar plan" (este último deshabilitado
con tooltip "Registra una valoración primero" si el jugador no tiene
ninguna) abren `AssessmentFormSheet`/`NutritionPlanSheet` en vez de navegar
— ambos paneles son completamente controlados (`open`/`onOpenChange`, sin
trigger propio) para poder dispararse tanto desde un botón suelto como
desde un ítem de un `DropdownMenu` (que no puede anidar su propio trigger
con estado local, mismo motivo por el que existe `useConfirmDialog`).

La clasificación de %Grasa reutiliza el umbral de `skinfold_sum` (no hay un
umbral separado para el porcentaje: al derivarse monótonamente de la Suma 6
Pliegues, clasificar por ese umbral equivale a clasificar el %Grasa). Ver
`classifyByThreshold` en `lib/format.ts`.

## Plan de alimentación

Un plan por valoración (`nutrition_plans.assessment_id` es único). A
diferencia de `assessments` (insert-only, solo admin edita), es un documento
clínico vivo: **cualquier rol** lo crea y edita libremente (política RLS sin
restricción), desde el panel `NutritionPlanSheet` — "Crear plan" si no
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

## Visualizaciones del dashboard

`components/dashboard/dashboard-reports.tsx` agrupa las 5 visualizaciones
basadas en las hojas de reporte del Excel original (Rep. Suma Pliegues, Rep.
Peso Corp. Mlg, Rep. IAKS, Tabla_Resumen, Resumen por Jugador), debajo de las
cards KPI existentes (esas no cambiaron). La tabla de jugadores que vivía
debajo de las KPI cards (Jugador/Sexo/Posición/Categoría) se retiró del
dashboard general: quedó redundante con Tabla_Resumen, una de las 5
visualizaciones, que ya cumple ese rol de listado tabular — `getDashboardStats()`
ya no trae más que los `id` necesarios para contar. Un segmented control
(`components/ui/segmented-control.tsx`, Radix Tabs con estilo de pill en vez
del subrayado de `components/ui/tabs.tsx`) alterna entre las 5 dentro de un
contenedor de altura fija (`h-[640px]`) — cambiar de vista nunca hace crecer
la página; cada vista maneja su propio scroll vertical interno.

- Una sola carga de datos (`lib/dashboard/report-queries.ts`: jugadores
  activos + todas sus valoraciones) alimenta las 5 vistas — cada una
  filtra/ordena/recorta en el cliente (`lib/dashboard/report-helpers.ts`),
  igual que la búsqueda en vivo de `/jugadores`, en vez de ir al servidor por
  cada combinación de filtros.
- Filtro "Valoración": no hay una tabla de "rondas" separada, así que se usa
  la `label` de la valoración (texto libre por jugador) como identificador
  de facto de una ronda compartida — si la nutricionista no etiqueta
  consistente entre jugadores, el filtro puede traer menos jugadores de los
  esperados para esa etiqueta. Por defecto siempre es la valoración más
  reciente de cada jugador.
- Gráficos de columnas verticales (`report-bar-chart.tsx`, eje X = jugador,
  eje Y = valor): con un plantel grande, el ancho total puede superar el
  contenedor, así que el propio gráfico scrollea horizontal (`overflow-x-auto`
  + un `minWidth` calculado por cantidad de columnas) en vez de apretar
  decenas de nombres en un ancho fijo. Líneas de referencia horizontales
  cuando hay umbral configurado (`reference_thresholds`, nunca hardcodeado).
- Colores en tabla: `RangeBadge` marca "Fuera de rango" en rojo (badge, no
  relleno de fila) solo cuando el valor cae fuera del umbral; dentro de
  rango no se pinta nada — ausencia de color = está bien, mismo principio
  del Design System que el resto de la app.
- Top N (mejores/peores, N configurable, 10 por defecto): "mejor" = valor
  más bajo de la métrica, literal, no un juicio fisiológico — si para AKS
  el sentido debería ser al revés, es un cambio de una línea en
  `applyTopN()`. En Tabla_Resumen no hay una métrica fija: el Top N se
  aplica sobre la columna por la que esté ordenada la tabla en ese momento
  (encabezados clicables, asc/desc).
- Resumen por Jugador es la única vista sin "vista general": exige elegir un
  jugador (se autoselecciona el primero disponible para no arrancar vacía).
  Radar de 8 pliegues cutáneos de la valoración elegida + evolución de
  Índice AKS a través de todas sus valoraciones — se eligió AKS por ser el
  indicador más directamente ligado a este análisis; cambiarlo a Peso o
  Suma de Pliegues es una línea. Sin Top N (no hay nada que rankear con un
  solo jugador). La evolución es el único gráfico de LÍNEA de las 5
  visualizaciones (el resto son columnas): tiene sentido acá porque el eje X
  es tiempo y lo que importa es la tendencia, no comparar valores entre sí
  — con las mismas líneas de referencia horizontales del umbral AKS que el
  resto de las vistas, y sin conectar puntos a través de una valoración sin
  AKS calculado (`connectNulls` en false: "dato insuficiente" nunca se
  disimula como una tendencia continua).
- Pliegue sin dato en el radar: se grafica como 0 (recharts no soporta
  "hueco" en un polígono cerrado) pero se lista aparte, explícito, arriba
  del gráfico ("Dato insuficiente: ...") — nunca 0 silencioso.

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
