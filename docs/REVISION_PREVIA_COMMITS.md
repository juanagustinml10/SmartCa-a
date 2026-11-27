# REVISIÓN PREVIA A COMMITS — ETAPAS 1.1 Y 1.2

**Fecha:** 26 de noviembre de 2026  
**Objetivo:** dejar una propuesta de agrupación de archivos para los commits de la Etapa 1.1 (seguridad/autenticación) y la Etapa 1.2 (base de datos, migración y seed), sin ejecutar commits, push, migraciones ni seed.  
**Restricciones respetadas durante la revisión:** no se modificó código, no se borraron archivos, no se cambió configuración, no se tocó PostgreSQL, no se hicieron commits ni push. La única escritura es este informe.

---

## 1. Estado de Git observado

| Aspecto | Valor |
|---|---|
| Rama | `main...origin/main` |
| Commit base | `1609d8e Initial commit: estado actual de SmartCaña` |
| Índice (`git diff --cached`) | Vacío: 0 archivos preparados |
| Archivos modificados | **95** |
| Archivos nuevos (antes de este informe) | **12** |
| Archivos eliminados | **0** |
| `git diff --stat` general | 95 archivos, 27.253 inserciones, 39.429 eliminaciones |
| Sin `src/generated/prisma/` | 67 archivos, 1.887 inserciones, 849 eliminaciones |
| Solo `src/generated/prisma/` | 28 archivos, 25.366 inserciones, 38.580 eliminaciones |
| `git diff --check` | EXIT 1 por trailing whitespace, exclusivamente en `apps/backend/src/generated/prisma/` |
| `git diff --check -- . ":(exclude)apps/backend/src/generated/prisma"` | Sin errores de whitespace; solo advertencias LF→CRLF de Git en Windows |

**Conteo de archivos nuevos antes de este informe (12):**

1. `apps/backend/prisma/migrations/20261126100330_init/migration.sql`
2. `apps/backend/prisma/migrations/migration_lock.toml`
3. `apps/backend/src/audit/dto/query-audit.dto.ts`
4. `apps/backend/src/common/config/required-env.ts`
5. `apps/backend/src/common/constants/roles.ts`
6. `apps/backend/src/common/decorators/permissions.decorator.ts`
7. `apps/backend/src/common/guards/permissions.guard.ts`
8. `apps/backend/src/security/auth-tenancy.spec.ts`
9. `apps/frontend/src/lib/auth-tokens.ts`
10. `docs/AUDITORIA_INTEGRAL_SMARTCANA.md`
11. `docs/ETAPA_1_1_SEGURIDAD_AUTENTICACION.md`
12. `docs/ETAPA_1_2_BASE_DE_DATOS.md`

Este informe sería el décimo tercer archivo nuevo si se decide versionarlo.

---

## 2. Propuesta de commit 1.1 — Seguridad, autenticación y tenancy

**Contenido:** 64 archivos modificados + 9 archivos nuevos.  
**No incluir:** migración, seed, `tsconfig.json`, `.gitignore` ni clientes Prisma regenerados.

### 2.1 Modificados (64)

**Configuración y pruebas (5)**

- `apps/backend/.env.example`
- `apps/backend/package.json`
- `apps/backend/src/app.controller.spec.ts`
- `apps/backend/test/app.e2e-spec.ts`
- `apps/backend/test/jest-e2e.json`

**Arranque, autenticación, guards y auditoría (9)**

- `apps/backend/src/app.module.ts`
- `apps/backend/src/audit/audit.controller.ts`
- `apps/backend/src/audit/audit.service.ts`
- `apps/backend/src/auth/auth.module.ts`
- `apps/backend/src/auth/auth.service.ts`
- `apps/backend/src/auth/strategies/jwt-refresh.strategy.ts`
- `apps/backend/src/auth/strategies/jwt.strategy.ts`
- `apps/backend/src/common/guards/roles.guard.ts`
- `apps/backend/src/prisma/prisma.service.ts`

**Módulos backend con corrección de `companyId`/permisos (50)**

- `apps/backend/src/company/company.controller.ts`
- `apps/backend/src/company/company.repository.ts`
- `apps/backend/src/company/company.service.ts`
- `apps/backend/src/company/interfaces/company-repository.interface.ts`
- `apps/backend/src/cost-categories/cost-categories.controller.ts`
- `apps/backend/src/cost-categories/dto/create-cost-category.dto.ts`
- `apps/backend/src/costs/costs.controller.ts`
- `apps/backend/src/costs/costs.repository.ts`
- `apps/backend/src/costs/costs.service.ts`
- `apps/backend/src/costs/interfaces/costs-repository.interface.ts`
- `apps/backend/src/farm/farm.controller.ts`
- `apps/backend/src/farm/farm.repository.ts`
- `apps/backend/src/farm/farm.service.ts`
- `apps/backend/src/farm/interfaces/farm-repository.interface.ts`
- `apps/backend/src/fields/fields.controller.ts`
- `apps/backend/src/fields/fields.repository.ts`
- `apps/backend/src/fields/fields.service.ts`
- `apps/backend/src/fields/interfaces/fields-repository.interface.ts`
- `apps/backend/src/harvests/harvests.controller.ts`
- `apps/backend/src/harvests/harvests.repository.ts`
- `apps/backend/src/harvests/harvests.service.ts`
- `apps/backend/src/harvests/interfaces/harvests-repository.interface.ts`
- `apps/backend/src/reports/reports.repository.ts`
- `apps/backend/src/roles/dto/update-role.dto.ts`
- `apps/backend/src/roles/interfaces/roles-repository.interface.ts`
- `apps/backend/src/roles/roles.controller.ts`
- `apps/backend/src/roles/roles.repository.ts`
- `apps/backend/src/roles/roles.service.ts`
- `apps/backend/src/sessions/sessions.controller.ts`
- `apps/backend/src/sessions/sessions.service.ts`
- `apps/backend/src/settings/settings.controller.ts`
- `apps/backend/src/shi/shi.service.ts`
- `apps/backend/src/suppliers/interfaces/suppliers-repository.interface.ts`
- `apps/backend/src/suppliers/suppliers.controller.ts`
- `apps/backend/src/suppliers/suppliers.repository.ts`
- `apps/backend/src/suppliers/suppliers.service.ts`
- `apps/backend/src/users/dto/update-user.dto.ts`
- `apps/backend/src/users/interfaces/users-repository.interface.ts`
- `apps/backend/src/users/users.controller.ts`
- `apps/backend/src/users/users.repository.ts`
- `apps/backend/src/users/users.service.ts`

**Frontend (9)**

- `apps/frontend/src/app/campos/[id]/page.tsx`
- `apps/frontend/src/app/campos/page.tsx`
- `apps/frontend/src/app/profile/page.tsx`
- `apps/frontend/src/components/auth/login-form.tsx`
- `apps/frontend/src/contexts/auth-context.tsx`
- `apps/frontend/src/lib/api-fields.ts`
- `apps/frontend/src/lib/api.ts`
- `apps/frontend/src/types/auth.ts`
- `apps/frontend/src/types/fields.ts`

### 2.2 Nuevos (9)

- `apps/backend/src/audit/dto/query-audit.dto.ts`
- `apps/backend/src/common/config/required-env.ts`
- `apps/backend/src/common/constants/roles.ts`
- `apps/backend/src/common/decorators/permissions.decorator.ts`
- `apps/backend/src/common/guards/permissions.guard.ts`
- `apps/backend/src/security/auth-tenancy.spec.ts`
- `apps/frontend/src/lib/auth-tokens.ts`
- `docs/AUDITORIA_INTEGRAL_SMARTCANA.md`
- `docs/ETAPA_1_1_SEGURIDAD_AUTENTICACION.md`

### 2.3 Verificación ya registrada para este commit

- 19/19 tests unitarios y 1/1 e2e.
- Typechecks de backend y frontend: EXIT 0.
- Builds de backend y frontend: EXIT 0.
- Pruebas con mocks de Prisma: no validan PostgreSQL real.
- El informe de la etapa distingue `CORREGIDO`, `PROBADO` y `PENDIENTE`; no presenta la tenancy real con dos empresas como resuelta.

---

## 3. Propuesta de commit 1.2 — Migración inicial, seed y documentación

**Contenido mínimo recomendado:** 3 archivos modificados + 3 archivos nuevos, más la decisión sobre los 28 archivos generados de Prisma.  
**No incluir:** cambios de autenticación/frontend de la Etapa 1.1.

### 3.1 Modificados (3)

- `.gitignore` — deja de ignorar `apps/backend/prisma/migrations/`.
- `apps/backend/prisma/seed.ts` — seed reescrito con UUID deterministas y `upsert`.
- `apps/backend/tsconfig.json` — excluye `prisma/seed.ts` del typecheck principal.

### 3.2 Nuevos (3)

- `apps/backend/prisma/migrations/20261126100330_init/migration.sql`
- `apps/backend/prisma/migrations/migration_lock.toml`
- `docs/ETAPA_1_2_BASE_DE_DATOS.md`

### 3.3 Clientes Prisma regenerados (28)

Estos archivos ya estaban versionados en el commit inicial y aparecen modificados por `npx prisma generate` con Prisma 7.9.1:

- `apps/backend/src/generated/prisma/browser.ts`
- `apps/backend/src/generated/prisma/client.ts`
- `apps/backend/src/generated/prisma/commonInputTypes.ts`
- `apps/backend/src/generated/prisma/enums.ts`
- `apps/backend/src/generated/prisma/internal/class.ts`
- `apps/backend/src/generated/prisma/internal/prismaNamespace.ts`
- `apps/backend/src/generated/prisma/internal/prismaNamespaceBrowser.ts`
- `apps/backend/src/generated/prisma/models.ts`
- `apps/backend/src/generated/prisma/models/Activity.ts`
- `apps/backend/src/generated/prisma/models/ActivityType.ts`
- `apps/backend/src/generated/prisma/models/AuditLog.ts`
- `apps/backend/src/generated/prisma/models/Campaign.ts`
- `apps/backend/src/generated/prisma/models/Company.ts`
- `apps/backend/src/generated/prisma/models/Cost.ts`
- `apps/backend/src/generated/prisma/models/CostCategory.ts`
- `apps/backend/src/generated/prisma/models/Farm.ts`
- `apps/backend/src/generated/prisma/models/Field.ts`
- `apps/backend/src/generated/prisma/models/FieldAlert.ts`
- `apps/backend/src/generated/prisma/models/FieldStatus.ts`
- `apps/backend/src/generated/prisma/models/Harvest.ts`
- `apps/backend/src/generated/prisma/models/Permission.ts`
- `apps/backend/src/generated/prisma/models/Role.ts`
- `apps/backend/src/generated/prisma/models/RolePermission.ts`
- `apps/backend/src/generated/prisma/models/Session.ts`
- `apps/backend/src/generated/prisma/models/Setting.ts`
- `apps/backend/src/generated/prisma/models/Supplier.ts`
- `apps/backend/src/generated/prisma/models/User.ts`
- `apps/backend/src/generated/prisma/models/Variety.ts`

**Hallazgo:** `schema.prisma` no está modificado. El diff de estos archivos es principalmente cambio de estilo del generador (comillas dobles, sin punto y coma, líneas reagrupadas, comentarios con trailing whitespace), no un cambio de esquema. Aun ignorando whitespace, el ruido sigue siendo alto.

**Decisión pendiente del usuario:**

- **Opción A — commit mínimo y legible (recomendada para revisión):** excluir estos 28 archivos de ambos commits con pathspec explícito y dejarlos fuera del historial de esta etapa. Deben quedar fuera del índice; el cliente se regenera con `npx prisma generate`. Consecuencia: el árbol de trabajo seguirá sucio hasta que se decida revertirlos o commitearlos por separado. **No revertir sin autorización.**
- **Opción B — conservar el criterio actual del repo:** incluirlos en la Etapa 1.2 o en un commit mecánico separado (`chore: regenerate prisma client`). Es coherente con que ya están trackeados, pero acepta un diff muy ruidoso y con errores de `git diff --check`.

En cualquiera de las dos opciones, **no mezclarlos con el commit 1.1**.

### 3.4 Verificación ya registrada para este commit

- `prisma validate` y `prisma generate`: EXIT 0.
- Hash idéntico entre la migración y un diff regenerado: `02FBB8957DB41635FC853FEF51DE5A3A5F33009329A9D6F0E268E791A6EEB5C2`.
- 3400 UUID generados por el helper: 0 inválidos, 0 duplicados.
- Typecheck aislado del seed, 19/19 tests, 1/1 e2e y builds: EXIT 0.
- Todo es **offline**. Queda pendiente `migrate deploy`, seed doble real, login demo, reportes con `price_per_ton`, FK/índices y tenancy con dos empresas.

---

## 4. Archivos y artefactos que no deben agregarse

| Ruta / patrón | Motivo |
|---|---|
| `apps/backend/.env` | Existe localmente y está ignorado por `apps/backend/.gitignore:3`. Contiene configuración real; **no preparar**. |
| `apps/frontend/.env` | Existe localmente; no aparece en `git status` y debe permanecer ignorado. |
| `docker/.env` | Ignorado por `.gitignore:13`; no agregar. |
| `apps/frontend/.next/dev/logs/next-development.log` | Log de desarrollo ignorado; no agregar. |
| `node_modules/`, `dist/`, `.next/`, `coverage/`, `docker/data/`, `*.tsbuildinfo` | Artefactos generados/ignorados; no agregar. |
| `apps/backend/prisma.config.js`, `apps/backend/prisma/seed.js`, `apps/backend/prisma/seed.js.map`, `apps/backend/prisma/seed.d.ts` | Artefactos compilados **ya trackeados desde antes** y sin cambios en esta revisión. No modificar ni volver a agregar dentro de estas etapas. |
| `apps/backend/src/generated/prisma/` (28 archivos) | No agregar al commit 1.1. Decidir entre Opción A u Opción B antes del commit 1.2. |
| Secretos de test en `apps/backend/src/security/auth-tenancy.spec.ts` | Son valores de prueba (`test-access-secret...`, `test-refresh-secret...`); se versionan con el commit 1.1, pero no deben reutilizarse fuera de tests. |
| Credencial demo en `apps/backend/prisma/seed.ts` (`SmartCañaDemo2026!`) | Es credencial explícita de desarrollo para el seed; no usar en producción. |
| Cadenas históricas inseguras en `docs/AUDITORIA_INTEGRAL_SMARTCANA.md` (`super-secret-change-me`, `admin123`) | Se citan como hallazgos de auditoría, no como secretos activos. Si la política del repo prohíbe cualquier literal de este tipo, redactar en un cambio documental separado. |
| `apps/backend/prisma/seed.js` trackeado | Contiene `admin123` en código compilado preexistente. No fue tocado en esta revisión; sugiere limpieza futura separada. |

No se encontraron correos personales en los documentos nuevos ni credenciales reales en los archivos modificados. Las únicas coincidencias secret-like están en tests, seed demo, documentación histórica y el artefacto compilado preexistente indicado arriba.

---

## 5. Problemas encontrados

1. **Ruido excesivo en clientes Prisma regenerados.** 28 archivos trackeados cambian por formato del generador, no por `schema.prisma`. `git diff --check` falla por trailing whitespace en esos archivos.
2. **Salto de línea LF/CRLF.** Git advierte en casi todos los archivos modificados que LF será reemplazado por CRLF. No son errores de contenido, pero hacen menos predecible el diff y pueden multiplicar cambios.
3. **Existen `.env` locales reales.** No están en Git ni en el índice, pero cualquier `git add -A` sin pathspec podría intentar incluirlos si se cambia `.gitignore`. Usar `git add` por rutas.
4. **Artefactos compilados preexistentes versionados.** `prisma.config.js`, `seed.js`, `seed.js.map` y `seed.d.ts` ya están trackeados. `seed.js` conserva la contraseña demo antigua `admin123`. Esto no fue introducido por 1.1/1.2.
5. **Alcance amplio pero cohesionado de la Etapa 1.1.** Los 64 archivos modificados corresponden a los módulos listados en `docs/ETAPA_1_1_SEGURIDAD_AUTENTICACION.md` §7 (auth, guards, tenancy por módulo, frontend y pruebas). No se detectaron cambios ajenos a 1.1/1.2 fuera de los generados Prisma.
6. **Contrato HTTP con `companyId` legacy.** Los DTOs de algunos módulos todavía aceptan `companyId`; la lógica lo ignora/sobrescribe, pero el contrato público no se limpió. Queda pendiente documentado.
7. **Health check requiere JWT.** `GET /` y `GET /health` no tienen `@Public` por el guard global; hay que decidir si el health check debe ser público para monitoreo.
8. **Validación real todavía pendiente.** La Etapa 1.2 demostró consistencia migración↔esquema offline, pero nunca aplicó la migración ni ejecutó dos veces el seed. La Etapa 1.1 probó guards con mocks, no con dos empresas PostgreSQL.
9. **`QueryAuditDto` rechaza `companyId` extra** cuando `forbidNonWhitelisted` está activo. Es el comportamiento buscado, pero cualquier cliente que enviaba ese parámetro debe actualizarse.
10. **Agregar este informe cambia el conteo.** Quedaría un archivo nuevo adicional; debe incluirse explícitamente en el commit de documentación que se elija.

---

## 6. Recomendaciones antes de cualquier commit

1. **Mantener el índice vacío hasta decidir la Opción A/B de Prisma.** No ejecutar `git add -A`.
2. **Hacer primero el commit 1.1** con los 64 modificados y 9 nuevos de la §2. Usar pathspecs explícitos. Incluir `docs/AUDITORIA_INTEGRAL_SMARTCANA.md` y `docs/ETAPA_1_1_SEGURIDAD_AUTENTICACION.md`.
3. **Hacer después el commit 1.2** con `.gitignore`, `prisma/seed.ts`, `tsconfig.json`, los 2 archivos de migración y `docs/ETAPA_1_2_BASE_DE_DATOS.md`. Agregar `docs/REVISION_PREVIA_COMMITS.md` aquí o en un commit documental separado.
4. **Decidir el destino de los 28 generados Prisma antes de preparar el índice.** Si se elige la Opción A, verificar con `git diff --cached --name-only` que ninguno aparezca. Si se elige la Opción B, preferir un commit separado y aceptar el ruido.
5. **Ejecutar `git diff --cached --check` después de preparar.** Debe quedar limpio, o al menos entendible si se incluyó el cliente generado.
6. **No tocar `.env`, logs ni artefactos compilados.** Verificar `git status --short --untracked-files=all` antes de confirmar.
7. **No ejecutar commits ni push** hasta que el usuario autorice explícitamente esta revisión.
8. **Cuando se autorice PostgreSQL:** `migrate deploy`, seed dos veces, login con credenciales demo, verificación de `price_per_ton`, FK/índices y matriz de tenancy con dos empresas. Ninguno de esos resultados debe citarse como probado antes de ejecutarse.
9. **Line endings:** si se quiere eliminar el ruido LF/CRLF, hacerlo como decisión separada (por ejemplo `.gitattributes` o configuración de Git), no dentro de los commits funcionales.

---

## 7. Estado de "implementado" vs. "pendiente" en la documentación existente

| Documento | Estado que declara | Uso correcto en los commits |
|---|---|---|
| `docs/ETAPA_1_1_SEGURIDAD_AUTENTICACION.md` | `CORREGIDO`, `PROBADO`, `PENDIENTE / PENDIENTE DE VERIFICACIÓN` | No citar tenancy real ni login en navegador como probados. |
| `docs/ETAPA_1_2_BASE_DE_DATOS.md` | `IMPLEMENTADO`, `PROBADO OFFLINE`, `PENDIENTE DE POSTGRESQL REAL` | No citar `migrate deploy` ni idempotencia real como ejecutados. |
| `docs/AUDITORIA_INTEGRAL_SMARTCANA.md` | Hallazgos históricos de la auditoría base | Referencia; no debe interpretarse como cambios aplicados. |
| Este informe | `OBSERVADO`/`RECOMENDADO` | No modifica código ni ejecuta acciones sobre Git más allá de la lectura. |

---

## 8. Cierre

El árbol de trabajo contiene exactamente los cambios esperables de las Etapas 1.1 y 1.2, más el ruido de la regeneración del cliente Prisma y la documentación correspondiente. No hay eliminaciones, no hay nada preparado en el índice y no se ejecutaron commits, push, migraciones ni seed. La única decisión técnica abierta es qué hacer con los 28 archivos generados de `apps/backend/src/generated/prisma/`.
