# ETAPA 1.3.6 — EJECUCIÓN AUTORIZADA DEL SEED

**Fecha:** 26 de noviembre de 2026.
**Comprobaciones previas:** 11:22:39.
**Primera ejecución:** 11:22:51 – 11:22:52.
**Conclusión:** **EJECUCIÓN FALLIDA**.

La ejecución se detuvo inmediatamente después del fallo. **No se realizó la segunda ejecución** de prueba de idempotencia, tal como exige el procedimiento autorizado.

---

## 1. Base utilizada

| Dato | Valor |
|---|---|
| Servidor | PostgreSQL 18.3 local para Windows (`postgresql-x64-18`) |
| Host y puerto | `localhost:5432` |
| Base de datos | `smartcana` |
| Usuario conectado | `smartcana` |
| Schema | `public` |
| Directorio de ejecución | `apps/backend` |
| Comando autorizado | `npm run prisma:seed` (`ts-node --esm prisma/seed.ts`) |

Identidad confirmada antes y después del intento: `smartcana|smartcana|public`.

## 2. Comprobaciones previas

Todas coincidieron con lo esperado; por eso se autorizó el intento.

| Comprobación | Resultado |
|---|---|
| Base y usuario | `smartcana` / `smartcana` |
| Servidor | PostgreSQL 18.3 local |
| Migración inicial | `20261126100330_init` aplicada, terminada, `applied_steps_count=1`, sin rollback |
| `migrate status` | `Database schema is up to date!`, exit `0` |
| Tablas de dominio | 20 tablas, todas con `0` filas |
| `_prisma_migrations` | 1 fila |
| Seed revisado en 1.3.5 | 784 líneas; `import "dotenv/config";` presente; `git diff --stat` = 1 inserción |

## 3. Resultado de la primera ejecución

**Comando:** `npm run prisma:seed`, desde `apps/backend`, con la configuración y `DATABASE_URL` del `.env` existente.

**Código de salida:** `1` (fallo).

**Salida completa del comando** (sin secretos):

```text
> backend@0.0.1 prisma:seed
> ts-node --esm prisma/seed.ts

(node:28548) [DEP0180] DeprecationWarning: fs.Stats constructor is deprecated.
(Use `node --trace-deprecation ...` to show where the warning was created)
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\apps\backend\src\generated\prisma\client.js' imported from ...\apps\backend\prisma\seed.ts
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:865:10)
    at defaultResolve (node:internal/modules/esm/resolve:991:11)
    at nextResolve (node:internal/modules/esm/hooks:785:28)
    at resolve (...\node_modules\ts-node\dist\child\child-loader.js:15:125)
    at nextResolve (node:internal/modules/esm/hooks:785:28)
    at AsyncLoaderHooksOnLoaderHookWorker.resolve (...\node_modules\ts-node\dist\child\esm.js:269:30)
    at MessagePort.handleMessage (node:internal/event_target:843:20)
    at MessagePort.<anonymous> (node:internal/per_context/messageport:23:28)
    at [nodejs.internal.kHybridDispatch] (node:internal/event_target:843:20)
    at Function.emit (node:events:519:28)
    at MessagePort.<anonymous> (node:worker_threads:132:28) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///.../apps/backend/src/generated/prisma/client.js'
}
npm error Lifecycle script `prisma:seed` failed with error:
npm error code 1
npm error path ...\apps\backend
npm error workspace backend@0.0.1
npm error location ...\apps\backend
npm error command failed
npm error command C:\WINDOWS\system32\cmd.exe /d /s /c ts-node --esm prisma/seed.ts
```

**Error exacto:** `ERR_MODULE_NOT_FOUND: Cannot find module '.../src/generated/prisma/client.js'`.

**Diagnóstico de solo lectura:** el seed importa `../src/generated/prisma/client.js`, pero en `apps/backend/src/generated/prisma/` existe `client.ts` y **no existe** `client.js` ni `client.d.ts`. El generador del esquema es `prisma-client` con salida TypeScript, y `ts-node --esm` no resolvió el especificador `.js` al archivo `.ts` en este entorno. La falla es de resolución de módulo al arrancar el script: **no se llegó a crear ningún registro, ni a ejecutar ninguna consulta de escritura**.

No se aplicó ninguna corrección: cambiar el import, regenerar el cliente, modificar el script o la configuración quedan fuera de la autorización concedida.

## 4. Resultado de la segunda ejecución

**No se ejecutó.** El procedimiento autorizado indica que la segunda pasada solo se realiza si la primera termina correctamente. La primera terminó con exit `1`, por lo que la prueba de idempotencia queda **pendiente y sin datos sobre los cuales realizarse**.

## 5. Cantidad de registros por tabla y comparación entre ejecuciones

No hubo dos conjuntos de conteos que comparar. El conteo posterior al fallo, obtenido con consultas de solo lectura, confirma que la base sigue igual que antes del intento:

| Tabla | Antes | Después del fallo |
|---|---:|---:|
| `activities` | 0 | 0 |
| `activity_types` | 0 | 0 |
| `audit_logs` | 0 | 0 |
| `campaigns` | 0 | 0 |
| `companies` | 0 | 0 |
| `cost_categories` | 0 | 0 |
| `costs` | 0 | 0 |
| `farms` | 0 | 0 |
| `field_alerts` | 0 | 0 |
| `field_statuses` | 0 | 0 |
| `fields` | 0 | 0 |
| `harvests` | 0 | 0 |
| `permissions` | 0 | 0 |
| `role_permissions` | 0 | 0 |
| `roles` | 0 | 0 |
| `sessions` | 0 | 0 |
| `settings` | 0 | 0 |
| `suppliers` | 0 | 0 |
| `users` | 0 | 0 |
| `varieties` | 0 | 0 |
| `_prisma_migrations` | 1 | 1 |

**Comparación:** sin diferencias. No se crearon 1 empresa, 1 establecimiento, 1 proveedor, 7 roles, 44 permisos, 3 usuarios, 3 campos, 6 actividades, 6 costos, 3 cosechas, 3 alertas, 4 estados de campo, 3 variedades, 2 campañas, 6 tipos de actividad, 4 categorías de costos, 1 configuración ni 161 relaciones rol-permiso.

## 6. Verificación de relaciones

No hay registros que relacionar: las 20 tablas de dominio están vacías y las 29 claves foráneas de la migración no fueron ejercitadas por el seed. La migración sigue aplicada (`20261126100330_init`, terminada, sin rollback).

## 7. Verificación de usuarios y roles

No existen usuarios ni roles en la base; por lo tanto no se pudo verificar la pertenencia a la empresa, la asignación de roles ni la ausencia del rol `super_admin` entre los usuarios demo. Tampoco hay hashes de contraseñas que comprobar: no se creó ninguno y no se muestra ningún secreto en este informe.

Las comprobaciones de hashing bcrypt y de asignación de roles quedan **pendientes**, y corresponden a una reintentada autorizada del seed.

## 8. Confirmación de ausencia de duplicados

La base está vacía, así que no hay duplicados ni registros alterados. La idempotencia del seed sigue siendo solo una conclusión estática de la etapa 1.3.5: **no fue confirmada en runtime**.

## 9. Errores o advertencias

- **Error bloqueante:** `ERR_MODULE_NOT_FOUND`, módulo `../src/generated/prisma/client.js` no encontrado desde `prisma/seed.ts`. Exit `1`.
- **Advertencia no bloqueante:** `[DEP0180] DeprecationWarning: fs.Stats constructor is deprecated`, emitida por `ts-node`/Node antes del error. No causó el fallo.
- No hubo errores de base de datos, de conexión ni de restricciones únicas: el script no llegó a conectarse.
- No se realizó ninguna reparación automática ni se ejecutó un comando alternativo.

## 10. Confirmación de alcance

Dentro de lo autorizado:

- Se ejecutó **una sola vez** `npm run prisma:seed` desde `apps/backend`, con el `.env` existente.
- Se realizaron verificaciones de solo lectura antes y después.

Fuera de lo autorizado y, por lo tanto, **no realizado**:

- No se ejecutó una segunda pasada del seed.
- No se ejecutaron migraciones, `db push` ni `migrate reset`.
- No se ejecutaron `DROP`, `TRUNCATE`, `DELETE` ni ninguna otra escritura manual.
- No se modificaron el esquema, el seed, el cliente generado, los scripts, la configuración ni `.env`.
- No se cambiaron credenciales, contraseñas ni roles.
- No se instalaron dependencias ni PostGIS.
- No se hicieron commits ni push.

---

## Conclusión

**EJECUCIÓN FALLIDA.**

El seed no pudo iniciar por un problema de resolución de módulo (`client.js` inexistente frente a `client.ts` generado). La base permanece exactamente como estaba: 20 tablas de dominio vacías y migración inicial aplicada. No se ejecutó la prueba de idempotencia.

Se requiere una autorización independiente para cualquier corrección del entorno de ejecución y una nueva autorización para volver a intentar el seed. No se avanzó a otras tareas.
