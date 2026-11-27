# ETAPA 1.3.8 — Ejecución real del seed e idempotencia

**Fecha de la verificación:** 2026-11-27 10:16:35–10:18 (hora local)
**Resultado:** **DETENIDO. No se ejecutó el seed ni la prueba de idempotencia.**

## Motivo de la detención

La instrucción exige que las 20 tablas de dominio estén vacías antes de cualquier escritura y establece textualmente:

> Si alguna tabla contiene registros, la identidad de la base no coincide o alguna comprobación falla, detenerse sin ejecutar el seed.

Las 20 tablas contienen registros. Se cumplió la condición de detención, por lo que **no se ejecutó `npm run prisma:seed`**, ni una primera ni una segunda pasada.

Los datos presentes corresponden a la ejecución única del seed ya realizada el 2026-11-26 23:04:31–23:04:35 (exit `0`), documentada en `docs/ETAPA_1_3_6_SEED_EJECUTADO.md`. Esta etapa no los modificó.

## 1. Base de datos autorizada

| Parámetro | Valor comprobado |
|---|---|
| Servidor | PostgreSQL 18.3 (x86_64-windows) |
| Host / puerto | `localhost` / `5432` |
| Base de datos | `smartcana` |
| Usuario | `smartcana` |
| Schema | `public` |
| Directorio de trabajo | `apps/backend` |

Identidad confirmada mediante `SELECT current_user, current_database(), current_schema(), version();`. El `.env` existente se usó sin mostrar ni modificar credenciales.

## 2. Comprobaciones obligatorias previas

| Comprobación | Resultado |
|---|---|
| Identidad exacta de servidor, base, usuario y schema | Correcta |
| Migración `20261126100330_init` aplicada y terminada | `finished=true`, `steps=1`, `rolled_back=false` |
| `npx prisma migrate status` | `Database schema is up to date!`, exit `0` |
| Conteo de las 20 tablas de dominio | Ejecutado (sección 4) |
| Las 20 tablas están vacías | **FALSO**: 18 tablas tienen registros; solo `sessions` y `audit_logs` están en 0 |
| Script `prisma:seed` | `node --loader ts-node/esm prisma/seed.ts` (corrección 1.3.7 conservada) |
| Archivo del seed | `apps/backend/prisma/seed.ts`, 784 líneas, primera línea `import "dotenv/config";`, diff local de 1 inserción |

Al fallar la comprobación 5, se aplicó la regla de detención. No se realizaron escrituras, reparaciones ni reintentos.

## 3. Resultado de la ejecución

| Paso | Estado |
|---|---|
| Primera ejecución (`npm run prisma:seed`) | **No ejecutada** |
| Salida / código de salida | No aplica |
| Verificación posterior a la primera ejecución | No aplica |
| Guardado de conteos para idempotencia | No aplica (no hubo ejecución) |
| Segunda ejecución | **No ejecutada** |
| Comparación de idempotencia | No aplica |

## 4. Conteos completos (único estado observado)

No hay conteos "antes y después" de esta etapa porque no hubo ejecución. Se registra el estado observado al inicio y al final, que es idéntico:

| Entidad | Registros | Esperado tras seed |
|---|---:|---:|
| companies | 1 | 1 |
| farms | 1 | 1 |
| suppliers | 1 | 1 |
| roles | 7 | 7 |
| permissions | 44 | 44 |
| users | 3 | 3 |
| fields | 3 | 3 |
| activities | 6 | 6 |
| costs | 6 | 6 |
| harvests | 3 | 3 |
| field_alerts | 3 | 3 |
| field_statuses | 4 | 4 |
| varieties | 3 | 3 |
| campaigns | 2 | 2 |
| activity_types | 6 | 6 |
| cost_categories | 4 | 4 |
| settings | 1 | 1 |
| role_permissions | 161 | 161 |
| sessions | 0 | 0 |
| audit_logs | 0 | 0 |
| `_prisma_migrations` | 1 | 1 |

Los 18 conteos de dominio coinciden con lo esperado tras la carga inicial. Las tablas `sessions` y `audit_logs` permanecen vacías porque no se realizaron login ni operaciones auditables en esta etapa.

## 5. Verificación de usuarios, roles y hashes

Consultas de solo lectura, sin exponer contraseñas ni hashes:

| Usuario | Rol | Empresa | Hash bcrypt válido | Longitud | `super_admin` |
|---|---|---|---|---|---|
| `admin@smartcana.com` | `admin` | SmartCaña S.A. (demo) | Sí | 60 | No |
| `ingeniero@smartcana.com` | `ingeniero` | SmartCaña S.A. (demo) | Sí | 60 | No |
| `operador@smartcana.com` | `operador` | SmartCaña S.A. (demo) | Sí | 60 | No |

"Hash bcrypt válido" verifica únicamente el prefijo `$2` y la longitud 60; no se mostraron valores.

## 6. Integridad y duplicados

| Comprobación | Resultado |
|---|---|
| Claves foráneas evaluadas | 29 |
| Claves foráneas con huérfanos | 0 |
| Registros huérfanos totales | 0 |
| Duplicados en `users.email` | 0 |
| Duplicados en `roles.code` | 0 |
| Duplicados en `permissions.code` | 0 |
| Duplicados en `cost_categories.code` | 0 |
| Duplicados en `role_permissions` (role_id + permission_id) | 0 |

## 7. Errores y advertencias

- **Bloqueo:** las tablas de dominio no están vacías. No es un error técnico, sino una condición de la autorización que impide ejecutar el seed.
- Se intentó una verificación con una expresión regular mal escapada desde PowerShell que devolvió `bcrypt_valido=false`; se corrigió la consulta y el resultado real es `true` para los tres usuarios. No hubo impacto en la base.
- No se presentaron errores de PostgreSQL ni de Prisma.
- No se ejecutaron `db push`, `migrate reset`, DROP, TRUNCATE ni DELETE.

## 8. Estado final de PostgreSQL

- Migración `20261126100330_init` terminada, sin rollback.
- `migrate status`: esquema actualizado, exit `0`.
- Conteos idénticos a los del inicio de la etapa.
- Sin sesiones ni registros de auditoría nuevos.
- Sin escrituras, seeds ni migraciones ejecutadas en esta etapa.

## 9. Archivos modificados

**Ningún archivo fue modificado en esta etapa** salvo este informe.

Estado previo heredado, sin cambios:

- 30 archivos modificados localmente: 28 archivos generados por Prisma, `apps/backend/prisma/seed.ts` y `apps/backend/package.json`.
- 9 documentos sin versionar.

## 10. Estado de Git

- Rama: `main`, sin divergencia (`main...origin/main`).
- Último commit local y remoto: `22bbb4a feat: incorporar migracion inicial y seed de demostracion`.
- `origin/main = 22bbb4a`.
- No se hicieron commits ni push.

## 11. Conclusión y siguiente paso

La base ya contiene la carga de demostración correcta y consistente, pero **no se puede repetir el seed bajo la autorización actual**, porque la condición de tablas vacías no se cumple. Para realizar la prueba de idempotencia se necesita una autorización explícita y distinta que permita una segunda pasada sobre la base con datos, o un entorno de prueba separado.

Tampoco se reanudó la corrección P0 de seguridad: quedó pendiente y sin cambios de código.
