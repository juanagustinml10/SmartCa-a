# ETAPA 1.3.2 — POSTGRESQL PREPARADO

**Fecha:** 26 de noviembre de 2026
**Autorización:** opción A del informe `ETAPA_1_3_1_CORRECCION_CONEXION.md`, autorizada explícitamente por el usuario.
**Objetivo:** crear únicamente el rol y la base necesarios en PostgreSQL 18 local y verificar la conexión de Prisma sin aplicar migraciones ni seed.
**Restricciones respetadas:** no se ejecutaron migraciones ni seed; no se ejecutaron `DROP`, `TRUNCATE` ni `DELETE`; no se recrearon bases; no se eliminaron ni modificaron roles existentes; no se cambió `pg_hba.conf` ni se desactivó autenticación; no se modificó `.env`; no se instaló Docker ni PostGIS; no se hicieron commits ni push. La contraseña se leyó en memoria y no se mostró, imprimió, registró ni modificó. La única escritura en el repositorio es este informe.

---

## 1. Resumen ejecutivo

| Ítem | Resultado |
|---|---|
| Rol `smartcana` | **Creado** (no existía; verificado antes de crear). |
| Permiso `LOGIN` | Confirmado: `rolcanlogin = t`. |
| Base `smartcana` | **Creada** (no existía; verificada antes de crear). |
| Propietario | Confirmado: `smartcana`. |
| Conexión Prisma | Corregida: `SELECT 1` → `Script executed successfully`, exit `0`. |
| Identidad de conexión | `smartcana` / `smartcana` / `public` / PostgreSQL 18.3. |
| `migrate status` | Ejecuta correctamente: 1 migración encontrada, `20261126100330_init` sin aplicar. |
| Tablas | 0 tablas de usuario, consultadas antes y después de `migrate status`. |
| `_prisma_migrations` | No existe, consultado antes y después de `migrate status`. |
| Conclusión | **CONEXIÓN RESTABLECIDA — LISTO PARA VALIDAR MIGRACIONES.** |

---

## 2. Operaciones autorizadas ejecutadas

Servidor utilizado: PostgreSQL 18.3 local, usuario administrador `postgres`, host `localhost`, puerto `5432`.

Antes de cada operación se repitió la comprobación de existencia:

```sql
SELECT count(*) FROM pg_roles WHERE rolname = 'smartcana';      -- 0
SELECT count(*) FROM pg_database WHERE datname = 'smartcana';   -- 0
```

### 2.1 Rol

- No existía.
- Se creó con `LOGIN` y la contraseña ya configurada en `apps/backend/.env`, leída en memoria.
- La contraseña se pasó como parámetro y se escapó con `format('%L', ...)`; no se imprimió ni se escribió en archivos.
- Se verificó previamente `SHOW log_statement;` → `none`, de modo que el servidor no registra sentencias con el valor.
- No se modificó ningún otro rol ni contraseña.

Resultado: `rol_creado=true`.

### 2.2 Base de datos

- No existía.
- Se creó con propietario `smartcana`.
- No se borró ni recreó ninguna base existente.

Resultado: `base_creada=true`.

### 2.3 Nota de ejecución

Hubo dos intentos preliminares de script que fallaron antes de crear objetos (uno por manejo de comillas en la línea de comandos y otro por falta de tipo explícito en un parámetro). En ambos casos se volvió a comprobar el estado y no se había creado ningún objeto. La ejecución definitiva fue la única que creó el rol y la base.

---

## 3. Verificaciones posteriores (solo lectura)

### 3.1 Rol y permiso `LOGIN`

```sql
SELECT rolname, rolcanlogin FROM pg_roles WHERE rolname = 'smartcana';
```

Resultado: `smartcana|t`. El rol existe y puede iniciar sesión.

### 3.2 Base y propietario

```sql
SELECT d.datname, pg_get_userbyid(d.datdba)
FROM pg_database d WHERE d.datname = 'smartcana';
```

Resultado: `smartcana|smartcana`. El propietario es el usuario correcto.

### 3.3 Conservación de objetos existentes

Listado final de roles: los mismos que antes (`pg_*`, `postgres`, `safeobserve`) más `smartcana`.
Listado final de bases: las mismas que antes (`consultorio_db`, `habit_tracker`, `padel_audit_test`, `padel_dev`, `postgres`, `safeobserve_db`, `template0`, `template1`) más `smartcana`.

No se eliminó ni modificó ningún objeto preexistente.

### 3.4 Identidad de la conexión

Conectando como `smartcana` contra `smartcana`:

```sql
SELECT current_user, current_database(), current_schema(), version();
```

Resultado:

```text
smartcana|smartcana|public|PostgreSQL 18.3 on x86_64-windows, compiled by msvc-19.44.35225, 64-bit
```

La conexión corresponde a la base y al schema esperados.

### 3.5 Prisma `SELECT 1`

```text
npx prisma db execute --stdin    (entrada: SELECT 1;)
```

Resultado: `Script executed successfully`, exit `0`. El config se cargó desde `prisma.config.js`.

### 3.6 Estado de migraciones

```text
npx prisma migrate status
```

Salida relevante:

```text
Datasource "db": PostgreSQL database "smartcana", schema "public" at "localhost:5432"

1 migration found in prisma/migrations
Following migration have not yet been applied:
20261126100330_init
```

Exit `1`. Este código refleja que la migración está pendiente, **no** un error de conexión: el comando consultó el estado real correctamente. No se ejecutó `migrate deploy`, `migrate dev`, `db push` ni `migrate reset`.

### 3.7 Tablas y `_prisma_migrations`

Consultas de solo lectura antes y después de `migrate status`:

| Consulta | Antes | Después |
|---|---:|---:|
| Tablas de usuario (`information_schema.tables`, excluyendo `pg_catalog` e `information_schema`) | 0 | 0 |
| `to_regclass('public._prisma_migrations')` | `NO_EXISTE` | `NO_EXISTE` |

`migrate status` no creó tablas ni la tabla de control de migraciones. La base quedó con 0 tablas de usuario. No se asumió este estado: fue verificado.

---

## 4. Archivos modificados

- `docs/ETAPA_1_3_2_POSTGRESQL_PREPARADO.md` — este informe (nuevo).

No se modificaron:

- `apps/backend/.env`;
- `apps/backend/prisma.config.ts` ni `prisma.config.js`;
- `apps/backend/prisma/seed.ts`;
- `pg_hba.conf` ni ningún archivo del servidor;
- `docker/docker-compose.yml`;
- migraciones ni datos.

Los 28 archivos generados de Prisma y los documentos `REVISION_PREVIA_COMMITS.md`, `ETAPA_1_3_DIAGNOSTICO_POSTGRESQL.md` y `ETAPA_1_3_1_CORRECCION_CONEXION.md` permanecen en su estado previo, sin versionar ni commitear.

---

## 5. Problemas pendientes

1. **Migración inicial pendiente:** `20261126100330_init` no está aplicada. Requiere autorización separada para ejecutar la migración; esta etapa no la aplicó.
2. **`_prisma_migrations` inexistente:** se creará cuando se aplique la migración, no antes. Hoy no hay registro de migraciones aplicadas.
3. **Seed sin carga de `.env`:** sigue sin importar `dotenv/config`. La propuesta de añadir `import "dotenv/config";` como primera línea de `apps/backend/prisma/seed.ts` continúa pendiente y no se aplicó. El seed no se ejecutó.
4. **Arquitectura divergente:** el compose describe PostGIS 16 en contenedor; la instancia real es PostgreSQL 18 local. No se cambió el método de instalación.
5. **Sin commits ni push:** no se realizó ninguna operación de Git sobre estos cambios.

---

## 6. Conclusión

**CONEXIÓN RESTABLECIDA — LISTO PARA VALIDAR MIGRACIONES.**

El `P1010` quedó resuelto: el rol y la base `smartcana` existen, el rol tiene `LOGIN`, la base pertenece a `smartcana`, Prisma ejecuta `SELECT 1` y `migrate status` informa el estado real. No se aplicó ninguna migración ni se ejecutó el seed.
