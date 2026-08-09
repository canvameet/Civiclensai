import { motion } from 'framer-motion';

const STATS = [
  { value: 'AI', label: 'Powered Classification' },
  { value: 'Live', label: 'Real-Time Updates' },
];

export default function About() {
  return (
    <section id="about" className="relative w-full overflow-hidden py-32">
      {/* soft purple bloom sitting behind the copy */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/5 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-5 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-md">
              About CivicLens
            </span>
            <h2 className="text-4xl font-black leading-[1.1] tracking-tighter text-white sm:text-5xl lg:text-6xl">
              Smart cities need{' '}
              <span className="text-gradient-accent">intelligent</span>{' '}
              civic infrastructure.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <p className="mb-6 text-base font-light leading-relaxed text-gray-400">
              CivicLens AI is an advanced civic issue reporting platform that combines artificial intelligence with social media monitoring to create a proactive approach to municipal problem-solving. We don't just wait for citizens to report issues — we actively discover them.
            </p>
            <p className="mb-12 text-base font-light leading-relaxed text-gray-400">
              Built for Hack The Stack 2026, our platform leverages Gemini AI to automatically classify complaints, detect duplicates, route issues to the correct departments, and convert social media posts into actionable civic reports.
            </p>

            <dl className="grid grid-cols-2 gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="border-l border-white/10 pl-5">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block text-4xl font-black tracking-tighter text-white sm:text-5xl">
                      {stat.value}
                    </span>
                    <span className="mt-2 block text-xs font-bold uppercase tracking-widest text-gray-600">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
