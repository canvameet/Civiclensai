import { motion } from 'framer-motion';
import {
  Brain,
  Search,
  Route,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

type Service = {
  title: string;
  description: string;
  Icon: LucideIcon;
  corner: string;
  iconPos: string;
};

const SERVICES: Service[] = [
  {
    title: 'AI Classification',
    description:
      'Powered by Gemini AI to automatically categorize complaints by type, severity, and route them to the correct department with explanations.',
    Icon: Brain,
    corner: 'top-0 right-0 rounded-bl-[100%]',
    iconPos: 'top-6 right-6',
  },
  {
    title: 'Social Scraping',
    description:
      'Proactively monitors X (Twitter) for civic complaints in your area, converting social posts into actionable reports before citizens file formal complaints.',
    Icon: Search,
    corner: 'top-0 left-0 rounded-br-[100%]',
    iconPos: 'top-6 left-6',
  },
  {
    title: 'Smart Routing',
    description:
      'Intelligent duplicate detection and department assignment based on complaint content, location, and historical patterns to ensure efficient resolution.',
    Icon: Route,
    corner: 'bottom-0 right-0 rounded-tl-[100%]',
    iconPos: 'bottom-6 right-6',
  },
  {
    title: 'Live Analytics',
    description:
      'Real-time dashboards with hotspot detection, status tracking, and resolution metrics to help authorities prioritize and resolve issues faster.',
    Icon: BarChart3,
    corner: 'bottom-0 left-0 rounded-tr-[100%]',
    iconPos: 'bottom-6 left-6',
  },
];

export default function Services() {
  return (
    <section id="services" className="relative w-full py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mb-16 max-w-2xl"
        >
          <span className="mb-5 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-md">
            Features
          </span>
          <h2 className="text-4xl font-black leading-tight tracking-tighter text-white sm:text-5xl lg:text-6xl">
            Intelligent Civic Issue Management{' '}
            <span className="text-gradient-accent">Platform</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {SERVICES.map((service, i) => (
            <motion.article
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.25, ease: 'easeOut' },
              }}
              className="group relative min-h-[280px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-white/20 hover:shadow-[0_0_35px_rgba(255,255,255,0.18)]"
            >
              {/* molten orange blobs drifting in the card background */}
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="liquid-blob liquid-blob-a" />
                <div className="liquid-blob liquid-blob-b" />
                <div className="liquid-blob liquid-blob-c" />
              </div>

              {/* quarter-circle seated in the card corner */}
              <div
                className={`absolute h-32 w-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 transition-all duration-500 group-hover:from-amber-400/30 group-hover:to-orange-500/30 ${service.corner}`}
                aria-hidden="true"
              />
              <service.Icon
                className={`absolute text-white ${service.iconPos}`}
                size={26}
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <div className="relative mt-24 flex flex-col">
                <h3 className="mb-3 text-2xl font-bold tracking-tight text-white">
                  {service.title}
                </h3>
                <p className="max-w-sm text-sm font-light leading-relaxed text-gray-400">
                  {service.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
