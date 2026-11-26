# 07 — Arquitectura GIS Profesional

> **Sprint 13** · GIS Profesional y Agricultura de Precisión
> Inspirado en ArcGIS, John Deere Operations Center, Climate FieldView, OneSoil y EOSDA Crop Monitoring.

---

## Visión General

El módulo GIS de SmartCaña es el **centro geográfico del sistema**: permite administrar los campos desde un mapa interactivo de nivel profesional, con polígonos reales, capas temáticas, herramientas de medición, integración de IA y datos climáticos.

La ruta principal es `/mapa`, accesible desde la Sidebar en ambos layouts (Dashboard y Executive Command Center).

---

## Stack Geoespacial

| Capa | Tecnología |
|---|---|
| Motor de mapa | Leaflet 1.9 |
| Bindings React | react-leaflet 5 (React 19, Next.js 16) |
| Formato espacial | GeoJSON (RFC 7946) |
| Base de datos (producción) | PostgreSQL + PostGIS |
| Base tiles | OSM, Esri World Imagery, OpenTopoMap, CARTO labels |
| Gráficos | Recharts (historial de producción) |

---

## Decisiones Arquitectónicas

### 1. Geometría real, no pines
Cada campo es un **Feature GeoJSON** con geometría `Polygon`. A partir del polígono se derivan:
- **Superficie (ha)** — fórmula de shoelace sobre proyección equirectangular
- **Perímetro (m)** — suma de distancias haversine entre vértices
- **Centroide** — promedio de vértices (usado para marcadores inteligentes)

Esto mantiene los datos 100% consistentes con lo que se mostrará en producción desde PostGIS (`ST_Area`, `ST_Perimeter`, `ST_Centroid`).

### 2. Coloreado temático
Los polígonos se colorean según la **métrica activa**:
- `shi` (default) → escala de 5 niveles configurables por el usuario
- `production` → tonalidad por producción estimada
- `costs` → tonalidad por costo por hectárea

La escala SHI es **editable en runtime** (rangos y colores) y la leyenda se adapta automáticamente.

### 3. Sistema de capas extensible
El panel de capas define `MapLayerId` en `types/gis.ts`. Cada capa es un bloque de renderizado dentro de `MapLayers` en `map-container.tsx`. Para agregar una capa nueva (p. ej. NDVI) solo se necesita:
1. Extender el union type `MapLayerId`
2. Agregar la definición en `LayerSelector`
3. Renderizar la capa en `MapLayers`
4. Agregar su mini-leyenda en `MapLegend`

### 4. Contexto global GIS
`gis-context.tsx` centraliza el estado: selección, capas visibles, mapa base, filtros, escala de colores, modo de medición y la instancia del mapa de Leaflet (para que los controles externos puedan actuar sobre el mapa).

### 5. Rendimiento
- `FieldPolygon` y `AiIndicator` están memoizados con comparadores custom
- Carga diferida (`next/dynamic`) del contenedor y paneles
- `LayerGroup` de Leaflet para marcadores
- Claves estables por `id` para reconciliación eficiente
- Preparado para cientos de lotes; para miles se recomienda clustering de marcadores y vector tiles

---

## Flujo de Datos

```
MOCK_FIELDS (base) ──► mock-gis.ts ──► GISFeature[] (GeoJSON)
                                          │
                          gis-context (filtros, capas)
                                          │
                    filteredFeatures (useMemo)
                                          │
                map-container ──► FieldPolygon[] (memorizados)
                                    │  click
                                    ▼
                    field-side-panel / mobile-field-panel
```

---

## Estructura de Archivos

```
apps/frontend/src/
├── types/gis.ts                  # Contratos: GISFeature, capas, filtros, clima, IA
├── lib/gis-utils.ts              # haversine, perímetro, centroide, área, color interpolado
├── lib/mock-gis.ts               # Datos: features, alertas, actividades, clima, IA, escala
└── components/gis/
    ├── gis-context.tsx           # Provider global (estado + derivaciones)
    ├── map-layout.tsx            # Orquestación de overlays + paneles
    ├── map-container.tsx         # Leaflet MapContainer + todas las capas
    ├── field-polygon.tsx         # Polígono + tooltip + popup + centroide (memo)
    ├── field-popup.tsx           # Contenido del popup al hacer clic
    ├── field-side-panel.tsx      # Panel lateral detallado (desktop)
    ├── mobile-field-panel.tsx    # Bottom-sheet (mobile/tablet)
    ├── map-toolbar.tsx           # Zoom, GPS, fullscreen, medir, reset
    ├── base-layer-switcher.tsx   # 4 mapas base
    ├── layer-selector.tsx        # Toggles de capas temáticas
    ├── map-legend.tsx            # Leyenda dinámica por métrica
    ├── map-filters.tsx           # Filtros avanzados
    ├── health-scale-settings.tsx # Editor de escala SHI
    ├── weather-overlay.tsx       # Condiciones + pronóstico 5 días
    ├── measurement-tool.tsx      # Medición distancia/superficie
    └── ai-indicator.tsx          # Marcadores IA pulsantes
```

---

## Capas Disponibles

| Capa | Fuente de datos | Representación |
|---|---|---|
| `fields` | `MOCK_GIS_FEATURES` | Polígonos coloreados por métrica + centroides |
| `alerts` | `MOCK_ALERTS` | Marcadores por severidad (crítico/alto/medio/bajo) |
| `activities` | `MOCK_ACTIVITIES` | Marcadores por tipo (cosecha, fertilización, riego, control, suelo) |
| `production` | `estimatedProduction` | Coloreado temático + activa leyenda de producción |
| `costs` | `costPerHectare` | Coloreado temático + activa leyenda de costos |
| `weather` | `MOCK_WEATHER` | Estaciones en mapa + overlay climático |

---

## Mapas Base

| ID | Nombre | Tiles |
|---|---|---|
| `osm` | Callejero | OpenStreetMap |
| `satellite` | Satélite | Esri World Imagery |
| `topographic` | Topográfico | OpenTopoMap |
| `hybrid` | Híbrido | Esri World Imagery + etiquetas CARTO |

---

## Medición

- **Distancia**: clic agrega vértices, se dibuja polilínea, total en m/km
- **Superficie**: 3+ vértices cierran polígono, área en ha
- Doble clic o tecla finaliza y limpia
- El cursor cambia a cruz mientras está activo

---

## Integración Clima

El overlay muestra condiciones actuales (temperatura, humedad, viento, lluvia) y pronóstico de 5 días. El adaptador está preparado para conectarse a una API externa (p. ej. Open-Meteo) reemplazando `MOCK_WEATHER` por una llamada real desde el backend.

---

## Integración IA

Las recomendaciones se renderizan como **marcadores pulsantes** sobre el lote afectado. Al hacer clic se abre el panel lateral con la explicación completa, nivel de confianza e impacto. Los lotes con riesgo detectado mantienen el marcador animado como indicador visual.

---

## Futura Evolución

Preparado para incorporar sin cambios de arquitectura:
- **Imágenes satelitales** y NDVI/NDRE como nuevas capas
- **Mapas de humedad y rendimiento** (capas temáticas adicionales)
- **Sensores IoT** (puntos en vivo) y **drones**
- **Machine Learning espacial** (coloreado por predicción de rendimiento)
- **Vector tiles / clustering** para miles de lotes
- Persistencia en **PostGIS** con consultas espaciales (`ST_*`)
