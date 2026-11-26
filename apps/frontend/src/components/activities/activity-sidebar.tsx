'use client';

import { motion } from 'framer-motion';
import { X, User, Calendar, Clock, Timer, MapPin, Cloud, Wrench, FileText, ExternalLink } from 'lucide-react';
import type { ActivityItem } from '@/types/activities';
import { ACTIVITY_TYPE_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/activities';

interface ActivitySidebarProps {
  activity: ActivityItem;
  onClose: () => void;
}

export default function ActivitySidebar({ activity, onClose }: ActivitySidebarProps) {
  const typeCfg = ACTIVITY_TYPE_CONFIG[activity.type];
  const statusCfg = STATUS_CONFIG[activity.status];
  const priorityCfg = PRIORITY_CONFIG[activity.priority];

  return (
    <motion.aside
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-16 right-0 bottom-0 w-96 z-40 border-l border-border-default bg-bg-surface shadow-xl flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-border-default shrink-0">
        <span className="text-sm font-semibold text-text-primary">Detalle de actividad</span>
        <button onClick={onClose} className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-subtle transition-colors">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">
          <div className="flex items-start gap-3">
            <div className={`size-10 rounded-full ${typeCfg.bg} flex items-center justify-center shrink-0`}>
              <FileText className={`size-5 ${typeCfg.color}`} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text-primary">{activity.title}</h2>
              <p className="text-xs text-text-tertiary mt-0.5">{typeCfg.name} · {activity.fieldName}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${statusCfg.color} ${statusCfg.bg}`}>
              <span className={`size-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium ${priorityCfg.color} ${priorityCfg.bg}`}>
              {priorityCfg.label} prioridad
            </span>
          </div>

          <div className="space-y-3">
            <DetailRow icon={Calendar} label={new Date(activity.date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
            <DetailRow icon={Clock} label={`${activity.startTime} - ${activity.endTime} (${activity.duration} min)`} />
            <DetailRow icon={User} label={activity.responsible} />
            <DetailRow icon={MapPin} label={`${activity.farmName} · ${activity.fieldName}`} />
            <DetailRow icon={Timer} label={`Campaña ${activity.campaign}`} />
            {activity.productName && (
              <DetailRow icon={Wrench} label={`${activity.productName}${activity.doseAmount ? ` · ${activity.doseAmount} ${activity.doseUnit}` : ''}`} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border-default">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Costo estimado</div>
              <div className="text-sm font-semibold text-text-primary mt-0.5">${activity.estimatedCost.toLocaleString('es-AR')}</div>
            </div>
            <div className="p-3 rounded-lg border border-border-default">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Costo real</div>
              <div className="text-sm font-semibold text-text-primary mt-0.5">
                {activity.actualCost ? `$${activity.actualCost.toLocaleString('es-AR')}` : '—'}
              </div>
            </div>
          </div>

          {activity.machinery && activity.machinery.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-text-secondary mb-2">Maquinaria</h4>
              <div className="space-y-1">
                {activity.machinery.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                    <Wrench className="size-3.5 text-text-tertiary" />
                    {m}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activity.weather && (
            <div>
              <h4 className="text-xs font-medium text-text-secondary mb-2">Condiciones climáticas</h4>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1"><Cloud className="size-3.5" /> {activity.weather.conditions}</span>
                <span>{activity.weather.temperature}°C</span>
                <span>Humedad: {activity.weather.humidity}%</span>
                <span>Viento: {activity.weather.windSpeed} km/h</span>
              </div>
            </div>
          )}

          {activity.observations && (
            <div>
              <h4 className="text-xs font-medium text-text-secondary mb-1">Observaciones</h4>
              <p className="text-xs text-text-secondary leading-relaxed">{activity.observations}</p>
            </div>
          )}

          {activity.attachments.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-text-secondary mb-2">Archivos adjuntos</h4>
              <div className="space-y-1">
                {activity.attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2 text-xs text-text-secondary">
                    <FileText className="size-3.5 text-text-tertiary" />
                    {att.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-border-default shrink-0">
        <a
          href={`/campos/${activity.fieldId}`}
          className="flex items-center justify-center gap-2 h-9 rounded-lg border border-border-default text-sm font-medium text-text-secondary hover:bg-bg-subtle transition-colors"
        >
          <ExternalLink className="size-4" />
          Ver campo
        </a>
      </div>
    </motion.aside>
  );
}

function DetailRow({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-text-secondary">
      <Icon className="size-4 text-text-tertiary shrink-0 mt-0.5" />
      <span className="capitalize">{label}</span>
    </div>
  );
}
