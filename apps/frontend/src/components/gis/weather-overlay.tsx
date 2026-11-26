'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Droplets, Wind, CloudRain, RefreshCw } from 'lucide-react';
import { useGis } from './gis-context';
import { WEATHER_CODE_CONFIG } from '@/lib/mock-gis';

const CONDITION_ICON: Record<string, React.ElementType> = {
  clear: Cloud,
  'partly-cloudy': Cloud,
  cloudy: Cloud,
  rain: CloudRain,
  storm: CloudRain,
};

export default function WeatherOverlay() {
  const { weather, visibleLayers } = useGis();
  const current = weather.current;
  const config = WEATHER_CODE_CONFIG[current.code] ?? WEATHER_CODE_CONFIG.clear;
  const ConditionIcon = CONDITION_ICON[current.code] ?? Cloud;

  if (!visibleLayers.weather) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="w-64 rounded-xl border border-border-default bg-bg-surface/90 backdrop-blur-md shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-3 h-9 border-b border-border-default">
          <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <Cloud className="size-3.5" />
            Clima
          </span>
          <span className="text-[10px] text-text-tertiary">{weather.source}</span>
        </div>

        <div className="p-3">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center size-10 rounded-lg"
              style={{ backgroundColor: `${config.color}22` }}
            >
              <ConditionIcon className="size-5" style={{ color: config.color }} />
            </div>
            <div>
              <div className="text-lg font-bold text-text-primary leading-none">
                {current.temperature}°C
              </div>
              <div className="text-[11px] text-text-tertiary">{config.label}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-3">
            <Stat icon={Droplets} label="Humedad" value={`${current.humidity}%`} />
            <Stat icon={Wind} label="Viento" value={`${current.windSpeed} km/h`} />
            <Stat icon={CloudRain} label="Lluvia" value={`${current.precipitation} mm`} />
          </div>

          <div className="mt-3 pt-2 border-t border-border-default">
            <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1.5">
              Pronóstico 5 días
            </div>
            <div className="flex justify-between">
              {weather.forecast.map((day) => {
                const dConfig = WEATHER_CODE_CONFIG[day.code] ?? WEATHER_CODE_CONFIG.clear;
                const DayIcon = CONDITION_ICON[day.code] ?? Cloud;
                const date = new Date(day.time);
                return (
                  <div key={day.time} className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] text-text-tertiary">
                      {date.toLocaleDateString('es-AR', { weekday: 'short' })}
                    </span>
                    <DayIcon className="size-3.5" style={{ color: dConfig.color }} />
                    <span className="text-[10px] font-medium text-text-primary">
                      {day.temperature}°
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1 text-[9px] text-text-tertiary">
            <RefreshCw className="size-2.5" />
            Actualizado: {new Date(weather.updatedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-bg-subtle p-1.5 text-center">
      <Icon className="size-3 text-text-tertiary mx-auto" />
      <div className="text-[11px] font-semibold text-text-primary mt-0.5">{value}</div>
      <div className="text-[9px] text-text-tertiary">{label}</div>
    </div>
  );
}
