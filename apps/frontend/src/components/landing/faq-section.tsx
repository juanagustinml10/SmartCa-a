'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: '¿Qué necesito para empezar a usar SmartCaña?', a: 'Solo necesitás una computadora o tablet con conexión a internet. Te ayudamos con la carga inicial de datos de tus campos. No requiere hardware adicional ni instalación.' },
  { q: '¿SmartCaña funciona con cualquier variedad de caña?', a: 'Sí. Nuestros modelos de IA se adaptan a todas las variedades comerciales de caña de azúcar: LCP 85-384, TUCCP 77-42, RA 87-3, CP 65-47, entre otras.' },
  { q: '¿Los datos satelitales tienen algún costo adicional?', a: 'No. Las imágenes satelitales y el procesamiento NDVI están incluidos en todos los planes. Trabajamos con Sentinel-2, Landsat 8/9 y Planet Labs.' },
  { q: '¿Ofrecen capacitación para el equipo?', a: 'Sí. Incluimos sesiones de capacitación virtual para todo tu equipo. También contamos con una base de conocimiento y tutoriales interactivos.' },
  { q: '¿Puedo exportar mis datos a otros sistemas?', a: 'Sí. SmartCaña permite exportar reportes en PDF, Excel y CSV. También ofrecemos integración vía API para conectar con ERP y sistemas contables.' },
  { q: '¿Qué nivel de precisión tienen las predicciones?', a: 'Nuestros modelos alcanzan un 98% de precisión en predicción de rendimiento, validados con datos históricos de más de 10,000 hectáreas en Tucumán, Salta y Jujuy.' },
  { q: '¿Cómo manejan la seguridad de los datos?', a: 'Todos los datos se almacenan en datacenters en Argentina con encriptación AES-256. Cumplimos con normativas de protección de datos personales. Realizamos backups diarios.' },
  { q: '¿Tienen costo de implementación?', a: 'No cobramos costo de implementación ni cargo por usuario adicional. El plan incluye acceso completo para todo tu equipo, soporte técnico y actualizaciones.' },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-32 px-6">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-medium text-text-primary">Preguntas frecuentes</h2>
          <p className="mt-4 text-base text-text-secondary">Todo lo que necesitás saber sobre SmartCaña.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl border border-border-default bg-bg-surface/40 backdrop-blur-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-text-primary">{faq.q}</span>
                  <ChevronDown className={`size-4 text-text-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
