"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Menu, Search, Bell, ChevronDown, Sun, CloudSun, User, LogOut, Settings as SettingsIcon,
} from "lucide-react";
import { MOCK_CAMPAIGNS, MOCK_WEATHER } from "@/lib/mock-data";
import { useAuth } from "@/contexts/auth-context";

interface HeaderProps {
  onMenuClick: () => void;
}

const weatherIconMap: Record<string, React.ElementType> = {
  sunny: Sun, "partly-cloudy": CloudSun, cloudy: CloudSun, rainy: CloudSun, stormy: CloudSun,
};

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeCampaign, setActiveCampaign] = useState(MOCK_CAMPAIGNS[0]);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const WeatherIcon = weatherIconMap[MOCK_WEATHER.condition] || CloudSun;
  const initials = user?.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '??';

  function handleLogout() {
    setUserMenuOpen(false);
    logout();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border-default bg-bg-surface/80 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Buscar campos, lotes, actividades..."
              className="h-9 w-64 rounded-lg border border-border-default bg-bg-subtle pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 lg:w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setCampaignOpen(!campaignOpen)}
              className="flex h-9 items-center gap-2 rounded-lg border border-border-default px-3 text-sm font-medium text-text-primary hover:bg-bg-subtle transition-colors"
            >
              {activeCampaign.label}
              <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
            </button>
            <AnimatePresence>
              {campaignOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border-default bg-bg-elevated p-1 shadow-lg"
                >
                  {MOCK_CAMPAIGNS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setActiveCampaign(c); setCampaignOpen(false); }}
                      className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${
                        c.id === activeCampaign.id
                          ? "bg-brand-50 text-brand-600"
                          : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                      }`}
                    >
                      {c.label}
                      {c.isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-border-default bg-bg-subtle px-3 py-1.5 sm:flex">
            <WeatherIcon className="h-4 w-4 text-warning-500" />
            <span className="font-mono text-sm font-medium text-text-primary">{MOCK_WEATHER.temperature}°</span>
            <span className="text-xs text-text-tertiary">H:{MOCK_WEATHER.maxTemp}° L:{MOCK_WEATHER.minTemp}°</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-error-500 ring-2 ring-bg-surface" />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-72 rounded-lg border border-border-default bg-bg-elevated p-2 shadow-lg"
                >
                  <div className="p-3 text-center text-sm text-text-tertiary">Sin notificaciones nuevas</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex h-9 items-center gap-2 rounded-lg border border-border-default px-2 text-sm text-text-primary hover:bg-bg-subtle transition-colors"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className="hidden text-sm font-medium lg:block">{user?.name}</span>
            </button>
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border-default bg-bg-elevated p-1 shadow-lg"
                >
                  <div className="border-b border-border-default px-3 py-2">
                    <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                    <p className="text-xs text-text-tertiary">{user?.email}</p>
                  </div>
                  <button onClick={() => { setUserMenuOpen(false); router.push('/profile'); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors">
                    <User className="h-4 w-4" /> Perfil
                  </button>
                  <button onClick={() => { setUserMenuOpen(false); router.push('/settings'); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors">
                    <SettingsIcon className="h-4 w-4" /> Configuración
                  </button>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors">
                    <LogOut className="h-4 w-4" /> Cerrar sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
