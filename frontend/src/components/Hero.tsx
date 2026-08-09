import { useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const OUTLINE_IMG =
  'https://strvid.nyc3.cdn.digitaloceanspaces.com/cloudinary/hero_city_outline_fzg37d.jpg';
const REAL_IMG =
  'https://strvid.nyc3.cdn.digitaloceanspaces.com/cloudinary/hero_city_iglhwn.jpg';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // the reality layer is punched through the sketch by an expanding circle
  const circleSize = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const clipPath = useMotionTemplate`circle(${circleSize}% at 50% 50%)`;

  // both layers creep forward so the reveal feels like a push-in, not a wipe
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  // the sketch caption steps aside once the reality starts showing through
  const outlineTextOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const realTextOpacity = useTransform(scrollYProgress, [0.35, 0.6], [0, 1]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative h-[300vh] w-full"
      aria-label="Introduction"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* ---------- base layer: the sketch ---------- */}
        <motion.div style={{ scale }} className="absolute inset-0">
          <img
            src={OUTLINE_IMG}
            alt="Line-drawn architectural sketch of a city skyline"
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-black/60" />
        </motion.div>

        <motion.div
          style={{ opacity: outlineTextOpacity }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center"
        >
          <span className="mb-6 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-300 backdrop-blur-md">
            AI-Powered Civic Platform
          </span>
          <h1 className="max-w-4xl text-5xl font-black leading-[1.1] tracking-tighter text-white sm:text-7xl lg:text-8xl">
            THE CITY <span className="text-gradient-soft">SPEAKS</span>
          </h1>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-gray-400 sm:text-lg">
            Where every civic issue is heard, classified, and resolved by AI intelligence.
          </p>
        </motion.div>

        {/* ---------- reveal layer: the reality ---------- */}
        <motion.div
          style={{ clipPath, WebkitClipPath: clipPath }}
          className="absolute inset-0 z-20"
        >
          <motion.div style={{ scale }} className="absolute inset-0">
            <img
              src={REAL_IMG}
              alt="Photorealistic city skyline at dusk"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>

          <motion.div
            style={{ opacity: realTextOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
          >
            <span className="mb-6 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-300 backdrop-blur-md">
              From Report to Resolution
            </span>
            <p className="max-w-4xl text-5xl font-black leading-[1.1] tracking-tighter text-white sm:text-7xl lg:text-8xl">
              WE MAKE IT <span className="text-gradient-accent">HEARD</span>
            </p>
            <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-gray-300 sm:text-lg">
              AI-powered civic issue tracking with social media scraping and smart routing.
            </p>
          </motion.div>
        </motion.div>

        {/* ---------- scroll cue ---------- */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute inset-x-0 bottom-10 z-30 flex flex-col items-center gap-2"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Scroll
          </span>
          <ChevronDown
            className="animate-bounce-slow text-white/70"
            size={22}
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </section>
  );
}
