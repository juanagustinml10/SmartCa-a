# ETAPA 1.3.1 — CORRECCIÓN DE CONEXIÓN POSTGRESQL

**Fecha:** 26 de noviembre de 2026
**Objetivo:** identificar la causa del `P1010` y dejar Prisma en condiciones de conectarse a la base `smartcana` sin perder ni modificar datos existentes.
**Restricciones respetadas:** no se ejecutaron migraciones ni seed; no se ejecutaron `DROP`, `TRUNCATE` ni `DELETE`; no se recrearon bases ni se limpiaron volúmenes; no se eliminaron contenedores ni servicios; no se modificó `.env`, la configuración del servidor ni el seed; no se hicieron commits ni push. No se muestran contraseñas, URLs completas ni secretos. La única escritura es este informe.

---

## 1. Resumen ejecutivo

| Ítem | Resultado |
|---|---|
| Servidor identificado | PostgreSQL 18.3 local para Windows, servicio `postgresql-x64-18`, escuchando en `0.0.0.0:5432` y `[::]:5432`. |
| Docker / Podman | No disponibles. No hay contenedor SmartCaña ejecutándose. |
| Configuración de Prisma | `DATABASE_URL` desde `apps/backend/.env`: usuario `smartcana`, host `localhost`, puerto `5432`, base `smartcana`, schema `public`. Credenciales presentes, no mostradas. |
| Causa concreta | El rol `smartcana` no existe y la base de datos `smartcana` no existe en el servidor alcanzado. |
| ¿Contraseña o `pg_hba.conf`? | No. `pg_hba.conf` usa `trust` para loopback; la contraseña no es el bloqueante. |
| Correcciones realizadas | Ninguna. La corrección requiere crear rol y base: operación de modificación de servidor sujeta a autorización. |
| Conexión a la base destino | No disponible todavía (`P1010`). |
| `migrate status` | No pudo completarse (`P1010`). |
| Tablas y `_prisma_migrations` | No verificados. No se asume que la base esté vacía. |
| Seed | Propuesta preparada, sin aplicar. |
| Conclusión | **REQUIERE AUTORIZACIÓN — SE IDENTIFICÓ LA CAUSA, PERO LA CORRECCIÓN NECESITA PERMISOS.** |

---

## 2. Fase 1 — Servidor PostgreSQL identificado

### 2.1 Proceso y servicio

- `netstat -ano | findstr ":5432"` mostró dos listeners:
  - `0.0.0.0:5432`, PID `6840`, estado `LISTENING`.
  - `[::]:5432`, PID `6840`, estado `LISTENING`.
- El PID `6840` corresponde a `postgres.exe` (el path no fue legible desde la sesión actual, pero el binario queda identificado por el servicio).
- Servicio de Windows detectado: `postgresql-x64-18`, estado `Running`, inicio `Automatic`.
- `PathName` del servicio: `"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" runservice -N "postgresql-x64-18" -D "C:\Program Files\PostgreSQL\18\data" -w`.
- Consulta de identidad del servidor (solo lectura, como `postgres` contra `postgres`):
  - usuario actual: `postgres`
  - base actual: `postgres`
  - schema actual: `public`
  - versión: `PostgreSQL 18.3 on x86_64-windows`.

### 2.2 Herramientas y contenedores

| Herramienta | Disponible |
|---|---|
| `docker` | No |
| `podman` | No |
| `nerdctl` | No |
| `psql` en `PATH` | No |
| `pg_isready` en `PATH` | No |
| `C:\Program Files\PostgreSQL\18\bin\psql.exe` | Sí, utilizado para las consultas de solo lectura |

No hay Docker Desktop, Docker Engine, Podman ni alternativa equivalente accesible. En consecuencia, no existe contenedor SmartCaña en ejecución.

### 2.3 docker-compose del proyecto

`docker/docker-compose.yml` describe la arquitectura esperada, no la instalación realmente encontrada:

- imagen `postgis/postgis:16-3.4`;
- contenedor `smartcana-db`;
- `POSTGRES_USER: smartcana`;
- `POSTGRES_DB: smartcana`;
- contraseña redactada en la inspección;
- mapeo `5432:5432`;
- volumen `postgres_data`;
- healthcheck con `pg_isready -U smartcana`;
- contenedor adicional `smartcana-pgadmin` en el puerto `5050`.

El servidor que responde en `5432` es PostgreSQL 18 instalado como servicio de Windows, **no** el contenedor PostGIS 16 del compose. No se asumió que fuera el servidor correcto solo por ocupar el puerto: se verificó su identidad y su contenido.

### 2.4 Configuración de conexión, sin secretos

`apps/backend/prisma.config.ts` importa `dotenv/config` y toma `datasource.url` de `process.env["DATABASE_URL"]`. El artefacto compilado `prisma.config.js` hace lo mismo.

Datos no sensibles leídos de `apps/backend/.env`:

| Dato | Valor |
|---|---|
| Origen | `apps/backend/.env` |
| Usuario | `smartcana` |
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `smartcana` |
| Schema | `public` |
| Contraseña | Presente, no mostrada |

Prisma reportó la misma base y schema al intentar `migrate status`: `PostgreSQL database "smartcana", schema "public" at "localhost:5432"`.

---

## 3. Fase 2 — Causa concreta del `P1010`

### 3.1 Reglas de autenticación

`C:\Program Files\PostgreSQL\18\data\pg_hba.conf` solo contiene reglas activas de loopback:

```text
host    all    all    127.0.0.1/32    trust
host    all    all    ::1/128         trust
```

El método `trust` permite la conexión local sin exigir contraseña. Por lo tanto, una contraseña errónea no explica el rechazo. No se modificó este archivo.

### 3.2 Roles existentes

Consulta de solo lectura:

```sql
SELECT rolname FROM pg_roles ORDER BY 1;
```

Roles de usuario/no sistema detectados: `postgres`, `safeobserve`. El resto son roles internos de PostgreSQL (`pg_monitor`, `pg_read_all_data`, `pg_database_owner`, etc.).

Consulta puntual:

```sql
SELECT count(*) FROM pg_roles WHERE rolname = 'smartcana';
```

Resultado: `0`. El rol `smartcana` **no existe**.

Intento de conexión de solo lectura con ese usuario contra la base `postgres`:

```text
psql -h 127.0.0.1 -p 5432 -U smartcana -d postgres -Atc "SELECT current_user, current_database();"
```

Resultado: `FATAL: no existe el rol "smartcana"` (exit `2`).

### 3.3 Bases existentes

Consulta de solo lectura:

```sql
SELECT datname FROM pg_database ORDER BY 1;
```

Bases detectadas: `consultorio_db`, `habit_tracker`, `padel_audit_test`, `padel_dev`, `postgres`, `safeobserve_db`, `template0`, `template1`. No aparece `smartcana`.

Consulta puntual:

```sql
SELECT count(*) FROM pg_database WHERE datname = 'smartcana';
```

Resultado: `0`. La base `smartcana` **no existe**.

Intento de conexión de solo lectura como `postgres` contra la base `smartcana`:

```text
psql -h 127.0.0.1 -p 5432 -U postgres -d smartcana -Atc "SELECT current_user, current_database();"
```

Resultado: `FATAL: no existe la base de datos "smartcana"` (exit `2`).

### 3.4 Comprobación con Prisma

| Comando | Resultado |
|---|---|
| `npx prisma db execute --stdin` con `SELECT 1;` | `Error: P1010 — User was denied access on the database (not available)`, exit `1`. |
| `npx prisma migrate status` | `Error: P1010: User was denied access on the database (not available)`, exit `1`. |
| `npx prisma validate` | EXIT `0`, esquema válido. Prisma `7.9.1`, Node `v24.14.1`. |

### 3.5 Diagnóstico final

El `P1010` es causado por la **combinación de dos objetos inexistentes** en el servidor alcanzado:

1. El usuario configurado `smartcana` no existe como rol de PostgreSQL.
2. La base de datos configurada `smartcana` no existe.

Quedan descartados:

- contraseña incorrecta: `pg_hba.conf` usa `trust` en loopback;
- permisos insuficientes sobre una base existente: la base no existe;
- host o puerto incorrectos: el puerto responde y Prisma detecta PostgreSQL 18.3;
- servidor diferente al esperado: se confirmó que es PostgreSQL local, aunque no es el contenedor PostGIS 16 descrito en el compose;
- reglas `pg_hba.conf` restrictivas: solo hay reglas `trust` para loopback;
- esquema inválido: `prisma validate` pasó.

---

## 4. Fase 3 — Correcciones realizadas

**Ninguna.**

La corrección minimalista sería crear el rol `smartcana` y la base `smartcana` en el PostgreSQL 18 local. Ambas operaciones crean objetos en el servidor (usuario/rol y base de datos) y entran en la categoría que la tarea exige autorizar explícitamente. Por lo tanto, se detuvo la ejecución antes de crear cualquier objeto.

Tampoco se realizó lo siguiente:

- modificar `.env` ni reutilizar otra credencial;
- cambiar contraseñas;
- eliminar usuarios o roles;
- modificar permisos globales;
- desactivar autenticación o cambiar `pg_hba.conf`;
- cambiar el método de instalación o migrar a Docker;
- crear tablas, aplicar migraciones ni ejecutar el seed.

### 4.1 Corrección propuesta, pendiente de autorización

Opción recomendada, sin tocar `.env`:

1. Crear el rol `smartcana` con `LOGIN`, reutilizando la contraseña ya configurada en `apps/backend/.env` sin mostrarla ni cambiarla.
2. Crear la base de datos `smartcana` con propietario `smartcana`.
3. No crear extensiones, tablas ni datos adicionales.
4. No borrar ni sobrescribir ningún objeto existente.

Alternativa si se prefiere no crear objetos: ajustar `DATABASE_URL` en `.env` para apuntar a un usuario y una base ya existentes del servidor. Requiere que el usuario indique cuáles y autorice la modificación de `.env`. No se hizo.

Tercera alternativa, no recomendada sin decisión explícita: levantar el contenedor `smartcana-db` del compose. Cambiaría el servidor alcanzado en el puerto `5432`, podría entrar en conflicto con el servicio de Windows y modificaría la arquitectura. No se hizo.

---

## 5. Fase 4 — Verificación

La fase de verificación contra la base `smartcana` **no pudo ejecutarse** porque la base y el rol no existen. No se ejecutaron consultas de escritura.

| Comprobación solicitada | Estado |
|---|---|
| Prisma ejecuta `SELECT 1` | No verificado contra `smartcana`. `npx prisma db execute --stdin` devolvió `P1010`. Sí se verificó `SELECT 1` contra la base `postgres` como `postgres` (resultado `1`, exit `0`), lo que confirma que el servidor responde, no que la base destino sea correcta. |
| Conexión corresponde a `smartcana` | No. Prisma apunta a `smartcana`, pero el servidor informa que esa base no existe. |
| Schema `public` | Configurado y reportado por Prisma, pero no verificado dentro de la base destino. |
| `npx prisma migrate status` | No completó: `P1010`. No hay línea base de migraciones aplicadas. |
| Listado de tablas | No consultado. No se asume que la base esté vacía. |
| Existencia de `_prisma_migrations` | No consultada. No se asume que exista ni que esté vacía. |

Una vez autorizada y aplicada la corrección, estas seis comprobaciones deberán repetirse en modo solo lectura antes de hablar de migraciones.

---

## 6. Fase 5 — Preparación del seed

### 6.1 Problema detectado

`apps/backend/prisma/seed.ts`:

- obtiene `const databaseUrl = process.env.DATABASE_URL;`;
- valida que exista y no sea `CAMBIARME`;
- pasa ese valor a `new PrismaPg({ connectionString: databaseUrl })`;
- **no importa `dotenv/config`**.

`apps/backend/package.json` define el script:

```text
prisma:seed = ts-node --esm prisma/seed.ts
```

Ese script no pasa por `prisma.config.ts`, por lo que la carga de `.env` que hace Prisma CLI no alcanza al proceso del seed. Se comprobó que `DATABASE_URL` no está visible para un proceso Node simple iniciado desde `apps/backend`. Con la configuración actual, el seed fallaría en su propia validación o requeriría exportar la variable manualmente. El seed **no fue ejecutado**.

### 6.2 Propuesta, no aplicada

Añadir como primera línea de `apps/backend/prisma/seed.ts`:

```ts
import "dotenv/config";
```

Es el mecanismo más apropiado para esta configuración porque:

- usa el mismo cargador que ya usa `prisma.config.ts`, manteniendo un único origen de verdad (`apps/backend/.env`);
- se ejecuta antes de leer `process.env.DATABASE_URL` en la línea 8 del seed;
- funciona con `ts-node --esm` sin depender de banderas del shell;
- evita exportar secretos en la línea de comandos o en el historial de PowerShell.

Alternativa sin modificar el seed: exportar `DATABASE_URL` en el entorno del proceso justo antes de ejecutarlo. Es viable, pero deja la carga implícita, depende de quién ejecute el comando y no queda documentada en el repositorio.

Esta corrección **no se aplicó** porque la tarea pide explicarla primero. Tampoco se ejecutó el seed.

---

## 7. Riesgos y pendientes

1. **Bloqueante:** rol y base inexistentes. Sin ellos, Prisma seguirá devolviendo `P1010`.
2. **Requiere autorización:** crear el rol y la base modifica el servidor. No se hizo.
3. **No se puede afirmar que la base esté vacía:** no hay acceso a la base destino. El estado de tablas y datos sigue siendo indeterminado.
4. **`_prisma_migrations` desconocida:** no se sabe si existe ni qué migraciones registra. No se aplicó ninguna.
5. **Migración inicial sin aplicar:** el archivo `20261126100330_init/migration.sql` está presente y validado offline (20 tablas, 29 FK, 18 índices), pero no se ejecutó.
6. **Arquitectura divergente:** el compose describe PostGIS 16 en contenedor; el servidor real es PostgreSQL 18 como servicio de Windows. No se cambió el método de instalación.
7. **Docker no disponible:** no se pudo verificar el contenedor `smartcana-db` ni su volumen.
8. **`trust` en loopback:** no es el bloqueante, pero conviene no exponer el servicio más allá de `127.0.0.1` sin revisión. No se modificó.
9. **Seed sin carga de `.env`:** propuesta lista, sin aplicar. El seed crea datos de demostración y usuarios con contraseña demo; ejecutarlo sobre una base real o compartida sería inapropiado.
10. **Sin commits ni push:** los cambios locales preexistentes (archivos generados de Prisma y documentos sin versionar) se dejaron tal cual.

---

## 8. Conclusión

**REQUIERE AUTORIZACIÓN — SE IDENTIFICÓ LA CAUSA, PERO LA CORRECCIÓN NECESITA PERMISOS.**

La causa del `P1010` está comprobada: el usuario `smartcana` y la base `smartcana` no existen en el PostgreSQL 18 local que escucha en el puerto `5432`. La corrección segura es crear ese rol y esa base sin borrar ni sobrescribir nada, reutilizando la contraseña ya configurada sin mostrarla. Como esa operación modifica usuarios/roles y objetos del servidor, se detuvo a la espera de autorización explícita.

### Autorización solicitada

Se necesita una de estas decisiones:

- **A (recomendada):** autorizar la creación del rol `smartcana` y la base `smartcana` en el PostgreSQL 18 local, sin modificar `.env`, sin cambiar contraseñas y sin crear tablas ni datos.
- **B:** indicar qué usuario y base existentes deben usarse y autorizar el ajuste de `DATABASE_URL` en `.env`.
- **C:** autorizar otra alternativa (por ejemplo levantar el compose), aceptando el cambio de servidor y el posible conflicto de puerto.

No se avanzó con migraciones ni seed.
