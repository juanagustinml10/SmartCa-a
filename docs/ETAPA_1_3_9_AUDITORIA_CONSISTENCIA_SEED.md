# ETAPA 1.3.9 — Auditoría de consistencia del seed

**Fecha:** 2026-11-27 10:31–10:35 (hora local)
**Alcance:** auditoría exclusivamente de solo lectura. No se ejecutó el seed, migraciones ni ninguna escritura en PostgreSQL. No se modificaron informes anteriores, código, `.env` ni dependencias.

---

## 1. Contradicciones encontradas

### Contradicción principal

`docs/ETAPA_1_3_8_SEED_EJECUTADO.md:14` afirma:

> Los datos presentes corresponden a la ejecución única del seed ya realizada el 2026-11-26 23:04:31–23:04:35 (exit `0`), documentada en `docs/ETAPA_1_3_6_SEED_EJECUTADO.md`.

Pero `docs/ETAPA_1_3_6_SEED_EJECUTADO.md` documenta exactamente lo contrario:

- `:6` — Conclusión: **EJECUCIÓN FALLIDA**.
- `:44` — Código de salida: `1`.
- `:79` — Error `ERR_MODULE_NOT_FOUND` para `client.js`.
- `:93-115` — Las 20 tablas de dominio siguen en `0` filas después del fallo.
- `:161-163` — Conclusión: el seed no pudo iniciar; no se ejecutó la prueba de idempotencia.

**Explicación:** no se está hablando del mismo evento. 1.3.6 describe un **primer intento fallido** a las 11:22:51 del 2026-11-26 con el comando anterior `ts-node --esm prisma/seed.ts`. La ejecución exitosa de las 23:04:31 ocurrió **después** de la corrección de 1.3.7 y **no está documentada en ninguno de los cuatro informes**. 1.3.8 cometió un error de atribución al citar 1.3.6 como fuente de esa ejecución exitosa.

### Contradicción secundaria

- 1.3.7 `:103,142` dice que la ejecución real del seed está **pendiente** y que solo se validó una carga controlada.
- 1.3.8 `:82` encuentra los 18 conteos de dominio ya poblados.

Ambas afirmaciones son verdaderas en su momento: 1.3.7 cerró con la base vacía; la carga real ocurrió más tarde, fuera del registro documental de esas etapas.

### Consecuencia

La idempotencia **sigue siendo una conclusión estática** (1.3.5 `:99`, 1.3.6 `:131`, 1.3.7 `:144`). Ninguna de las cuatro etapas ejecutó la segunda pasada. La base contiene el resultado de **una sola ejecución exitosa**, además de un intento fallido anterior que no escribió nada.

---

## 2. Cronología reconstruida

| Fecha / hora | Etapa | Comando | Exit | Estado de la base | Conclusión |
|---|---|---|---:|---|---|
| 2026-11-26, sin hora | 1.3.5 | `npx prisma validate`, `tsc --noEmit` (varios) | `0` | 20 tablas en 0 | Seed preparado, no ejecutado; idempotencia solo estática |
| 2026-11-26 11:22:39 | 1.3.6 | Comprobaciones previas | — | 20 tablas en 0 | Todas pasaron |
| 2026-11-26 11:22:51–11:22:52 | 1.3.6 | `npm run prisma:seed` → `ts-node --esm prisma/seed.ts` | `1` | Sin cambios, 20 tablas en 0 | Fallo de resolución de módulo; sin segunda pasada |
| 2026-11-26, sin hora | 1.3.7 | Pruebas controladas con `node --loader ts-node/esm`; `prisma validate`; `tsc` | `0` / `1` esperado | Sigue vacía | Script corregido; seed no ejecutado sobre la base |
| **2026-11-26 23:04:31–23:04:35** (local) / 2026-11-27 02:04:31–02:04:35 UTC | **Sin informe dedicado** | `npm run prisma:seed` → `node --loader ts-node/esm prisma/seed.ts` | `0` | Poblada con los conteos esperados | Única ejecución exitosa; origen de los datos actuales |
| 2026-11-27 10:16:35 | 1.3.8 | Comprobaciones previas; `npx prisma migrate status` (`0`) | — | 18 tablas con datos | Detención por condición de tablas vacías incumplida; sin seed ni idempotencia |
| 2026-11-27 10:31 | 1.3.9 | Solo lectura | — | Idéntica | Auditoría de consistencia |

**Evidencia de la ejecución exitosa:** los `updated_at` de las tablas con ese campo están todos en `2026-11-27 02:04:35` UTC, es decir `23:04:35` local del 2026-11-26 (UTC-3), coincidiendo con el horario citado en 1.3.8. No hay registros con `updated_at` posterior. El horario y el exit `0` provienen del registro de la sesión de trabajo; **no hay un documento en `docs/` que los respalde**, y 1.3.8 los atribuye erróneamente a 1.3.6.

---

## 3. Estado real de la base

| Verificación | Resultado |
|---|---|
| Servidor | PostgreSQL 18.3 |
| Base / usuario / schema | `smartcana` / `smartcana` / `public` |
| Migración | `20261126100330_init`, `finished_at` presente, `applied_steps_count=1`, `rolled_back_at IS NULL` (sin rollback) |
| `npx prisma migrate status` | `Database schema is up to date!`, exit `0` |

### Conteos de las 20 tablas de dominio

| Tabla | Filas | Tabla | Filas |
|---|---:|---|---:|
| companies | 1 | campaigns | 2 |
| farms | 1 | activity_types | 6 |
| suppliers | 1 | cost_categories | 4 |
| roles | 7 | settings | 1 |
| permissions | 44 | role_permissions | 161 |
| users | 3 | sessions | 0 |
| fields | 3 | audit_logs | 0 |
| activities | 6 | field_statuses | 4 |
| costs | 6 | varieties | 3 |
| harvests | 3 | field_alerts | 3 |

`_prisma_migrations`: 1 fila.

### Usuarios demo

Sin mostrar contraseñas ni hashes:

| Usuario | Rol | Empresa | Hash bcrypt válido | `super_admin` |
|---|---|---|---|---|
| `admin@smartcana.com` | `admin` | SmartCaña S.A. (demo) | Sí | No |
| `ingeniero@smartcana.com` | `ingeniero` | SmartCaña S.A. (demo) | Sí | No |
| `operador@smartcana.com` | `operador` | SmartCaña S.A. (demo) | Sí | No |

La verificación de hash comprueba solo el prefijo y la longitud, sin exponer valores.

### Integridad y unicidad

| Comprobación | Resultado |
|---|---|
| Claves foráneas evaluadas | 29 |
| Claves foráneas con huérfanos | 0 |
| Filas huérfanas totales | 0 |
| Duplicados: `users.email` | 0 |
| Duplicados: `roles(company_id, code)` | 0 |
| Duplicados: `permissions.code` | 0 |
| Duplicados: `role_permissions.id` | 0 |
| Duplicados: `role_permissions(role_id, permission_id)` | 0 |
| Duplicados: `cost_categories.code` | 0 |
| Duplicados: `settings(company_id, key)` | 0 |

### Identificadores deterministas

Todas las filas de las 10 tablas verificadas usan el prefijo `00000000-0000-4000-8000-` generado por `uuid()`:

`companies 1/1`, `roles 7/7`, `permissions 44/44`, `role_permissions 161/161`, `users 3/3`, `fields 3/3`, `activities 6/6`, `costs 6/6`, `harvests 3/3`, `field_alerts 3/3`.

---

## 4. Análisis de idempotencia del código

Archivo analizado: `apps/backend/prisma/seed.ts` (784 líneas). No se modificó.

| Bloque | Líneas | Operación | Clave / restricción | Efecto en una segunda ejecución |
|---|---|---|---|---|
| Guardia y cliente | 1–17 | Sin escrituras | — | Ninguno |
| `uuid()` y grupos | 19–43 | Función pura; 17 grupos | — | IDs idénticos |
| Definiciones estáticas | 45–208 | Ninguna | — | Ninguno |
| Permisos | 211–223 | `createMany({ skipDuplicates: true })` + `findMany` | `permissions.id` (PK determinista) y `permissions.code` (`@unique`, `schema.prisma:69`) | No duplica; no reescribe campos |
| Estados de campo | 232–240 | `upsert` con `update: {}` | ID determinista | No modifica campos de negocio |
| Variedades | 281–289 | `upsert` con `update: {}` | ID determinista | No modifica campos de negocio |
| Campañas | 302–310 | `upsert` con `update: {}` | ID determinista | No modifica campos de negocio |
| Tipos de actividad | 335–343 | `upsert` con `update: {}` | ID determinista | No modifica campos de negocio |
| Categorías de costo | 352–360 | `upsert` con `update: {}` | ID determinista | No modifica campos de negocio |
| Empresa | 368–377 | `upsert` por `cuit` con `update: {}` | `companies.cuit` (`@unique`, `schema.prisma:17`) | No modifica campos |
| Establecimiento | 379–392 | `upsert` por ID determinista con `update: {}` | ID determinista | No modifica campos |
| Proveedor | 394–404 | `upsert` por ID determinista con `update: {}` | ID determinista | No modifica campos |
| Configuración | 406–415 | `upsert` por `companyId_key` con `update: {}` | `@@unique([companyId, key])` (`schema.prisma:189`) | No modifica campos |
| Roles | 419–434 | `upsert` por `companyId_code` con `update: {}` | `@@unique([companyId, code])` (`schema.prisma:59`) | No modifica campos |
| Rol-permiso | 437–449 | `createMany({ skipDuplicates: true })` | ID determinista y `@@unique([roleId, permissionId])` (`schema.prisma:89`) | No duplica; no reescribe |
| Usuarios | 451–500 | `bcrypt.hash` + `upsert` por `email` con `update: {}` | `users.email` (`@unique`, `schema.prisma:103`) | El hash se recalcula en memoria pero **no se sobrescribe**; ningún campo de negocio cambia |
| Campos | 565–599 | `upsert` por ID determinista con `update: {}` | ID determinista | No modifica campos |
| Actividades | 630–649 | `upsert` por ID determinista con `update: {}` | ID determinista | No modifica campos |
| Costos | 661–684 | `upsert` por ID determinista con `update: {}` | ID determinista | No modifica campos |
| Cosechas | 720–748 | `upsert` por ID determinista con `update: {}` | ID determinista | No modifica campos |
| Alertas | 757–773 | `upsert` por ID determinista con `update: {}` | ID determinista | No modifica campos |
| Cierre | 776–784 | Logs y `$disconnect()` | — | Ninguno |

**Totales del análisis estático:** 16 `upsert`, todos con `update: {}`; 2 `createMany` con `skipDuplicates: true`; 1 `bcrypt.hash`; 0 operaciones `delete`, `deleteMany`, `updateMany`, `$executeRaw` ni `$queryRaw` de escritura; 0 valores aleatorios (`Math.random()`).

### Campos que podrían modificarse en una segunda ejecución

- **Campos de negocio:** ninguno. La ausencia de datos en `update: {}` impide reescribir valores.
- **`updated_at`:** 11 modelos usan `@updatedAt` (Company, User, Farm, Setting, Variety, CostCategory, Supplier, Field, Activity, Cost y Harvest). Prisma actualiza automáticamente esas columnas en operaciones de actualización; con un payload vacío no es posible confirmar sin ejecutar si el `upsert` sobre una fila existente refresca `updated_at`. **Es el único campo susceptible de cambio y no fue verificado en runtime.**
- **`created_at`:** no se toca; solo se asigna por `@default(now())` al crear.
- **Contraseñas/hashes:** no se sobrescriben por el `update: {}`.

### Duplicación y relaciones

Con las claves primarias deterministas y las restricciones únicas citadas, una segunda pasada **no debería crear duplicados**. Las relaciones se reconstruyen desde mapas de IDs ya existentes (`permissionIdByCode`, `roleIdByCode`, `fieldIdByName`, etc.), por lo que los UUID deterministas se conservan. Ningún bloque elimina filas.

---

## 5. Riesgos de una segunda ejecución

1. **Condición de autorización incumplida:** la autorización de 1.3.8 exigía tablas vacías. No puede invocarse para una segunda pasada sobre la base poblada.
2. **Idempotencia no probada en runtime:** las conclusiones de 1.3.5–1.3.7 son estáticas. Solo una comparación antes/después podría confirmarla.
3. **Posible refresco de `updated_at`:** si Prisma ejecuta un `UPDATE` implícito con `update: {}`, las marcas temporales cambiarían aunque los datos de negocio no lo hagan. Hay que definir si eso cuenta como "alteración inesperada" antes de autorizar.
4. **`skipDuplicates` silencioso:** si un código, ID o par rol-permiso fue modificado manualmente, la segunda pasada lo omite sin avisar; `permissions.findMany` por código podría devolver más de una fila y el `Map` conservaría la última. No crea duplicados, pero tampoco corrige ni reporta la anomalía.
5. **Filas eliminadas manualmente:** una segunda pasada las recrearía. Eso no es duplicación, pero sí cambia el estado actual.
6. **Ediciones manuales previas:** `update: {}` no las revierte; las relaciones apuntarían a los IDs existentes, aunque estuvieran alterados.
7. **Coste de `bcrypt.hash(…, 10)`:** se recalcula en cada ejecución sin efecto en BD; es solo CPU.
8. **Advertencias de Node/ts-node:** `--experimental-loader` y `[DEP0180]`; no bloqueantes según 1.3.7.
9. **Riesgo de entorno:** el seed contiene una contraseña demo en claro definida en código (`seed.ts:46`, valor no mostrado). Solo debe ejecutarse en la base local de desarrollo.
10. **Documentación inconsistente:** 1.3.8 cita mal la fuente de la ejecución exitosa; la carga real carece de informe propio. Esto dificulta cualquier auditoría posterior.

---

## 6. Recomendación técnica

**Desde el código, una segunda ejecución sobre la base actual parece segura en cuanto a duplicación y destrucción:** no hay `delete`, `TRUNCATE`, `DROP` ni `updateMany`; los 16 `upsert` usan `update: {}` y los dos `createMany` usan `skipDuplicates` con restricciones únicas reales.

Sin embargo:

1. **No ejecutar bajo la autorización de 1.3.8.** Requiere una autorización nueva y explícita que permita una segunda pasada con tablas pobladas, o un entorno/base desechable.
2. **Preferir una base de prueba separada** creada desde la misma migración para validar la idempotencia sin tocar los datos demo.
3. **Si se autoriza sobre la base actual**, capture antes y después: conteos de las 20 tablas, los UUID deterministas y los `updated_at`, y compárelos. Aceptar explícitamente el posible refresco de `updated_at` o descartar la prueba si se exige cambio cero.
4. **Corregir la documentación en una etapa posterior** (no en esta): 1.3.8 debe dejar de atribuir la ejecución exitosa a 1.3.6 y debe crearse un informe para la ejecución de las 23:04:31.
5. **No reanudar P0 ni integración frontend** sin autorización independiente.

**Estado de la idempotencia:** demostrada por construcción, **no confirmada en runtime**.

---

## 7. Archivos modificados

**Ninguno, salvo este informe.** No se modificaron los informes 1.3.5–1.3.8, `seed.ts`, `schema.prisma`, migraciones, `package.json`, `.env`, dependencias ni datos.

Estado previo heredado, sin cambios:

- 30 archivos modificados localmente (28 generados por Prisma, `apps/backend/prisma/seed.ts`, `apps/backend/package.json`).
- 10 documentos sin versionar al cierre de esta etapa (9 previos + este informe).

---

## 8. Estado de Git

- Rama: `main`, sin divergencia (`main...origin/main`).
- Último commit local y remoto: `22bbb4a feat: incorporar migracion inicial y seed de demostracion`.
- `origin/main = 22bbb4a`.
- No se hicieron commits ni push.
- No se ejecutaron seed, migraciones, `db push`, `migrate reset`, INSERT, UPDATE, DELETE, DROP ni TRUNCATE.

---

## 9. Conclusión

La aparente contradicción entre "seed fallido" y "seed ejecutado exitosamente" corresponde a **dos ejecuciones distintas**: un intento fallido a las 11:22 (1.3.6) y una ejecución exitosa a las 23:04 del mismo día que nunca fue documentada y que 1.3.8 atribuyó por error a 1.3.6. La base está sana y con los conteos esperados; el seed es idempotente por diseño, pero la segunda pasada sigue pendiente.

Se detiene aquí, a la espera de revisión y autorización.
