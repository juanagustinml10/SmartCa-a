# ETAPA 1.3.3 — VALIDACIÓN PREVIA DE MIGRACIONES

**Fecha:** 26 de noviembre de 2026
**Alcance:** auditoría y validación exclusivamente en modo lectura y offline. No se aplicó la migración, no se ejecutó el seed y no se modificó ningún archivo del proyecto salvo este informe.
**Restricciones respetadas:** no se ejecutaron `migrate deploy`, `migrate dev`, `db push`, `migrate reset` ni seed; no se ejecutó ninguna sentencia SQL de escritura; no se modificaron `.env`, `schema.prisma`, migraciones, seed, configuración de PostgreSQL, roles ni bases; no se hicieron commits ni push. No se muestran contraseñas ni URLs completas.

---

## 1. Archivos revisados

Se leyeron íntegramente los cuatro archivos solicitados:

| Archivo | Líneas | SHA-256 (prefijo) |
|---|---:|---|
| `apps/backend/prisma/schema.prisma` | 470 | `E44EFD358EC71B65...` |
| `apps/backend/prisma/migrations/20261126100330_init/migration.sql` | 503 | `02FBB8957DB41635...` |
| `apps/backend/prisma/migrations/migration_lock.toml` | 3 | `D6BAE7899F05DA95...` |
| `apps/backend/prisma.config.ts` | 12 | `AC5FFAF59739097D...` |

Configuración confirmada:

- `prisma.config.ts` importa `dotenv/config`, apunta a `prisma/schema.prisma`, usa `prisma/migrations` como directorio de migraciones y toma `datasource.url` de `process.env["DATABASE_URL"]`.
- `migration_lock.toml` declara `provider = "postgresql"`, coherente con `datasource db { provider = "postgresql" }`.
- `schema.prisma` usa el generador `prisma-client` con salida `../src/generated/prisma`.
- Existe una sola migración (`20261126100330_init`) y ninguna otra carpeta de migración.

---

## 2. Validaciones realizadas y resultados

| Validación | Comando / método | Resultado |
|---|---|---|
| Sintaxis del esquema | `npx prisma validate` | EXIT `0` — `The schema at prisma\schema.prisma is valid 🚀`. |
| Esquema vs. migración | `npx prisma migrate diff --from-empty --to-schema=prisma/schema.prisma --script` | EXIT `0`. El SQL generado es **idéntico** al contenido de `migration.sql` (504 vs. 503 líneas por el salto final; iguales tras normalizar fin de línea). |
| Typecheck del backend | `npx tsc --noEmit --pretty false --project tsconfig.json` | EXIT `0`, sin errores ni advertencias. No se generaron archivos. |
| Estado de migraciones | `npx prisma migrate status` | EXIT `1` por migración pendiente, no por error de conexión. Reporta 1 migración encontrada y `20261126100330_init` sin aplicar. |
| Versión del servidor | `SELECT version();` | PostgreSQL 18.3 local. |
| Tablas de usuario | `information_schema.tables` | `0`. |
| `_prisma_migrations` | `to_regclass('public._prisma_migrations')` | `NO_EXISTE`. |

La comparación `migrate diff` se hizo entre un datamodel vacío y el esquema Prisma, sin usar `--from-config-datasource` ni `--from-migrations`, para no requerir base shadow ni escribir en la base real. La ayuda de Prisma 7 confirma que `migrate diff` es un comando de solo lectura.

---

## 3. Compatibilidad con PostgreSQL 18.3

### 3.1 Tipos y sintaxis

Todos los tipos usados por la migración son nativos y soportados en PostgreSQL 18.3:

| Tipo PostgreSQL | Uso en la migración |
|---|---|
| `UUID` | 20 claves primarias y columnas de relación |
| `VARCHAR(n)` | textos acotados (`200`, `100`, `50`, `20`, `10`, `7`, `5`, `300`, `500`) |
| `TEXT` | textos largos y hashes |
| `TIMESTAMP(3)` | `created_at`, `updated_at`, `deleted_at`, `last_*` |
| `DATE` | fechas de campaña, actividad, coste y cosecha |
| `DECIMAL(p,s)` | áreas, coordenadas, precios, toneladas y porcentajes |
| `INTEGER` | `sort_order`, `ratoon_number`, `health_score`, `shi_score` |
| `BOOLEAN` | flags `is_system`, `is_active`, `requires_*` |
| `JSONB` | `old_values`, `new_values`, `characteristics`, `attachments` |

La única función integrada utilizada es `CURRENT_TIMESTAMP`, disponible sin extensiones. No hay tipos `SERIAL`, `IDENTITY`, `ENUM`, `geometry`, `geography` ni `Unsupported`.

### 3.2 Dependencias y extensiones

- `CREATE EXTENSION`: **0**. No se instala nada.
- Extensiones instaladas en la base: solo `plpgsql`.
- `CREATE SCHEMA IF NOT EXISTS "public"`: una sola sentencia, idempotente. El schema `public` ya existe y es propiedad de `pg_database_owner`; `smartcana` tiene privilegio `CREATE` sobre él por ser propietario de la base, por lo que la sentencia no debería fallar ni alterar nada.
- Todas las tablas se crean sin calificar el schema, resolviendo a `public`, que es el schema por defecto de la conexión.
- Las 29 claves foráneas se añaden después de crear las 20 tablas, por lo que no hay referencias adelantadas.

### 3.3 Permisos del ejecutor

Consultas de solo lectura confirmaron que `smartcana` es propietario de la base y tiene permiso `CREATE` en `public`. No se requiere superusuario.

### 3.4 Resultado de compatibilidad

No se detectaron problemas de sintaxis, tipos, funciones, restricciones ni dependencias que impidan ejecutar la migración en PostgreSQL 18.3. La validación es estática y mediante el generador de Prisma; no se ejecutó el DDL porque la etapa lo prohíbe.

---

## 4. Operaciones destructivas o inesperadas

Análisis del SQL de la migración:

| Patrón | Ocurrencias |
|---|---:|
| `CREATE TABLE` | 20 |
| `PRIMARY KEY` | 20 |
| `CREATE UNIQUE INDEX` | 11 |
| `CREATE INDEX` (no único) | 7 |
| `ALTER TABLE ... ADD CONSTRAINT` | 29 |
| `DROP` (inicio de sentencia) | 0 |
| `TRUNCATE` | 0 |
| `DELETE FROM` | 0 |
| `INSERT` / `UPDATE` / `COPY` | 0 / 0 / 0 |
| `ALTER COLUMN` / `DROP CONSTRAINT` | 0 / 0 |
| `ALTER DATABASE` / `ALTER ROLE` / `CREATE ROLE` | 0 / 0 / 0 |
| `GRANT` / `REVOKE` | 0 / 0 |
| `CREATE EXTENSION` | 0 |
| Tablas en schemas ajenos | 0 |

Las 29 apariciones de `ON DELETE` son cláusulas de clave foránea, no sentencias `DELETE`. No hay operaciones sobre roles, bases, datos ni otros schemas. La migración es puramente de creación de objetos.

---

## 5. Correspondencia entre el esquema Prisma y el SQL

La comparación byte a byte entre el SQL generado desde `schema.prisma` y `migration.sql` dio **idéntico**. Además, se verificó estructura por estructura:

| Elemento | Esquema Prisma | Migración SQL | Coincidencia |
|---|---:|---:|---|
| Modelos / tablas | 20 | 20 | Sí |
| Claves primarias | 20 (`@id`) | 20 (`*_pkey`) | Sí |
| Índices únicos | 11 (`@unique`, `@@unique`) | 11 `CREATE UNIQUE INDEX` | Sí |
| Índices normales | 7 (`@@index`) | 7 `CREATE INDEX` | Sí |
| Relaciones | 29 | 29 `FOREIGN KEY` | Sí |
| `ON DELETE` | 17 `RESTRICT`, 9 `SET NULL`, 3 `CASCADE` | Igual | Sí |
| `ON UPDATE` | `Cascade` por defecto | 29 `ON UPDATE CASCADE` | Sí |

Tablas creadas (20): `companies`, `roles`, `permissions`, `role_permissions`, `users`, `sessions`, `farms`, `settings`, `audit_logs`, `field_statuses`, `varieties`, `campaigns`, `activity_types`, `cost_categories`, `suppliers`, `fields`, `field_alerts`, `activities`, `costs`, `harvests`.

Detalles comprobados:

- Los campos opcionales (`String?`, `Decimal?`, `DateTime?`, `Json?`) se crean sin `NOT NULL`.
- Los valores por defecto de texto, booleanos, enteros y JSON se trasladan correctamente (`'es-AR'`, `'ARS'`, `'active'`, `false`, `true`, `0`, `1`, `'#6B7280'`, `'#1DB85E'`, `'{}'`, `'[]'`).
- `@default(now())` se traduce a `DEFAULT CURRENT_TIMESTAMP`.
- `@db.Date` → `DATE`, `@db.Decimal(10,7)` → `DECIMAL(10,7)`, `@db.Uuid` → `UUID`, `Json` → `JSONB`.
- Los nombres con `@map` se respetan (`company_id`, `created_at`, etc.). Los campos sin `@map` en `Variety` (`potentialYieldMin`, `soilPreference`, etc.) y `Field.soilType` permanecen en camelCase en la base, tal como declara Prisma.

### 5.1 Diferencias encontradas

**No se encontraron diferencias** entre el esquema y la migración que puedan provocar errores al aplicarla ni pérdida de información. La base está vacía, por lo que no hay datos que puedan verse afectados.

### 5.2 Observaciones de diseño (no son diferencias)

1. `@default(uuid())` no genera un `DEFAULT` en la base: Prisma calcula el UUID en el cliente. Inserciones directas por SQL deben proporcionar `id`.
2. `@updatedAt` no crea un disparador en la base: Prisma actualiza el valor. Inserciones directas deben proporcionar `updated_at`.
3. `AuditLog` tiene `userId` y `companyId`, pero no declara relaciones; por tanto no hay claves foráneas hacia `users` ni `companies`. Es una decisión de diseño deliberada o una limitación, no un error de la migración.
4. La mezcla de nombres snake_case y camelCase en `varieties` y `fields.soil_type`/`soilType` es inconsistente, pero coincide exactamente entre esquema y SQL.

---

## 6. Estado real de GIS / PostGIS

| Comprobación | Resultado |
|---|---|
| `geometry`, `geography`, `Unsupported(` en `schema.prisma` | 0 apariciones |
| `geometry`, `geography`, `postgis`, funciones `ST_*` en `migration.sql` | 0 apariciones |
| Referencias GIS en `apps/backend/src` | 0 apariciones |
| `CREATE EXTENSION` en la migración | 0 |
| Extensiones instaladas en la base | Solo `plpgsql` |
| PostGIS disponible en el servidor (`pg_available_extensions`) | `NO_DISPONIBLE` |
| Imagen del compose | `postgis/postgis:16-3.4`, contenedor `smartcana-db`, **no utilizado** |

El soporte geográfico real se limita a dos columnas numéricas: `farms.latitude` / `farms.longitude` y `fields.latitude` / `fields.longitude`, todas `DECIMAL(10,7)`. No hay tipos espaciales, índices espaciales ni funciones PostGIS.

**Conclusión GIS:** las funcionalidades geográficas **no están operativas a nivel de base de datos**. No se instaló PostGIS ni se modificó la arquitectura. Si más adelante se requieren consultas espaciales, hará falta una decisión independiente (instalar PostGIS en PostgreSQL 18 o utilizar el contenedor del compose), con su propia autorización.

---

## 7. Confirmación de que no se modificó la base

Tras todas las consultas y validaciones:

- Tablas de usuario: `0` (idéntico al estado inicial de la etapa 1.3.2).
- `public._prisma_migrations`: `NO_EXISTE`.
- `migrate status`: sigue reportando `20261126100330_init` como pendiente.
- No se ejecutó DDL, DML, seed ni `prisma db execute` con sentencias de escritura.
- No se crearon ni eliminaron roles, bases, extensiones ni objetos de esquema.

---

## 8. Riesgos detectados

1. **GIS no operativo:** el compose describe PostGIS 16 pero el servidor real es PostgreSQL 18 sin PostGIS disponible. Las coordenadas son solo decimales. Documentado arriba; no bloquea la migración.
2. **Valores por defecto calculados en cliente:** `uuid()` y `@updatedAt` no existen como defaults/triggers en la base. Solo relevante para inserciones fuera de Prisma.
3. **Auditoría sin FK:** `audit_logs` no valida referencias a usuarios/compañías. Puede conservar registros huérfanos por diseño.
4. **Nomenclatura mixta:** columnas camelCase en `varieties` y `fields.soilType`. No afecta a Prisma ni a la migración.
5. **Migración única y sin `_prisma_migrations`:** la primera aplicación creará las 20 tablas y la tabla de control. Es el comportamiento esperado; debe ejecutarse solo con autorización independiente.
6. **Seed pendiente:** `seed.ts` sigue sin importar `dotenv/config`; su corrección propuesta no se aplicó. El seed no se ejecutó.

No se detectaron riesgos de pérdida de datos porque la base destino está vacía y la migración no contiene operaciones destructivas.

---

## 9. Recomendación final

**APTA CON OBSERVACIONES**

La migración `20261126100330_init` es correcta, completa y coincide exactamente con el esquema Prisma actual. No contiene operaciones destructivas, no requiere extensiones ni permisos especiales y es compatible con PostgreSQL 18.3. Nada impide su ejecución.

Las observaciones que deben quedar documentadas son el estado no operativo de GIS/PostGIS, los defaults calculados en cliente, la ausencia de FK en `audit_logs` y la nomenclatura mixta. Ninguna exige corregir la migración antes de aplicarla.

No se aplicó la migración. Se requiere una autorización independiente del usuario para ejecutarla en una etapa posterior, seguida de una verificación de tablas, `_prisma_migrations` y `migrate status`. Tampoco se ejecutó el seed.
