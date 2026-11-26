'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { CostItem, CostCategory, Supplier } from '@/types/costs';

interface CostFormProps {
  categories: CostCategory[];
  suppliers: Supplier[];
  onSubmit: (data: Partial<CostItem>) => void;
  onClose: () => void;
  initial?: CostItem | null;
}

export function CostForm({ categories, suppliers, onSubmit, onClose, initial }: CostFormProps) {
  const [form, setForm] = useState({
    description: initial?.description ?? '',
    costCategoryId: initial?.costCategoryId ?? '',
    supplierId: initial?.supplierId ?? '',
    amount: initial?.amount ?? 0,
    quantity: initial?.quantity ?? undefined,
    unit: initial?.unit ?? '',
    unitPrice: initial?.unitPrice ?? undefined,
    costDate: initial?.costDate ?? new Date().toISOString().split('T')[0],
    observations: initial?.observations ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      quantity: form.quantity || undefined,
      unitPrice: form.unitPrice || undefined,
      amount: form.unitPrice && form.quantity ? form.quantity * form.unitPrice : form.amount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-bg-surface border-l border-border-default overflow-y-auto">
        <div className="flex items-center justify-between px-6 h-14 border-b border-border-default shrink-0">
          <h2 className="text-sm font-semibold text-text-primary">{initial ? 'Editar costo' : 'Nuevo costo'}</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Descripción</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full h-9 px-3 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Categoría</label>
              <select
                value={form.costCategoryId}
                onChange={(e) => setForm({ ...form, costCategoryId: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary"
                required
              >
                <option value="">Seleccionar</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Proveedor</label>
              <select
                value={form.supplierId}
                onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary"
              >
                <option value="">Seleccionar</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Cantidad</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.quantity ?? ''}
                onChange={(e) => setForm({ ...form, quantity: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full h-9 px-3 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Unidad</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Precio unitario</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.unitPrice ?? ''}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full h-9 px-3 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Monto total</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                className="w-full h-9 px-3 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Fecha</label>
              <input
                type="date"
                value={form.costDate}
                onChange={(e) => setForm({ ...form, costDate: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Observaciones</label>
            <textarea
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-9 text-xs font-medium text-text-secondary bg-bg-subtle border border-border-default rounded-lg hover:bg-border-default transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-1.5 h-9 text-xs font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors">
              <Save className="size-3.5" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
