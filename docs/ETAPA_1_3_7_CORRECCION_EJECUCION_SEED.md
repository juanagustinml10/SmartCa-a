# ETAPA 1.3.7 — CORRECCIÓN DEL ENTORNO DE EJECUCIÓN DEL SEED

**Fecha:** 26 de noviembre de 2026.
**Conclusión:** problema de resolución corregido; seed compilado y cargado bajo prueba controlada; **no se cargaron datos**.
**Alcance:** corrección mínima del entorno de ejecución. No se ejecutó el seed sobre la base.

---

## 1. Causa técnica exacta del error

El error de la etapa 1.3.6 fue:

```text
ERR_MODULE_NOT_FOUND: Cannot find module '.../apps/backend/src/generated/prisma/client.js'
    imported from .../apps/backend/prisma/seed.ts
```

Causa raíz, confirmada por inspección:

- `apps/backend/package.json` declara `"type": "module"`: el backend se ejecuta como **ESM**.
- `apps/backend/tsconfig.json` usa `module: "nodenext"` y `moduleResolution: "nodenext"`, con `rootDir: "./src"` y `prisma/seed.ts` excluido del proyecto.
- `schema.prisma` usa el generador `prisma-client` con salida `../src/generated/prisma`, que genera **TypeScript**, no JavaScript: existe `client.ts`, pero **no existe `client.js` ni `client.d.ts`**.
- `seed.ts` importa `../src/generated/prisma/client.js`, tal como exige la convención ESM de TypeScript con `nodenext`. El propio `client.ts` generado también importa `./enums.js`, `./internal/class.js`, etc.
- Node.js resuelve los especificadores ESM de forma literal: no reescribe `.js` a `.ts`. Con Node 24.14.1 se comprobó que `node --experimental-transform-types` tampoco lo hace: al importar `client.ts` falló con `ERR_MODULE_NOT_FOUND` para `./enums.js`.
- El comando anterior, `ts-node --esm prisma/seed.ts`, no aplicó la resolución de `ts-node` a ese specifier desde el archivo de entrada y abortó antes de compilar/ejecutar el seed.

**Solución verificada:** registrar directamente el loader ESM de `ts-node` con `node --loader ts-node/esm`. Ese loader sí resuelve los especificadores `.js` a los archivos `.ts` generados. Se comprobó con importaciones controladas:

| Prueba controlada | Resultado |
|---|---|
| Importar `./src/generated/prisma/client.ts` con `node --loader ts-node/esm` | exit `0`, `PrismaClient` exportado |
| Importar `./src/generated/prisma/client.js` con el mismo loader | exit `0`, `PrismaClient` exportado |
| Cargar `prisma/seed.ts` con el mismo loader y `DATABASE_URL` sin configurar | llegó a la guardia de configuración; **sin** `ERR_MODULE_NOT_FOUND` |

No hizo falta `--experimental-specifier-resolution=node`: se probó y no es necesario con este loader, por lo que no se incluyó.

## 2. Archivos inspeccionados

| Archivo / ubicación | Qué se revisó |
|---|---|
| `apps/backend/prisma/seed.ts` | Importaciones, guardia de `DATABASE_URL`, 784 líneas, lógica intacta. |
| `apps/backend/src/generated/prisma/` | 28 archivos: `client.ts`, `browser.ts`, `internal/`, `models/`; ausencia de `client.js` y `client.d.ts`; uso de `import.meta.url` y specifiers `.js`. |
| `apps/backend/prisma/schema.prisma` | Generador `prisma-client`, salida `../src/generated/prisma`. Sin cambios. |
| `apps/backend/package.json` | `"type": "module"`, script `prisma:seed`, dependencias y versiones. |
| `apps/backend/prisma.config.ts` | Carga de `dotenv/config` para la CLI de Prisma. Sin cambios. |
| `apps/backend/tsconfig.json` | `nodenext`, `rootDir: ./src`, exclusión de `prisma/seed.ts`. |
| `apps/backend/tsconfig.build.json` | Excluye `prisma/`. Sin cambios. |
| `package.json` del monorepo | Workspaces `apps/*` y `packages/*`; sin tsconfig raíz; dependencias hoisteadas. |
| Versiones instaladas | Node `v24.14.1`, npm `11.11.0`, TypeScript `5.9.3`, Prisma CLI y `@prisma/client` `7.9.1`, `@prisma/adapter-pg` `7.9.1`, ts-node `10.9.2`. |

No se encontró `tsx` ni `esbuild` instalados, así que no se agregaron dependencias.

## 3. Archivos modificados

**Un único archivo:** `apps/backend/package.json`.

```diff
-    "prisma:seed": "ts-node --esm prisma/seed.ts",
+    "prisma:seed": "node --loader ts-node/esm prisma/seed.ts",
```

**Motivo:** sustituir el arranque del CLI de `ts-node --esm` por el registro directo del loader ESM de `ts-node`, que resuelve correctamente los specifiers `.js` a los archivos `.ts` generados por Prisma 7. No cambia la lógica del seed, la ruta del cliente, el sistema de módulos, el esquema ni las dependencias.

**No se modificaron:** `seed.ts` en esta etapa, el cliente generado, `schema.prisma`, migraciones, `prisma.config.ts`, tsconfigs, `.env`, credenciales ni datos.

## 4. Solución implementada

El comando del script ahora es:

```text
node --loader ts-node/esm prisma/seed.ts
```

Es reproducible desde `apps/backend`, usa la misma configuración TypeScript y el mismo `.env`, y conserva el nombre del script (`npm run prisma:seed`) para quienes lo invocan. La única advertencia esperable es la de Node sobre `--experimental-loader` (además de `[DEP0180]` de `ts-node`), ambas no bloqueantes y ya presentes en la etapa anterior.

## 5. Comandos ejecutados y códigos de salida

| Comando | Exit | Observación |
|---|---:|---|
| Inspección de archivos y versiones | — | Solo lectura. |
| `node --experimental-transform-types ... import('./src/generated/prisma/client.ts')` | `1` | `ERR_MODULE_NOT_FOUND` para `./enums.js`: Node no reescribe `.js`→`.ts`. |
| `node --loader ts-node/esm ... import('./src/generated/prisma/client.ts')` | `0` | `PrismaClient` exportado correctamente. |
| `node --loader ts-node/esm ... import('./src/generated/prisma/client.js')` | `0` | Resolución `.js`→`.ts` confirmada. |
| Carga controlada de `prisma/seed.ts` con loader y `DATABASE_URL` sin valor | `1` (esperado) | Llegó a la guardia `DATABASE_URL no configurada`; sin `ERR_MODULE_NOT_FOUND`. |
| `npx prisma validate` | `0` | `The schema at prisma\schema.prisma is valid 🚀`. |
| `npx tsc --noEmit --pretty false --project tsconfig.json` | `0` | Backend sin errores. |
| `npx tsc --noEmit --pretty false --module nodenext --moduleResolution nodenext --target ES2023 --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck prisma/seed.ts` | `0` | Seed sin errores de compilación. |
| Consultas SQL de solo lectura | — | Identidad, migración y conteos; ver §6. |
| `git diff --check -- apps/backend/package.json` | `0` | Sin problemas de whitespace. |

La prueba controlada de carga se hizo con `DATABASE_URL` sin valor y `DOTENV_CONFIG_PATH` apuntando a un archivo inexistente, de modo que `dotenv/config` no pudiera restaurar la URL real. El seed abortó en la guardia ubicada antes de crear `PrismaPg`, `PrismaClient` o cualquier consulta. No se usó `npm run prisma:seed` ni `ts-node --esm prisma/seed.ts`.

## 6. Resultado de las validaciones

- **Resolución del cliente:** corregida. El loader ESM de `ts-node` resuelve `../src/generated/prisma/client.js` al `client.ts` generado.
- **Compilación:** backend y seed compilan sin errores (`tsc --noEmit`, exit `0`).
- **Carga del seed:** comprobada sin ejecutar operaciones: el módulo se cargó y alcanzó su guardia de configuración; no hubo errores de módulo.
- **Coherencia del comando:** el script leído desde `package.json` es exactamente `node --loader ts-node/esm prisma/seed.ts`, alineado con `"type": "module"` y `moduleResolution: nodenext`.
- **Sin dependencias nuevas:** no se instaló ni agregó ninguna.

## 7. Confirmación de que el seed NO fue ejecutado

**No se ejecutó el seed sobre la base.** No se crearon registros, no se modificaron contraseñas ni se ejecutó la prueba de idempotencia. La única carga del archivo `seed.ts` fue una prueba controlada que se detuvo deliberadamente en la guardia de `DATABASE_URL`, antes de inicializar Prisma o conectarse. No se llamó a `npm run prisma:seed`.

## 8. Confirmación de PostgreSQL

Consultas exclusivamente de solo lectura:

- Servidor: PostgreSQL 18.3 local; base `smartcana`; usuario `smartcana`; schema `public`.
- Migración `20261126100330_init`: terminada, `applied_steps_count=1`, sin rollback.
- `_prisma_migrations`: 1 fila.
- Las **20 tablas de dominio continúan vacías** (`0` filas en `activities`, `activity_types`, `audit_logs`, `campaigns`, `companies`, `cost_categories`, `costs`, `farms`, `field_alerts`, `field_statuses`, `fields`, `harvests`, `permissions`, `role_permissions`, `roles`, `sessions`, `settings`, `suppliers`, `users` y `varieties`).

No se ejecutaron migraciones, `db push`, `reset`, escrituras SQL ni operaciones de datos.

## 9. Estado de Git

Al cierre de las verificaciones, antes de crear este informe:

- **30 archivos modificados:** 28 archivos del cliente Prisma generado (cambios locales preexistentes), `apps/backend/prisma/seed.ts` (la inserción de `dotenv/config` de la etapa 1.3.5) y `apps/backend/package.json` (cambio de esta etapa).
- **8 documentos sin versionar:** informes de las etapas 1.3, 1.3.1 a 1.3.6 y `REVISION_PREVIA_COMMITS.md`. Con este informe pasan a ser 9.
- **No se hicieron commits ni push.**

El `git diff` de `package.json` contiene exclusivamente el cambio de la línea del script. No se regeneraron archivos versionados.

## 10. Comando recomendado para la futura ejecución

Desde `apps/backend`, con autorización independiente:

```text
npm run prisma:seed
```

Que ejecuta internamente:

```text
node --loader ts-node/esm prisma/seed.ts
```

## 11. Limitaciones y pruebas pendientes

- **Ejecución real del seed:** pendiente. Solo se validó la carga controlada; falta ejecutarlo con la URL real para confirmar la inserción de datos y la idempotencia en runtime.
- **Advertencias:** `--experimental-loader` puede eliminarse en futuras versiones de Node y `[DEP0180]` proviene de `ts-node`; ninguna impide el arranque en Node 24.14.1.
- **No se probó la segunda pasada** del seed: requiere que la primera finalice correctamente y autorización explícita.
- **Sin cambios de arquitectura:** se mantuvo ESM, el cliente generado en su ruta actual y la dependencia `ts-node` ya existente.

---

**Estado final:** resolución del cliente corregida, seed compilable y cargable sin ejecutarse, base intacta, informe creado. Se detiene aquí; no se ejecutó el seed ni se avanzó a la siguiente etapa.
