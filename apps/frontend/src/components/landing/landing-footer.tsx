'use client';

import { Sprout, Heart, Globe, MessageCircle, Mail } from 'lucide-react';

const footerLinks = {
  Producto: ['Funcionalidades', 'Precios', 'Integraciones', 'API', 'Roadmap'],
  Recursos: ['Blog', 'Documentación', 'Tutoriales', 'Webinars', 'Calculadora ROI'],
  Empresa: ['Sobre nosotros', 'Equipo', 'Carreras', 'Contacto', 'Prensa'],
  Legal: ['Términos', 'Privacidad', 'Cookies', 'Seguridad', 'GDPR'],
};

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-border-default bg-bg-surface/40 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-xl bg-brand-500 flex items-center justify-center">
                <Sprout className="size-4 text-white" />
              </div>
              <span className="text-sm font-bold text-text-primary">SmartCaña</span>
            </div>
            <p className="text-xs text-text-tertiary leading-relaxed max-w-xs">
              Plataforma inteligente para la gestión integral de cultivos de caña de azúcar.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[MessageCircle, Globe, Mail].map((Icon, i) => (
                <a key={i} href="#" className="size-8 rounded-lg bg-bg-subtle flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-surface transition-colors">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-text-secondary hover:text-text-primary transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border-default flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-tertiary">© 2026 SmartCaña. Todos los derechos reservados.</p>
          <p className="text-xs text-text-tertiary flex items-center gap-1">
            Hecho con <Heart className="size-3 text-error-500" /> para el campo argentino
          </p>
        </div>
      </div>
    </footer>
  );
}
