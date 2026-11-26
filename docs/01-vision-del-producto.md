# SmartCaña — Visión del Producto

**Plataforma AgTech Inteligente para la Gestión Integral de Cultivos de Caña de Azúcar**

| Campo | Detalle |
|---|---|
| **Nombre del proyecto** | SmartCaña |
| **Tipo de documento** | Visión del Producto (v1.0) |
| **Autor** | SmartCaña — Equipo de Desarrollo |
| **Fecha** | Julio 2026 |
| **Contexto** | Tesis Final — Tecnicatura Universitaria en Programación (TUP), UTN |
| **Clasificación** | Documento Confidencial — Uso Académico |

---

## Índice

1. [Visión del Proyecto](#1-visión-del-proyecto)
2. [Problema que Resuelve](#2-problema-que-resuelve)
3. [Oportunidad de Negocio](#3-oportunidad-de-negocio)
4. [Público Objetivo](#4-público-objetivo)
5. [Tipos de Usuarios](#5-tipos-de-usuarios)
6. [Objetivos Generales](#6-objetivos-generales)
7. [Objetivos Específicos](#7-objetivos-específicos)
8. [Alcance del Proyecto](#8-alcance-del-proyecto)
9. [Funcionalidades Principales](#9-funcionalidades-principales)
10. [Funcionalidades Futuras](#10-funcionalidades-futuras)
11. [Propuesta de Valor](#11-propuesta-de-valor)
12. [Diferenciadores Frente a Otros Sistemas](#12-diferenciadores-frente-a-otros-sistemas)
13. [Beneficios para Productores](#13-beneficios-para-productores)
14. [Beneficios para Ingenios](#14-beneficios-para-ingenios)
15. [Beneficios para Investigadores](#15-beneficios-para-investigadores)
16. [Riesgos del Proyecto](#16-riesgos-del-proyecto)
17. [Limitaciones](#17-limitaciones)
18. [Tecnologías Recomendadas](#18-tecnologías-recomendadas)
19. [Posibles Integraciones Futuras](#19-posibles-integraciones-futuras)
20. [Conclusión](#20-conclusión)

---

## 1. Visión del Proyecto

**SmartCaña** es una plataforma web AgTech diseñada para transformar la gestión de cultivos de caña de azúcar mediante la digitalización integral de procesos agrícolas, la visualización geográfica de datos, la analítica inteligente y la asistencia basada en Inteligencia Artificial.

La caña de azúcar es el cultivo más antiguo y económicamente determinante del noroeste argentino. Tucumán concentra más del 70% de la superficie implantada del país, procesando anualmente entre 14 y 16 millones de toneladas de materia prima, con una industria que involucra a cientos de productores, más de 10 ingenios azucareros activos y una cadena productiva que se extiende desde la siembra hasta la exportación de azúcar y derivados.

Sin embargo, a pesar de su importancia estratégica, el sector cañero argentino opera con niveles de digitalización significativamente inferiores a los de otras regiones productoras como Brasil, Australia o India. La mayoría de los productores dependen de registros en papel, planificación basada en经验 empírica, y una coordinación deficiente con los ingenios que resulta en colas de camiones de horas e incluso días, pérdidas de materia prima por degradación del azúcar en campo, y una toma de decisiones que carece de datos georreferenciados y analítica avanzada.

**SmartCaña** nace con la visión de cerrar esta brecha tecnológica, ofreciendo una solución moderna, escalable y preparada para el futuro que permita a productores cañeros, ingenios, asesores agronómicos e investigadores tomar decisiones basadas en datos, optimizar recursos, reducir costos y mejorar la productividad sostenible del cultivo.

**La visión a largo plazo** es consolidar a SmartCaña como la plataforma de referencia para la gestión inteligente de la caña de azúcar en Latinoamérica, incorporando progresivamente capacidades de agricultura de precisión, sensores IoT, imágenes satelitales, drones e Inteligencia Artificial predictiva.

---

## 2. Problema que Resuelve

El cultivo de caña de azúcar en Argentina enfrenta una serie de problemas estructurales que afectan la productividad, la rentabilidad y la sostenibilidad de la actividad:

### 2.1 Fragmentación de la Información Agrícola

La información relacionada con el cultivo —historial de variedades, análisis de suelos, registros de fertilización, aplicaciones de agroquímicos, rendimientos por parcela, datos climáticos— se encuentra dispersa en planillas de papel, cuadernos de campo, registros informales y, en algunos casos, hojas de cálculo aisladas. No existe una fuente única de verdad que permita al productor o al ingenio acceder a información completa y confiable de cada parcela.

### 2.2 Falta de Visibilidad Geográfica

Los productores cañeros manejan múltiples parcelas distribuidas geográficamente, a menudo con superficies que van desde 40 hectáreas hasta más de 10.000 hectáreas. Actualmente no cuentan con herramientas que les permitan visualizar sus campos en un mapa, identificar zonas de bajo rendimiento, detectar anomalías en el cultivo o planificar operaciones de campo de forma espacialmente informada.

### 2.3 Coordinación Deficiente con los Ingenios

Uno de los problemas más críticos documentados en el sector cañero tucumano es la falta de coordinación entre productores e ingenios. Como consecuencia, se producen largas colas de camiones en los patios de recepción de los ingenios, con tiempos de espera que pueden extenderse desde horas hasta varios días. Estos tiempos de espera generan múltiples problemas:

- **Degradação do açúcar:** A caña cortada começa a perder sacarose imediatamente após a colheita. Bactérias e evaporação reduzem o teor de açúcar, diminuindo o rendimento efetivo por tonelada.
- **Aumento de custos logísticos:** Mais camões são necessários para compensar a menor eficiência de transporte, elevando o custo total da logística.
- **Pérdidas económicas directas:** Cada tonelada de caña que não chega ao ingenio a tempo representa insumos, energía, trabalho e capital que não se convertem em açúcar.

### 2.4 Ausencia de Analítica de Datos

Sin datos históricos estructurados, es imposible realizar análisis de tendencias, comparar rendimientos entre campañas, evaluar el impacto de decisiones agronómicas o construir modelos predictivos. El productor opera en modo reactivo, respondiendo a problemas cuando ya están manifestados en vez de anticiparse a ellos.

### 2.5 Gestión Ineficiente de Costos

El control de costos en la producción de caña —insumos, maquinaria, mano de obra, transporte— es frecuentemente rudimentario. Muchos productores no disponen de una visión clara de la rentabilidad por parcela, lo que dificulta la optimización de inversiones y la toma de decisiones económicas informadas.

### 2.6 Toma de Decisiones Basada en Experiencia, No en Datos

Las decisiones sobre cuándo fertilizar, cuándo cosechar, qué variedad sembrar o cuánto regar se toman tradicionalmente basándose en la experiencia del productor o del capataz. Si bien esta experiencia tiene un valor incalculable, carece de la precisión y el respaldo estadístico que la tecnología actual puede ofrecer.

### 2.7 Resistencia a la Adopción Tecnológica

Históricamente, las herramientas tecnológicas disponibles para el sector cañero han sido costosas, complejas, diseñadas para otros contextos productivos (como granos o soja) o directamente inaccesibles para pequeños y medianos productores. Esto ha generado una brecha tecnológica significativa entre la agricultura de precisión aplicada a otros cultivos y la gestión del cultivo de caña de azúcar.

---

## 3. Oportunidad de Negocio

### 3.1 Mercado Regional

Argentina es el sexto productor mundial de azúcar, con una producción que oscila entre 800.000 y 1.000.000 de toneladas anuales. La provincia de Tucumán procesa entre 14 y 16 millones de toneladas de caña por campaña, con más de 300.000 hectáreas bajo cultivo y alrededor de 12 ingenios activos. La industria genera miles de empleos directos e indirectos y representa un pilar fundamental de la economía regional.

### 3.2 Mercado AgTech en Crecimiento

El mercado de agricultura de precisión en Latinoamérica se proyecta con una tasa de crecimiento compuesto anual del 10-15% hasta 2030. Brasil y Argentina lideran la adopción de tecnologías agrícolas digitales. Sin embargo, la caña de azúcar ha sido históricamente un cultivo subatendido por las plataformas AgTech existentes, que se han enfocado predominantemente en granos, soja y cereales.

### 3.3 Brecha No Ocupada

Las plataformas existentes para gestión de caña (como SugarGIS en India, Copla-GIS en Brasil, SugarMaps en Australia o CaneSense en Tailandia) son solutions developadas para contextos productivos muy diferentes al argentino. No están adaptadas a la estructura de tenencia de tierras, la relación cañero-inguenio, las condiciones climáticas, las variedades locales ni la normativa vigente. Existe una oportunidad clara de desarrollo de una solución local que atienda estas particularidades.

### 3.4 Demanda de Sostenibilidad

La presión regulatoria y del mercado internacional por producciones más sostenibles, con menor huella hídrica, reducción de emisiones de gases de efecto invernadero y manejo responsable de agroquímicos, crea una demanda creciente de herramientas que permitan medir, reportar y optimizar la huella ambiental del cultivo.

### 3.5 Diversificación de la Industria Azucarera

La industria cañera argentina está diversificándose hacia bioetanol, bioelectricidad, bioplásticos y otros subproductos de la caña. Esta diversificación requiere gestión más sofisticada de la cadena productiva, lo que amplifica la demanda de plataformas digitales integrales.

---

## 4. Público Objetivo

### 4.1 Productores Cañeros

Desde pequeños productores con 40 hectáreas hasta grandes explotaciones con más de 10.000 hectáreas. Incluye productores independientes que comercializan caña a uno o más ingenios, así como productores integrados a ingenios mediante contratos de abastecimiento.

### 4.2 Ingenios Azucareros

Empresas industriales que procesan caña de azúcar para producir azúcar, bioetanol, bioelectricidad y otros derivados. Necesitan visibilidad sobre la disponibilidad y calidad de la materia prima, coordinación logística eficiente y datos de campo para optimizar su operación.

### 4.3 Asesores Agronómicos

Profesionales que brindan asesoramiento técnico a productores y necesita herramientas para monitorear el estado de los cultivos, generar recomendaciones fundamentadas y dar seguimiento a las acciones implementadas.

### 4.4 Investigadores y Centros de Investigación

Instituciones como la EEAOC, INTA, universidades y centros de investigación que estudian el cultivo de caña y necesitan datos históricos, herramientas de análisis espacial y plataformas para validar hipótesis agronómicas.

### 4.5 Contratistas y Transportistas

Empresas y profesionales que prestan servicios de cosecha, transporte y otras operaciones de campo, y que requieren coordinación eficiente con productores e ingenios.

---

## 5. Tipos de Usuarios

### 5.1 Productor Cañero ( Rol Primario )

El usuario principal de la plataforma. Su perfil varía significativamente:

| Subtipo | Superficie | Perfil Tecnológico | Necesidad Principal |
|---|---|---|---|
| Pequeño productor | 40–200 ha | Bajo-medio | Gestión básica, control de costos |
| Mediano productor | 200–600 ha | Medio | Analítica, planificación, reportes |
| Grande productor | 600–10.000+ ha | Medio-alto | Gestión integral, agricultura de precisión |

**Funciones típicas:**
- Registrar y gestionar parcelas con información georreferenciada
- Registrar actividades de campo (siembra, fertilización, control fitosanitario, cosecha)
- Visualizar el estado de sus cultivos en mapa
- Analizar rendimientos históricos y costos
- Coordinar la cosecha y el transporte con el ingenio
- Recibir alertas y recomendaciones basadas en datos
- Generar reportes para gestión interna y para el ingenio

### 5.2 Encargado de Campo / Capataz

Responsable de la operación diaria en el campo. Ejecuta las tareas planificadas por el productor o el asesor agronómico y necesita herramientas simples de uso en campo (mobile) para registrar actividades, reportar incidencias y consultar instrucciones.

### 5.3 Ingeniero Agrónomo / Asesor Técnico

Profesional que brinda recomendaciones técnicas basadas en datos. Requiere acceso a la información de múltiples productores o parcelas, capacidad de análisis comparativo, y herramientas para generar recomendaciones de fertilización, manejo varietal, control de plagas y enfermedades, y planificación de cosecha.

### 5.4 Gerente / Responsable de Compras del Ingenio

Necesita visibilidad sobre la disponibilidad de caña en el territorio, la calidad estimada de la materia prima, la logística de acopio y los volúmenes comprometidos por productor. La plataforma le permite planificar la campaña molienda, optimizar la logística de recepción y gestionar la relación con los proveedores de caña.

### 5.5 Investigador

Accede a datos anonimizados o autorizados para análisis estadístico, validación de modelos agronómicos, publicación científica y desarrollo de nuevas metodologías de manejo del cultivo.

### 5.6 Administrador de la Plataforma

Responsable de la gestión técnica de la plataforma, administración de usuarios, configuración de permisos, monitoreo del sistema y soporte.

---

## 6. Objetivos Generales

1. **Desarrollar una plataforma web moderna, intuitiva y funcional** que permita la gestión integral del cultivo de caña de azúcar, desde la planificación hasta la cosecha y su relación con los ingenios.

2. **Digitalizar la información agrícola** del cultivo de caña, transformando registros dispersos y en papel en una base de datos centralizada, estructurada y georreferenciada.

3. **Proporcionar herramientas de visualización geográfica (GIS)** que permitan a los productores y asesores comprender la variabilidad espacial de sus campos y tomar decisiones localizadas.

4. **Implementar analítica de datos e inteligencia artificial** que transforme datos históricos y en tiempo real en recomendaciones accionables para optimizar la productividad y la rentabilidad.

5. **Mejorar la coordinación entre productores e ingenios** mediante herramientas de comunicación, planificación de cosecha y logística compartida.

6. **Diseñar la plataforma con arquitectura escalable** que permita la incorporación progresiva de nuevas tecnologías como sensores IoT, imágenes satelitales, drones y machine learning avanzado.

7. **Crear un producto de calidad profesional** que pueda formar parte de un portafolio tecnológico y servir como base para una startup AgTech.

---

## 7. Objetivos Específicos

### 7.1 Gestión de Parcelas y Campos
- Registrar parcelas con polígonos georreferenciados (coordenadas GPS)
- Asociar a cada parcela información de: variedad, fecha de siembra, número de rango, historial de cultivo, análisis de suelo, superficie exacta
- Permitir la importación/exportación de datos geoespaciales (shapefiles, GeoJSON, KML)
- Visualizar parcelas en mapa interactivo con capas temáticas

### 7.2 Registro de Actividades de Campo
- Registrar actividades agronómicas: siembra, fertilización, raleo, control de malezas, control de plagas y enfermedades, riego, cosecha
- Asociar cada actividad a una parcela, fecha, responsable, insumos utilizados y costos
- Registrar dosis, productos aplicados y condiciones climáticas al momento de la aplicación
- Generar historial cronológico completo por parcela

### 7.3 Control de Costos e Inversiones
- Registrar costos por parcela: insumos, maquinaria, mano de obra, transporte, servicios
- Calcular costo de producción por hectárea y por tonelada
- Comparar costos entre parcelas, campañas y períodos
- Generar reportes de costos para gestión interna y para presentar al ingenio

### 7.4 Visualización Geográfica (GIS)
- Mapa interactivo con todas las parcelas del productor
- Capas temáticas: rendimiento, actividad de cosecha, estado fenológico, análisis de suelo, uso de insumos
- Herramienta de selección espacial para filtrar parcelas por zona geográfica
- Visualización de imágenes satelitales de fondo (Google Maps, OpenStreetMap, o proveedores satelitales)
- Identificación de zonas de bajo rendimiento mediante análisis espacial

### 7.5 Gestión de Cosecha y Logística
- Planificar cosechas por parcela considerando: madurez del cultivo, capacidad del ingenio, disponibilidad de cosechadoras, condiciones climáticas
- Registrar toneladas cosechadas por parcela, variedad y fecha
- Coordinar el transporte desde la parcela al ingenio
- Visualizar en mapa la ubicación de camiones en tiempo real (integración GPS)
- Estimar tiempos de traslado y optimizar rutas

### 7.6 Gestión de Variedades
- Mantener un catálogo de variedades de caña con sus características agronómicas
- Asociar variedades a parcelas con fecha de implantación
- Comparar rendimientos y comportamiento entre variedades
- Recomendar variedades basándose en datos históricos y condiciones edafoclimáticas

### 7.7 Monitoreo Climático
- Integrar datos de estaciones meteorológicas o servicios climáticos
- Registrar condiciones climáticas relevantes: temperatura, precipitación, humedad, heladas
- Generar alertas por eventos climáticos extremos
- Correlacionar datos climáticos con rendimientos y fenología del cultivo

### 7.8 Reportes y Analítica
- Generar reportes automáticos: resumen de campaña, análisis de rendimiento, balance de costos, historial de parcela
- Exportar datos en múltiples formatos (PDF, CSV, Excel)
- Dashboard ejecutivo con indicadores clave (KPIs) del productor
- Comparativas interanuales de rendimiento y costos

### 7.9 Inteligencia Artificial — Asistente Agronómico
- Chatbot inteligente capacitado en agronomía de caña de azúcar que responda preguntas del productor
- Recomendaciones personalizadas basadas en el historial de cada parcela
- Alertas tempranas de posibles problemas fitosanitarios basadas en patrones de datos
- Sugerencias de fechas óptimas de cosecha basadas en modelos de madurez

### 7.10 Gestión de Usuarios y Permisos
- Registro y autenticación segura de usuarios
- Roles y permisos diferenciados (productor, asesor, ingenio, administrador)
- Multi-tenancy para soportar múltiples productores en una misma instancia
- Gestión de perfiles y preferencias

---

## 8. Alcance del Proyecto

### 8.1 Alcance Incluido (MVP — Versión 1.0)

| Módulo | Funcionalidad | Estado |
|---|---|---|
| **Gestión de Parcelas** | Alta, edición, visualización en mapa, polígonos | Incluido |
| **Registro de Actividades** | CRUD de actividades agronómicas por parcela | Incluido |
| **Control de Costos** | Registro de gastos, cálculo de costo por hectárea | Incluido |
| **Mapa Interactivo** | Visualización de parcelas, capas temáticas básicas | Incluido |
| **Gestión de Variedades** | Catálogo, asociación a parcelas | Incluido |
| **Reportes** | Reportes básicos de actividad y costos | Incluido |
| **Gestión de Usuarios** | Registro, login, roles, permisos básicos | Incluido |
| **Panel de Control** | Dashboard con resumen de actividad | Incluido |
| **Asistente IA** | Chatbot con conocimiento agronómico de caña | Incluido |
| **Responsive Design** | Adaptado a desktop y tablets | Incluido |

### 8.2 Alcance Excluido (MVP)

- Integración con sensores IoT en campo
- Imágenes satelitales en tiempo real (se ofrecerá visualización básica de mapas)
- Drone mapping y análisis de imágenes aéreas
- Integración directa con sistemas de los ingenios (ERP, balanzas)
- Módulo de gestión de riego automatizado
- App nativa móvil (se priorizará web responsive)
- Sistema de facturación y pagos
- Módulo de gestión de personal rural

### 8.3 Alcance Diferido (Versiones Futuras)

- Conexión con estaciones meteorológicas propias
- Imágenes satelitales NDVI y análisis multiespectral
- Integración IoT con sensores de suelo y clima
- Módulo de predicción de rendimiento con Machine Learning
- Planificación de cosecha con optimización logística avanzada
- App nativa para Android/iOS
- Integración con sistemas ERP de ingenios
- Marketplace de insumos y servicios agrícolas
- Módulo de trazabilidad farm-to-fork
- Certificaciones de sostenibilidad

---

## 9. Funcionalidades Principales

### 9.1 Módulo de Gestión de Campos

**Descripción:** Permite al productor registrar, organizar y visualizar todas sus parcelas de caña de azúcar en una interfaz geográfica intuitiva.

**Historias de usuario asociadas:**
- Como productor quiero registrar mis parcelas con sus límites en un mapa para tener una visualización clara de mi explotación
- Como productor quiero asociar información agronómica a cada parcela (variedad, fecha de siembra, historial) para tomar decisiones informadas
- Como asesor quiero visualizar las parcelas de mis clientes en un mapa para planificar visitas y recomendaciones

**Capacidades clave:**
- Creación de parcelas mediante dibujo interactivo sobre mapa (polígonos)
- Importación de archivos GeoJSON/Shapefile para carga masiva de parcelas
- Edición de atributos de parcela: nombre, superficie, variedad, fecha de siembra, número de rango, estado del cultivo
- Visualización en mapa con diferentes capas: rendimiento, actividad reciente, variedades, análisis de suelo
- Vista de lista y vista de mapa intercambiables
- Búsqueda y filtrado avanzado de parcelas

### 9.2 Módulo de Registro de Actividades

**Descripción:** Herramienta para documentar todas las actividades realizadas en cada parcela a lo largo del ciclo del cultivo.

**Historias de usuario asociadas:**
- Como encargado de campo quiero registrar rápidamente una aplicación de fertilizante con su dosis y costo para mantener un historial preciso
- Como productor quiero ver todas las actividades realizadas en una parcela ordenadas cronológicamente para entender la secuencia de manejo
- Como asesor quiero comparar las actividades aplicadas en diferentes parcelas para evaluar prácticas de manejo

**Capacidades clave:**
- Registro de actividades categorizadas: siembra, fertilización, control de malezas, control de plagas, control de enfermedades, riego, raleo, quema, cosecha
- Cada actividad incluye: fecha, parcela responsable, productos/dosis aplicados, observaciones, costo asociado
- Adjuntar fotografías de campo a cada registro
- Historial cronológico por parcela con filtro por tipo de actividad y período
- Plantillas predefinidas para actividades frecuentes
- Modo rápido de registro desde dispositivos móviles

### 9.3 Módulo de Análisis de Costos

**Descripción:** Sistema de registro y análisis de costos de producción por parcela, por hectárea y por tonelada producida.

**Historias de usuario asociadas:**
- Como productor quiero saber cuánto me cuesta producir caña por hectárea en cada parcela para identificar las más rentables
- Como gerente quiero comparar costos entre campañas para evaluar la evolución de la eficiencia
- como productor quiero generar un reporte de costos para presentar al ingenio en la negociación de precios

**Capacidades clave:**
- Registro de costos categorizados: insumos (semilla, fertilizantes, agroquímicos), mano de obra, maquinaria, transporte, servicios, otros
- Asociación de costos a parcelas y períodos
- Cálculo automático de costo por hectárea y costo por tonelada estimada
- Comparativa de costos entre parcelas, campañas y períodos
- Gráficos de distribución de costos (pie charts, barras)
- Exportación de datos de costos en CSV/Excel
- Reporte de costos formateado para impresión

### 9.4 Módulo de Gestión de Cosecha

**Descripción:** Planificación, registro y seguimiento de la cosecha de caña, incluyendo la coordinación logística con el ingenio.

**Historias de usuario asociadas:**
- Como productor quiero planificar la cosecha de mis parcelas considerando la madurez del cultivo para maximizar el rendimiento de azúcar
- Como transportista quiero saber qué parcelas están programadas para cosecha hoy y cuál es la ruta óptima
- Como ingenio quiero recibir información anticipada de los volúmenes programados por productor para planificar mi capacidad de molienda

**Capacidades clave:**
- Calendario de cosecha con visualización de parcelas programadas
- Registro de cosecha: fecha, parcela, toneladas cosechadas, variedad, método (manual, mecánico, semimecanizado)
- Estimación de rendimiento por parcela basada en datos históricos
- Coordinación de transporte: registro de camiones, choferes, rutas
- Visualización en mapa de estado de cosecha (parcelas cosechadas, pendientes, en proceso)
- Reporte de cosecha por campaña y por parcela

### 9.5 Módulo de Gestión de Variedades

**Descripción:** Catálogo de variedades de caña de azúcar con información agronómica y comparativa de comportamiento.

**Capacidades clave:**
- Catálogo de variedades con: nombre, origen, ciclo, tolerancias, potencial de rendimiento, características de tallo
- Asociación de variedades a parcelas con fecha de implantación
- Comparativa de rendimiento entre variedades en diferentes condiciones
- Recomendación de variedades basada en condiciones edafoclimáticas de la parcela
- Registro de comportamiento varietal frente a plagas y enfermedades

### 9.6 Módulo de Monitoreo Climático

**Descripción:** Integración de datos meteorológicos relevantes para la gestión del cultivo.

**Capacidades clave:**
- Visualización de condiciones climáticas actuales y pronóstico
- Registro de eventos climáticos relevantes: heladas, granizo, sequías, exceso de lluvia
- Alertas de condiciones adversas para el cultivo
- Historial climático por zona geográfica
- Correlación entre variables climáticas y rendimientos

### 9.7 Módulo de Reportes

**Descripción:** Generación de reportes automatizados y dashboards analíticos.

**Capacidades clave:**
- Dashboard ejecutivo con KPIs: superficie total, hectáreas en producción, rendimiento promedio, costo promedio, actividad reciente
- Reporte de resumen de campaña
- Reporte de rendimiento por parcela y por variedad
- Reporte de costos por parcela y por categoría
- Reporte de actividades realizadas en un período
- Exportación a PDF y CSV
- Períodos de reporte personalizables

### 9.8 Asistente IA Agronómico

**Descripción:** Chatbot inteligente con conocimiento especializado en agronomía de caña de azúcar, capaz de asistir al productor con consultas técnicas.

**Capacidades clave:**
- Interfaz de chat integrada en la plataforma
- Base de conocimiento sobre: manejo agronómico de caña, variedades, plagas, enfermedades, fertilización, cosecha, suelos, clima
- Responder preguntas como: "¿Cuándo debo fertilizar?", "¿Qué variedad es mejor para mi zona?", "¿Cómo detecto la royón?", "¿Cuál es la dosis recomendada de urea?"
- Recomendaciones contextuales basadas en los datos de las parcelas del productor
- Sugerencias proactivas basadas en el calendario agrícola y condiciones actuales
- Capacidad de aprender de las interacciones para mejorar las recomendaciones

### 9.9 Panel de Control (Dashboard)

**Descripción:** Vista resumen del estado actual de la explotación cañera del productor.

**Capacidades clave:**
- Resumen de parcelas: total, en producción, en descanso, en preparación
- Próximas actividades programadas
- Alertas activas (climáticas, fitosanitarias, de cosecha)
- Rendimiento promedio de la última campaña
- Costo promedio por hectárea
- Gráfico de evolución de rendimiento por campaña
- Actividad reciente de registros

---

## 10. Funcionalidades Futuras

### 10.1 Fase 2 — Agricultura de Precisión

| Funcionalidad | Descripción |
|---|---|
| **Imágenes Satelitales NDVI** | Visualización de imágenes multiespectrales para evaluar la salud del cultivo |
| **Análisis de Variabilidad Espacial** | Mapas de fertilización variable y zonificación de manejo |
| **Integración IoT** | Conexión con sensores de humedad de suelo, temperatura, clima en campo |
| **Estaciones Meteorológicas Propias** | Recepción de datos de estaciones instaladas en las parcelas |
| **Drones y Fotogrametría** | Procesamiento de imágenes aéreas para análisis de densidad de plantación, detección de fallas |

### 10.2 Fase 2 — Inteligencia Artificial Avanzada

| Funcionalidad | Descripción |
|---|---|
| **Predicción de Rendimiento** | Modelos de ML que estiman el rendimiento esperado por parcela |
| **Detección Temprana de Plagas/Enfermedades** | Análisis de patrones para alertar sobre riesgos fitosanitarios |
| **Optimización de Cosecha** | Algoritmos que determinan la fecha óptima de cosecha por parcela |
| **Asistente IA Mejorado** | IA generativa con capacidades de análisis de datos del productor |
| **Recomendación Automatizada** | Sistema que genera planes de manejo personalizados |

### 10.3 Fase 3 — Integración y Ecosistema

| Funcionalidad | Descripción |
|---|---|
| **Integración con ERP del Ingenio** | Conexión directa con sistemas de gestión de ingenios |
| **Trazabilidad Blockchain** | Registro inmutable de la cadena productiva |
| **Marketplace de Insumos** | Plataforma de compra/venta de insumos agrícolas |
| **Módulo de Bioetanol** | Gestión de la producción de bioetanol a partir de subproductos |
| **Plataforma de Carbono** | Cuantificación y certificación de créditos de carbono |
| **App Nativa Móvil** | Aplicación nativa para Android/iOS con funcionalidades offline |
| **API Pública** | Interfaz de programación para integraciones de terceros |

---

## 11. Propuesta de Valor

SmartCaña ofrece una propuesta de valor diferenciada para cada segmento del ecosistema cañero:

### Para el Productor Cañero

> **"Transformá tu experiencia en datos accionables. Tomá decisiones sobre tu campo con la información completa, visual y analítica que necesitás — en una sola plataforma, desde cualquier dispositivo."**

- Unificá toda la información de tus parcelas en un solo lugar
- Visualizá tu campo en un mapa interactivo
- Conocé el costo real de producción por hectárea y por tonelada
- Compará rendimientos entre campañas y variedades
- Recibí recomendaciones de un asistente IA especializado en caña
- Coordiná la cosecha y el transporte con eficiencia

### Para el Ingenio

> **"Obtené visibilidad anticipada sobre la materia prima. Planificá la campaña molienda con datos confiables de disponibilidad, calidad y logística."**

- Accedé a información de volúmenes programados por productor
- Coordiná la logística de recepción con mayor precisión
- Reducí los tiempos de espera en patio y las pérdidas asociadas
- Fortalecé la relación con tus proveedores mediante transparencia

### Para el Asesor Agronómico

> **"Armá recomendaciones fundamentadas. Accedé a datos georreferenciados históricos y en tiempo real para fundamentar cada decisión técnica."**

- Visualizá el estado de todas las parcelas que asesorás
- Compará prácticas de manejo entre productores
- Generá recomendaciones con respaldo de datos
- Documentá y seguí las acciones implementadas

### Para el Investigador

> **"Accedé a datos reales estructurados. Validá hipótesis con información georreferenciada histórica del cultivo de caña en Argentina."**

- Datos anonimizados disponibles para análisis
- Herramientas de visualización y exportación
- Plataforma para publicar resultados y compartir conocimiento

---

## 12. Diferenciadores Frente a Otros Sistemas

| Diferenciador | SmartCaña | Soluciones Genéricas (ERP, Excel) | Plataformas Internacionales (SugarGIS, CropIn) |
|---|---|---|---|
| **Enfoque en caña de azúcar** | Diseñada específicamente para el cultivo de caña, con terminología, ciclos y procesos propios del rubro | Sin enfoque en un cultivo específico | Genéricas o diseñadas para otros contextos (India, Brasil, Australia) |
| **Adaptada al contexto argentino** | Variedades locales, relaciones cañero-inguenio, normativa argentina, condiciones del NOA | Sin adaptación regional | No adaptada al mercado argentino |
| **Visualización geográfica nativa** | GIS integrado con parcelas georreferenciadas y capas temáticas | Sin capacidad geográfica | Parcial o requerir integraciones costosas |
| **Asistente IA especializado** | Chatbot con conocimiento profundo de agronomía de caña de azúcar | No disponible | No disponible o genérico |
| **Accessible y moderna** | Interfaz web moderna, intuitiva, responsive, diseñada para usuarios no técnicos | Interfaces complejas o anticuadas | Interfaces funcionales pero no optimizadas para el contexto local |
| **Escalable** | Arquitectura preparada para incorporar IoT, satélites, drones, ML | Limitada | Depende de cada plataforma |
| **Orientada a productores medianos** | Diseñada para productores de 40 a 10.000 ha con costos accesibles | Costos elevados o no justificados | Precios de mercado internacional |
| **Código abierto / local** | Desarrollada localmente, con posibilidad de personalización | Depende del proveedor | Propietaria, sin posibilidad de personalización local |

---

## 13. Beneficios para Productores

### 13.1 Beneficios Operativos
- **Reducción del tiempo de gestión:** Centralización de información elimina la búsqueda en múltiples fuentes
- **Mejor planificación de cosecha:** Programación basada en datos de madurez y capacidad del ingenio
- **Trazabilidad completa:** Historial documentado de cada parcela para auditorías y negociaciones
- **Acceso desde campo:** Uso de tablets y smartphones para registro y consulta en tiempo real

### 13.2 Beneficios Económicos
- **Control de costos preciso:** Conocimiento real del costo de producción por parcela
- **Optimización de insumos:** Identificación de parcelas que requieren menor inversión
- **Mayor rendimiento por hectánea:** Decisiones basadas en datos que incrementan la productividad
- **Mejor precio de negociación:** Datos documentados para respaldar la negociación con el ingenio

### 13.3 Beneficios Estratégicos
- **Visión a largo plazo:** Datos históricos que permiten identificar tendencias y patrones
- **Diversificación informada:** Datos para evaluar la incorporación de nuevas variedades o prácticas
- **Preparación para el futuro:** Plataforma preparada para incorporar tecnologías emergentes

---

## 14. Beneficios para Ingenios

### 14.1 Planificación de Molienda
- Visibilidad anticipada de los volúmenes de caña disponibles por zona y productor
- Estimación de calidad (variedad, madurez) antes de la recepción
- Optimización de la capacidad de molienda en función de la disponibilidad real

### 14.2 Eficiencia Logística
- Reducción de tiempos de espera en patio mediante mejor coordinación
- Programación de recepción de camiones para evitar congestión
- Rastreo de la cadena de suministro desde el campo hasta la planta

### 14.3 Relación con Productores
- Comunicación directa y transparente sobre necesidades de materia prima
- Disponibilidad de datos de campo para asesoramiento conjunto
- Fortalecimiento de la relación comercial basada en información compartida

### 14.4 Calidad de Materia Prima
- Información anticipada sobre estado de madurez y calidad esperada
- Posibilidad de influir en las prácticas de manejo para mejorar la calidad
- Reducción de pérdidas por tiempos excesivos entre cosecha y molienda

---

## 15. Beneficios para Investigadores

### 15.1 Acceso a Datos
- Base de datos estructurada de campos reales con información georreferenciada
- Datos históricos de rendimiento, actividades, costos y condiciones climáticas
- Posibilidad de acceder a datos anonimizados de múltiples productores

### 15.2 Herramientas de Análisis
- Visualización geográfica de datos para análisis espacial
- Exportación de datos en formatos estándar para procesamiento estadístico
- Capacidad de correlación entre variables agronómicas, climáticas y de manejo

### 15.3 Transferencia de Tecnología
- Plataforma para publicar recomendaciones y validaciones agronómicas
- Canal directo de comunicación con productores para difundir resultados
- Base para proyectos de investigación aplicada con datos reales

### 15.4 Publicaciones y Reconocimiento
- Datos para sustentar publicaciones científicas
- Contribución al desarrollo tecnológico del sector cañero argentino
- Posibilidad de colaboración con instituciones internacionales

---

## 16. Riesgos del Proyecto

### 16.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Complejidad excesiva del módulo GIS | Alta | Alto | Desarrollo iterativo, uso de bibliotecas probadas (Leaflet, MapLibre), empezar con funcionalidades básicas |
| Rendimiento insuficiente con grandes volúmenes de datos | Media | Alto | Arquitectura escalable, indexación geoespacial, paginación, caching |
| Problemas de compatibilidad entre dispositivos | Media | Medio | Testing en múltiples dispositivos, diseño responsive progresivo |
| Dependencia de servicios externos (mapas, clima) | Media | Medio | Abstracción de capas de datos, opciones de fallback, caché local |
| Seguridad de datos sensibles del productor | Baja | Muy Alto | Encriptación, autenticación robusta, auditorías de seguridad, backups |

### 16.2 Riesgos de Producto

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Baja adopción por parte de productores | Alta | Alto | Diseño UX excepcional, capacitación, soporte, enfoque en valor práctico |
| Complejidad percibida por usuarios no técnicos | Alta | Alto | Iteraciones con usuarios reales, simplificación progresiva, tutoriales |
| Funcionalidades no alineadas con necesidades reales | Media | Alto | Investigación continua con productores, desarrollo iterativo con feedback |
| Competencia de soluciones informales (Excel, WhatsApp) | Alta | Medio | Diferenciación clara, demostración de valor superior, migrating tools |

### 16.3 Riesgos del Proyecto Académico

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Extensión del alcance más allá del tiempo disponible | Alta | Alto | Scope management estricto, MVP definido, delegación de features a fases futuras |
| Dificultad de acceso a datos reales para pruebas | Media | Medio | Generación de datos sintéticos realistas, contacto con productores |
| Cambios en tecnologías o dependencias durante el desarrollo | Baja | Medio | Selección de tecnologías maduras, arquitectura desacoplada |

---

## 17. Limitaciones

### 17.1 Limitaciones del MVP

1. **Sin integración IoT:** La primera versión no conectará con sensores físicos en campo. La captura de datos será manual o mediante importación.

2. **Sin imágenes satelitales propias:** Se utilizará visualización de mapas base (Google Maps, OpenStreetMap) sin análisis multiespectral integrado.

3. **Sin app nativa móvil:** La experiencia móvil será a través de la versión web responsive, con limitaciones en funcionalidades offline.

4. **Sin integración con ingenios:** No se establecerá conexión directa con los sistemas de los ingenios (balanzas, ERPs). La coordinación será mediante funcionalidades básicas de reporte y comunicación.

5. **Sin predicción con ML:** Las funcionalidades de IA se limitarán a un chatbot con conocimiento de dominio. No se implementarán modelos predictivos de rendimiento ni detección automática de plagas.

6. **Escalabilidad geográfica limitada:** El contenido agronómico del asistente IA estará enfocado en el contexto del NOA argentino.

7. **Dependencia de conectividad:** Al ser una plataforma web, requerirá conexión a internet para su uso. No se implementará modo offline completo.

### 17.2 Limitaciones del Proyecto Académico

- El proyecto se desarrolla en el marco de una Tesis Final de TUP, con un plazo y recursos definidos
- No se dispondrá de un equipo completo de desarrollo comercial; el desarrollo será realizado de forma individual o en equipo reducido
- Los datos utilizados para pruebas y demostración serán simulados o provistos por productores colaboradores
- No se realizará un lanzamiento comercial durante la fase de tesis

---

## 18. Tecnologías Recomendadas

> **Nota:** Esta sección presenta las tecnologías consideradas y justificadas para el desarrollo de SmartCaña. Su implementación concreta se definirá en la fase de Arquitectura de Software (documento 02).

### 18.1 Frontend

| Tecnología | Justificación |
|---|---|
| **React.js** o **Next.js** | Ecosistema maduro, gran comunidad, excelente soporte para aplicaciones SPA/SSR, amplia disponibilidad de bibliotecas GIS y de visualización. Next.js ofrece ventajas de rendimiento (SSR, SSG) y SEO. |
| **TypeScript** | Tipado estático que mejora la mantenibilidad, reduce errores y facilita el desarrollo en equipo. Estándar de facto en proyectos profesionales. |
| **Tailwind CSS** | Framework CSS utility-first que permite construir interfaces personalizadas rápidamente sin dependencias pesadas. Ideal para diseño responsive. |
| **Leaflet** o **MapLibre GL JS** | Bibliotecas open-source para mapas interactivos. Leaflet es ligera y madura; MapLibre ofrece renders vectoriales de alto rendimiento. Ambas soportan GeoJSON, WMS y capas personalizadas. |
| **Recharts** o **Nivo** | Bibliotecas de visualización de datos basadas en React para gráficos, dashboards y analítica. |
| **shadcn/ui** o **Radix UI** | Componentes UI accesibles, personalizables y de alta calidad para construir una interfaz profesional. |

### 18.2 Backend

| Tecnología | Justificación |
|---|---|
| **Node.js** con **Express** o **NestJS** | Runtime JavaScript de alto rendimiento, ideal para APIs REST/GraphQL. NestJS ofrece arquitectura modular, inyección de dependencias y escalabilidad. |
| **Python** con **FastAPI** (alternativa) | Si se requiere procesamiento intensivo de datos geoespaciales o integración con modelos de ML, Python ofrece un ecosistema superior. FastAPI proporciona alto rendimiento y documentación automática. |
| **PostgreSQL** + **PostGIS** | Base de datos relacional robusta con extensión geoespacial. PostGIS es el estándar para almacenamiento y consulta de datos espaciales (polígonos de parcelas, análisis espacial, índices geoespaciales). |
| **Redis** | Caché en memoria para sesiones, datos frecuentemente consultados y rate limiting. |
| **Prisma** o **TypeORM** | ORM para Node.js que facilita la interacción con la base de datos y la migración de esquemas. |

### 18.3 Infraestructura y DevOps

| Tecnología | Justificación |
|---|---|
| **Docker** | Contenedización del entorno de desarrollo y producción para consistencia entre ambientes. |
| **Vercel** o **Railway** (despliegue) | Plataformas de despliegue modernas con CI/CD integrado, escalado automático y dominios personalizados. |
| **GitHub Actions** | CI/CD integrado con el repositorio para tests automáticos, linting y despliegues. |
| **Cloudflare** (CDN/DNS) | CDN global para assets estáticos, protección DDoS y DNS gestionado. |

### 18.4 IA y Chatbot

| Tecnología | Justificación |
|---|---|
| **OpenAI API** (GPT) o **Anthropic Claude** | Modelos de lenguaje para el asistente agronómico. Se utilizará RAG (Retrieval-Augmented Generation) para conectar con una base de conocimiento específica de caña de azúcar. |
| **LangChain** (opcional) | Framework para orquestar la integración entre LLMs, bases de datos vectoriales y fuentes de conocimiento. |
| **Pinecone** o **pgvector** | Almacenamiento de embeddings vectoriales para búsqueda semántica en la base de conocimiento agronómica. |

### 18.5 Seguridad

| Tecnología | Justificación |
|---|---|
| **JWT** + **Refresh Tokens** | Autenticación stateless con rotación segura de tokens. |
| **Argon2** | Algoritmo de hashing de contraseñas moderno y seguro. |
| **Helmet.js** | Middleware de seguridad para Express/NestJS que agrega headers de seguridad HTTP. |
| **Rate Limiting** | Protección contra abuso de endpoints de la API. |

### 18.6 Justificación de NO usar otras tecnologías

| Tecnología descartada | Razón |
|---|---|
| **MongoDB** | Para datos geoespaciales complejos, PostgreSQL + PostGIS es superior. Un modelo relacional es más adecuado para la estructura jerárquica de usuarios-parcelas-actividades. |
| **Firebase** | Si bien es rápido para prototipos, su modelo NoSQL y las limitaciones de consultas complejas lo hacen menos adecuado para una plataforma con necesidades geoespaciales y analíticas. |
| **Angular** | Aunque maduro, React/Next.js ofrece un ecosistema más rico para visualización de datos, GIS y una experiencia de desarrollo más ágil para un equipo reducido. |
| **MySQL** | Carece de soporte geoespacial nativo comparable a PostGIS. PostgreSQL es superior para este caso de uso. |
| **MongoDB Atlas** | Mismas limitaciones que MongoDB para datos geoespaciales y relaciones. |

---

## 19. Posibles Integraciones Futuras

### 19.1 Integraciones con Servicios Externos

| Integración | Proveedor / Estándar | Propósito | Fase |
|---|---|---|---|
| **Imágenes Satelitales** | Sentinel-2 (Copernicus), Planet Labs, EOS Data Analytics | Análisis NDVI, detección de estrés hídrico, monitoreo de crecimiento | Fase 2 |
| **Datos Climáticos** | OpenWeatherMap, SMN (Servicio Meteorológico Nacional), WeatherAPI | Datos históricos y pronósticos meteorológicos | Fase 1-2 |
| **GPS / Tracking** | Google Maps Platform, OpenRouteService | Seguimiento de vehículos de transporte, optimización de rutas | Fase 2 |
| **IoT / Sensores** | The Things Network, MQTT brokers, protocolos LoRaWAN | Recepción de datos de sensores de campo (humedad, temperatura, etc.) | Fase 2-3 |
| **ERPs de Ingenios** | SAP, sistemas propietarios vía API | Intercambio de datos de recepción, pesada y facturación | Fase 3 |
| **Pagos** | MercadoPago, Mobbex | Pagos de suscripciones, servicios | Fase 3 |

### 19.2 Integraciones con Estándares del Sector

| Estándar | Propósito |
|---|---|
| **GeoJSON / WKT** | Intercambio de datos geoespaciales |
| **GeoPackage** | Almacenamiento de datos geoespaciales portátiles |
| **WMS / WFS** | Consumo de servicios de mapas OGC |
| **APK (Agricultural Knowledge Package)** | Estándar emergente para intercambio de datos agronómicos |

### 19.3 Integraciones con Instituciones

| Institución | Tipo de Integración |
|---|---|
| **EEAOC** (Estación Experimental Agroindustrial Obispo Colombres) | Datos de investigación, validación agronómica, contenido para IA |
| **INTA** | Recomendaciones técnicas, datos de ensayos, publicaciones |
| **SATCA** | Contenido técnico, contactos del sector, eventos |
| **IPAAT** | Datos estadísticos de la campaña, información de mercado |
| **Universidades (UNT, UNSTA)** | Investigación académica, pasantías, validación científica |

---

## 20. Conclusión

SmartCaña representa una oportunidad significativa para abordar una problemática real y apremiante del sector agroindustrial argentino: la necesidad urgente de digitalización de la gestión de cultivos de caña de azúcar.

El cultivo de caña, pilar económico del noroeste argentino, opera hoy con herramientas de gestión que no están a la altura de la complejidad y las exigencias de la agricultura contemporánea. La falta de información centralizada, la ausencia de visualización geográfica, la coordinación ineficiente entre productores e ingenios, y la toma de decisiones basada exclusivamente en la experiencia empírica generan pérdidas cuantificables de productividad, rentabilidad y sostenibilidad.

SmartCaña se positiona como la solución AgTech diseñada específicamente para este cultivo, este contexto y este mercado. No es un ERP genérico adaptado a la caña, ni una plataforma internacional descontextualizada. Es una plataforma construida desde cero para el productor cañero argentino, con su terminología, sus procesos, sus variedades, sus relaciones con los ingenios y sus condiciones productivas.

El alcance del MVP está cuidadosamente definido para entregar valor real en un plazo académico factible, mientras que la arquitectura y la visión del producto están preparadas para escalar hacia capacidades de agricultura de precisión, IoT, Inteligencia Artificial y analítica avanzada en versiones futuras.

La combinación de un mercado con alta demanda de soluciones digitales, una brecha tecnológica significativa que cerrar, tecnologías web modernas accesibles, y la posibilidad de generar impacto real en miles de productores, convierte a SmartCaña en un proyecto con potencial tanto académico como comercial.

**El objetivo final es claro:** transformar la manera en que se gestiona la caña de azúcar en Argentina, llevando la inteligencia de datos al corazón de cada decisión agronómica, logística y económica del productor cañero.

---

*Documento generado como parte del Proyecto de Tesis Final — TUP UTN, Julio 2026.*
