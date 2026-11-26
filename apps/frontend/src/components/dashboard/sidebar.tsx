"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  LayoutDashboard,
  Sprout,
  Map,
  ClipboardList,
  BarChart3,
  DollarSign,
  Package,
  FileText,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  MonitorCheck,
} from "lucide-react";
import { MOCK_NAVIGATION } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  Monitor,
  LayoutDashboard,
  Sprout,
  Map,
  ClipboardList,
  BarChart3,
  DollarSign,
  Package,
  FileText,
  Bot,
  Settings,
  Shield,
  MonitorCheck,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const active = MOCK_NAVIGATION.find((item) => item.href === pathname)?.id ?? "dashboard";

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      <AnimatePresence>
        {(mobileOpen || true) && (
          <motion.aside
            initial={false}
            animate={{
              width: collapsed ? 64 : 256,
              x: mobileOpen ? 0 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-border-default bg-bg-surface md:relative ${
              mobileOpen ? "block" : "hidden md:flex"
            }`}
          >
            <div className="flex h-16 items-center border-b border-border-default px-4">
              <motion.div
                animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
                className="flex w-full items-center gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500">
                  <span className="text-sm font-bold text-white">S</span>
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap text-sm font-semibold text-text-primary"
                    >
                      Smart<span className="text-brand-500">Caña</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {MOCK_NAVIGATION.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard;
                const isActive = active === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.href)}
                    className={`group relative flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-500"
                        : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                    }`}
                  >
                    <div className="flex w-full items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="overflow-hidden whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    {item.badge && !collapsed && (
                      <span className="ml-auto rounded-full bg-ai-50 px-2 py-0.5 text-[10px] font-semibold text-ai-500">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-500"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-border-default p-3">
              <button
                onClick={onToggle}
                className="flex w-full items-center justify-center rounded-lg p-2 text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors"
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
