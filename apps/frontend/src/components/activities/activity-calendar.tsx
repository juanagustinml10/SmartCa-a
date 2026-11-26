'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ActivityItem } from '@/types/activities';


interface ActivityCalendarProps {
  activities: ActivityItem[];
  onSelect: (id: string) => void;
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function ActivityCalendar({ activities, onSelect }: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const activitiesByDate = useMemo(() => {
    const map = new Map<string, ActivityItem[]>();
    for (const act of activities) {
      const key = act.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(act);
    }
    return map;
  }, [activities]);

  const weeks = useMemo(() => {
    const weeksArr: { date: number; activities: ActivityItem[] }[][] = [];
    let week: { date: number; activities: ActivityItem[] }[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      week.push({ date: 0, activities: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      week.push({ date: day, activities: activitiesByDate.get(dateStr) ?? [] });
      if (week.length === 7) {
        weeksArr.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) week.push({ date: 0, activities: [] });
      weeksArr.push(week);
    }

    return weeksArr;
  }, [year, month, daysInMonth, firstDayOfWeek, activitiesByDate]);

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors">
          <ChevronLeft className="size-5" />
        </button>
        <h3 className="text-base font-semibold text-text-primary">{MONTHS[month]} {year}</h3>
        <button onClick={nextMonth} className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors">
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border-default rounded-lg overflow-hidden">
        {DAYS.map((d) => (
          <div key={d} className="bg-bg-surface px-2 py-2 text-[10px] font-medium text-text-tertiary text-center uppercase tracking-wider">
            {d}
          </div>
        ))}

        {weeks.flat().map((day, i) => (
          <div
            key={i}
            className={`bg-bg-surface min-h-24 p-1.5 ${
              day.date === 0 ? 'opacity-30' : ''
            }`}
          >
            {day.date > 0 && (
              <>
                <div className={`text-xs font-medium mb-1 size-6 flex items-center justify-center rounded-full ${
                  isToday(day.date) ? 'bg-brand-500 text-white' : 'text-text-secondary'
                }`}>
                  {day.date}
                </div>
                <div className="space-y-0.5">
                  {day.activities.slice(0, 3).map((act) => {
                    const statusColor = act.status === 'completed' ? 'bg-success-500' : act.status === 'in_progress' ? 'bg-blue-500' : act.status === 'cancelled' ? 'bg-error-500' : 'bg-text-tertiary';
                    return (
                      <button
                        key={act.id}
                        onClick={() => onSelect(act.id)}
                        className="w-full text-left flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-bg-subtle transition-colors"
                      >
                        <span className={`size-1.5 rounded-full shrink-0 ${statusColor}`} />
                        <span className="text-[10px] text-text-secondary truncate leading-tight">{act.title}</span>
                      </button>
                    );
                  })}
                  {day.activities.length > 3 && (
                    <span className="text-[10px] text-brand-500 font-medium px-1">+{day.activities.length - 3} más</span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
