'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useAuth } from '@/contexts/auth-context';
import { User, Mail, Calendar, Clock, Globe, Building2, Shield, Pencil } from 'lucide-react';

export default function ProfilePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const { user } = useAuth();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-AR', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={sidebarMobile} onMobileClose={() => setSidebarMobile(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarMobile(true)} />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="size-20 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <button className="absolute -bottom-1 -right-1 size-7 rounded-full bg-bg-surface border border-border-default flex items-center justify-center hover:bg-bg-subtle transition-colors">
                    <Pencil className="size-3.5 text-text-secondary" />
                  </button>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-text-primary">{user.name}</h1>
                  <p className="text-sm text-text-tertiary">{user.position ?? 'Usuario'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ProfileField icon={Mail} label="Email" value={user.email} />
                <ProfileField icon={Building2} label="Empresa" value={user.companyName} />
                <ProfileField icon={Globe} label="Zona horaria" value={user.timezone.replace('America/Argentina/', '')} />
                <ProfileField icon={Shield} label="Rol" value={{
                  super_admin: 'Super administrador',
                  admin: 'Administrador',
                  gerente: 'Gerente',
                  supervisor: 'Supervisor',
                  ingeniero: 'Ingeniero agrónomo',
                  operador: 'Operador',
                  invitado: 'Invitado',
                }[user.role] ?? user.role} />
                <ProfileField icon={Calendar} label="Miembro desde" value={formatDate(user.createdAt)} />
                <ProfileField icon={Clock} label="Último acceso" value={`${formatDate(user.lastAccess)} · ${formatTime(user.lastAccess)}`} />
              </div>

              <div className="bg-bg-surface border border-border-default rounded-xl p-5">
                <h3 className="text-sm font-medium text-text-primary mb-4">Información personal</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Nombre" value={user.name} />
                    <InputField label="Email" value={user.email} type="email" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Teléfono" value={user.phone ?? ''} placeholder="+54 381 555-0000" />
                    <InputField label="Cargo" value={user.position ?? ''} placeholder="Gerente General" />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="h-9 px-4 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors">
                    Guardar cambios
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-surface border border-border-default">
      <div className="size-9 rounded-lg bg-bg-subtle flex items-center justify-center">
        <Icon className="size-4 text-text-tertiary" />
      </div>
      <div>
        <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function InputField({ label, value, placeholder, type = 'text' }: { label: string; value: string; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-text-tertiary">{label}</label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full h-9 px-3 rounded-lg border border-border-default bg-bg-canvas text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
      />
    </div>
  );
}
