import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

type Feature = {
  name: string;
  category: string;
  description: string;
  image: string;
};

const FEATURES: Feature[] = [
  {
    name: 'Citizen Portal',
    category: 'Submit & Track',
    description:
      'Easy-to-use interface for citizens to submit complaints with text, images, and location. Track status in real-time with AI-powered classifications.',
    image:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
  },
  {
    name: 'Authority Dashboard',
    category: 'Manage & Resolve',
    description:
      'Comprehensive dashboard for authorities to view, filter, and manage complaints. Update statuses, view analytics, and identify hotspot areas.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  },
  {
    name: 'Social Feed',
    category: 'Proactive Monitoring',
    description:
      'Live feed of civic complaints scraped from X (Twitter). Convert social posts into formal complaints with one click and track their resolution.',
    image:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
  },
  {
    name: 'AI Insights',
    category: 'Analytics & Reporting',
    description:
      'Powered by Gemini AI to provide category analysis, severity assessment, duplicate detection, and smart routing with detailed explanations.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  },
  {
    name: 'Real-Time Updates',
    category: 'Live Monitoring',
    description:
      'Server-sent events keep all users synchronized. See new complaints appear instantly, status changes propagate in real-time across all dashboards.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  },
];

const EASE = [0.25, 1, 0.5, 1] as const;

export default function Work() {
  const [active, setActive] = useState(0);

  return (
    <section id="work" className="relative w-full py-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mb-14 flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <span className="mb-5 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-md">
              How It Works
            </span>
            <h2 className="text-4xl font-black tracking-tighter text-white sm:text-5xl lg:text-6xl">
              Platform <span className="text-gradient-accent">Features</span>
            </h2>
          </div>

          <a
            href="#services"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
          >
            View All Features
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="flex h-auto w-full flex-col gap-3 md:h-[400px] md:flex-row"
        >
          {FEATURES.map((feature, i) => {
            const isActive = active === i;
            return (
              <motion.article
                key={feature.name}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                tabIndex={0}
                aria-label={`${feature.name} — ${feature.category}`}
                animate={{ flex: isActive ? 4 : 0.8 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="group relative h-[220px] cursor-pointer overflow-hidden rounded-3xl border border-white/10 md:h-full"
              >
                <img
                  src={feature.image}
                  alt={`${feature.name} — ${feature.category} interface`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 transition-colors duration-500 ${
                    isActive
                      ? 'bg-gradient-to-t from-black/90 via-black/40 to-transparent'
                      : 'bg-black/60'
                  }`}
                />

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">
                    {feature.category}
                  </span>
                  <h3 className="text-2xl font-black tracking-tighter text-white">
                    {feature.name}
                  </h3>

                  <motion.div
                    animate={{
                      opacity: isActive ? 1 : 0,
                      height: isActive ? 'auto' : 0,
                    }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-gray-300">
                      {feature.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-transform duration-300 hover:scale-105 active:scale-95">
                      Learn More
                      <ArrowUpRight size={16} />
                    </span>
                  </motion.div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
