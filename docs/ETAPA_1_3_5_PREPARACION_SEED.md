# ETAPA 1.3.5 — PREPARACIÓN Y VALIDACIÓN DEL SEED

**Fecha:** 26 de noviembre de 2026
**Alcance:** revisión estática del seed, corrección autorizada de la carga de variables de entorno y validaciones sin escribir en la base. **No se ejecutó el seed.**
**Restricciones respetadas:** no se ejecutó `prisma db seed` ni `seed.ts`; no se insertaron, actualizaron ni eliminaron registros; no se ejecutaron migraciones ni `db push`; no se modificó `.env`, el esquema Prisma, la configuración ni las migraciones; no se instalaron dependencias; no se hicieron commits ni push. No se muestran contraseñas, hashes ni valores de `.env`.

---

## 1. Archivos revisados

Se leyeron íntegramente:

| Archivo | Líneas revisadas |
|---|---:|
| `apps/backend/prisma/seed.ts` | 783 originales / 784 tras la corrección |
| `apps/backend/package.json` | 108 |
| `apps/backend/prisma.config.ts` | 12 |
| `apps/backend/prisma/schema.prisma` | 470 |

Puntos de configuración confirmados:

- `package.json` define `prisma:seed` como `ts-node --esm prisma/seed.ts`.
- `prisma.config.ts` importa `dotenv/config`, pero la CLI de Prisma no interviene en el script `prisma:seed`; por eso el seed necesitaba su propia carga.
- `bcrypt@^6.0.0` y `@types/bcrypt@^6.0.0` están declarados.
- El generador Prisma apunta a `../src/generated/prisma`, que es el cliente importado por el seed.

---

## 2. Modificaciones realizadas

**Única modificación de código:** se añadió como primera línea de `apps/backend/prisma/seed.ts`:

```ts
import "dotenv/config";
```

Antes de la corrección, el archivo no contenía ninguna referencia a `dotenv`. Después de la corrección, la comprobación estática confirma que la importación está presente.

No se modificaron:

- `.env` ni ningún valor de credencial;
- `schema.prisma`, migraciones ni `prisma.config.ts`;
- `package.json` ni dependencias;
- la lógica del seed, sus UUID, datos, contraseñas ni relaciones.

También se creó este informe. No se hicieron commits ni push.

---

## 3. Validaciones ejecutadas

| Validación | Resultado |
|---|---|
| `npx prisma validate` | EXIT `0` — esquema válido. |
| Typecheck del backend (`tsc --noEmit --project tsconfig.json`) | EXIT `0`, sin errores. No generó archivos. |
| Typecheck del seed (`tsc --noEmit` con opciones `nodenext`, porque `tsconfig.json` excluye `prisma/seed.ts`) | EXIT `0`, sin errores. |
| Carga aislada de `dotenv/config` | `DATABASE_URL_cargada=true`. No se imprimió el valor. |
| UUID deterministas | Formato válido (`00000000-0000-4000-8000-…`), versión 4 y variante correctas, longitud 36. |
| Constantes de grupo | 17 grupos, todos únicos y dentro de un byte (`0x01`–`0x11`). |
| Análisis estático del seed | 16 `upsert`, 2 `createMany` con `skipDuplicates: true`, 0 `Math.random()`, 0 apariciones de `admin123`, 1 `bcrypt.hash`, 30 llamadas a `uuid()`. |
| Permisos y roles | 44 permisos sin duplicados; 7 roles; 161 relaciones rol-permiso; 0 permisos inexistentes referenciados. |

---

## 4. Análisis de idempotencia

El seed usa identificadores deterministas y estrategias de no duplicación en todas las entidades:

| Entidad | Estrategia | Rerun |
|---|---|---|
| Permisos (44) | `createMany({ skipDuplicates: true })` + `findMany` por código | Sin duplicados; se reutilizan los IDs existentes |
| Estados de campo (4) | `upsert` por ID determinista, `update: {}` | Sin cambios |
| Variedades (3) | `upsert` por ID determinista, `update: {}` | Sin cambios |
| Campañas (2) | `upsert` por ID determinista, `update: {}` | Sin cambios |
| Tipos de actividad (6) | `upsert` por ID determinista, `update: {}` | Sin cambios |
| Categorías de costo (4) | `upsert` por ID determinista, `update: {}` | Sin cambios |
| Empresa (1) | `upsert` por `cuit` único, `update: {}` | Sin cambios |
| Establecimiento (1) | `upsert` por ID determinista | Sin cambios |
| Proveedor (1) | `upsert` por ID determinista | Sin cambios |
| Configuración (1) | `upsert` por clave compuesta `companyId_key` | Sin cambios |
| Roles (7) | `upsert` por `companyId_code` | Sin cambios |
| Relaciones rol-permiso (161) | `createMany({ skipDuplicates: true })` con IDs deterministas | Sin duplicados |
| Usuarios (3) | `upsert` por `email` único | Sin cambios |
| Campos (3) | `upsert` por ID determinista | Sin cambios |
| Actividades (6) | `upsert` por ID determinista | Sin cambios |
| Costos (6) | `upsert` por ID determinista | Sin cambios |
| Cosechas (3) | `upsert` por ID determinista | Sin cambios |
| Alertas (3) | `upsert` por ID determinista | Sin cambios |
| Sesiones, auditoría | No se generan | Sin cambios |

Detalles relevantes:

- La función `uuid(grupo, índice)` produce UUID v4 deterministas; los 17 grupos son únicos y cada índice se usa una sola vez dentro de su grupo, por lo que no hay colisiones previstas.
- `update: {}` en los 16 `upsert` garantiza que una segunda ejecución no reescriba filas existentes.
- `bcrypt.hash` se calcula en cada ejecución, pero como los usuarios se crean con `upsert` y `update: {}`, el hash existente no se sobrescribe. Por eso el estado de la base es estable entre reruns.
- Los `createMany` con `skipDuplicates: true` usan las restricciones únicas de `permissions.code`, `role_permissions.id` y `role_permissions(role_id, permission_id)`.
- No hay `Math.random()`, fechas `now()` aleatorias en los datos ni IDs autogenerados que cambien entre ejecuciones.

**Resultado:** el seed es idempotente por diseño. No se ejecutó, por lo que la idempotencia fue verificada estáticamente, no en runtime.

---

## 5. Usuarios demo y roles previstos

Sin revelar hashes, contraseñas ni secretos:

**Empresa y entorno**

- 1 empresa de demostración con CUIT de prueba.
- 1 establecimiento principal en Tucumán, Argentina.
- 1 proveedor de demostración.
- 1 configuración `price_per_ton`.
- 3 campos, 6 actividades, 6 costos, 3 cosechas y 3 alertas.

**Roles (7)**

| Código | Permisos |
|---|---:|
| `super_admin` | 44 (solo catálogo; ningún usuario demo lo usa) |
| `admin` | 42 |
| `gerente` | 30 |
| `supervisor` | 14 |
| `ingeniero` | 17 |
| `operador` | 9 |
| `invitado` | 5 |

Total: 44 permisos globales y 161 relaciones rol-permiso. Los 44 códigos de permiso referenciados existen en el catálogo del seed.

**Usuarios demo (3)**

| Email | Rol |
|---|---|
| `admin@smartcana.com` | `admin` |
| `ingeniero@smartcana.com` | `ingeniero` |
| `operador@smartcana.com` | `operador` |

Los tres comparten una contraseña exclusiva de desarrollo definida en el código. Se almacena como hash `bcrypt` con coste `10`; el valor de la contraseña y el hash no se muestran en este informe. Ningún usuario demo tiene el rol `super_admin`.

**Coherencia con el esquema:** todos los campos obligatorios de las entidades creadas se proporcionan; las claves foráneas se resuelven desde mapas construidos a partir de registros ya insertados, con comprobaciones que lanzan error si falta una referencia. Los campos opcionales no utilizados (`activityId`, `userId` en costos, sesiones, auditoría) quedan vacíos, lo cual es válido según `schema.prisma`.

---

## 6. Confirmación de que la base sigue vacía

Conteo exacto por tabla mediante consultas de solo lectura:

| Tabla | Filas |
|---|---:|
| `_prisma_migrations` | 1 |
| Todas las 20 tablas de dominio | 0 |

No hay registros en `companies`, `users`, `roles`, `permissions`, `fields`, `activities`, `costs`, `harvests`, `field_alerts` ni en ninguna otra tabla de dominio. La migración `20261126100330_init` sigue registrada como aplicada. No hay cambios inesperados.

---

## 7. Confirmación de que no se ejecutó el seed

**No se ejecutó el seed.** No se llamó a `prisma db seed`, a `npm run prisma:seed` ni a `ts-node prisma/seed.ts`. No se insertó ningún registro de demostración. La única comprobación de ejecución fue una prueba aislada que importó `dotenv/config` y devolvió un booleano, sin ejecutar el seed ni conectarse para escribir.

---

## 8. Problemas pendientes

1. **Ejecución no probada en runtime:** está prohibida en esta etapa. Se validaron el typecheck y la carga de variables, pero no el recorrido completo del script.
2. **Contraseña demo en el código:** es de diseño y exclusiva de desarrollo; no debe ejecutarse contra una base de producción. No se revela aquí.
3. **Estrategia `update: {}`:** una segunda ejecución no corrige filas que hubieran sido modificadas manualmente; solo evita duplicados.
4. **GIS:** el permiso `map.view` existe, pero la base sigue sin PostGIS ni tipos espaciales, según la etapa 1.3.3. No se instaló nada.
5. **Archivos locales sin versionar:** 28 archivos generados de Prisma modificados y varios documentos de etapas anteriores siguen sin commitear. No se hicieron commits ni push.
6. **Datos no sembrados:** sesiones y registros de auditoría no se crean intencionalmente; es coherente con el esquema.

---

## 9. Recomendación final

**APTO CON OBSERVACIONES**

El seed está corregido, es coherente con el esquema, respeta las relaciones, usa UUID deterministas y bcrypt, no contiene datos aleatorios ni contraseñas inseguras, y es idempotente por diseño. Nada impide su ejecución sobre la base de desarrollo `smartcana`.

Las observaciones documentadas —contraseña exclusiva de desarrollo, ejecución no probada en runtime, `update: {}` y ausencia de GIS— no requieren cambios adicionales antes de ejecutarlo, pero deben tenerse presentes.

No se ejecutó el seed. Su ejecución requiere una autorización independiente del usuario.
