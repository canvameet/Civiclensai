import type React from 'react';
import { motion } from 'framer-motion';
import { Database, MapPin, Shield, Sparkles, Zap } from 'lucide-react';
import { XIcon } from './BrandIcons';

// lucide v1 dropped its brand glyphs, so X comes from the inlined brand marks
type TickerIcon = React.FC<
  { size?: number; className?: string } & React.SVGProps<SVGSVGElement>
>;

const INTEGRATIONS: { name: string; Icon: TickerIcon }[] = [
  { name: 'MongoDB Atlas', Icon: Database },
  { name: 'Gemini AI', Icon: Sparkles },
  { name: 'X (Twitter)', Icon: XIcon },
  { name: 'Location Services', Icon: MapPin },
  { name: 'Secure Auth', Icon: Shield },
  { name: 'Real-time Updates', Icon: Zap },
];

function Row() {
  return (
    <div className="flex shrink-0 items-center gap-16 px-8">
      {INTEGRATIONS.map(({ name, Icon }) => (
        <div
          key={name}
          className="flex shrink-0 items-center gap-3 text-gray-600 transition-colors duration-300 hover:text-gray-300"
        >
          <Icon size={26} strokeWidth={1.5} aria-hidden="true" />
          <span className="whitespace-nowrap text-lg font-semibold tracking-tight">
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Clients() {
  return (
    <section className="relative w-full overflow-hidden py-24" aria-label="Platform Integrations">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
        className="mx-auto mb-14 max-w-6xl px-4 text-center sm:px-6 lg:px-8"
      >
        <span className="mb-5 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-md">
          Powered By
        </span>
        <h2 className="text-3xl font-black tracking-tighter text-white sm:text-4xl">
          Built on <span className="text-gradient-accent">Modern</span>{' '}
          Technology Stack
        </h2>
      </motion.div>

      <div className="relative">
        <motion.div
          className="flex w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
        >
          {/* duplicated so the -50% loop point lands seamlessly */}
          <Row />
          <Row />
        </motion.div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-ink to-transparent sm:w-56" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-ink to-transparent sm:w-56" />
      </div>
    </section>
  );
}
