# AUDITORÍA INTEGRAL DE SMARTCAÑA

**Fecha:** 26 de noviembre de 2026
**Tipo:** auditoría estática y ejecución segura de verificaciones (sin modificación de código fuente)
**Repositorio auditado:** `juanagustinml10/SmartCa-a` (rama `main`, commit `1609d8e`)
**Estado del árbol de trabajo al iniciar:** limpio (`git status --short --branch` → `## main...origin/main`)

> **Regla metodológica:** no se inventan funcionalidades ni resultados. Todo lo afirmado está respaldado por archivos, líneas, endpoints o comandos ejecutados. **No se incluyen porcentajes de avance**: no existe un denominador objetivo y auditable que permita calcularlos sin arbitrariedad. Los porcentajes que aparecen citados (por ejemplo "98 % de precisión") son **claims del propio proyecto**, no evaluaciones de esta auditoría.

---

## 1. Resumen ejecutivo

SmartCaña tiene una **base académica y de diseño muy sólida**, un **frontend visualmente avanzado** y un **backend con arquitectura NestJS real**, pero hoy funciona como **dos proyectos casi independientes que no se comunican**:

- El backend implementa **63 endpoints reales** sobre Prisma/PostgreSQL, con JWT, bcrypt, Helmet, Throttler, guards globales y DTOs con `class-validator`. Sin embargo tiene **fallos críticos de aislamiento multi-tenant**, secretos con valores por defecto inseguros, permisos granulares declarados pero nunca enforceados, y dos piezas importantes (`ReportsRepository` y `ShiService`) **sin controlador**, por lo que son inalcanzables por HTTP.
- El frontend es **casi por completo una maqueta con datos mock**. La única pantalla que intenta consumir la API es `/campos`, y lo hace **sin enviar el JWT**, por lo que cae al fallback. La autenticación es un `MOCK_USER` en `localStorage` que acepta cualquier correo con password ≥ 4 caracteres.
- El supuesto **"Centro de Decisiones Inteligentes" no existe**: no hay módulo IA, ni llamada a LLM, ni endpoint de predicción. Los paneles "IA" muestran constantes (`16.800 t con 82 %`, `$2.350.000 con 76 %`) y consejos rotativos. El backend tiene un `ShiService` determinístico real, pero no está expuesto y el frontend calcula su propio SHI con `Math.random()`.
- La base de datos tiene **20 modelos**, **0 enums**, **sin migraciones**, **sin PostGIS real** y un seed con **IDs incompatibles con `@db.Uuid`**.
- Las verificaciones ejecutadas: **builds de frontend y backend OK**, **TypeScript frontend OK**, pero **TypeScript backend falla**, **Jest no ejecuta ninguna prueba** por configuración ESM, **156 archivos fuera de formato** y **137 problemas de linter en backend**.

**Conclusión de fondo:** el proyecto es defendible como **diseño y propuesta** (visión, arquitectura, casos de uso, reglas de negocio, UI), pero **no como sistema integrado y funcionando de extremo a extremo**. La prioridad no es agregar IA ni más pantallas, sino reparar autenticación, tenancy, base de datos reproducible y la conexión frontend↔backend.

---

## 2. Estado general del proyecto

| Dimensión | Estado observado | Evidencia |
|---|---|---|
| Monorepo | npm workspaces `apps/*`, `packages/*` | `package.json:6-9` |
| Backend | NestJS 11 + Prisma 7 + PostgreSQL; 16 módulos registrados | `apps/backend/src/app.module.ts:27-52` |
| Frontend | Next.js 16.2.12 + React 19.2.4 + Tailwind 4 + Leaflet + Recharts | `apps/frontend/package.json:11-37` |
| Endpoints HTTP | 63 mapeados (todos bajo `/api` salvo `/health`) | controladores de `apps/backend/src/**` |
| Rutas frontend | 19 generadas en build (18 de app + `_not-found`) | salida de `next build` |
| Modelos Prisma | 20, sin enums | `apps/backend/prisma/schema.prisma`; `generated/prisma/enums.ts:11` |
| Migraciones | **No existen**, además explícitamente ignoradas | `.gitignore:39`; sin `prisma/migrations/` |
| Pruebas | 2 suites, **0 tests ejecutados** por error de configuración | `npm test`, `npm run test:e2e` |
| CI/CD | `.github/workflows/` vacío | listado de `.github` |
| Repositorio Git | Público, rama `main`, un único commit inicial real | `git log -1`: `1609d8e` |
| Documentación | 8 archivos en `docs/` + README/CHANGELOG/CONTRIBUTING/LICENSE | listado de `docs/` |

**No se calculan porcentajes de avance.** La razón: los módulos no son atómicos (una pantalla puede estar completa visualmente pero sin datos reales, y un endpoint puede existir pero ser inseguro). Cualquier porcentaje simplificaría en exceso dimensiones incompatibles.

---

## 3. Documentación revisada

### 3.1 Inventario

| Archivo | Contenido principal |
|---|---|
| `docs/01-vision-del-producto.md` | Visión, problema (§2), mercado (§3), objetivos generales (§6) y específicos (§7.1-7.10), alcance MVP (§8), roadmap de versiones, exclusión de IoT/satélites/offline (§8.2-8.3, §17) |
| `docs/02-arquitectura-del-sistema.md` | Arquitectura por capas, API, seguridad (§8), CI/CD (§10.4), escalabilidad (§9), roadmap técnico de 12 fases (§15), IA/RAG en Fase 10 (§6, §15) |
| `docs/03-modelo-de-negocio.md` | Actores (§2), 13 casos de uso (§3), historias, RN-01…RN-38 (§7), modelo funcional (§8), versiones v1.1/v2.0 |
| `docs/04-base-de-datos.md` | 22 entidades declaradas (§2.1), 23 tablas en anexo, ERD, índices (§6), PostGIS/geometry (§8), integridad (§9), rendimiento (§10) |
| `docs/05-design-system.md` | Design system, componentes, grillas, formatos, accesibilidad (§12), WCAG 2.1 AA (§15.9) |
| `docs/06-executive-command-center.md` | Centro de Comando Ejecutivo, KPIs, filtros, mapa, timeline, panel IA, exportación "arquitectura preparada" |
| `docs/07-gis-architecture.md` | Stack Leaflet, capas, medición, escala SHI, flujo `MOCK_FIELDS → mock-gis.ts → GISFeature[]` (§66-79), futura evolución PostGIS (§156-164) |
| `docs/revision-sprint-4.md` | Auditoría interna con puntaje 6.8/10, R7 (0 tests), R3 (sin guards/JWT/roles) |
| `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE` | Visión comercial, Sprints 11-13, convenciones, licencia |
| `docker/docker-compose.yml`, `docker/.env.example`, `.github/` | PostgreSQL + pgAdmin, plantilla de entorno, workflows vacíos |

### 3.2 Consolidado de requisitos (fuente → estado real)

**Funcionales declarados** (fuente principal `docs/01 §7`, `docs/03 §8`):

| # | Requisito | Fuente | Estado real resumido |
|---|---|---|---|
| RF-01 | Parcelas georreferenciadas con GeoJSON | `docs/01 §7.1`, `docs/03 §8.2` | Parcial: mock en frontend, sin geometry en BD |
| RF-02 | Actividades agrícolas con dosis/insumos/historial | `docs/01 §7.2` | Parcial: solo mock; sin endpoints |
| RF-03 | Costos por parcela, costo/ha, costo/t | `docs/01 §7.3` | Parcial: backend real, frontend mock |
| RF-04 | Mapa interactivo con capas y medición | `docs/01 §7.4`, `docs/07` | Parcial: completo sobre mock |
| RF-05 | Cosecha/rendimiento | `docs/01 §7.5` | Parcial: backend real, frontend mock |
| RF-06 | Catálogo de variedades | `docs/01 §7.6` | Parcial: modelo y seed, sin endpoints |
| RF-07 | Clima, alertas y notificaciones | `docs/01 §7.7` | Parcial: mock; sin `weather_*` ni `notifications` |
| RF-08 | Reportes y exportación PDF/CSV/Excel | `docs/01 §7.8` | Parcial: repo sin controller; export "Próximamente" |
| RF-09 | Asistente IA (chat, recomendaciones, `POST /ai/chat`) | `docs/01 §7.9`, `docs/02 §6` | **No cumple** |
| RF-10 | Usuarios, roles, permisos, multi-tenancy | `docs/01 §7.10` | Parcial con fallos críticos |
| RF-11 | Dashboard y Centro Ejecutivo | `docs/01 §9.9`, `docs/06` | Parcial: UI completa, datos mock |
| RF-12 | Inventario de insumos | `docs/05 §7.6, §9.9` | **No cumple** (ni siquiera en MVP según `docs/01 §8.1`) |

**No funcionales declarados:** JWT + refresh + Argon2 (`docs/01 §18.5`; se implementa bcrypt, **no Argon2**), Helmet y rate limiting (implementados), WCAG 2.1 AA (no verificado), dashboard < 3 s y búsqueda < 200 ms (no medido), CI/CD (no implementado), offline (contradictorio y no implementado), logging estructurado con request ID (no implementado).

### 3.3 Contradicciones detectadas (no se elige una versión)

1. **RAG/IA en MVP** (`docs/01 §18.4`, `docs/02 §6.1`, Fase 10) vs **diferido a v2.0** (`docs/03 §8.4`).
2. **"Sin predicción con ML"** (`docs/01 §17.1.5`) vs **"prediciendo y alertando"** (`docs/05 §1.4`), predicciones con confianza (`docs/06`), y "98 % de precisión" en landing (`brand-panel.tsx:69`).
3. **Satélites/NDVI excluidos** (`docs/01 §8.2, §8.3`) vs capa/paleta en `docs/05` y FAQ que afirma Sentinel-2/Landsat/Planet incluidos.
4. **Sin almacenamiento de conversaciones IA** (`docs/02 §6.4`) vs `ai_conversations`/`ai_messages` (`docs/04 §4.21-4.22`) y "la conversación se guarda" (`docs/05 §10.4`).
5. **Redis como caché actual** (`docs/02 §8.6`) vs **"futuro"** (`docs/02 §9.6`); `docker-compose.yml` solo levanta PostgreSQL y pgAdmin.
6. **Docker futuro** (`docs/02 §9.6`) vs compose existente y procedimiento en README.
7. **CI/CD detallado** (`docs/02 §10.4`) vs `.github/workflows` vacío y `npm test` = `echo`.
8. **Auth implementada** (README, CHANGELOG 0.3.0) vs **"sin guards/JWT/roles"** (`docs/revision-sprint-4.md §11 R3`) vs frontend con `MOCK_USER`. El backend sí tiene guards globales.
9. **22 entidades** (`docs/04 §2.1`) vs **23 tablas** en el mismo documento (anexo).
10. **Soft delete universal** (`docs/04 §7.2`) vs excepciones en `§9.5` y anexo; RN-33 vs hard delete a 30 días.
11. **"Una parcela es siempre campo, nunca lote"** (`docs/05 §15.6`) vs uso indistinto de "lote" en `docs/01`, `docs/04`, `docs/07`.
12. **Modo offline** (`docs/05 §15.5`) vs **"no se implementará offline completo"** (`docs/01 §17.1.7`).
13. **Inventario** en `docs/05` vs ausente del MVP (`docs/01 §8.1`).
14. **Sprint 4 = Fields** (`docs/revision-sprint-4 §13`) vs **Sprint 4 = Actividades** (README); CHANGELOG no registra sprints 2-4.
15. **Formulario móvil v1.1** (`docs/03 §8.3`) vs flujo responsive ya descrito (`docs/05 §11.4`).
16. **Sin estado global** (`docs/revision-sprint-4 §3`) vs `ExecutiveContext` y `gis-context` en código.
17. **Sin focus traps** (`docs/05 §12.3`) vs **"Modales: focus trap"** (`docs/05 §12.4`).
18. **Separador de miles punto** (`docs/05 §7.15`) vs `$ 845,200` (`docs/05 §9.8`).
19. Textos en portugués y un carácter chino en `docs/01 §1, §2.3`.
20. **CHANGELOG v0.4.0** vs **`package.json` versión 0.1.0**; el roadmap técnico arranca después del primer release registrado.

### 3.4 Brecha documental vs. código

La documentación funciona mejor como **visión objetivo** que como **estado implementado**. Los claims más sobredimensionados frente al código son: IA/RAG/pgvector/OpenAI (`docs/02 §6.1-6.3`), predicciones con confianza, "98 % de precisión", exportación enterprise, PostGIS en producción (`docs/07` afirma consistencia con `ST_*`), y auditoría de contraste WCAG marcada como "auditada" sin herramienta ni evidencia.

---

## 4. Matriz de cumplimiento

**Estados permitidos:** CUMPLIDO · PARCIAL · NO CUMPLIDO · PENDIENTE DE VERIFICACIÓN.
**Prioridades:** CRÍTICA · ALTA · MEDIA · BAJA.

| Requisito | Estado | Evidencia encontrada | Problema detectado | Acción necesaria | Prioridad |
|---|---|---|---|---|---|
| Visión, problema y justificación | CUMPLIDO | `docs/01 §1-3` | Cifras de mercado sin bibliografía | Agregar marco teórico citado | MEDIA |
| Objetivos y alcance | CUMPLIDO | `docs/01 §6-8`, `docs/03 §8` | Contradicciones de alcance (IA, satélites, offline) | Congelar una versión del alcance | ALTA |
| Requisitos RF/RNF con IDs y trazabilidad | PARCIAL | `docs/01 §7`, `docs/03 §7` | Sin IDs RF/RNF ni matriz RF↔HU↔test | Crear documento de requisitos | ALTA |
| Arquitectura documentada | CUMPLIDO | `docs/02 §4-10` | Sin ADRs individuales | Redactar ADRs clave | MEDIA |
| Modelo de datos documentado | PARCIAL | `docs/04 §2.1` (22 entidades) | 20 modelos reales; 8 entidades ausentes | Reconciliar docs y schema | ALTA |
| Migraciones Prisma | NO CUMPLIDO | Sin `prisma/migrations/`; `.gitignore:39` | No hay historial ni deploy reproducible | Generar y versionar migración inicial | CRÍTICA |
| PostGIS real | NO CUMPLIDO | `schema.prisma` sin `geometry`; `docker-compose.yml:3` | GIS es GeoJSON mock, sin `ST_*` ni GiST | Definir geometry + migración + índice GiST | ALTA |
| Seed de datos | PARCIAL | `prisma/seed.ts:9-500` | IDs no UUID, no idempotente, `Math.random()` | Corregir IDs y `upsert` | ALTA |
| Autenticación backend | PARCIAL | `auth.service.ts:25-211`; `auth.module.ts:13` | Secretos con fallback `super-secret-change-me`; logout filtra por IP | Fallar si falta secret; logout por userId | CRÍTICA |
| Autenticación frontend | NO CUMPLIDO | `contexts/auth-context.tsx:6,51-91` | `MOCK_USER`; cualquier email con pass ≥4 entra | Conectar a `/auth/login|me|refresh` | CRÍTICA |
| Autorización por roles | PARCIAL | `app.module.ts:65-76`; `roles.guard.ts:28` | `super_admin`/`gerente` → 403; 31 endpoints sin `@Roles` | Jerarquía de roles y `@Roles` donde falta | CRÍTICA |
| Permisos granulares | NO CUMPLIDO | `seed.ts:9-73`; sin `PermissionsGuard` | 44 permisos nunca evaluados | Implementar guard o retirar permisos | ALTA |
| Aislamiento multi-tenant | NO CUMPLIDO | `costs.repository.ts:32,115`; `harvests.repository.ts:31,102`; `audit.controller.ts:25` | `companyId` del body/query, no del JWT | Filtrar por `req.user.companyId` en todos | CRÍTICA |
| Usuarios, roles y permisos (CRUD) | PARCIAL | `users.controller.ts:24-60`; `roles.controller.ts:24-55` | DTOs de update sin decoradores; tenant roto | Corregir DTOs y repositorios | ALTA |
| Organizaciones y establecimientos | PARCIAL | `company.controller.ts:20-50`; `farm.controller.ts:22-53` | `POST /companies` sin `@Roles` | Proteger creación de empresa | CRÍTICA |
| Campos y parcelas (backend) | PARCIAL | `fields.controller.ts:21-48`; `fields.service.ts:37-119` | Sin `@Roles`; nombre único global; sin índices | Permisos, unicidad por farm, índices | ALTA |
| Campos y parcelas (frontend) | PARCIAL | `lib/api-fields.ts:141-204`; `app/campos/page.tsx:122` | Sin JWT; latch de mock; botones sin handler | Enviar token, quitar latch, conectar acciones | CRÍTICA |
| Gestión geográfica y mapas | PARCIAL | `gis-context.tsx:20-28`; `mock-gis.ts:39-91` | Polígonos generados en cliente; sin PostGIS | Unificar mapas y persistir geometría | ALTA |
| Actividades agrícolas | PARCIAL | `mock-activities.ts:88-162`; sin módulo backend | Solo maqueta; filtros no aplicados | Crear módulo y conectarlo | ALTA |
| Costos y categorías | PARCIAL | `costs.controller.ts:21-68`; `costos/page.tsx:226` | Backend real; frontend `console.log`; sin roles | Conectar UI y proteger endpoints | ALTA |
| Producción y cosechas | PARCIAL | `harvests.controller.ts:21-68`; `harvests.service.ts:43-48` | Frontend mock; `update` no revalida refs | Conectar UI y validar update | ALTA |
| Insumos e inventario | NO CUMPLIDO | Solo categoría `insumos` en `seed.ts:237` | Sin modelo ni pantalla; nav lleva a 404 | Definir alcance o eliminar promesa | ALTA |
| Proveedores | PARCIAL | `suppliers.controller.ts:21-48` | Backend real; sin UI; sin `@Roles` | Agregar pantalla y roles | MEDIA |
| Reportes e indicadores | PARCIAL | `reports.repository.ts:134-677` (718 líneas) | Sin controller/module; `activityWhere` rompe tenancy | Exponer y corregir filtros | ALTA |
| Exportación PDF/CSV/Excel | NO CUMPLIDO | `export-modal.tsx:48-63` | "Próximamente"; `docs/06` lo admite | Implementar o retirar del alcance | MEDIA |
| Dashboard general | PARCIAL | `dashboard/page.tsx:49-80` | 100 % mock; buscador sin `onChange` | Conectar KPIs y alertas reales | ALTA |
| Centro de Comando Ejecutivo | PARCIAL | `executive/page.tsx:31-112` | Solo `category` filtra; resto decorativo | Conectar filtros y datos | ALTA |
| Auditoría y trazabilidad | PARCIAL | `audit.service.ts:37,54-56`; `auth.service.ts:84,184,211` | Solo 3 escrituras (auth); `catch {}`; `?companyId` externo | Auditar CRUD y quitar escape | CRÍTICA |
| Configuración del sistema | PARCIAL | `settings.controller.ts:3`; `settings/page.tsx:28-71` | `import type` anula validación; UI mock con bugs | Corregir import y conectar PUT | ALTA |
| Seguridad y sesiones | PARCIAL | `sessions.service.ts:13-18`; `auth-context.tsx:62` | Revocación cross-user; sesión mock sin token | Verificar propiedad y conectar API | CRÍTICA |
| Centro de Decisiones Inteligentes | NO CUMPLIDO | `ia-panel.tsx:18,35`; `mock-executive.ts:171-217`; 0 coincidencias IA en backend | Constantes con apariencia de predicción | Construir sobre datos reales; no fingir IA | ALTA |
| Integración frontend↔backend | PARCIAL | `api.ts:15-38`; `api-fields.ts:141` | Sin `Authorization`; solo fields; contrato roto | Token centralizado y contratos | CRÍTICA |
| Validación de datos | PARCIAL | `update-user.dto.ts:4-7`; `update-role.dto.ts:7`; `settings.controller.ts:3` | DTOs sin decoradores; analytics sin DTO | Reparar DTOs y pipes | ALTA |
| Manejo de errores y estados vacíos | PARCIAL | `prisma-exception.filter.ts:32`; `audit.service.ts:54-56` | Re-lanza en filtro; errores silenciados | Política de errores coherente | MEDIA |
| Pruebas unitarias | NO CUMPLIDO | `npm test`: `SyntaxError: Cannot use import statement outside a module` | 0 tests ejecutados; test obsoleto espera "Hello World!" | Reparar config Jest y tests | ALTA |
| Pruebas de integración | NO CUMPLIDO | `npm run test:e2e`: mismo error ESM | 0 tests ejecutados | Configurar ESM y BD de prueba | ALTA |
| Verificación de tipos | PARCIAL | `tsc` frontend OK; backend `TS6059` | `seed.ts` fuera de `rootDir` | Ajustar `tsconfig.json` | MEDIA |
| Linter y formato | PARCIAL | backend 137 problemas; Prettier 156 archivos | `lint` usa `--fix` | Ejecutar formateo y quitar `--fix` del script | MEDIA |
| Builds de producción | CUMPLIDO | `nest build` y `next build` exitosos | Sin warning bloqueante | Mantener en CI | BAJA |
| CI/CD | NO CUMPLIDO | `.github/workflows/` vacío | No hay pipeline | Crear workflow tras arreglar tests | MEDIA |
| Accesibilidad WCAG 2.1 AA | NO CUMPLIDO | Solo 5 coincidencias `aria-*`; sin labels asociados | No hay foco, teclado ni contraste auditado | Pasada de accesibilidad | ALTA |
| Diseño responsive | PARCIAL | `sm:/md:/lg:` abundantes; `detail-panel.tsx:28` fijo 400 px | Panel ejecutivo problemático en móvil | Revisar breakpoints | MEDIA |
| Documentación técnica de API | NO CUMPLIDO | `apps/backend/README.md:24-26` es template Nest | Sin endpoints ni ejemplos | Escribir README de API | MEDIA |
| Demostración funcional | PARCIAL | Build OK, pero login mock y sin migraciones | No se puede mostrar flujo real completo | Subsanar etapas 1-2 | ALTA |

---

## 5. Auditoría funcional por módulo

### 5.1 Autenticación y autorización

**Backend.** `auth.controller.ts` expone `POST /auth/login`, `/auth/refresh`, `/auth/logout` y `GET /auth/me`. `auth.service.ts:25-211` hace Prisma real (`user.findUnique`, `user.update`, `session.create/findFirst/update/updateMany`), `bcrypt.compare`, expiración 2 h/7 d (o 7 d/30 d con `remember`), hash del refresh token y rotación. Hay auditoría de login/refresh/logout. **Pero**: los secretos tienen defaults literales `super-secret-change-me` y `super-refresh-secret-change-me` (`auth.module.ts:13`, `jwt.strategy.ts:13`, `auth.service.ts:59,116,156`), `logout` filtra sesiones por `ipAddress` (`auth.service.ts:207`) y deja activas las de otras IP, `JwtRefreshStrategy` está registrado pero nunca usado, y no hay lockout de cuenta ni rate limit específico de login.

**Frontend.** `auth-context.tsx` usa `MOCK_USER`, credenciales demo visibles en pantalla (`login-form.tsx:166`) y acepta cualquier email con password ≥ 4 caracteres (`:73-91`). Guarda solo un JSON en `localStorage`; con `remember=false` escribe `sessionStorage` pero el initializer lee solo `localStorage` → la sesión se pierde al recargar. No hay `Authorization` en `api.ts`. `AuthGuard` es cliente-only, sin `middleware.ts`; las rutas se navegan por URL. `isFirstAccess` se calcula pero nunca redirige a `/onboarding`.

**Juicio:** **NO CUMPLIDO como sistema**. Existe una implementación backend aceptable pero insegura, y una simulación frontend que no la usa. Es el bloqueo número uno para cualquier demo real.

### 5.2 Usuarios, roles y permisos

CRUD real en `users.controller.ts:24-60` y `roles.controller.ts:24-55`, con `@Roles('admin','ingeniero')` para lectura y `admin` para escritura. `users.repository.ts:36-111` y `roles.repository.ts:43-135` usan Prisma y soft delete. Problemas: `UpdateUserDto.password` y `UpdateRoleDto.permissionIds` redeclaran campos **sin decoradores**, por lo que el `ValidationPipe` no los valida; `findById/update/remove` no filtran `companyId`; `create` acepta `companyId` libre del body. Los ~40 códigos de permiso del seed y `PermissionCode` de `packages/types` **nunca se evalúan**: no hay `PermissionsGuard` ni `@Permissions`, y `JwtPayload.permissions` nunca se pobla. `super_admin` y `gerente` reciben 403 donde hay `@Roles`.

### 5.3 Organizaciones y establecimientos

`company.controller.ts` y `farm.controller.ts` tienen endpoints reales con Prisma y soft delete. **Brecha crítica:** `POST /companies` no tiene `@Roles` (`company.controller.ts:34-38`), así que cualquier JWT autenticado puede crear una empresa. `farm` filtra `companyId` en `findAll` pero no en `findById/update/remove`. Los proveedores (`Supplier`) y `company` se combinan con el problema de tenancy: `users.create` y `costs.create` aceptan `companyId` arbitrario. Es una vía de escalada multi-tenant completa.

### 5.4 Campos y parcelas

Backend: CRUD real (`fields.controller.ts:21-48`), DTOs sólidos (`create-field.dto.ts:11-79` con `@IsUUID`, `@Min/@Max`), reglas de nombre único, existencia de farm/variety/status y soft delete. **Pero ningún endpoint tiene `@Roles`** y `findById` no filtra company. Frontend: única pantalla con API (`api-fields.ts`), con skeleton, error y retry bien implementados; sin embargo `request()` no envía token, `useMockFallback` se activa ante cualquier error y **nunca se resetea**, el `createField` del frontend no envía `farmId` ni `fieldStatusId` (obligatorios en el DTO → 400), los IDs mock `f1` no son UUID (`ParseUUIDPipe` daría 400) y los botones "Nuevo Campo" no tienen handler. El detalle mezcla campo de API con SHI/cosechas mock.

### 5.5 Gestión geográfica y mapas

`components/gis/**` es la implementación más completa: capas, filtros, medición, escala SHI, clima y panel lateral. Funciona sobre `mock-gis.ts`: los polígonos se **generan en cliente** a partir de centroide y superficie (`generateFieldPolygon`, `:41-46`), no se leen de PostGIS. El esquema solo tiene `latitude/longitude` decimales. Existen **tres implementaciones de mapa**: `components/gis/**` (usada por `/mapa`), `components/map/**` (casi toda muerta, salvo `polygon-utils.ts` y `mock-geojson.ts`) y `executive-map-inner.tsx` (tercera versión con mocks propios). Falta atribución OSM (`attributionControl={false}`). Es una maqueta GIS muy lograda, pero **no es gestión geográfica persistida**.

### 5.6 Actividades agrícolas

**No existe módulo backend**: ni controller, service, repository ni DTO. Solo el modelo `Activity` en Prisma y su cliente generado; se consumen indirectamente en `fields.repository.ts:91-98`, `costs.service.ts:150-157` y `reports.repository.ts:502-577`. El frontend tiene tres vistas (timeline/calendario/tabla) sobre `MOCK_ACTIVITIES` generadas con `Math.random()`. `dateRange`, `farmName` y `responsible` están en el estado pero no se aplican. "Nueva actividad" no hace nada. Los permisos `activities.*` del seed no tienen endpoints.

### 5.7 Costos y categorías

Backend relativamente completo: CRUD (`costs.controller.ts:21-68`), `analytics` con agregaciones reales (`costs.repository.ts:169-309`), validación de siete referencias (`costs.service.ts:89-159`) y categorías con DTO. **Sin `@Roles`**; `companyId` se toma del body/query sin comparar con el JWT; `analytics` usa `@Query` sueltos sin DTO; `isActive` en `CreateCostCategoryDto` solo tiene `@IsOptional()`. Frontend: 300 costos aleatorios, `computeAnalytics` calcula bien **sobre mock**, rentabilidad usa constantes fijas (`estimatedTons = 12458`, `estimatedRevenue = 45000000`) y el formulario hace `console.log('New cost:', data)`.

### 5.8 Producción y cosechas

Backend: CRUD y `analytics` reales con `bestField/worstField` y series mensuales (`harvests.repository.ts:160-315`). `harvests.service.ts` valida referencias al crear, pero **`update` no las revalida** (`:43-48`), por lo que un PATCH puede apuntar a entidades inexistentes. Sin `@Roles` ni filtro de company. Frontend: 120 cosechas aleatorias (`mock-harvests.ts:39-91`), SHI calculado con `Math.random()`, sin botón "Nueva cosecha" ni loading/empty global.

### 5.9 Insumos e inventario

**No existe.** No hay modelo en Prisma (solo la categoría de costo `insumos` en el seed y `Activity.productName/dose*`). La navegación mock incluye `/inventario` (`mock-data.ts:12-26`) pero no hay `page.tsx`: lleva a 404. Además hay contradicción documental: `docs/05` lo describe y `docs/01 §8.1` lo excluye del MVP.

### 5.10 Proveedores

CRUD real en `suppliers.controller.ts:21-48` y `suppliers.repository.ts:41-95`, con existence check de company. Sin `@Roles`, sin filtro de company en todas las operaciones y con `sortKey` pasado directamente a Prisma sin whitelist. No hay pantalla frontend.

### 5.11 Reportes e indicadores

`reports.repository.ts` tiene **718 líneas de análisis real con Prisma**: producción con ventana previa y variación, costos, rentabilidad, por campo, actividades, campañas y resumen. Sin embargo **no hay `ReportsController`, `ReportsService` ni `ReportsModule`**, `app.module.ts` no lo importa y `QueryReportDto` está sin uso: **es inalcanzable por HTTP**. Defectos adicionales: `activityWhere` sobrescribe el filtro de company por `farmId` (`:71-73`), la campaña activa del resumen es global (`:655`), y el precio por tonelada es `45000` hardcodeado (`:686`). El frontend no tiene ruta `/reportes` (nav mock → 404).

### 5.12 Dashboard general y ejecutivo

`/dashboard`: KPIs, alertas, producción, costos y actividades de mocks; `computeAnalytics(MOCK_COSTS)` sí calcula, pero sobre datos sintéticos. Buscador sin `onChange`, campaña/clima falsos y badge de notificaciones rojo aunque el panel diga "Sin notificaciones nuevas". Sin loading/error.

`/executive`: grilla responsive muy cuidada, filtros globales, timeline, detail panel y export modal. Pero de los filtros **solo `category` afecta los KPIs**; exportación está marcada "Próximamente"; el layout se persiste en `localStorage` sin validación; `DetailPanel` tiene ancho fijo 400 px (mala experiencia en móvil); textos de 9-10 px con contraste dudoso. Es una demo visual excelente, no un centro de decisiones.

### 5.13 Auditoría y trazabilidad

Backend escribe `AuditLog` **solo tres veces**, todas en AuthService (login `:84`, refresh `:184`, logout `:211`). Cero auditoría de CRUD en users, roles, company, farms, fields, costs, harvests, suppliers, settings, sessions ni cambios de permisos. `AuditService.log` silencia errores con `catch {}` (`audit.service.ts:54-56`). `AuditController` permite `?companyId=` del query y sobrescribe el del JWT (`:25`). Frontend: `MOCK_AUDIT_LOGS` de 363 líneas con búsqueda/orden/paginación en memoria; el endpoint real queda sin usar.

### 5.14 Configuración del sistema

Backend tiene CRUD real por clave compuesta `companyId_key`. **Validación rota**: `settings.controller.ts:3` usa `import type { UpdateSettingDto }`; al borrarse en tiempo de ejecución, `design:paramtypes` es `Object` y el `ValidationPipe` global no aplica los decoradores. Frontend: 7 tabs decorativos, `MOCK_SESSIONS` duplicado, botones sin handler, `settings-integrations.tsx:35-36` con template literal dentro de string normal (clase rota) y `<option selected>` en vez de `value/defaultValue`. Solo el tema persiste realmente.

### 5.15 Seguridad y sesiones

Positivos: Helmet, CORS configurable, Throttler 100/min, `ParseUUIDPipe`, bcrypt 10, `whitelist` + `forbidNonWhitelisted`, hash de refresh token. Negativos: fallback de secretos, 31 endpoints sin `@Roles`, permisos no enforceados, `companyId` manipulable, `POST /companies` abierto, `revoke(:id)` sin verificar propiedad (`sessions.service.ts:13-18`), y frontend sin token. La UI de sesiones revoca solo en un array local con `setTimeout`.

### 5.16 Centro de Decisiones Inteligentes

Ver §8. Resumen: **no existe**.

### 5.17 Integración frontend↔backend

`api.ts:15-38` hace `fetch` sin cabecera `Authorization`. El backend tiene `JwtAuthGuard` global y `/fields` no es `@Public`, así que `GET /fields` devuelve 401 y el frontend cae al mock. Aun con token, `GET /fields/f1` daría 400 por `ParseUUIDPipe`. `createField` no envía campos obligatorios. De los 63 endpoints, **solo se intenta consumir `/fields` y `/fields/:id`**; `/auth`, `/audit`, `/sessions`, `/costs`, `/harvests`, `/settings`, `/companies`, `/users` y `/analytics` no son usados por la UI. Los botones de crear/editar/guardar en costos, perfil, configuración, actividades y campos son no-op.

---

## 6. Auditoría técnica

### 6.1 Frontend

- **Organización:** componentes agrupados por dominio; buena granularidad visual. Tres implementaciones de mapa y duplicación entre `dashboard/**` y `executive/**` (`kpi-card` vs `executive-kpi`, `alerts` vs alertas inline, `sidebar` vs `executive-sidebar`, `activity-timeline` vs `executive-timeline`). `components/map/**` es mayormente código muerto; la carpeta `<repo>/src/**` está vacía.
- **Rutas:** 19 rutas compiladas. Cuatro entradas de la nav (`/inventario`, `/reportes`, `/ia`, `/configuracion`) no existen. `next.config.ts:3-5` está vacío (sin proxy/rewrites).
- **Formularios y validación:** HTML `required`/`min` y algo de regex en login; pero `onSubmit` de costos solo hace `console.log`, forgot/reset password simulan envío con `setTimeout`, onboarding calcula `progress` y lo descarta con `void progress`.
- **Estados:** `/campos` y su detalle tienen skeleton/spinner/empty/error bien hechos (aunque el `onAction` del empty es no-op). El resto no tiene estados de carga porque todo es sincrónico y mock.
- **Responsive:** abundantes `sm:/md:/lg:/xl:`, `overflow-x-auto` en tablas. Problema: `detail-panel.tsx:28` ancho fijo 400 px y `h-screen overflow-hidden` con scrolls anidados.
- **Consumo de API:** ver §5.17. Latch `useMockFallback` global e irreversible (`api-fields.ts:141,151,164`).
- **Sesión:** ver §5.1.
- **Calidad:** sin `any`, `@ts-ignore`, `TODO` ni `FIXME`; sí `console.warn` ×2 y `console.log` ×1. `Math.random()` en módulos de mock genera datos distintos por recarga y riesgo de hidratación (`suppressHydrationWarning` en `layout.tsx:36` lo enmascara). `components.json` declara shadcn `base-nova` pero solo existen 3 componentes `ui/`.
- **Accesibilidad:** solo 5 coincidencias `aria-*` en todo el frontend (3 son clases Tailwind). Icon buttons sin nombre accesible, dropdowns sin `aria-expanded`/teclado/Escape, labels sin `htmlFor`, sidebar móvil sin `role="dialog"`/`aria-modal`/focus trap, polígonos Leaflet solo con mouse. No hay evidencia de auditoría WCAG pese a `docs/05 §15.9`.

### 6.2 Backend

- **Módulos/controladores:** 16 módulos registrados, todos existen. Faltan módulos para Activities, Campaigns, Varieties, Reports, SHI y FieldAlert (aunque estos cuatro últimos tienen modelo/seed).
- **Validación:** `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform` (`app.module.ts:56-64`) es un acierto. Se rompe en `UpdateUserDto.password`, `UpdateRoleDto.permissionIds`, `isActive` de categorías, `import type` en Settings, y parámetros sueltos de analytics/audit.
- **Errores:** `HttpExceptionFilter` y `PrismaExceptionFilter` mapean P2002/P2003/P2025; pero `prisma-exception.filter.ts:32` hace `throw exception` dentro del filtro para el resto, comportamiento no verificado y riesgoso. `AuditService.log` silencia errores.
- **Autorización:** guards globales `ThrottlerGuard`, `JwtAuthGuard`, `RolesGuard`; `@Public` respetado. `@Roles` solo conoce `admin/ingeniero/supervisor`. Sin guard de permisos.
- **Reglas de negocio:** bien implementadas en users, roles, fields, costs, harvests, suppliers y auth; parciales en harvests.update; ausentes en activities/inventario.
- **Seguridad:** ver §5.15.
- **Logs y auditoría:** `LoggerService` envuelve `Logger` de Nest a stdout, sin persistencia ni request ID; único `console.log` en `main.ts:23`.
- **Separación de responsabilidades:** buena (controller → service → repository), pero con código muerto (`JwtRefreshStrategy`, métodos de `SessionsService`, `QueryReportDto`, `ShiService`) y bloques `meta` de paginación repetidos en siete repositorios.

### 6.3 Arquitectura, dependencias y entornos

- El monorepo es correcto y `@smartcana/types` se consume desde ambos lados; sin embargo `packages/config` y `packages/ui` están vacíos.
- `dotenv/config` se importa en `prisma.config.ts` pero `dotenv` no figura en `dependencies` (`package.json:29-48`): dependencia implícita que puede romper en instalación limpia.
- `.env.example` del backend **no documenta** `JWT_SECRET`, `JWT_REFRESH_SECRET` ni `FRONTEND_URL`, aunque el código los usa.
- `docker-compose.yml` hardcodea credenciales `smartcana/smartcana` y no consume `docker/.env.example` mediante `env_file` ni interpolación.
- Escalabilidad documentada (réplicas, Redis, microservicios) sin implementación: es diseño, no arquitectura desplegada. `README.md` es el template por defecto de Nest.

---

## 7. Auditoría de base de datos

### 7.1 Modelo real

20 modelos sin enums: `Company`, `Role`, `Permission`, `RolePermission`, `User`, `Session`, `Farm`, `Setting`, `AuditLog`, `FieldStatus`, `Variety`, `Campaign`, `ActivityType`, `CostCategory`, `Supplier`, `Field`, `FieldAlert`, `Activity`, `Cost`, `Harvest`. `generated/prisma/enums.ts:11` confirma "there are no enums in the schema".

### 7.2 Entidades documentadas ausentes

`docs/04 §2.1` declara 22 entidades (23 tablas en el anexo). No existen: `user_assignments`, `field_varieties`, `activity_photos`, `weather_records`, `weather_alerts`, `notifications`, `ai_conversations`, `ai_messages`. `refresh_tokens` se sustituye por `Session`, que no tiene `isRevoked` ni índice/unique en `tokenHash`. No hay inventario de insumos. `docs/03 §8.2` describe `POST /fields` con geometría PostGIS, pero el esquema solo guarda latitud/longitud.

### 7.3 Índices y restricciones

Existen PKs, `@unique` en `Company.cuit`, `Permission.code`, `User.email`, y códigos de catálogos; `@@unique` en `Role(companyId,code)`, `RolePermission`, `Setting(companyId,key)`; e índices en `Session(userId)`, `Session(isActive)` y cinco en `AuditLog`.

Faltan índices en las tablas de mayor volumen: `Field` no tiene **ningún** índice secundario (necesita `farmId`, `deletedAt`, compuestos `(farmId,name)`, `(farmId,campaignCode)`); `Activity` requiere `(fieldId,activityDate)`; `Cost` requiere `(companyId,costDate)`, `(fieldId,costDate)` y por categoría/campaign/supplier; `Harvest` requiere `(fieldId,campaignId)`; `AuditLog` necesita compuestos `(companyId,createdAt)` y `(entity,entityId)`. No hay CHECK constraints (`amount >= 0`, `tons > 0`, `soilPh 0..14`, `endDate > startDate`), ni enums para estados/prioridades, ni índices parciales `deleted_at IS NULL`, GiST, GIN o trigram.

**Aislamiento:** `Campaign`, `Variety`, `FieldStatus`, `ActivityType` y `CostCategory` son globales, sin `companyId`; `User.email` es global, impidiendo el mismo correo en dos empresas. `Field` no garantiza nombre único por establecimiento.

### 7.4 Migraciones

**No existen.** `apps/backend/prisma/migrations/` no está en disco ni en Git, y `.gitignore:39` lo excluye explícitamente. `prisma.config.ts:6-8` apunta a esa ruta y los scripts `prisma:migrate`/`prisma:reset` están declarados. Consecuencia: no hay forma reproducible de aplicar el esquema con `prisma migrate deploy`; cada entorno dependería de `db push` o de una migración artesanal no versionada. Contradice la integridad/auditabilidad declarada en `docs/04 §40-49`.

### 7.5 Seed

Cubre 44 permisos, 4 estados, 3 variedades, 3 campañas, 6 tipos de actividad, 4 categorías de costo, 1 empresa, 1 establecimiento, 7 roles, 1 usuario admin, 10 campos, 17 actividades, 12 costos, 4 cosechas y 6 alertas. No crea `Supplier`, `Setting`, `Session`, `AuditLog` ni usuarios adicionales.

Problemas: **IDs como `default-company`, `default-farm`, `el-talita` no son UUID** pero las columnas son `@db.Uuid` (`schema.prisma:15,46,130,154,329,380`) → la inserción debería fallar en PostgreSQL. No es idempotente (`cost.create`, `harvest.create`, `fieldAlert.create` sin `upsert`). Usa `Math.random()` en sacarosa/humedad. Los `update: {}` no corrigen datos existentes. Los IDs GIS del frontend (`f1`, `f2`) no corresponden a los del seed.

### 7.6 PostGIS

La imagen `postgis/postgis:16-3.4` está en `docker-compose.yml:3`, pero **no hay ni una sola declaración `geometry`, `Unsupported`, extensión ni índice GiST** en `apps/backend/prisma/`. Los polígonos se generan en el cliente (`mock-gis.ts:41-46`) con Shoelace/haversine (`gis-utils.ts`). `docs/07 §156-164` ubica la persistencia PostGIS en "Futura Evolución", lo que confirma que hoy no existe.

### 7.7 Integridad y rendimiento

Solo `RolePermission` y `Session` declaran `onDelete: Cascade`. `AuditLog` guarda IDs sin FK, por lo que puede quedar huérfano. Soft delete en 12 modelos, ausente en catálogos y `AuditLog`. Ningún `DateTime` usa `@db.Timestamptz` pese a `docs/04 §91-93`. Dinero y medidas sí usan `Decimal` correctamente. Prisma no indexa FK automáticamente: con 7 FK en `Cost`, 5 en `Harvest` y 4 en `Field`, los filtros por empresa/campaña/fecha harán escaneos completos a medida que crezcan.

---

## 8. Auditoría del Centro de Decisiones Inteligentes

**Veredicto: NO CUMPLIDO.** La expresión "Centro de Decisiones Inteligentes" no aparece en ningún documento ni en el código. Lo que existe es un *Centro de Comando Ejecutivo* con apariencia de analítica.

### 8.1 Clasificación honesta de lo existente

| Categoría | Qué existe realmente | Evidencia |
|---|---|---|
| **Implementado real (pero inalcanzable)** | `ShiService`: índice determinístico de 7 sub-scores con pesos fijos, consulta Prisma real de alerts/activities/harvests/costs | `shi.service.ts:35-209`; sin controller en `app.module.ts` |
| **Implementado real (parcialmente expuesto)** | Agregaciones con variación vs. período anterior, rentabilidad, costos por ha/t, analytics de costos y cosechas | `reports.repository.ts:84-96,230-234,339-429`; `GET /costs/analytics`, `GET /harvests/analytics` |
| **Basado en reglas simples** | Recomendación del detalle de campo por umbral `healthScore >= 80`; alertas por `priority` | `campos/[id]/page.tsx:278-281`; `reports.repository.ts:655-657` |
| **Solo diseñado / documentado** | Chat IA, RAG con pgvector, `POST /ai/chat`, predicciones con confianza, conversaciones persistidas, NDVI, ML | `docs/02 §6.1-6.3`, `docs/01 §18.4`, `docs/04 §4.21-4.22` |
| **No existe** | Modelo de ML, llamada a LLM, dataset, métricas, entrenamiento, predicción de rendimiento, recomendaciones científicas | 0 coincidencias de `recommend|prediction|forecast|IA|AI|machine learning` en `apps/backend/src`; sin SDK de IA en `package.json` |

### 8.2 Datos que alimentan los paneles "IA"

- `ia-center.tsx:6,12-14` rota entre 3 frases de `MOCK_AI_RECOMMENDATIONS`; el input y los botones no tienen handlers.
- `ia-panel.tsx:18,35,43,57,70` muestra `16800 t (82 %)` y `$2.35M (76 %)` como literales de `mock-executive.ts:171-217`, con `lastUpdated` fijo `2026-07-29T06:00:00` formateado como si fuera reciente. Las tarjetas tienen `cursor-pointer` sin acción.
- `gis-context.tsx:27,175` y `map-container.tsx:182-190` muestran 5 recomendaciones con "confidence" inventada (`mock-gis.ts:171-214`).
- El SHI del frontend se calcula con `Math.random()` (`mock-harvests.ts:219-222`) mientras el backend tiene un cálculo determinístico sin exponer.
- La landing afirma "IA predictiva con 98 % de precisión", "10.000 hectáreas", "25 % de ahorro" y "AES-256 en datacenters argentinos" sin evidencia en el repositorio.

### 8.3 Qué haría falta para un valor diferencial real

1. **Datos:** migrar mocks a tablas reales con histórico de al menos 2-3 campañas; sin eso no hay análisis posible.
2. **Indicadores:** exponer `ShiService` y `ReportsRepository` por HTTP y usarlos en los paneles.
3. **Reglas transparentes:** recomendaciones explicables ("costo/ha 18 % sobre mediana del establecimiento → revisar fertilización") con umbrales documentados y auditables. No hace falta IA para aportar valor.
4. **Comparación:** parcelas vs. medianas por variedad/campaña y período actual vs. anterior, ya parcialmente implementado en `reports.repository.ts`.
5. **Predictivo (solo si hay datos):** histórico suficiente, métricas (MAE/RMSE), dataset de validación y explicación del modelo. Sin esto, **no debe afirmarse** que el sistema predice.
6. **IA generativa (opcional y posterior):** si se incorpora un LLM, debe quedar claro que es una capa de explicación sobre datos reales, con logging y costes, no una fuente de cifras.

---

## 9. Resultados de pruebas

Ejecutadas el 25-26 de noviembre de 2026, sin modificar fuentes. `git status` quedó limpio después de los builds (solo artefactos ignorados `.next/` y `dist/`).

| Verificación | Comando | Resultado | Detalle |
|---|---|---|---|
| Dependencias | `npm ls --depth=0` | OK con observación | Workspaces resueltos; paquetes `@emnapi/*` marcados como `extraneous` |
| TypeScript frontend | `npx tsc --noEmit -p apps/frontend/tsconfig.json` | **EXIT 0** | Sin errores |
| TypeScript backend | `npx tsc --noEmit -p apps/backend/tsconfig.json` | **EXIT 2** | `TS6059`: `prisma/seed.ts` fuera de `rootDir` (`src`) |
| Linter frontend | `npx eslint .` (en `apps/frontend`) | **EXIT 0** | Sin errores |
| Linter backend | `npx eslint "{src,apps,libs,test}/**/*.ts"` (sin `--fix`) | **EXIT 1** | 137 problemas: 136 errores, 1 warning; 131 auto-fixables; error de parseo en `test/app.e2e-spec.ts` |
| Formato | `npx prettier --list-different ...` | 156 archivos fuera de formato | Afecta backend y frontend |
| Build backend | `npm run build --workspace=apps/backend` | **EXIT 0** | `nest build` correcto (usa `tsconfig.build.json`, que excluye seed/test) |
| Build frontend | `npm run build --workspace=apps/frontend` | **EXIT 0** | Compiló en 5,3 s; TypeScript en 6,7 s; 19 páginas generadas |
| Test unitario | `npm test --workspace=apps/backend -- --runInBand` | **EXIT 1** | 1 suite fallida, **0 tests ejecutados**; `SyntaxError: Cannot use import statement outside a module` en `app.controller.spec.ts:1` |
| Test e2e | `npm run test:e2e --workspace=apps/backend -- --runInBand` | **EXIT 1** | 1 suite fallida, **0 tests ejecutados**; mismo error en `app.e2e-spec.ts:1`. El test solo hace `GET /`, no modifica datos |
| Servicios externos | — | PENDIENTE DE VERIFICACIÓN | PostgreSQL escucha en 5432 (10 procesos), pero Docker no está instalado en esta máquina; no se ejecutó seed ni migración |

**Notas sobre los tests:** el único test unitario (`app.controller.spec.ts:19`) espera `'Hello World!'`, pero `AppService.getHealth()` devuelve un objeto (`app.service.ts:5-11`): aunque se reparara ESM, el test fallaría. El e2e no replica el prefijo `/api`, los filtros ni los guards del bootstrap. No existe ningún test de reglas de negocio, repositorios ni integración frontend-backend.

---

## 10. Evaluación académica — Tecnicatura Universitaria en Programación

| Criterio | Estado | Evidencia |
|---|---|---|
| Problema claramente identificado | CUMPLIDO | `docs/01 §2.1-2.7` (siete causas) |
| Justificación | PARCIAL | `docs/01 §3` (mercado) y `§17.2` (académica); cifras sin citas |
| Objetivo general y específicos | CUMPLIDO | `docs/01 §6`, `§7.1-7.10` |
| Alcance definido | PARCIAL | `docs/01 §8`; contradicciones con `docs/05`, `docs/03` |
| Requisitos funcionales y no funcionales | PARCIAL | Repartidos en `docs/01`, `docs/02`, `docs/03`; sin IDs ni trazabilidad |
| Análisis y diseño del sistema | CUMPLIDO | `docs/03`: 8 actores, 13 casos de uso, 38 reglas de negocio |
| Modelo de datos | PARCIAL | `docs/04` muy completo, pero 20 modelos reales vs. 22/23 documentados y sin migraciones |
| Arquitectura documentada | CUMPLIDO | `docs/02 §4-10`; sin ADRs |
| Tecnologías justificadas | PARCIAL | Stack en README y docs; Argon2/CI/Redis documentados pero no implementados |
| Innovación / valor diferencial | PARCIAL | Idea de CDI y GIS es diferencial, pero hoy es decoración con mocks |
| Plan de pruebas | NO CUMPLIDO | `CONTRIBUTING.md` exige tests; 0 tests ejecutados; `npm test` = `echo` |
| Documentación técnica | PARCIAL | Docs de diseño abundantes; `apps/backend/README.md` es template; sin README de API |
| Posibilidad de demostrar funcionamiento | PARCIAL | Builds OK, pero login mock, sin migraciones y sin integración real |

**Falta académica más importante:** el proyecto puede defenderse en la **mesa de diseño**, pero no en la **mesa de ejecución**. Para una TUP conviene presentar: (a) documento RF/RNF con trazabilidad, (b) plan de pruebas con resultados reales, (c) marco teórico citado, (d) un demo con login real y datos sembrados, y (e) una versión coherente del alcance que retire o difiera explícitamente IA, satélites, offline e inventario.

---

## 11. Problemas y riesgos detectados

### CRÍTICOS

1. **Fallback de secretos JWT** (`auth.module.ts:13`, `jwt.strategy.ts:13`, `auth.service.ts:59,116,156`): con `.env` incompleto se firma con un literal conocido. Cualquiera puede forjar tokens.
2. **Aislamiento multi-tenant roto**: `companyId` del body/query en costos, cosechas, proveedores, usuarios, roles y auditoría; `POST /companies` sin `@Roles`. Exfiltración/edición cross-empresa.
3. **Autenticación frontend simulada**: cualquier email con password ≥ 4 caracteres entra; sin token en la API; `remember=false` pierde la sesión al recargar.
4. **Sin migraciones y seed inválido**: no se puede recrear la BD de forma reproducible; los IDs del seed no son UUID.
5. **Revocación de sesiones cross-user** (`sessions.service.ts:13-18`) y auditoría consultable por `?companyId=` externo.
6. **PRÁCTICAMENTE 0 pruebas ejecutables**: Jest roto por ESM, test obsoleto, sin tests de negocio.

### ALTOS

7. Permisos granulares declarados pero no enforceados; `super_admin`/`gerente` reciben 403.
8. `ReportsRepository` y `ShiService` sin controller: analítica real inaccesible.
9. Contrato `createField` roto y latch de mock irreversible en el cliente.
10. Claims de IA/predicción/98 % sin implementación: riesgo académico y de confianza.
11. PostGIS ausente; tres implementaciones de mapa; nav con rutas a 404.
12. Validaciones rotas en UpdateUser/UpdateRole/Settings/analytics/audit.
13. Sin auditoría de CRUD; errores silenciados.
14. Accesibilidad WCAG declarada pero no verificada; solo 5 `aria-*`.

### MEDIOS

15. 156 archivos sin formato, 137 problemas de linter, `TS6059`.
16. Código muerto y duplicado; `components.json` no refleja lo usado.
17. Contradicciones documentales (20) y desalineación CHANGELOG/package.json.
18. Credenciales Docker hardcodeadas; `docker/.env.example` no consumido; `dotenv` dependencia implícita.

---

## 12. Funcionalidades faltantes

**Bases (bloqueantes):** migraciones versionadas, seed válido e idempotente, autenticación real en frontend, envío de JWT, tenancy consistente, jerarquía de roles, tests ejecutables.

**Módulos completos:** Activities (backend + frontend conectado), Inventario de insumos (o retirarlo del alcance), Reportes con controller y exportación, Proveedores en UI, Campañas/Variedades con endpoints, Configuración conectada, Sesiones conectadas.

**Integración:** costos, cosechas, auditoría, settings, dashboard y executive consumiendo endpoints reales; eliminación de `Math.random()` y de mocks en producción.

**Geoespacial:** geometry/PostGIS con migración e índice GiST; unificación de los tres mapas.

**CDI:** ver §8.3. Hoy no hay predicción, IA, RAG ni recomendaciones científicas.

**Calidad:** CI/CD, plan de pruebas, README de API, ADRs, trazabilidad RF↔test, accesibilidad real.

---

## 13. Plan de trabajo priorizado

Las etapas están ordenadas por dependencia. **No se desarrolla nada avanzado antes de completar las bases.**

### ETAPA 1 — Errores críticos y bloqueos de funcionamiento

| # | Tarea | Por qué | Archivos afectados | Resultado esperado | Verificación |
|---|---|---|---|---|---|
| 1.1 | Eliminar defaults de secretos y fallar si faltan; documentar variables | Cualquiera puede forjar JWT | `auth.module.ts`, `jwt.strategy.ts`, `jwt-refresh.strategy.ts`, `auth.service.ts`, `.env.example` | Arranque falla con mensaje claro si no hay secretos | `npm run start:dev` sin `.env` → error; con `.env` → OK |
| 1.2 | Filtrar `companyId` desde `req.user` en todos los repositorios; quitar `companyId` de bodies/queries | Fuga cross-tenant | `users/roles/fields/costs/harvests/suppliers/company/audit` repositories y controllers | Ningún endpoint devuelve datos de otra empresa | Test e2e con dos empresas y tokens distintos |
| 1.3 | Proteger `POST /companies`; jerarquía de roles; `@Roles` en endpoints sensibles | Escalada de privilegios | `company.controller.ts`, `roles.guard.ts`, `sessions.controller.ts`, `fields/costs/harvests/suppliers/cost-categories controllers` | `super_admin`/`gerente` funcionan; roles bajos reciben 403 | Matriz de pruebas rol × endpoint |
| 1.4 | Conectar `AuthContext` a `/auth/login|me|refresh` y enviar `Authorization` en `api.ts`; quitar latch de mock | La UI hoy no usa el backend | `auth-context.tsx`, `api.ts`, `api-fields.ts`, `auth-guard.tsx` | Login real; `GET /fields` con token; sin latch global | Demo: login → /campos muestra datos de API |
| 1.5 | Generar y versionar migración inicial; corregir IDs del seed a UUID y hacerlo idempotente | BD no reproducible | `.gitignore:39`, `prisma/migrations/`, `prisma/seed.ts` | `prisma migrate deploy` + `prisma db seed` funcionan dos veces | Ejecutar en BD limpia y repetir seed |
| 1.6 | Reparar configuración ESM de Jest y actualizar tests obsoletos | 0 pruebas ejecutadas | `package.json`, `test/jest-e2e.json`, `app.controller.spec.ts`, `app.e2e-spec.ts` | `npm test` y `npm run test:e2e` ejecutan y pasan | Salida con `Tests: N passed` |

### ETAPA 2 — Completar funcionalidades principales

| # | Tarea | Por qué | Archivos afectados | Resultado esperado | Verificación |
|---|---|---|---|---|---|
| 2.1 | Crear módulo Activities (controller/service/repo/DTO) y conectar la UI | Requisito RF-02 sin backend | `src/activities/**`, `app.module.ts`, `actividades/page.tsx` | CRUD real de actividades con filtros aplicados | Crear/editar/listar actividad vía UI y API |
| 2.2 | Conectar costos y categorías a `/costs`; reemplazar `console.log` | RF-03 hoy es mock | `costos/page.tsx`, `cost-form.tsx`, `lib/api-costs.ts` (nuevo) | Alta/edición persisten en BD | Verificar registro tras recargar |
| 2.3 | Conectar cosechas y validar referencias en `update` | RF-05 y consistentencia | `produccion/page.tsx`, `harvests.service.ts` | PATCH con IDs inexistentes → 400/404 | Test con referencia inválida |
| 2.4 | Corregir `createField` (enviar `farmId`/`fieldStatusId`, UUID) y handlers de botones | Contrato roto y botones muertos | `api-fields.ts`, `campos/page.tsx`, `campos/[id]/page.tsx` | Alta de campo real desde la UI | Crear campo y verificar en BD |
| 2.5 | Corregir validación de UpdateUser/UpdateRole/Settings y DTOs de analytics/audit | `ValidationPipe` se evita | DTOs listados, `settings.controller.ts` (quitar `import type`) | Payloads inválidos → 400 | Pruebas con campos extra/inválidos |
| 2.6 | Pantalla de proveedores con roles y filtro por empresa | RF de proveedores sin UI | `src/app/proveedores/` (nuevo), `suppliers.controller.ts` | CRUD de proveedores desde UI | Verificar aislamiento entre empresas |

### ETAPA 3 — Mejorar integración y reglas de negocio

| # | Tarea | Por qué | Archivos afectados | Resultado esperado | Verificación |
|---|---|---|---|---|---|
| 3.1 | Exponer Reports con controller/module/service y corregir `activityWhere`, campaña y precio | 718 líneas de análisis inalcanzables | `src/reports/**`, `app.module.ts` | `GET /api/reports/*` con filtros por empresa | Comparar totales con datos sembrados |
| 3.2 | Exponer `ShiService` y usar SHI real en frontend | Hoy SHI es `Math.random()` | `src/shi/**`, `campos/[id]/page.tsx`, `produccion/page.tsx` | SHI calculado en backend y mostrado | Recalcular tras cambiar costos |
| 3.3 | Auditar CRUD real; quitar `catch {}` y `?companyId` del query | Trazabilidad vacía | `src/audit/**`, servicios de CRUD | Toda mutación genera `AuditLog` | Verificar logs tras crear/editar |
| 3.4 | Verificar propiedad en `revoke` y conectar UI de sesiones | Revocación cross-user | `sessions.service.ts`, `sessions/page.tsx` | Solo se revocan sesiones propias | Test con dos usuarios |
| 3.5 | Implementar `PermissionsGuard` o retirar permisos del seed | 44 permisos decorativos | `src/common/guards/`, `auth.service.ts`, `seed.ts` | Decisión documentada y coherente | Matriz permiso × endpoint |
| 3.6 | Unificar mapas y persistir geometría en PostGIS | Tres implementaciones y sin BD geoespacial | `components/gis/**`, `components/map/**`, `executive-map-inner.tsx`, `schema.prisma`, migración | Un solo mapa fuente; polígonos desde BD | Consulta `ST_Area` sobre campo creado |

### ETAPA 4 — Centro de Decisiones Inteligentes (sobre bases ya listas)

| # | Tarea | Por qué | Archivos afectados | Resultado esperado | Verificación |
|---|---|---|---|---|---|
| 4.1 | Reemplazar mocks por agregaciones reales en `ia-panel`, `ai-center` y recomendaciones GIS | Hoy son constantes | `ia-panel.tsx`, `ai-center.tsx`, `gis-context.tsx` | Cifras calculadas desde `/reports` y `/shi` | Cambiar datos y verificar que la cifra cambia |
| 4.2 | Definir reglas de recomendación explicables con umbrales documentados | Valor diferencial sin fingir IA | Nuevo `src/recommendations/**`, `docs/08-recomendaciones.md` | Recomendación con motivo y regla identificable | Revisar regla y dato de origen |
| 4.3 | Histórico y comparación entre parcelas/períodos | RF de análisis histórico | `reports.repository.ts`, panel ejecutivo | Comparativas por campaña/parcela con datos reales | Verificar contra seed de 3 campañas |
| 4.4 | Solo si hay dataset: evaluar modelo predictivo con métricas | Evitar afirmar predicción sin evidencia | Documento de métricas + código opcional | MAE/RMSE y dataset de validación publicados | Reproducir evaluación |
| 4.5 | Retirar o corregir claims de "98 % de precisión", satélites y IA en landing/docs | Coherencia académica | `brand-panel.tsx`, `faq-section.tsx`, `docs/01`, `docs/05`, `docs/06` | Lenguaje honesto y alineado | Revisión de textos |

### ETAPA 5 — UX/UI, responsive y accesibilidad

| # | Tarea | Por qué | Archivos afectados | Resultado esperado | Verificación |
|---|---|---|---|---|---|
| 5.1 | Eliminar `Math.random()` de mocks y añadir estados de carga/error reales | Datos cambian por recarga | `lib/mock-*.ts`, todas las páginas | Render determinista y estados claros | Recargar dos veces y comparar |
| 5.2 | Accesibilidad: labels, `aria-label`, teclado en dropdowns/mapa, foco en modales | WCAG 2.1 AA declarado | `login-form.tsx`, `header.tsx`, `audit/page.tsx`, `gis/**`, `detail-panel.tsx` | Navegación completa por teclado | Auditoría con axe/Lighthouse |
| 5.3 | Corregir rutas de navegación inexistentes | Links a 404 | `mock-data.ts`, sidebar | Todas las entradas llevan a rutas reales o se ocultan | Recorrido manual de nav |
| 5.4 | Unificar componentes duplicados y conectar botones no-op | Calidad y coherencia | `dashboard/**`, `executive/**`, `settings-*.tsx`, `profile/page.tsx` | Una sola implementación por responsabilidad | Revisión de imports y handlers |
| 5.5 | Revisar `detail-panel` fijo y scrolls anidados en móvil | Usabilidad | `detail-panel.tsx`, `executive-layout.tsx`, `dashboard/page.tsx` | Panel adaptable en 375 px | Prueba en viewport móvil |

### ETAPA 6 — Pruebas, seguridad y rendimiento

| # | Tarea | Por qué | Archivos afectados | Resultado esperado | Verificación |
|---|---|---|---|---|---|
| 6.1 | Tests unitarios de reglas de negocio (auth, SHI, reports, costos) | Hoy 0 tests | `src/**/*.spec.ts` | Cobertura de casos válidos e inválidos | `npm test` con N passed |
| 6.2 | Tests e2e con BD de prueba aislada | Validar flujo real | `test/`, compose de test | Login → CRUD → auditoría | `npm run test:e2e` |
| 6.3 | Crear workflow de CI (lint, typecheck, test, build) | `docs/02 §10.4` sin implementar | `.github/workflows/ci.yml` | Pipeline verde en push | Ver GitHub Actions |
| 6.4 | Corregir `TS6059`, ejecutar formateo y quitar `--fix` del script de lint | Deuda técnica | `tsconfig.json`, todo el repo, `package.json` | `tsc`, `prettier --check` y `eslint` sin errores | Comandos en verde |
| 6.5 | Añadir índices y paginación en schema/servicios | Rendimiento futuro | `schema.prisma`, repositorios | Consultas por empresa/fecha usan índice | `EXPLAIN ANALYZE` |
| 6.6 | Seguridad: rate limit de login, lockout, CORS estricto, rotación de secretos | Defensa del sistema | `auth.module.ts`, `main.ts`, `app.module.ts` | Política de seguridad documentada | Pruebas de fuerza bruta controlada |

### ETAPA 7 — Documentación y presentación académica

| # | Tarea | Por qué | Archivos afectados | Resultado esperado | Verificación |
|---|---|---|---|---|---|
| 7.1 | Documento RF/RNF con IDs y trazabilidad RF↔HU↔caso de uso↔test | Falta académica crítica | `docs/08-requisitos.md` (nuevo) | Matriz completa | Revisión docente |
| 7.2 | Resolver las 20 contradicciones y congelar versión del alcance | Coherencia | `docs/01`, `docs/02`, `docs/03`, `docs/05`, README, CHANGELOG | Un solo alcance vigente | Diff entre docs |
| 7.3 | Plan de pruebas con resultados reales | `CONTRIBUTING.md` lo exige | `docs/09-plan-de-pruebas.md` | Casos, criterios y evidencia | Ejecutar plan |
| 7.4 | Marco teórico con citas y validación con productores/ingenios | Justificación sólida | `docs/01 §3`, referencias | Bibliografía verificable | Revisión de citas |
| 7.5 | README técnico: setup, `.env`, migraciones, seed, endpoints | Backend README es template | `README.md`, `apps/backend/README.md` | Otro desarrollador puede arrancar | Clonar e instalar desde cero |
| 7.6 | Guion de demo con datos sembrados y flujo real | Defensa académica | `docs/10-demo.md`, seed | Demo de 5 minutos sin mocks | Ensayo general |

---

## 14. Conclusión general

SmartCaña **no está listo para presentarse como sistema funcional**, aunque sí como **proyecto de diseño con muy buena base teórica y visual**. La distancia entre lo documentado (IA, PostGIS, exportación, RBAC completo, CI/CD, WCAG) y lo ejecutable es grande, y esa distancia es exactamente lo que una auditoría académica va a encontrar.

Lo que más conviene hacer no es sumar funcionalidades nuevas, sino **cerrar el circuito**: secretos seguros, tenancy correcto, login real, base de datos reproducible, endpoints conectados y pruebas que ejecuten. Con eso, el mismo frontend existente pasaría de maqueta a producto demostrable, y el "Centro de Decisiones Inteligentes" podría empezar a ser **analítica real y explicable** apoyada en `ShiService` y `ReportsRepository`, sin necesidad de fingir inteligencia artificial.

**Este documento se entrega sin commitear**, a la espera de autorización para corregir cualquiera de las tareas listadas. No se modificó código fuente, no se eliminaron archivos, no se ejecutaron migraciones ni se hicieron commits o push durante la auditoría.
