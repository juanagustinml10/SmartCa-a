"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Menu, Search, Bell, ChevronDown, CloudSun, User, LogOut, Settings as SettingsIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { DashboardCampaign } from "@/types/dashboard";

interface HeaderProps {
  onMenuClick: () => void;
  // Estos props sólo se usan en el Dashboard; las demás páginas siguen
  // renderizando el header sin selector de campaña.
  campaigns?: DashboardCampaign[];
  campaignId?: string | null;
  onCampaignChange?: (campaignId: string | null) => void;
  alertCount?: number;
  loading?: boolean;
}

export function Header({
  onMenuClick,
  campaigns = [],
  campaignId = null,
  onCampaignChange,
  alertCount = 0,
  loading = false,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = user?.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";
  const activeLabel = campaigns.find((item) => item.id === campaignId)?.code ?? "Todas las campañas";

  async function handleLogout() {
    setUserMenuOpen(false);
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border-default bg-bg-surface/80 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-subtle transition-colors md:hidden"
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
              disabled={loading}
              className="flex h-9 items-center gap-2 rounded-lg border border-border-default px-3 text-sm font-medium text-text-primary hover:bg-bg-subtle transition-colors disabled:opacity-50"
            >
              {activeLabel}
              <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
            </button>
            <AnimatePresence>
              {campaignOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border-default bg-bg-elevated p-1 shadow-lg"
                >
                  <button
                    onClick={() => { onCampaignChange?.(null); setCampaignOpen(false); }}
                    className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${
                      campaignId === null
                        ? "bg-brand-50 text-brand-600"
                        : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                    }`}
                  >
                    Todas las campañas
                  </button>
                  {campaigns.map((campaign) => (
                    <button
                      key={campaign.id}
                      onClick={() => { onCampaignChange?.(campaign.id); setCampaignOpen(false); }}
                      className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${
                        campaign.id === campaignId
                          ? "bg-brand-50 text-brand-600"
                          : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                      }`}
                    >
                      {campaign.code}
                      {campaign.isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
                    </button>
                  ))}
                  {campaigns.length === 0 && (
                    <p className="px-3 py-2 text-xs text-text-tertiary">Sin campañas registradas</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-border-default bg-bg-subtle px-3 py-1.5 text-xs text-text-tertiary sm:flex">
            <CloudSun className="h-4 w-4" />
            Clima no disponible
          </div>

          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-subtle transition-colors"
            >
              <Bell className="h-5 w-5" />
              {alertCount > 0 && (
                <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-error-500 ring-2 ring-bg-surface" />
              )}
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
                  <div className="p-3 text-center text-sm text-text-tertiary">
                    {alertCount > 0
                      ? `${alertCount} alerta${alertCount !== 1 ? "s" : ""} activa${alertCount !== 1 ? "s" : ""}`
                      : "Sin alertas activas"}
                  </div>
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
                  <button onClick={() => { setUserMenuOpen(false); router.push("/profile"); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors">
                    <User className="h-4 w-4" /> Perfil
                  </button>
                  <button onClick={() => { setUserMenuOpen(false); router.push("/settings"); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors">
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
