# ETAPA 1.1 — SEGURIDAD, AUTENTICACIÓN Y AISLAMIENTO MULTI-TENANT

**Fecha:** 26 de noviembre de 2026
**Referencia:** `docs/AUDITORIA_INTEGRAL_SMARTCANA.md`
**Alcance:** corregir autenticación, autorización, secretos y `companyId` sin cambiar arquitectura, sin agregar módulos ni funcionalidades y sin modificar el diseño visual.
**Restricciones respetadas:** no se ejecutaron migraciones ni seed; no se modificó ningún `.env` real; no se borraron datos; no se hicieron commits ni push; no se introdujeron datos ficticios para simular funcionamiento.

---

## 1. Cómo leer este informe

Se distinguen tres estados, que **no son intercambiables**:

| Estado | Significado |
|---|---|
| **CORREGIDO** | El código fue modificado. Puede estar respaldado por inspección de código, build o typecheck; no implica necesariamente prueba de ejecución contra la base de datos real. |
| **PROBADO** | Existe una ejecución real registrada en este documento con comando y salida. |
| **PENDIENTE / PENDIENTE DE VERIFICACIÓN** | No se ejecutó, no se pudo ejecutar en este entorno o requiere una decisión posterior. No se presenta como resuelto. |

Las pruebas de seguridad se ejecutaron con **mocks de Prisma y servicios**, no contra PostgreSQL. Por eso cubren guards, DTOs, rehidratación del JWT y flujo HTTP con `supertest`, pero **no validan integración real con la base de datos sembrada**.

---

## 2. Resumen ejecutivo

- **CORREGIDO y PROBADO:** arranque sin secretos por defecto, rehidratación del usuario desde BD en cada request, jerarquía de roles, guard de permisos, login real del frontend con `/auth/login|me|refresh|logout`, envío centralizado de `Authorization`, refresco único en 401, eliminación del fallback mock en `/campos`, y 19 pruebas backend en verde.
- **CORREGIDO por inspección, no ejecutado contra DB real:** filtrado por `companyId` en usuarios, roles, empresas, establecimientos, campos, costos, cosechas, proveedores, auditoría, configuración, reportes y SHI.
- **PENDIENTE DE VERIFICACIÓN:** demo end-to-end con PostgreSQL, migraciones y seed válidos; matriz completa rol × endpoint con dos empresas reales; exposición HTTP de Reportes/SHI; revocación por `tokenHash`; protección server-side de rutas del frontend.
- No se afirmó funcionamiento real de pantallas que siguen con mocks fuera del alcance de esta etapa (dashboard, executive, costos, producción, mapa, etc.).

---

## 3. Corregido

### 3.1 Secretos y arranque

| Archivo | Corrección |
|---|---|
| `apps/backend/src/common/config/required-env.ts` | `requireEnv()` falla si la variable falta, está vacía o vale `CAMBIARME`. No imprime valores. |
| `apps/backend/src/auth/auth.module.ts`, `jwt.strategy.ts`, `jwt-refresh.strategy.ts`, `auth.service.ts`, `prisma/prisma.service.ts` | Se eliminaron los defaults literales de `JWT_SECRET`, `JWT_REFRESH_SECRET` y `DATABASE_URL`. |
| `apps/backend/.env.example` | Documenta `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL` y `PORT` con marcadores `CAMBIARME`. No se tocó ningún `.env` real. |

**Estado:** CORREGIDO; `requireEnv('CAMBIARME')` PROBADO en el suite de seguridad.

### 3.2 Autenticación y rehidratación del JWT

- `JwtStrategy.validate()` consulta Prisma en cada request y devuelve `role`, `companyId` y `permissions` **desde la BD**, no desde el payload firmado.
- Usuarios inactivos o con `deletedAt` son rechazados con 401 aunque el token no haya vencido.
- `GET /auth/me` incluye `createdAt` para el mapa del perfil frontend.
- `POST /auth/logout` revoca **todas** las sesiones activas del usuario y limpia `refreshTokenHash`; ya no filtra por IP.
- `SessionsService.revoke()` verifica que la sesión pertenezca al usuario; si no, responde 404 para no revelar existencia ajena.

**Estado:** CORREGIDO; login válido/inválido, token vencido, usuario inactivo, rehidratación de `companyId` y logout global revisados en código. Los tres primeros y la rehidratación están PROBADOS con mocks; logout no tiene prueba automatizada específica.

### 3.3 Roles y escalada de privilegios

- `apps/backend/src/common/constants/roles.ts` define `ROLE_RANK`: `super_admin:0`, `admin:1`, `gerente:2`, `supervisor:3`, `ingeniero:3`, `operador:4`, `invitado:5`.
- `isRoleAtLeast()` permite que un rol superior satisfaga un `@Roles` inferior.
- `canAssignRole()` impide asignar un rol de nivel superior al del actor.
- `UsersService` valida el rol asignado en `create` y `update`.
- `RolesService` impide otorgar permisos que el actor no posee y bloquea modificación/eliminación de roles del sistema.

**Estado:** CORREGIDO y PROBADO en las pruebas de jerarquía y en los casos `super_admin` vs. `admin` vs. `operador`.

### 3.4 Permisos granulares

- `Packages/types` expone `PermissionCode`; se agregó `@Permissions()` y `PermissionsGuard` como guard global.
- El guard lee los permisos del usuario rehidratado por `JwtStrategy`; **nunca** del body ni de la query.
- Solo se enforcea donde existe decorador: los endpoints sin `@Permissions` conservan su comportamiento previo (JWT global) para no romper funcionalidad existente.
- `DELETE /harvests/:id` usa `harvests.edit` porque `harvests.delete` no existe en `PermissionCode` ni en el seed.

**Estado:** CORREGIDO; aplicaciones concretas listadas en §6. Casos `users.view`, `fields.*` y `companies.manage` PROBADOS.

### 3.5 Aislamiento multi-tenant

Regla aplicada: **`companyId` se deriva siempre del JWT rehidratado**. Body y query nunca son fuente de autoridad.

- Controladores: usan `@CurrentUser()` y pasan `user.companyId` a services/repositories.
- Repositorios: filtran por `companyId`, incluidas relaciones anidadas (`farm.companyId`, `field.farm.companyId`, etc.).
- Costos y cosechas: `analytics` ignora explícitamente `?companyId=` y usa el token.
- Auditoría: `QueryAuditDto` no declara `companyId`; el controlador fuerza el del JWT.
- Reportes: `activityWhere`, campaña activa, resumen y precio por tonelada pasan a usar el `companyId` recibido como filtro interno.
- SHI: `calculateForField(companyId, fieldId)` filtra el campo por `farm.companyId`.
- `cost-categories` y `permissions` siguen siendo catálogos globales: se agregaron permisos, no `companyId`.

**Estado:** CORREGIDO por inspección en todos los módulos listados. PROBADO en ejecución para `fields` (query, body, repositorio) y para el rechazo de `companyId` extra en `/fields?companyId=`. **No ejecutado contra dos empresas reales en los demás módulos.**

**Observación de contrato:** los DTOs de creación de `users`, `costs`, `harvests` y `suppliers` todavía declaran `companyId` por compatibilidad y los DTOs de query lo declaran como opcional. El valor se ignora/sobrescribe en service y repository, pero el contrato HTTP sigue aceptándolo. Queda listado como pendiente de limpieza en §8.

### 3.6 Frontend: autenticación y datos de campos

| Archivo | Corrección |
|---|---|
| `src/lib/auth-tokens.ts` (nuevo) | Storage centralizado, `remember` usa `localStorage` o `sessionStorage` de forma consistente, eventos de expiración y refresh con token guardado. |
| `src/lib/api.ts` | Envía `Authorization: Bearer ...`, construye `headers` antes de `...options`, refresh único en 401, `ApiError` y `authApi` para `/auth/login|refresh|me|logout`. |
| `src/contexts/auth-context.tsx` | Login real, hidratación vía `/auth/me`, refresh en 401, logout que revoca en backend, sin `MOCK_USER` ni credenciales demo. |
| `src/types/auth.ts`, `src/app/profile/page.tsx` | Roles del backend y etiquetas actualizadas. |
| `src/lib/api-fields.ts` | Sin `MOCK_FIELDS`, sin latch `useMockFallback`; errores se re-lanzan. Mapeo de cosechas reales y campos de SHI cuando el backend los expone. |
| `src/app/campos/page.tsx` | Lista vacía es resultado válido; no se inicializa con mocks. |
| `src/app/campos/[id]/page.tsx` | Sin mocks de campos/cosechas; SHI determinista calculado desde datos reales, sin `Math.random()`. |
| `src/components/auth/login-form.tsx` | Mínimo de password 6 y texto demo eliminado. |

**Estado:** CORREGIDO y verificado con typecheck y build de frontend. **No probado en navegador contra API real**; ver §8.

### 3.7 Pruebas

- Jest configurado para ESM en `apps/backend/package.json` y `test/jest-e2e.json`.
- `app.controller.spec.ts` actualizado al health real.
- `test/app.e2e-spec.ts` reescrito como e2e mínimo HTTP sin BD.
- `src/security/auth-tenancy.spec.ts` (nuevo): 18 casos de seguridad/tenancy.

**Estado:** CORREGIDO y PROBADO; ver §5.

---

## 4. Matriz de roles y `companyId`

### 4.1 Jerarquía

| Rol | Rank | Satisface `@Roles` |
|---|---:|---|
| `super_admin` | 0 | todos |
| `admin` | 1 | `admin`, `gerente`, `supervisor`, `ingeniero`, `operador`, `invitado` |
| `gerente` | 2 | `gerente`, `supervisor`, `ingeniero`, `operador`, `invitado` |
| `supervisor` | 3 | `supervisor`, `ingeniero`, `operador`, `invitado` |
| `ingeniero` | 3 | `ingeniero`, `supervisor`, `operador`, `invitado` |
| `operador` | 4 | `operador`, `invitado` |
| `invitado` | 5 | `invitado` |

Un rol superior **no** omite `@Permissions`: si el endpoint declara permiso, el usuario debe tenerlo en BD.

### 4.2 Origen de `companyId`

| Capa | Comportamiento |
|---|---|
| Token emitido | Incluye `companyId` del usuario al hacer login/refresh. |
| `JwtStrategy.validate()` | **Sobrescribe** el payload con `companyId`, `role` y `permissions` leídos desde BD. |
| `@CurrentUser()` | Entrega ese objeto rehidratado al controlador. |
| Controller | Pasa `user.companyId` al service. |
| Service/Repository | Construye `where` y datos de creación con ese `companyId`. |
| Cliente | No envía `companyId` como fuente de autoridad; cuando aparece en DTOs legacy se ignora. |

**Casos probados:** token con `companyId: company-b` para un usuario de `company-a` → las llamadas usan `company-a`; `?companyId=company-b` en detalle → se ignora; `companyId` en body de creación → 400 por `forbidNonWhitelisted` en `fields`; creación válida → service recibe `company-a`.

### 4.3 Observaciones del seed (inspección estática, no ejecutado)

- `super_admin` recibe `ALL_CODES`, por lo que `POST /companies` es alcanzable con ese rol.
- `admin` excluye `permissions.manage` y `companies.manage`; un admin con `@Roles('admin')` puede pasar el rol pero **no** el permiso `companies.manage`.
- `gerente` excluye permisos `users.*`, `roles.*`, `permissions.*`, `companies.*`, `sessions.*`, `audit.*` y `settings.manage`.
- Estas conclusiones son del archivo `prisma/seed.ts`; **no se ejecutó seed**.

---

## 5. Resultados reales de ejecución

Todos los comandos se ejecutaron desde la raíz del monorepo.

| Verificación | Comando | Resultado |
|---|---|---|
| Test unitario + seguridad | `npm test --workspace=apps/backend` | `Test Suites: 2 passed, 2 total`; `Tests: 19 passed, 19 total`; `Time: 2.153 s` |
| Test e2e mínimo | `npm run test:e2e --workspace=apps/backend` | `Test Suites: 1 passed, 1 total`; `Tests: 1 passed, 1 total`; `Time: 1.119 s` |
| Typecheck backend | `npx tsc --noEmit -p apps/backend/tsconfig.json` | EXIT 0, sin salida |
| Typecheck frontend | `npx tsc --noEmit -p apps/frontend/tsconfig.json` | EXIT 0, sin salida |
| Build backend | `npm run build --workspace=apps/backend` | EXIT 0 (`nest build`, sin salida adicional) |
| Build frontend | `npm run build --workspace=apps/frontend` | `✓ Compiled successfully in 6.9s`; `Finished TypeScript in 6.4s`; `19/19` páginas generadas; EXIT 0 |

Salida literal del suite principal:

```text
> backend@0.0.1 test
> node --experimental-vm-modules ../../node_modules/jest/bin/jest.js --runInBand

(node:22576) ExperimentalWarning: VM Modules is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)

Test Suites: 2 passed, 2 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        2.153 s
Ran all test suites.
```

El `ExperimentalWarning` de Node es informativo; no falló ningún test.

### 5.1 Casos cubiertos por `src/security/auth-tenancy.spec.ts`

1. `POST /auth/login` con credenciales válidas → 201, tokens reales y sesión creada.
2. `POST /auth/login` con password incorrecta → 401, sin sesión creada.
3. `POST /auth/login` con password de 5 caracteres → 400 por DTO.
4. `GET /fields` sin token → 401.
5. `GET /fields` con token vencido → 401.
6. `GET /fields` con usuario desactivado después de emitir el token → 401.
7. Token con `companyId` manipulado → la BD rehidrata `company-a`.
8. `operador` en `GET /users` → 403 por rol.
9. `admin` sin `users.view` en `GET /users` → 403 por permiso.
10. `super_admin` en `GET /users` → 200 (jerarquía).
11. `admin` en `POST /companies` → 403 aunque tenga `companies.manage`.
12. `super_admin` en `POST /companies` → 201.
13. Jerarquía: `isRoleAtLeast` y `canAssignRole` con casos válidos e inválidos.
14. `?companyId=company-b` en `/fields/:id` → se ignora; se llama al service con `company-a`.
15. `?companyId=company-b` en `/fields` → 400 por propiedad no declarada en el DTO de listado.
16. `companyId` en el body de `POST /fields` → 400; sin ese campo → service recibe `company-a`.
17. `FieldsRepository.findById('company-a', id)` → `where` incluye `farm: { companyId: 'company-a' }`.
18. `requireEnv()` rechaza `CAMBIARME` con mensaje que no incluye el valor.

Además, `app.controller.spec.ts` verifica que `/health` devuelve `{ status: 'ok', name: 'SmartCaña API', version: '0.1.0', timestamp }`.

### 5.2 Alcance real del e2e

`test/app.e2e-spec.ts` crea una aplicación Nest con `AppController`/`AppService` y valida `GET /health` → 200. **No importa `AppModule`**, no replica guards ni prefijo `/api` y no toca PostgreSQL. Sirve para verificar arranque HTTP y configuración ESM; no debe citarse como prueba de autenticación.

---

## 6. Endpoints protegidos

 Leyenda: **JWT** = `JwtAuthGuard` global; **Roles** = `RolesGuard`; **Permisos** = `PermissionsGuard`. Todas las rutas salvo `POST /auth/login` y `POST /auth/refresh` requieren JWT. Los permisos se enforcean solo donde hay `@Permissions`.

| Módulo | Endpoints | Protección declarada |
|---|---|---|
| App | `GET /`, `GET /health` | JWT global (no se agregó `@Public`; ver pendiente §8) |
| Auth | `POST /auth/login`, `POST /auth/refresh` | `@Public` |
| Auth | `POST /auth/logout`, `GET /auth/me` | JWT |
| Users | `GET /users`, `GET /users/:id` | JWT + Roles(`admin`, `ingeniero`) + `users.view` |
| Users | `POST /users`, `PATCH /users/:id`, `DELETE /users/:id` | JWT + Roles(`admin`) + `users.create` / `users.edit` / `users.delete` |
| Roles | `GET /roles`, `GET /roles/:id` | JWT + Roles(`admin`, `ingeniero`) + `roles.view` |
| Roles | `POST /roles`, `PATCH /roles/:id`, `DELETE /roles/:id` | JWT + Roles(`admin`) + `roles.manage` |
| Permissions | `GET /permissions`, `GET /permissions/:id` | JWT + Roles(`admin`, `ingeniero`) |
| Companies | `GET /companies`, `GET /companies/:id` | JWT + Roles(`admin`) + `companies.view` |
| Companies | `POST /companies` | JWT + Roles(`super_admin`) + `companies.manage` |
| Companies | `PATCH /companies/:id`, `DELETE /companies/:id` | JWT + Roles(`admin`) + `companies.manage` |
| Farms | `GET /farms`, `GET /farms/:id` | JWT + Roles(`admin`, `ingeniero`, `supervisor`) + `fields.view` |
| Farms | `POST /farms` | JWT + Roles(`admin`) + `fields.create` |
| Farms | `PATCH /farms/:id` | JWT + Roles(`admin`, `ingeniero`) + `fields.edit` |
| Farms | `DELETE /farms/:id` | JWT + Roles(`admin`) + `fields.delete` |
| Fields | `GET /fields`, `GET /fields/:id` | JWT + `fields.view` |
| Fields | `POST /fields` | JWT + `fields.create` |
| Fields | `PATCH /fields/:id` | JWT + `fields.edit` |
| Fields | `DELETE /fields/:id` | JWT + `fields.delete` |
| Costs | `GET /costs`, `GET /costs/analytics`, `GET /costs/:id` | JWT + `costs.view` |
| Costs | `POST /costs` | JWT + `costs.create` |
| Costs | `PATCH /costs/:id` | JWT + `costs.edit` |
| Costs | `DELETE /costs/:id` | JWT + `costs.delete` |
| Cost categories | `GET /cost-categories`, `GET /cost-categories/:id` | JWT + `costs.view` |
| Cost categories | `POST /cost-categories` | JWT + `costs.create` |
| Cost categories | `PATCH /cost-categories/:id` | JWT + `costs.edit` |
| Cost categories | `DELETE /cost-categories/:id` | JWT + `costs.delete` |
| Harvests | `GET /harvests`, `GET /harvests/analytics`, `GET /harvests/:id` | JWT + `harvests.view` |
| Harvests | `POST /harvests` | JWT + `harvests.create` |
| Harvests | `PATCH /harvests/:id` | JWT + `harvests.edit` |
| Harvests | `DELETE /harvests/:id` | JWT + `harvests.edit` |
| Suppliers | `GET /suppliers`, `GET /suppliers/:id` | JWT + `suppliers.view` |
| Suppliers | `POST /suppliers` | JWT + `suppliers.create` |
| Suppliers | `PATCH /suppliers/:id` | JWT + `suppliers.edit` |
| Suppliers | `DELETE /suppliers/:id` | JWT + `suppliers.delete` |
| Sessions | `GET /sessions` | JWT + `sessions.view` |
| Sessions | `POST /sessions/:id/revoke`, `POST /sessions/revoke-all` | JWT + `sessions.revoke` |
| Audit | `GET /audit` | JWT + Roles(`admin`) + `audit.view` |
| Settings | `GET /settings` | JWT + Roles(`admin`, `ingeniero`) + `settings.view` |
| Settings | `GET /settings/:key` | JWT + Roles(`admin`, `ingeniero`, `supervisor`) + `settings.view` |
| Settings | `PUT /settings/:key`, `DELETE /settings/:key` | JWT + Roles(`admin`) + `settings.manage` |

Total: **63 endpoints mapeados**; 61 requieren JWT y 2 son públicos. Los prefijos reales son `/api/...`, excepto `/health` por la exclusión en `main.ts`.

**Importante:** que un endpoint aparezca en esta tabla no significa que haya sido ejecutado contra la BD real. Los casos ejecutados están en §5.1.

---

## 7. Archivos principales modificados

### Backend

- `src/common/config/required-env.ts`, `src/common/constants/roles.ts`, `src/common/guards/roles.guard.ts`, `src/common/guards/permissions.guard.ts`, `src/common/decorators/permissions.decorator.ts`.
- `src/auth/`, `src/prisma/prisma.service.ts`, `src/app.module.ts`, `.env.example`.
- `src/users/`, `src/roles/`, `src/company/`, `src/farm/`, `src/fields/`, `src/costs/`, `src/cost-categories/`, `src/harvests/`, `src/suppliers/`, `src/sessions/`, `src/audit/`, `src/settings/`.
- `src/reports/reports.repository.ts`, `src/shi/shi.service.ts` (solo corrección de scope; siguen sin controller).
- `src/security/auth-tenancy.spec.ts`, `src/app.controller.spec.ts`, `test/app.e2e-spec.ts`, `test/jest-e2e.json`, `package.json`, `tsconfig.json`.

### Frontend

- `src/lib/auth-tokens.ts`, `src/lib/api.ts`, `src/lib/api-fields.ts`, `src/contexts/auth-context.tsx`.
- `src/types/auth.ts`, `src/types/fields.ts`, `src/app/profile/page.tsx`.
- `src/app/campos/page.tsx`, `src/app/campos/[id]/page.tsx`, `src/components/auth/login-form.tsx`.

---

## 8. Pendiente y pendiente de verificación

### Bloqueante para una demo real

1. **No se ejecutó integración con PostgreSQL.** No hay migraciones versionadas y el seed tiene IDs no UUID; esto queda fuera del alcance de esta etapa pero impide afirmar funcionamiento real de extremo a extremo.
2. **No se ejecutó la matriz completa rol × endpoint con dos empresas reales.** Los casos con mocks cubren `fields`, `users` y `companies`; los demás módulos están corregidos por inspección.
3. **No se probó el login en navegador** contra la API con datos sembrados. Typecheck y build no sustituyen esa prueba.

### Seguridad aún abierta

4. `Session.tokenHash` se persiste pero **no se valida en los guards**; un access token robado sigue siendo válido hasta expirar o logout.
5. La rotación de refresh usa **un único hash por usuario**; no hay detección de reutilización de refresh tokens.
6. Tokens siguen en `localStorage`/`sessionStorage`: riesgo XSS. No se cambió a cookies HttpOnly porque eso cambiaría el contrato de autenticación.
7. No existe `middleware.ts`: la protección de rutas del frontend es solo client-side (`AuthGuard`).
8. `main.ts` mantiene `process.env.FRONTEND_URL ?? 'http://localhost:3000'`; no se aplicó `requireEnv('FRONTEND_URL')`.
9. `GET /` y `GET /health` no tienen `@Public`, por lo que el guard global les exige JWT. Debe decidirse si el health check debe ser público para monitoreo.
10. Los DTOs de creación/query todavía exponen `companyId` legacy; se ignora en la lógica, pero conviene retirarlo del contrato cuando se actualicen los clientes.

### Funcionalidad no incluida en esta etapa

11. `ReportsRepository` y `ShiService` siguen **sin controller/module**: el scope está corregido, pero no son alcanzables por HTTP.
12. `PermissionCode` no incluye `harvests.delete`; `DELETE /harvests/:id` usa `harvests.edit` como solución temporal coherente.
13. `onboardingCompleted` continúa siendo preferencia local; el backend no expone ese campo.
14. Permanecen mocks en dashboard, executive, costos, producción, mapa, GIS y otros módulos. **No se afirma** que esas pantallas consuman datos reales.
15. No se ejecutaron lint ni Prettier sobre todo el repositorio; la deuda de formato descrita en la auditoría original no se declaró resuelta.

### Estado de Git

16. Hay archivos modificados y nuevos en el árbol de trabajo. **No se hizo commit ni push**, según las restricciones de la etapa.

---

## 9. Verificación manual recomendada (cuando haya BD válida)

1. Configurar secretos reales en `.env` y ejecutar el backend; confirmar que arranca.
2. Repetir el arranque con `JWT_SECRET=CAMBIARME`; confirmar que falla con mensaje sin exponer valores.
3. Hacer login con un usuario sembrado; confirmar que `/campos` carga datos de la API y no mocks.
4. Cerrar y reabrir la pestaña: con `remember=false` la sesión debe persistir solo dentro de la pestaña; con `remember=true`, entre reinicios del navegador.
5. Forzar 401 (token vencido) y confirmar refresh único, sin bucle de peticiones.
6. Repetir la matriz de roles de §4 con dos empresas y tokens emitidos para cada una; verificar que ningún listado devuelva filas de la otra empresa.
7. Intentar `POST /companies` con `admin` (403) y con `super_admin` (201, si el permiso del seed está vigente).
8. Enviar `companyId` extra en body/query de los módulos corregidos y verificar que no cambia el ámbito.
9. Revocar una sesión ajena por ID y confirmar 404.
10. Confirmar que logout desactiva todas las sesiones activas del usuario, no solo la de la IP actual.
