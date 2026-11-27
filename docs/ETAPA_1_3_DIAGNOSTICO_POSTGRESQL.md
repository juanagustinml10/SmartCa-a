# ETAPA 1.3 — DIAGNÓSTICO PREVIO DE POSTGRESQL

**Fecha:** 26 de noviembre de 2026
**Objetivo:** determinar si es seguro ejecutar la migración inicial y el seed contra PostgreSQL real.
**Restricciones respetadas:** no se ejecutaron `migrate deploy`, `migrate dev`, `db push` ni el seed; no se borraron ni modificaron tablas, registros, `.env` ni archivos de configuración; no se hicieron commits ni push. No se muestran contraseñas, tokens, URLs completas ni secretos. La única escritura es este informe.

---

## 1. Resumen ejecutivo

| Ítem | Resultado |
|---|---|
| Configuración de Prisma | Prisma 7.9.1. `prisma.config.ts` carga `dotenv/config` y toma `datasource.url` de `process.env.DATABASE_URL`. |
| Proveedor | `postgresql`, confirmado en `schema.prisma` y `migration_lock.toml`. |
| Base detectada | `smartcana`, schema `public`, en `localhost:5432`. Sin credenciales mostradas. |
| Conexión | **FALLIDA**: `P1010 — User was denied access on the database`. |
| Puerto 5432 | Abierto desde el entorno local. No confirma por sí solo que sea la instancia correcta. |
| Estado de tablas | **No verificado**. No se asume que esté vacía. |
| `_prisma_migrations` | **No verificado**. No se asume que exista ni que esté vacía. |
| Migración inicial | Archivo presente y validado offline; **no se verificó su aplicación**. |
| Seed | Preparado offline, con advertencia importante: no carga `.env` por sí mismo. No ejecutado. |
| Recomendación | **DETENERSE.** |

---

## 2. Configuración de Prisma 7

Archivos revisados:

- `apps/backend/prisma.config.ts`
- `apps/backend/prisma.config.js` (artefacto compilado trackeado, sin cambios)
- `apps/backend/prisma/schema.prisma`
- `apps/backend/package.json`

Hallazgos:

1. `prisma.config.ts` importa `dotenv/config`.
2. Define `schema: "prisma/schema.prisma"`.
3. Define `migrations.path: "prisma/migrations"`.
4. Define `datasource.url: process.env["DATABASE_URL"]`.
5. `schema.prisma` declara `provider = "postgresql"` y no embede una URL con credenciales.
6. El script `prisma:seed` es `ts-node --esm prisma/seed.ts`.

Comando ejecutado sin conexión:

```text
npx prisma validate
```

Resultado: EXIT 0 — `The schema at prisma\schema.prisma is valid 🚀`.  
Versión: Prisma `7.9.1`, Schema Engine `e922089b7d...`, Node `v24.14.1`.

---

## 3. Conexión configurada, sin secretos

| Dato | Valor seguro |
|---|---|
| Origen efectivo de `DATABASE_URL` | `apps/backend/.env` |
| Variable definida en el archivo | Sí |
| Variable definida en el proceso de shell | No |
| Marcador `CAMBIARME` | No |
| Formato reconocido | `postgresql` |
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `smartcana` |
| Schema | `public` |
| Credenciales | Presentes, **no mostradas** |

Datos del compose revisados sin imprimir credenciales:

- Imagen: `postgis/postgis:16-3.4`
- Contenedor: `smartcana-db`
- `POSTGRES_DB`: `smartcana`
- Mapeo de puerto: presente

No se pudo confirmar el estado del contenedor porque `docker` no está disponible como comando en este entorno. El nombre de la base detectada coincide con el valor documentado del compose, pero **la identidad real del servidor no quedó confirmada** por la falla de autenticación.

---

## 4. Intentos de conexión y estado de migraciones

### 4.1 Prueba de conexión con la CLI de Prisma

Comando ejecutado con SQL de solo lectura:

```text
npx prisma db execute --stdin
```

Entrada enviada: `SELECT 1;`

Resultado:

```text
Error: P1010
User was denied access on the database `(not available)`
exit=1
```

La CLI cargó correctamente `prisma.config.js`; el fallo fue de acceso/autenticación, no de lectura del config.

### 4.2 Estado de migraciones con Prisma

Comando ejecutado:

```text
npx prisma migrate status
```

Resultado:

```text
Datasource "db": PostgreSQL database "smartcana", schema "public" at "localhost:5432"
Error: P1010: User was denied access on the database `(not available)`
exit=1
```

Este comando es de consulta; **no** aplica migraciones. No se ejecutaron `migrate deploy` ni `migrate dev`.

### 4.3 Disponibilidad del puerto

```text
Test-NetConnection -ComputerName localhost -Port 5432
```

Resultado: `TcpTestSucceeded = True`.

Esto indica que algo escucha en el puerto 5432, pero no demuestra que sea la instancia PostgreSQL esperada ni que las credenciales sean válidas.

---

## 5. Estado de tablas y datos

**No verificado.**

La autenticación fue rechazada, por lo que no se pudo consultar:

- `information_schema.tables`
- listado de schemas distintos de `pg_catalog` / `information_schema`
- conteo de filas por tabla
- presencia de datos previos

No se afirma que la base esté vacía. Tampoco se afirma que contenga tablas. El estado real queda indeterminado hasta que la conexión funcione.

---

## 6. Estado de `_prisma_migrations`

**No verificado.**

No se pudo determinar:

- si existe `public._prisma_migrations`;
- qué migraciones registra;
- si `20261126100330_init` ya fue aplicada;
- si hay migraciones anteriores o rollbacks registrados.

No se ejecutó ninguna consulta contra esa tabla porque la conexión fue rechazada. No se asume que la tabla exista ni que esté vacía.

---

## 7. Estado de la migración inicial

Archivos confirmados:

- `apps/backend/prisma/migrations/migration_lock.toml` → `provider = "postgresql"`.
- `apps/backend/prisma/migrations/20261126100330_init/migration.sql`.
- No hay otros directorios de migración.

Inspección offline del SQL de migración:

| Elemento | Cantidad |
|---|---:|
| `CREATE TABLE` | 20 |
| `FOREIGN KEY` | 29 |
| `CREATE INDEX` / `CREATE UNIQUE INDEX` | 18 |
| `CREATE EXTENSION` | 0 |
| Referencias a `geometry` | 0 |

Estado: **archivo listo, aplicación no verificada**. No se ejecutó `migrate deploy`, `migrate dev` ni `db push`.

---

## 8. Preparación del seed

Revisión estática de `apps/backend/prisma/seed.ts`:

| Comprobación | Resultado |
|---|---|
| Importa el cliente generado | Sí, desde `../src/generated/prisma/client.js` |
| Usa `PrismaPg` con `connectionString` desde `process.env.DATABASE_URL` | Sí |
| Valida que `DATABASE_URL` exista y no sea `CAMBIARME` | Sí |
| Helper de UUID deterministas | Presente |
| `upsert` | 16 apariciones |
| `createMany(..., skipDuplicates: true)` | 2 apariciones |
| `Math.random()` | 0 apariciones |
| Contraseña demo de desarrollo | Presente; valor no mostrado en este informe |
| Ejecución contra BD real | **No ejecutada** |

### Advertencia importante

`seed.ts` **no importa `dotenv/config`**. La CLI de Prisma sí carga `.env` a través de `prisma.config.ts`, pero el script `npm run prisma:seed` ejecuta directamente `ts-node --esm prisma/seed.ts`.

En este entorno se comprobó que `DATABASE_URL` no está visible para un proceso Node simple lanzado desde `apps/backend`. Por lo tanto, con la configuración actual, el seed **no recibiría la variable** a menos que se exporte explícitamente en el entorno antes de ejecutarlo. El script `prisma:seed` tampoco fue probado previamente con su loader ESM.

Esto no se corrigió porque la tarea prohíbe modificar archivos o configuración.

---

## 9. Riesgos detectados

1. **Bloqueante — autenticación rechazada (`P1010`).** No hay acceso a la base configurada, así que ninguna verificación de datos es fiable.
2. **No se confirmó la identidad real de la base.** El puerto 5432 está abierto, pero no se verificó que corresponda al contenedor `smartcana-db` ni a la base `smartcana` documentada.
3. **Estado desconocido de tablas y datos.** No se asume base vacía. Si ya existen tablas, la migración inicial podría fallar por objetos existentes o encontrar un esquema distinto.
4. **Estado desconocido de `_prisma_migrations`.** Podría no existir, tener migraciones previas o registrar la inicial. Sin esa información no se debe aplicar nada.
5. **Seed con riesgo de datos demo.** Crea usuarios con contraseña de desarrollo y datos de ejemplo; ejecutarlo sobre una base real o compartida sería inapropiado.
6. **Seed sin carga de `.env`.** Con la configuración actual, `npm run prisma:seed` probablemente fallaría por `DATABASE_URL` no visible, o requeriría exportarla manualmente.
7. **Docker no disponible en este entorno.** No se pudo verificar el contenedor, su estado ni su salud.
8. **`migrate status` no concluyó.** No hay línea base confirmada de migraciones aplicadas.

---

## 10. Recomendación

## DETENERSE

No ejecutar migración ni seed hasta que:

1. Se confirme que el servicio en `localhost:5432` es la instancia PostgreSQL esperada y que la base correcta es `smartcana`/`public`.
2. Se corrija el acceso denegado (`P1010`) sin modificar `.env` dentro de esta etapa de diagnóstico.
3. `npx prisma migrate status` termine correctamente y permita inspeccionar `_prisma_migrations`.
4. Se consulte el listado de tablas y conteos para confirmar si la base está vacía y no contiene datos ajenos.
5. Se decida cómo `DATABASE_URL` llegará al proceso del seed, dado que `seed.ts` no carga `.env` por sí mismo.
6. Se autorice explícitamente una ejecución posterior de migración y seed como una etapa separada.

No se ejecutó ninguna operación sobre los datos. No se hicieron commits ni push. No se modificaron `.env`, configuración ni código del proyecto.
