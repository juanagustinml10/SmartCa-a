# SmartCaña

**Plataforma AgTech Inteligente para la Gestión Integral de Cultivos de Caña de Azúcar**

SmartCaña es una plataforma SaaS diseñada para transformar la gestión de cultivos de caña de azúcar mediante digitalización integral, visualización geográfica, analítica inteligente y asistencia basada en Inteligencia Artificial.

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16+ | App Router, SSR/SSG |
| React | 19+ | UI declarativa |
| TypeScript | 5+ | Tipado estático |
| Tailwind CSS | 4+ | Estilos utilitarios |
| shadcn/ui | — | Componentes base |
| Framer Motion | 12+ | Animaciones |
| Lucide React | — | Iconografía |
| Recharts | — | Visualización de datos |
| Leaflet | — | Mapas interactivos |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| NestJS | 11+ | Framework backend |
| TypeScript | 5+ | Tipado estático |
| Prisma | 7+ | ORM / Base de datos |
| PostgreSQL | 16+ | Base de datos relacional |
| PostGIS | 3.4+ | Extensiones geoespaciales |

---

## Estructura del Proyecto

```
smart-cana/
├── apps/
│   ├── frontend/          # Next.js App Router
│   │   ├── src/
│   │   │   ├── app/       # Rutas y layouts
│   │   │   ├── components/# Componentes UI
│   │   │   └── lib/       # Utilidades
│   │   └── ...
│   └── backend/           # NestJS API
│       ├── src/
│       │   ├── prisma/    # Servicio Prisma
│       │   └── ...
│       ├── prisma/        # Schema Prisma
│       └── ...
├── docs/                  # Documentación del proyecto
├── docker/                # Configuración Docker
├── packages/              # Paquetes compartidos (futuro)
│   ├── types/             # Tipos TypeScript compartidos
│   ├── ui/                # Componentes UI compartidos
│   └── config/            # Configuraciones compartidas
├── scripts/               # Scripts de utilidad
└── .github/               # CI/CD (futuro)
```

---

## Requisitos

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** y **Docker Compose** (para base de datos)

---

## Cómo Ejecutar

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd smart-cana
npm install
```

### 2. Iniciar base de datos

```bash
docker compose -f docker/docker-compose.yml up -d
```

Esto inicia PostgreSQL 16 con PostGIS en `localhost:5432` y pgAdmin en `http://localhost:5050`.

### 3. Configurar variables de entorno

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend (ya incluye defaults)
```

### 4. Iniciar en desarrollo

```bash
# Frontend (http://localhost:3000)
npm run dev:frontend

# Backend (http://localhost:3001)
npm run dev:backend

# Ambos simultáneamente
npm run dev
```

### Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia frontend y backend |
| `npm run dev:frontend` | Solo frontend |
| `npm run dev:backend` | Solo backend |
| `npm run build` | Build de frontend y backend |
| `npm run lint` | Lint de frontend y backend |
| `npm run format` | Formatear código con Prettier |
| `npm run format:check` | Verificar formato |

---

## Executive Command Center

SmartCaña incluye un **Centro de Comando Ejecutivo** de nivel enterprise en la ruta `/executive`.

Inspirado en plataformas como Palantir Foundry, Microsoft Fabric, Power BI, SAP Analytics Cloud, ArcGIS Dashboard, Datadog y Grafana Enterprise.

### Capacidades

| Componente | Descripción |
|---|---|
| **KPIs Ejecutivos** | 10 indicadores con animación, tendencia, tooltips y comparación |
| **Mapa GIS** | Leaflet con GeoJSON, polígonos coloreados por SHI, tooltips interactivos |
| **Panel IA** | Resumen diario, recomendaciones, predicciones de producción y financieras |
| **Timeline** | Línea temporal con filtros por tipo, severidad y búsqueda |
| **Tablero de Gráficos** | 6 tipos sincronizados: Línea, Radar, Barras, Donut, Área, Treemap |
| **Filtros Globales** | Filtros que afectan todos los widgets en tiempo real |
| **Modo Centro de Control** | Pantalla completa optimizada para monitores grandes |
| **Personalización** | Mostrar/ocultar widgets, persistencia en localStorage |
| **Exportación** | Infraestructura preparada para PDF, Imagen, PowerPoint, Excel |

### Arquitectura

```
src/
├── app/executive/              # Ruta /executive
├── components/executive/       # Componentes del Command Center
│   ├── executive-layout.tsx     # Layout principal
│   ├── executive-header.tsx     # Header inteligente
│   ├── executive-sidebar.tsx    # Sidebar compacta
│   ├── executive-kpi.tsx        # KPIs animados
│   ├── global-filters.tsx       # Filtros globales
│   ├── executive-map-widget.tsx # Mapa GIS (Leaflet)
│   ├── executive-map-inner.tsx  # Renderizado del mapa
│   ├── ia-panel.tsx             # Panel de IA
│   ├── executive-timeline.tsx   # Timeline
│   ├── chart-grid.tsx           # Gráficos sincronizados
│   ├── detail-panel.tsx         # Panel lateral de detalle
│   ├── widget-wrapper.tsx       # Contenedor de widgets
│   ├── widget-settings.tsx      # Configuración de widgets
│   └── export-modal.tsx         # Modal de exportación
├── contexts/executive-context.tsx # Estado global
├── types/executive.ts            # Tipos y contratos
└── lib/mock-executive.ts         # Datos mock
```

---

## Security & RBAC

SmartCaña implementa un sistema de **Control de Acceso Basado en Roles (RBAC)** con 44 permisos granulares y 7 roles por empresa.

### Roles por Defecto

| Rol | Acceso |
|---|---|
| `super_admin` | Total (todos los permisos) |
| `admin` | Total excepto gestión de permisos y empresas |
| `gerente` | Operaciones + reportes + IA |
| `supervisor` | Campos, actividades, costos, producción, harvest |
| `ingeniero` | Supervisor + crear/editar costos y producción |
| `operador` | Lectura + crear actividades |
| `invitado` | Solo lectura básica |

### Endpoints de Seguridad

| Endpoint | Descripción |
|---|---|
| `POST /auth/login` | Login con JWT + refresh token |
| `POST /auth/refresh` | Renovar access token |
| `POST /auth/logout` | Cerrar sesión (revoca refresh token) |
| `GET /sessions` | Listar sesiones activas del usuario |
| `POST /sessions/:id/revoke` | Revocar sesión remota |
| `POST /sessions/revoke-all` | Revocar todas las demás sesiones |
| `GET /permissions` | Listar permisos disponibles |
| `GET /roles` | CRUD de roles con permisos |
| `GET /audit` | Logs de auditoría con filtros |

## Roadmap

| Fase | Estado | Descripción |
|---|---|---|
| Fase 1 | ✅ | Visión del Producto |
| Fase 2 | ✅ | Arquitectura del Sistema |
| Fase 3 | ✅ | Modelo de Negocio |
| Fase 4 | ✅ | Diseño de Base de Datos |
| Fase 5 | ✅ | Design System + UX/UI |
| Sprint 1 | ✅ | Inicialización del proyecto |
| Sprint 2 | ✅ | Módulo de Autenticación |
| Sprint 3 | ✅ | Módulo de Campos |
| Sprint 4 | ✅ | Módulo de Actividades |
| Sprint 5 | ✅ | Módulo de Producción |
| Sprint 6 | ✅ | Módulo de Costos |
| Sprint 7 | ✅ | Dashboard e IA |
| Sprint 11 | ✅ | Executive Command Center |
| Sprint 12 | ✅ | Enterprise Security & Multi-Tenancy |
| Sprint 13 | ✅ | GIS Profesional & Agricultura de Precisión |

---

## GIS Profesional

SmartCaña incluye un **Sistema de Información Geográfica** de nivel empresarial en la ruta `/mapa`.

Inspirado en funcionalidades de ArcGIS, John Deere Operations Center, Climate FieldView, OneSoil y EOSDA Crop Monitoring.

### Capacidades

| Componente | Descripción |
|---|---|
| **Polígonos inteligentes** | Campos representados como polígonos GeoJSON con área, perímetro y centroide |
| **Escala de colores** | 5 niveles configurables (Excelente → Crítico) con editor de rangos y colores |
| **Sistema de capas** | Campos, Alertas, Actividades, Producción, Costos, Clima (extensible) |
| **Mapas base** | Callejero (OSM), Satélite, Topográfico, Híbrido |
| **Herramientas** | Zoom, GPS, fullscreen, medición de distancia y superficie, reset de vista |
| **Filtros** | Empresa, campaña, estado, variedad, rangos de SHI y producción |
| **Panel de lote** | Información general, producción histórica, costos, actividades, alertas, IA |
| **IA en el mapa** | Marcadores pulsantes con recomendaciones y nivel de riesgo por lote |
| **Clima** | Condiciones actuales + pronóstico de 5 días, API extensible |

### Arquitectura GIS

```
src/
├── app/mapa/                      # Ruta /mapa
├── components/gis/
│   ├── gis-context.tsx            # Estado global GIS
│   ├── map-layout.tsx             # Layout del mapa con overlays
│   ├── map-container.tsx          # Contenedor Leaflet + capas
│   ├── field-polygon.tsx          # Polígono de campo (memoizado)
│   ├── field-popup.tsx            # Popup al hacer clic
│   ├── field-side-panel.tsx       # Panel lateral completo
│   ├── mobile-field-panel.tsx     # Bottom-sheet móvil
│   ├── map-toolbar.tsx            # Herramientas (zoom, GPS, medir...)
│   ├── base-layer-switcher.tsx    # 4 mapas base
│   ├── layer-selector.tsx         # Toggles de capas
│   ├── map-legend.tsx             # Leyenda dinámica
│   ├── map-filters.tsx            # Filtros avanzados
│   ├── health-scale-settings.tsx  # Editor de escala de colores
│   ├── weather-overlay.tsx        # Overlay climático
│   ├── measurement-tool.tsx       # Medición distancia/superficie
│   └── ai-indicator.tsx           # Marcadores IA pulsantes
├── lib/gis-utils.ts               # Utilidades geoespaciales
├── lib/mock-gis.ts                # Datos GIS mock
└── types/gis.ts                   # Contratos GIS
```

### Futura Evolución

La arquitectura está preparada para incorporar:
- Imágenes satelitales y NDVI/NDRE
- Mapas de humedad y rendimiento
- Sensores IoT y drones
- Machine Learning espacial

---

## Licencia

MIT © 2026 SmartCaña — Tesis TUP, UTN
