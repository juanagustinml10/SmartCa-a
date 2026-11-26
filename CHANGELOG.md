# Changelog

## [0.4.0] — 2026-08-06

### Added — Sprint 13: GIS Profesional & Agricultura de Precisión

#### Motor Geográfico
- Mapa GIS de nivel empresarial en `/mapa` (inspirado en ArcGIS, John Deere Operations Center, Climate FieldView, OneSoil, EOSDA)
- Leaflet + React Leaflet integrados con React 19 y Next.js 16
- Arquitectura preparada para PostGIS y GeoJSON en producción
- Carga diferida del mapa con Next.js dynamic y fallback de carga

#### Polígonos Inteligentes
- Cada campo representado como polígono GeoJSON real (no pines)
- Cálculo automático de superficie (ha), perímetro (m) y centroide
- Tooltip sticky con nombre y nivel de salud al pasar el cursor
- Popup con resumen al hacer clic
- Marcadores de centroide con color según estado

#### Escala de Colores Configurable
- 5 niveles: Excelente (verde intenso), Bueno (verde claro), Atención (amarillo), Riesgo (naranja), Crítico (rojo)
- Editor de escala de colores con selector de color y rangos editables
- Persistencia en tiempo real sobre el mapa
- Leyenda dinámica que se adapta a la métrica activa

#### Sistema de Capas
- Panel de capas con toggles: Campos, Alertas, Actividades, Producción, Costos, Clima
- Coloreado temático: SHI (por defecto), Producción (tonalidad), Costo/ha (tonalidad)
- Marcadores de alertas coloreados por severidad (crítico/alto/medio/bajo)
- Marcadores de actividades coloreados por tipo (cosecha, fertilización, riego, control, suelo)
- Capas climáticas con estaciones y datos de pronóstico
- Arquitectura extensible para futuras capas (NDVI, NDRE, humedad, rendimiento, IoT)

#### Herramientas de Mapa
- Zoom +/-, localización GPS, pantalla completa
- Medición de distancia (polilínea con total en m/km)
- Medición de superficie (polígono con área en ha)
- Indicador de medición en vivo con instrucciones
- Restablecer vista al centro de operaciones
- Doble clic o tecla para finalizar medición

#### Mapas Base
- 4 mapas base: Callejero (OSM), Satélite (Esri), Topográfico (OpenTopoMap), Híbrido (satélite + etiquetas)
- Switcher con vista previa de color

#### Filtros Avanzados
- Búsqueda por texto (lote, empresa, establecimiento)
- Filtro por empresa, campaña, estado y variedad
- Rangos de SHI y Producción con sliders duales
- Actualización automática del mapa
- Contador de lotes visibles en la leyenda

#### Panel Lateral de Lote
- Información general (empresa, establecimiento, variedad, campaña, suelo, riego)
- Métricas: superficie, perímetro, producción, costo/ha
- Historial de producción con gráfico de área (Recharts)
- Costos por categoría con barras de progreso
- Actividades recientes, alertas y recomendaciones IA
- Acciones rápidas: ver detalle, cerrar
- Panel móvil tipo bottom-sheet adaptado a pantallas pequeñas

#### Integración IA
- Recomendaciones IA directamente sobre el mapa
- Marcadores pulsantes por tipo (riesgo, advertencia, oportunidad, insight)
- Cambio de color en lotes con riesgo detectado
- Apertura de explicación completa desde el marcador

#### Clima
- Overlay climático con condiciones actuales (temperatura, humedad, viento, lluvia)
- Pronóstico de 5 días con iconos y colores por condición
- Integración preparada con API meteorológica externa (fallback mock)
- Estaciones climáticas renderizadas en el mapa

#### Rendimiento
- Componentes memoizados (FieldPolygon, AiIndicator) con comparadores custom
- Carga diferida de componentes pesados
- Mocks derivados de datos base para renderizado eficiente
- Arquitectura preparada para cientos de lotes (LayerGroup, keys estables)

#### Responsive
- Desktop: panel lateral, capas y leyenda visibles
- Tablet: capas y toolbar adaptados
- Mobile: bottom-sheet para detalle, toolbar compacto
- Leyenda oculta en pantallas pequeñas

#### Componentes Reutilizables
- MapLayout, FieldPolygon, MapToolbar, LayerSelector, MapLegend, FieldPopup, FieldSidePanel, WeatherOverlay, MapFilters, MeasurementTool, BaseLayerSwitcher, HealthScaleSettings, AiIndicator, MobileFieldPanel
- Contexto GIS centralizado (gis-context) con estado global
- Utilidades geoespaciales (haversine, perímetro, centroide, área, interpolación de color)

## [0.3.0] — 2026-08-04

### Added — Sprint 12: Enterprise Security & Multi-Tenancy

#### Seguridad Base
- **Helmet** integrado como middleware global (headers de seguridad HTTP)
- **ThrottlerModule** configurado para rate limiting global
- **JWT + Refresh Token** con sesiones persistentes en base de datos
- Login con campo "Recordarme" para sesiones extendidas

#### Modelo de Permisos (RBAC)
- 44 permisos granulares definidos (dashboard, fields, activities, production, costs, harvests, shi, ia, reports, executive, map, users, roles, permissions, companies, sessions, audit, settings, suppliers)
- Modelo Permission en Prisma con relación RolePermission
- Módulo Permissions completo: module, controller, service, repository, interface
- Endpoints: `GET /permissions` (listar), `GET /permissions/:code` (buscar por código)

#### Gestión de Roles
- 7 roles por empresa: super_admin, admin, gerente, supervisor, ingeniero, operador, invitado
- Asignación de permisos por rol con RolePermission
- CRUD completo de roles: module, controller, service, repository, interface, DTOs
- Endpoints: `GET /roles`, `GET /roles/:id`, `POST /roles`, `PATCH /roles/:id`, `DELETE /roles/:id`
- Campo `isSystem` para proteger roles predefinidos

#### Gestión de Sesiones
- Modelo Session en Prisma con tracking de device, IP, user agent, ubicación
- Sesiones se crean en login y se eliminan en logout/refresh
- Módulo Sessions completo: module, controller, service, repository, interface
- Endpoints: `GET /sessions` (mis sesiones), `POST /sessions/:id/revoke`, `POST /sessions/revoke-all`
- Revocación remota de sesiones desde cualquier dispositivo

#### Auditoría
- Enhanced AuditLog con campos `userName`, `description` e índices
- Módulo Audit: search, filter by action/entity/user/date, pagination, export
- Endpoints: `GET /audit` con query params (action, entity, userId, dateFrom, dateTo, search, page, limit)
- 25+ tipos de acciones de auditoría soportados

#### Frontend - Páginas
- **Página Auditoría** (`/audit`): tabla con búsqueda, filtros, ordenamiento, paginación, export preparada
- **Página Sesiones** (`/sessions`): lista de sesiones activas con iconos de dispositivo, revocación remota, tips de seguridad
- Sidebar actualizado en ambos módulos (Dashboard y Executive) con links a Auditoría y Sesiones

#### Frontend - Tipos y Mocks
- Tipos `AuditLogEntry`, `Session`, `AuditAction`, `AuditEntity`
- Mock data: 30 entradas de auditoría, 5 sesiones
- Navegación mock actualizada

#### Seed Data
- 44 permisos sembrados
- 7 roles por empresa con permisos asignados
- Usuario admin por defecto: `admin@smartcana.com` / `admin123`

#### Compatibilidad
- Tipos compartidos actualizados: RoleCode (agregado `super_admin`), PermissionCode, SessionInfo, AuditLogEntry
- Users DTO extendido con campos: phone, position, language, timezone
- Auth DTO extendido con campo `remember`
- Prisma schema regenerado con nuevas relaciones

## [0.2.0] — 2026-07-29

### Added — Sprint 11: Executive Command Center

#### Ruta /executive
- Nueva página ejecutiva de alto nivel en `/executive`
- Layout independiente del dashboard tradicional
- Header inteligente con reloj en vivo, fecha, y selector de zona horaria
- Sidebar compacta con navegación a todos los módulos

#### KPIs Ejecutivos
- 10 indicadores en tiempo real: Producción Total, Producción Proyectada, Costo Total, Costo por Hectárea, Rentabilidad, SHI Promedio, Alertas Activas, Actividades Pendientes, Riesgo IA, Temperatura Actual
- Contadores animados con Framer Motion
- Indicadores de tendencia (↑ ↓ →) con valores comparativos
- Tooltips explicativos en cada KPI
- Barras de progreso animadas en hover
- Formato inteligente de números (K/M)

#### Mapa GIS
- Integración definitiva de Leaflet con react-leaflet
- Capa base CartoDB dark
- Polígonos GeoJSON coloreados según SHI
- Tooltips interactivos con nombre y score
- Click en lote abre panel lateral con información detallada
- Colores adaptativos según estado de salud (verde/azul/amarillo/rojo)

#### Panel IA
- Resumen diario generado por IA
- Recomendación principal con nivel de riesgo
- Predicción de producción con barra de confianza
- Predicción financiera con indicador de confianza
- Lista de recomendaciones activas con tipo (riesgo, oportunidad, advertencia, insight)
- Animaciones de entrada secuenciales

#### Timeline
- Vista cronológica de actividades, costos, alertas y consultas IA
- Filtros por tipo de evento
- Filtros por severidad (crítica, alta, media)
- Búsqueda por texto
- Sincronización con campo seleccionado en mapa
- Indicador visual de severidad con borde lateral

#### Tablero de Gráficos
- 6 tipos de gráficos sincronizados: Línea, Radar, Barras, Donut, Área, Treemap
- Tooltips personalizados
- Selección en gráficos actualiza contexto global
- Integración con Recharts
- Gradientes personalizados

#### Filtros Globales
- Filtro por empresa, establecimiento, campo, campaña
- Filtro por estado, categoría, proveedor
- Filtro por rango de fechas
- Botón para limpiar todos los filtros
- Animación de entrada/salida

#### Widget System
- Arquitectura preparada para drag & drop
- WidgetWrapper reutilizable con handle de agarre
- Sistema de personalización: mostrar/ocultar widgets
- Panel de configuración de widgets (modal)
- Persistencia de layout en localStorage

#### Modo Centro de Control
- Botón de pantalla completa
- Oculta sidebar y expande contenido
- Optimizado para pantallas grandes
- Animaciones de transición

#### Exportación
- Infraestructura preparada para exportar: PDF, Imagen, PowerPoint, Excel
- Modal de selección de formato
- Indicador visual de próximamente

#### Rendimiento
- Lazy Loading del mapa Leaflet con Next.js dynamic
- Componentes memoizados con React.memo
- Suspense boundaries en carga de mapa
- Código splitting de componentes pesados

#### Responsive
- Grid adaptativo: mobile (2 cols), tablet (3 cols), desktop (6 cols KPIs)
- Sidebar adaptativa
- Ocultamiento de elementos en breakpoints específicos
- Experiencia optimizada por tamaño de pantalla

#### Conexiones
- Indicador de estado de sistemas (DB, API, GIS, IA)
- Notificaciones en vivo con contador no leídas

## [0.1.0] — 2026-07-28

### Added

- Inicialización del monorepo con npm workspaces
- Frontend Next.js con App Router, TypeScript, Tailwind CSS
- Backend NestJS con TypeScript y Prisma ORM
- Configuración de Docker (PostgreSQL + PostGIS + pgAdmin)
- Design System completo (docs/05-design-system.md)
- Landing page temporal con estado del proyecto
- README, LICENSE, CONTRIBUTING, CHANGELOG
- Prettier, ESLint, EditorConfig
- Variables de entorno de ejemplo

### Documentación

- docs/01-vision-del-producto.md
- docs/02-arquitectura-del-sistema.md
- docs/03-modelo-de-negocio.md
- docs/04-base-de-datos.md
- docs/05-design-system.md
