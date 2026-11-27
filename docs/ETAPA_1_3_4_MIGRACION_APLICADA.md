# ETAPA 1.3.4 — MIGRACIÓN INICIAL APLICADA

## 1. Fecha y hora

- Comprobaciones previas: **2026-11-26 10:59:07**.
- Ejecución de la migración: **2026-11-26 10:59:15**.
- Verificación posterior: inmediatamente después de la ejecución, mismo día.

## 2. Base y servidor utilizados

| Dato | Valor |
|---|---|
| Servidor | PostgreSQL 18.3 local para Windows, servicio `postgresql-x64-18` |
| Host y puerto | `localhost:5432` |
| Base de datos | `smartcana` |
| Usuario conectado | `smartcana` |
| Schema | `public` |
| Configuración | `apps/backend/prisma.config.ts`, con `DATABASE_URL` desde `apps/backend/.env` |

Identidad confirmada por consulta de solo lectura antes de aplicar:

```text
smartcana|smartcana|public|PostgreSQL 18.3 on x86_64-windows, compiled by msvc-19.44.35225, 64-bit
```

## 3. Comprobaciones previas

Todas coincidieron con lo esperado; de haber fallado alguna, se habría detenido la ejecución.

| Comprobación | Resultado |
|---|---|
| Base apuntada | `smartcana` |
| Usuario conectado | `smartcana` |
| Schema activo | `public` |
| Tablas de usuario antes | `0` |
| `_prisma_migrations` antes | `NO_EXISTE` |
| Extensiones antes | Solo `plpgsql` |
| Migraciones presentes | Una sola: `20261126100330_init` |
| `migration_lock.toml` | `provider = "postgresql"` |
| `migrate status` antes | Pendiente: `20261126100330_init` |

## 4. Migración ejecutada

Únicamente `20261126100330_init`. No se crearon nuevas migraciones.

**Comando autorizado y ejecutado** (desde `apps/backend`):

```text
npx prisma migrate deploy
```

**Salida completa del comando** (sin secretos; se omite únicamente la línea de envoltorio `stderr` de PowerShell):

```text
Loaded Prisma config from prisma.config.js.
Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "smartcana", schema "public" at "localhost:5432"

1 migration found in prisma/migrations

Applying migration `20261126100330_init`

The following migration(s) have been applied:

migrations/
  └─ 20261126100330_init/
    └─ migration.sql

All migrations have been successfully applied.
```

**Código de salida:** `0`.

## 5. Tablas creadas

Hay **21 tablas** en el schema `public`: las **20 tablas de dominio** definidas en `schema.prisma` más la tabla de control `_prisma_migrations`.

```text
_prisma_migrations
activities
activity_types
audit_logs
campaigns
companies
cost_categories
costs
farms
field_alerts
field_statuses
fields
harvests
permissions
role_permissions
roles
sessions
settings
suppliers
users
varieties
```

Comparación automática contra la lista esperada: `sin_diferencias=True`. No se creó ninguna tabla ajena al esquema esperado. Todas las tablas de usuario del servidor están en `public` (`public|21`); no hay tablas en otros schemas de usuario.

## 6. Restricciones e índices

| Elemento | Cantidad | Resultado |
|---|---:|---|
| Claves primarias | 21 | 20 de dominio + 1 de `_prisma_migrations` |
| Claves foráneas | 29 | Coincide con la auditoría de la etapa 1.3.3 |
| Índices declarados (sin contar PK) | 18 | Coincide con la auditoría de la etapa 1.3.3 |

Índices verificados:

```text
activity_types_code_key
audit_logs_action_idx
audit_logs_company_id_idx
audit_logs_created_at_idx
audit_logs_entity_idx
audit_logs_user_id_idx
campaigns_code_key
companies_cuit_key
cost_categories_code_key
field_statuses_code_key
permissions_code_key
role_permissions_role_id_permission_id_key
roles_company_id_code_key
sessions_is_active_idx
sessions_user_id_idx
settings_company_id_key_key
users_email_key
varieties_code_key
```

## 7. Estado de `_prisma_migrations`

- Existe: sí (`to_regclass('public._prisma_migrations')` → `_prisma_migrations`).
- Filas: `1`.
- Registro: `20261126100330_init | terminada=t | applied_steps_count=1 | no_revertida=t`.

Es decir, la migración quedó registrada como aplicada correctamente y sin rollback.

## 8. Resultado de `migrate status`

```text
Datasource "db": PostgreSQL database "smartcana", schema "public" at "localhost:5432"

1 migration found in prisma/migrations

Database schema is up to date!
```

**Código de salida:** `0`. No hay migraciones pendientes.

## 9. Resultado de `prisma validate`

```text
Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
```

**Código de salida:** `0`.

## 10. Errores o advertencias

- No hubo errores durante `migrate deploy` ni en las verificaciones posteriores.
- El `exit 1` de `migrate status` anterior a la migración era el estado esperado por tener una migración pendiente; después de aplicarla pasó a `exit 0`.
- No se instalaron extensiones: la única presente sigue siendo `plpgsql`.
- Se mantienen las observaciones ya documentadas en la etapa 1.3.3: PostGIS no está disponible, `uuid()` y `@updatedAt` se resuelven en el cliente, `audit_logs` no tiene claves foráneas y hay columnas con nomenclatura mixta. Ninguna impidió la migración.

## 11. Confirmación de que no se ejecutó el seed

**No se ejecutó el seed.** No se insertaron datos de demostración. La base contiene únicamente la estructura creada por la migración y el registro de control de migraciones.

## 12. Confirmación de alcance

No se realizó ninguna operación fuera de la autorización concedida:

- No se ejecutaron `migrate dev`, `db push`, `migrate reset` ni nuevas migraciones.
- No se ejecutaron `DROP`, `TRUNCATE` ni `DELETE`.
- No se modificaron usuarios, roles, permisos, contraseñas ni configuración del servidor.
- No se instalaron PostGIS ni extensiones.
- No se modificaron `schema.prisma`, los archivos de migración, `.env` ni el seed.
- No se hicieron commits ni push.

---

**Estado final:** migración inicial aplicada correctamente; esquema actualizado; base `smartcana` lista para la siguiente etapa. No se avanzó a la carga de datos de demostración: requiere autorización independiente.
