# ETAPA 1.2 — BASE DE DATOS, MIGRACIONES Y SEED

**Fecha:** 26 de noviembre de 2026
**Referencias:** `docs/AUDITORIA_INTEGRAL_SMARTCANA.md`, `docs/ETAPA_1_1_SEGURIDAD_AUTENTICACION.md`, `apps/backend/prisma/schema.prisma`, `apps/backend/prisma.config.ts`
**Alcance:** reproducibilidad de la base de datos: historial de migraciones, seed UUID idempotente y procedimiento desde cero.
**Restricciones respetadas:** no se ejecutaron migraciones, `db push` ni seed contra PostgreSQL; no se borraron ni modificaron datos; no se tocó ningún `.env`; no se cambió el esquema, la arquitectura ni los módulos; no se hicieron commits ni push; no se avanzó a la siguiente etapa.

---

## 1. Cómo leer este informe

| Estado | Significado |
|---|---|
| **IMPLEMENTADO** | El cambio existe en el árbol de trabajo y fue verificado por inspección o comandos offline. |
| **PROBADO OFFLINE** | Existe un comando ejecutado en este entorno, con resultado registrado, que **no** requiere PostgreSQL. |
| **PENDIENTE DE POSTGRESQL REAL** | Requiere una base de datos real. No se ejecutó por restricción explícita. No se presenta como resuelto. |

Distinción crítica: **toda la validación de esta etapa es estática u offline**. Ninguna comprobación demostró que `migrate deploy` o el seed funcionen contra un servidor PostgreSQL.

---

## 2. Resumen ejecutivo

- **IMPLEMENTADO:** migración inicial versionada (`20261126100330_init`) que representa exactamente los 20 modelos actuales; `migration_lock.toml`; `prisma/migrations/` dejó de estar ignorado por Git; seed reescrito con UUID deterministas, `upsert` y datos demo coherentes.
- **PROBADO OFFLINE:** `prisma validate`, `prisma generate`, typecheck backend, typecheck aislado del seed, igualdad byte a byte entre la migración y un diff regenerado, 3400 UUID generados por el helper sin inválidos ni duplicados, 19 tests unitarios, 1 test e2e y builds de backend y frontend.
- **PENDIENTE DE POSTGRESQL REAL:** aplicar la migración, ejecutar el seed dos veces para confirmar idempotencia en BD, login con las credenciales demo, reportes con `price_per_ton` y verificación de FK/índices en un servidor.
- **No se agregaron** extensiones PostGIS, índices, CHECKs, enums ni campos nuevos: el esquema actual no los declara y agregarlos habría cambiado el alcance de esta etapa.

---

## 3. Estado inicial

| Aspecto | Estado encontrado | Evidencia |
|---|---|---|
| Modelos Prisma | 20 modelos, 0 enums | `apps/backend/prisma/schema.prisma` |
| Migraciones | **No existían**; directorio ausente y explícitamente ignorado | `.gitignore:39`, sin `prisma/migrations/` |
| `migration_lock.toml` | Ausente | búsqueda global |
| Seed | 44 permisos, 7 roles, 1 empresa, 1 establecimiento, 10 campos, 17 actividades, 12 costos, 4 cosechas, 6 alertas; sin `Supplier`, `Setting`, `Session` ni `AuditLog` | `prisma/seed.ts`, auditoría §7.5 |
| PostgreSQL / PostGIS | Imagen `postgis/postgis:16-3.4` en Docker, pero esquema sin `geometry`, `Unsupported`, extensiones ni índices GiST | `docker/docker-compose.yml:3`, auditoría §7.6 |
| Prisma | 7.9.1, generator `prisma-client`, `output = "../src/generated/prisma"`, URL inyectada desde `prisma.config.ts` | `npx prisma --version`, `prisma.config.ts` |
| Base de datos real | No se consultó en ningún momento | restricción de la etapa |

No se asumió que el esquema coincidiera con una BD real: la migración se generó **desde el esquema Prisma actual**, no desde una BD existente.

---

## 4. Problemas detectados

| # | Problema | Evidencia | Resolución en esta etapa |
|---|---|---|---|
| 1 | Sin historial de migraciones: no había forma de aplicar el esquema con `migrate deploy` | auditoría §7.4 | Migración inicial generada y versionada |
| 2 | `prisma/migrations/` ignorado por Git | `.gitignore:39` | Se quitó la regla ignore |
| 3 | IDs del seed (`default-company`, `default-farm`, `el-talita`, IDs compuestos) incompatibles con columnas `@db.Uuid` | auditoría §7.5, `schema.prisma:15,154,329,380` | UUID v4 deterministas en todas las entidades |
| 4 | Seed no idempotente: `cost.create`, `harvest.create`, `fieldAlert.create` | `seed.ts:428-499` | `upsert` con IDs fijos / claves naturales; `createMany(..., skipDuplicates: true)` |
| 5 | `Math.random()` en sacarosa y humedad | `seed.ts:470-471` | Valores fijos deterministas |
| 6 | Contraseña demo `admin123` y único usuario con rol `admin` | `seed.ts:306` | Contraseña demo explícitamente de desarrollo; 3 usuarios sin `super_admin` |
| 7 | Sin datos para probar ajustes y proveedores; `price_per_ton` ausente | auditoría §7.5, `reports.repository.ts:699` | Se siembran `Setting(price_per_ton)` y un `Supplier` demo |
| 8 | Fechas no deterministas (`new Date()` en `shiCalculatedAt`) | `seed.ts:357` | Fecha fija |
| 9 | Artefactos de cliente generados podían estar desactualizados | `src/generated/prisma/` | Se regeneró el cliente con `prisma generate` |

---

## 5. Modelos y relaciones revisados

Revisión exhaustive de los 20 modelos de `apps/backend/prisma/schema.prisma`: **Company, Role, Permission, RolePermission, User, Session, Farm, Setting, AuditLog, FieldStatus, Variety, Campaign, ActivityType, CostCategory, Supplier, Field, FieldAlert, Activity, Cost, Harvest**.

### 5.1 Identificadores y relaciones

- Las 20 tablas tienen PK `id UUID` con `@default(uuid()) @db.Uuid`.
- 29 foreign keys generadas por Prisma. Las relaciones `RolePermission → Role/Permission` y `Session → User` usan `ON DELETE CASCADE`; las opcionales (`Farm`, `Variety`, `Campaign`, `Supplier`, `Activity`, `User` en `Cost`/`Harvest`) usan `ON DELETE SET NULL`; el resto `ON DELETE RESTRICT`.
- Catálogos globales sin `companyId`: `Campaign`, `Variety`, `FieldStatus`, `ActivityType`, `CostCategory` y `Permission`. Esto coincide con la decisión de la ETAPA 1.1 de tratar `cost-categories` y `permissions` como catálogos globales.
- Entidades con `companyId`: `Company`, `Role`, `User`, `Farm`, `Setting`, `Supplier`, `Cost`, `Harvest`. `Field`, `Activity`, `FieldAlert` y `Session` derivan el tenant por su relación con `Farm`/`User`. `AuditLog` guarda `companyId` y `userId` sin FK, tal como está definido en el esquema.

### 5.2 Índices y restricciones

- 18 índices en la migración: únicos por `cuit`, `code`, `email`, `(companyId, code)`, `(roleId, permissionId)`, `(companyId, key)`, e índices normales en `Session`, `AuditLog`.
- Defaults y longitudes (`VARCHAR`, `DECIMAL(12,2)`, `TIMESTAMP(3)`, `DATE`, `JSONB`) se conservan tal cual.
- Los nombres de columna sin `@map` (`soilType`, `potentialYieldMin`, `diseaseTolerance`, etc.) se conservan literalmente: la migración refleja el esquema, no un renombrado "mejorado".
- **No se agregaron** los índices ni CHECKs sugeridos en la auditoría §7.3, ni `geometry`/GiST: eso implicaría modificar el esquema y queda como tarea pendiente de otra etapa.

---

## 6. Migraciones creadas

| Archivo | Contenido |
|---|---|
| `apps/backend/prisma/migrations/20261126100330_init/migration.sql` | Migración inicial. 20 `CREATE TABLE`, 29 foreign keys, 18 índices, `CREATE SCHEMA IF NOT EXISTS "public"`. Sin `CREATE EXTENSION`, `geometry` ni GiST. |
| `apps/backend/prisma/migrations/migration_lock.toml` | `provider = "postgresql"`. |
| `.gitignore` | Se eliminó `apps/backend/prisma/migrations/`; ahora las migraciones son versionables. |

Generación: `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`. No se usó `--from-config-datasource` ni `--from-migrations`: ninguno de los dos requirió conexión a PostgreSQL en la forma empleada, y no se quiso arriesgar una operación contra una BD real.

**Consistencia migración ↔ esquema:** se regeneró el diff y se compararon hashes SHA-256. Ambos son `02FBB8957DB41635FC853FEF51DE5A3A5F33009329A9D6F0E268E791A6EEB5C2` → `identical=True`. Esto demuestra que la migración es la representación exacta del esquema actual **en este entorno**; no sustituye la prueba de apply en PostgreSQL.

---

## 7. Cambios en el seed

`apps/backend/prisma/seed.ts` fue reescrito. Puntos clave:

### 7.1 Identificadores

Función determinista `uuid(group, index)` con formato `00000000-0000-4000-8000-<grupo><índice>`; 17 grupos (tenant, permisos, roles, usuarios, catálogos, campos, actividades, costos, cosechas, alertas, settings, rol-permiso). Verificación offline: 3400 UUIDs generados en los rangos usados, **0 inválidos y 0 duplicados** (regex de UUID v4 con variant RFC 4122).

### 7.2 Idempotencia

- Permisos y relaciones rol-permiso: `createMany(..., skipDuplicates: true)`.
- Catálogos por `code` (`fieldStatus`, `variety`, `campaign`, `activityType`, `costCategory`): `upsert` por `code`.
- Empresa: `upsert` por `cuit`; setting: `upsert` por `(companyId, key)`; roles: `upsert` por `(companyId, code)`; usuarios: `upsert` por `email`.
- Resto de entidades: `upsert` por su ID determinista.
- `update: {}` en todos los `upsert`: una segunda ejecución **no duplica** y **no sobrescribe** cambios hechos después del seed.

### 7.3 Datos demo incluidos

| Entidad | Cantidad | Observación |
|---|---|---|
| Permisos | 44 | Igualdad verificada con `PermissionCode` de `@smartcana/types` y los `@Permissions` del backend |
| Roles | 7 | Incluye `super_admin` solo en el catálogo; **ningún usuario demo lo tiene** |
| Relaciones rol-permiso | 161 | Derivadas de las definiciones de roles |
| Usuarios | 3 | `admin`, `ingeniero`, `operador`; mismo hash bcrypt de la contraseña demo |
| Empresa / establecimiento / proveedor | 1 / 1 / 1 | Tenant único de demostración |
| Setting | 1 | `price_per_ton = 45000`, usado por `reports.repository.ts:699` |
| Estados / variedades / campañas / tipos de actividad / categorías de costo | 4 / 3 / 2 / 6 / 4 | Catálogos globales |
| Campos / actividades / costos / cosechas / alertas | 3 / 6 / 6 / 3 / 3 | Datos coherentes entre sí (mismos nombres de campo, campañas y variedades) |

### 7.4 Seguridad y credenciales demo

- `DATABASE_URL` se valida al inicio: si falta o vale `CAMBIARME`, el seed falla con un mensaje claro. No se modificó ningún `.env`.
- Se eliminó `Math.random()` y la contraseña `admin123`.
- **Credenciales exclusivas de desarrollo** (no usar en producción): contraseña demo `SmartCañaDemo2026!` para:

| Email | Rol |
|---|---|
| `admin@smartcana.com` | `admin` |
| `ingeniero@smartcana.com` | `ingeniero` |
| `operador@smartcana.com` | `operador` |

- No se crea ningún usuario `super_admin`. El catalogo lo conserva porque `ROLE_RANK` de la ETAPA 1.1 lo define, pero queda sin asignar.

### 7.5 Limitación conocida del seed

Si la base ya contuviera registros con los mismos códigos pero IDs no UUID de un seed anterior, `upsert` por código no corrige esos IDs (para no modificar datos existentes) y el seed usa los IDs presentes. El procedimiento soportado es una BD creada desde cero con la migración incluida.

---

## 8. Comandos ejecutados y resultados

Todos ejecutados el 26/11/2026. Ninguno se conectó a PostgreSQL.

| Comando | Resultado |
|---|---|
| `npx prisma --version` | EXIT 0 — Prisma 7.9.1; Schema Engine `e922089b7d...`; Node v24.14.1 |
| `npx prisma validate` | EXIT 0 — "The schema ... is valid 🚀" |
| `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` | **EXIT 1** — Prisma 7 removió esa flag; indica usar `--to-schema` |
| `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output ...` | EXIT 0 — SQL de 503 líneas; 20 tablas, 29 FK, 18 índices, 0 marcadores PostGIS/extensión |
| `npx prisma generate` | EXIT 0 — cliente generado en `src/generated/prisma` en 198 ms |
| `npx tsc --noEmit -p apps/backend/tsconfig.json` | EXIT 0 |
| `npx tsc --noEmit --module nodenext --moduleResolution nodenext --target ES2023 --esModuleInterop --skipLibCheck --strictNullChecks --noImplicitAny --allowSyntheticDefaultImports prisma/seed.ts` | EXIT 0 — el seed se chequea por separado porque `tsconfig.json` lo excluye para evitar `TS6059` |
| Regeneración del diff + `Get-FileHash` SHA-256 | `identical=True` — migración y esquema coinciden byte a byte |
| Script Node de validación del helper UUID | `checked=3400`, `invalid=0`, `duplicates=0` |
| `git check-ignore -v apps/backend/prisma/migrations/.../migration.sql` | Sin coincidencia: la migración **no** está ignorada |
| `npm test --workspace=apps/backend` | EXIT 0 — 2 suites, **19/19 tests** |
| `npm run test:e2e --workspace=apps/backend` | EXIT 0 — 1 suite, **1/1 test** |
| `npm run build --workspace=apps/backend` | EXIT 0 (`nest build`) |
| `npm run build --workspace=apps/frontend` | EXIT 0 — 19 páginas generadas |
| `git status --short` | Cambios de ETAPA 1.1 y 1.2 sin commitear; sin push |

Nota: los comandos de Prisma informan `Loaded Prisma config from prisma.config.js.`; Prisma 7 compila `prisma.config.ts` a `prisma.config.js`. Ese archivo generado no se modificó manualmente.

---

## 9. Procedimiento documentado: base de datos desde cero

No ejecutado en esta etapa. Procedimiento previsto para cuando se autorice trabajar con PostgreSQL:

1. `cd docker` y levantar PostgreSQL: `docker compose up -d postgres` (imagen `postgis/postgis:16-3.4`, credenciales de desarrollo definidas en `docker/docker-compose.yml`). Esperar el healthcheck `pg_isready`.
2. En `apps/backend`, copiar `.env.example` a `.env` y completar valores reales. Ejemplo de `DATABASE_URL` coherente con el compose: `postgresql://smartcana:smartcana@localhost:5432/smartcana?schema=public`. Completar también `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL` y `PORT`. **No reutilizar los valores demo en producción.**
3. `cd apps/backend && npm install` (si el workspace aún no está instalado).
4. `npx prisma generate` — genera el cliente a partir del esquema.
5. `npx prisma migrate deploy` — aplica `20261126100330_init` a una BD vacía.
6. `npm run prisma:seed` — siembra datos demo de desarrollo. Repetir el paso para comprobar idempotencia.
7. `npm test --workspace=apps/backend` y `npm run test:e2e --workspace=apps/backend`.
8. Iniciar el backend (`npm run start:dev --workspace=apps/backend`) y probar `POST /auth/login` con las credenciales demo de §7.4.

Para un reinicio limpio **solo en desarrollo**: `npx prisma migrate reset --force` borra y vuelve a aplicar todo. No ejecutar contra una BD con datos reales.

---

## 10. Verificado offline vs. no probado

| Verificado sin conexión | Requiere PostgreSQL real |
|---|---|
| Sintaxis del esquema (`prisma validate`) | `prisma migrate deploy` aplicando la migración |
| Cliente Prisma generado (`prisma generate`) | `prisma migrate status` sobre la BD |
| Migración = esquema (hash idéntico al diff regenerado) | Ejecución del seed y segunda ejecución para confirmar idempotencia real |
| Typecheck backend y typecheck aislado del seed | Restricciones FK, índices y tipos `UUID`/`DECIMAL` en PostgreSQL |
| UUID del seed válidos y únicos (helper) | Login real con bcrypt y rehidratación JWT desde BD |
| 44 códigos de permiso = `PermissionCode` = `@Permissions` | Endpoints con `@Permissions` funcionando con los permisos sembrados |
| 19 tests unitarios + 1 e2e con mocks | Reportes leyendo `price_per_ton` y datos de cosechas/costos |
| Builds backend y frontend | Dos empresas con tenancy real (pendiente ya de la ETAPA 1.1) |
| Migración no ignorada por Git | Comportamiento de `ON DELETE CASCADE/SET NULL/RESTRICT` |

---

## 11. Riesgos y tareas pendientes

1. **Riesgo principal:** la migración nunca se aplicó. Un error de SQL o de permisos del rol PostgreSQL solo aparecerá en `migrate deploy`.
2. El seed nunca se ejecutó: la idempotencia está demostrada por construcción (`upsert` + IDs fijos), no por ejecución doble en BD.
3. `npx prisma generate` regeneró artefactos versionados en `apps/backend/src/generated/prisma/`. Son cambios esperados del generador 7.9.1; se documentan y no se revirtieron.
4. `update: {}` evita sobrescribir datos, pero tampoco corrige datos mal sembrados en el pasado. No se tocó ninguna BD existente.
5. La auditoría §7.3 sigue vigente: faltan índices en `Field`, `Activity`, `Cost`, `Harvest`, CHECKs y enums. No se agregaron porque habría cambiado el esquema.
6. PostGIS sigue sin implementarse: la imagen Docker lo incluye, pero no hay `geometry` ni GiST. La migración no agrega la extensión para no inventar funcionalidad.
7. `AuditLog` sigue sin FK hacia `User`/`Company`, según el esquema actual.
8. Queda pendiente la verificación de tenancy con dos empresas reales, heredada de la ETAPA 1.1.
9. El script `prisma:seed` (`ts-node --esm prisma/seed.ts`) **no se ejecutó**: el tipo del seed se verificó con `tsc`, pero el loader ESM de `ts-node` queda pendiente de comprobación en el entorno con PostgreSQL.
10. Las credenciales demo son de desarrollo: reproducirlas en producción sería un riesgo de seguridad.

---

## 12. Cierre

Se dejó la estructura preparada y segura: migración versionada, seed válido e idempotente por diseño y procedimiento documentado. **No se ejecutó ninguna operación sobre una base de datos real**, no se modificaron `.env`, no se borraron datos, no se hicieron commits ni push y no se avanzó a la siguiente etapa.
