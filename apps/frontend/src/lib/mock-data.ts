import type {
  KpiData,
  ProductionDataPoint,
  CostDataPoint,
  AlertData,
  ActivityData,
  NavigationItem,
  WeatherData,
  CampaignData,
} from "@/types/dashboard";

export const MOCK_NAVIGATION: NavigationItem[] = [
  { id: "executive", label: "Centro de Comando", icon: "Monitor", href: "/executive", badge: "EX" },
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", href: "/dashboard" },
  { id: "fields", label: "Campos", icon: "Sprout", href: "/campos" },
  { id: "map", label: "Mapa", icon: "Map", href: "/mapa" },
  { id: "activities", label: "Actividades", icon: "ClipboardList", href: "/actividades" },
  { id: "production", label: "Producción", icon: "BarChart3", href: "/produccion" },
  { id: "costs", label: "Costos", icon: "DollarSign", href: "/costos" },
  { id: "inventory", label: "Inventario", icon: "Package", href: "/inventario" },
  { id: "reports", label: "Reportes", icon: "FileText", href: "/reportes" },
  { id: "ai", label: "IA", icon: "Bot", href: "/ia", badge: "AI" },
  { id: "audit", label: "Auditoría", icon: "Shield", href: "/audit" },
  { id: "sessions", label: "Sesiones", icon: "MonitorCheck", href: "/sessions" },
  { id: "settings", label: "Configuración", icon: "Settings", href: "/configuracion" },
];

export const MOCK_CAMPAIGNS: CampaignData[] = [
  { id: "2025-2026", label: "2025/2026", isActive: true },
  { id: "2024-2025", label: "2024/2025", isActive: false },
  { id: "2023-2024", label: "2023/2024", isActive: false },
];

export const MOCK_KPIS: KpiData[] = [
  { id: "fields-active", label: "Campos Activos", value: 12, unit: "", trend: "up", trendValue: "+2 vs 2024", icon: "Sprout", color: "brand" },
  { id: "hectares", label: "Hectáreas Cultivadas", value: 185.2, unit: "ha", trend: "up", trendValue: "+4.8%", icon: "Crop", color: "brand" },
  { id: "production", label: "Producción Estimada", value: 12458, unit: "t", trend: "up", trendValue: "+12.3%", icon: "Truck", color: "accent" },
  { id: "cost", label: "Costo Acumulado", value: 845200, unit: "$", trend: "up", trendValue: "+3.2%", icon: "Wallet", color: "warning", decimals: 0 },
  { id: "profitability", label: "Rentabilidad", value: 28.5, unit: "%", trend: "up", trendValue: "+2.1 pp", icon: "TrendingUp", color: "brand" },
  { id: "alerts", label: "Alertas Activas", value: 3, unit: "", trend: "down", trendValue: "-2 vs ayer", icon: "Bell", color: "error" },
  { id: "pending", label: "Actividades Pendientes", value: 7, unit: "", trend: "neutral", trendValue: "Sin cambios", icon: "Clock", color: "warning" },
  { id: "score", label: "Nivel General", value: 86, unit: "/100", trend: "up", trendValue: "+5 pts", icon: "Gauge", color: "brand" },
];

export const MOCK_PRODUCTION_DATA: ProductionDataPoint[] = [
  { campaign: "2021/22", production: 10200, yield_: 58.2, target: 65 },
  { campaign: "2022/23", production: 11050, yield_: 62.1, target: 65 },
  { campaign: "2023/24", production: 9800, yield_: 55.8, target: 68 },
  { campaign: "2024/25", production: 11900, yield_: 67.4, target: 70 },
  { campaign: "2025/26", production: 12458, yield_: 72.3, target: 70 },
];

export const MOCK_COST_DATA: CostDataPoint[] = [
  { name: "Labores", value: 320000, color: "#1DB85E" },
  { name: "Insumos", value: 245000, color: "#3B82F6" },
  { name: "Cosecha", value: 180000, color: "#F59A00" },
  { name: "Transporte", value: 65200, color: "#8B5CF6" },
  { name: "Otros", value: 35000, color: "#06B6D4" },
];

export const MOCK_ALERTS: AlertData[] = [
  {
    id: "a1",
    title: "Riesgo de lluvias intensas",
    description: "Se prevén precipitaciones >60mm en las próximas 72h. Revise el drenaje de los lotes bajos.",
    priority: "critical",
    category: "clima",
    timestamp: "2026-07-28T08:00:00",
    actionable: true,
  },
  {
    id: "a2",
    title: "Fertilización pendiente",
    description: "El Lote Norte requiere fertilización nitrogenada. La ventana óptima cierra en 5 días.",
    priority: "high",
    category: "cultivo",
    timestamp: "2026-07-28T06:30:00",
    actionable: true,
  },
  {
    id: "a3",
    title: "Bajo rendimiento esperado",
    description: "El Lote 7 muestra NDVI por debajo del umbral. Posible estrés hídrico.",
    priority: "medium",
    category: "monitoreo",
    timestamp: "2026-07-27T14:00:00",
    actionable: true,
  },
  {
    id: "a4",
    title: "Actividad sin registrar",
    description: "No se registraron actividades en el Lote 3 en los últimos 30 días.",
    priority: "low",
    category: "administrativo",
    timestamp: "2026-07-27T10:00:00",
    actionable: false,
  },
];

export const MOCK_ACTIVITIES: ActivityData[] = [
  {
    id: "act1",
    type: "harvest",
    title: "Cosecha Lote 4 completada",
    description: "12.4 t registradas. Rendimiento: 72.3 t/ha",
    timestamp: "2026-07-28T08:30:00",
    field: "Lote 4 — El Talita",
  },
  {
    id: "act2",
    type: "fertilization",
    title: "Fertilización Lote 7",
    description: "Urea 46% — 200 kg/ha. Aplicación terrestre.",
    timestamp: "2026-07-28T06:15:00",
    field: "Lote 7",
  },
  {
    id: "act3",
    type: "irrigation",
    title: "Riego programado Lote 2",
    description: "Riego por gravedad — 8 horas estimadas.",
    timestamp: "2026-07-27T16:00:00",
    field: "Lote 2",
  },
  {
    id: "act4",
    type: "control",
    title: "Control de malezas",
    description: "Aplicación de glifosato 48% — 3 L/ha.",
    timestamp: "2026-07-27T11:30:00",
    field: "Lote 5",
  },
  {
    id: "act5",
    type: "soil",
    title: "Muestreo de suelo",
    description: "Extracción de muestras para análisis de laboratorio.",
    timestamp: "2026-07-26T09:00:00",
    field: "Lote 3",
  },
  {
    id: "act6",
    type: "ai",
    title: "Recomendación IA generada",
    description: "Análisis de rendimiento: Lote 4 supera en 12% el promedio del campo.",
    timestamp: "2026-07-26T07:00:00",
  },
];

export const MOCK_WEATHER: WeatherData = {
  temperature: 32,
  condition: "partly-cloudy",
  humidity: 65,
  windSpeed: 12,
  maxTemp: 35,
  minTemp: 21,
};

export const MOCK_AI_RECOMMENDATIONS = [
  "Según las condiciones actuales, se recomienda postergar la fertilización del Lote Norte durante 48 horas debido a las lluvias pronosticadas.",
  "El Lote 4 presenta un rendimiento 18% superior al promedio del campo. Considere replicar el manejo en lotes con condiciones similares.",
  "Los costos de transporte aumentaron 7% este mes. Evaluar ruta alternativa por Ruta 307 para reducir 12 km por viaje.",
];
