import { useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { SIGNUP_HREF } from '../routes';

const NAV_ITEMS = [
  { label: 'Features', href: '#services' },
  { label: 'How It Works', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  // 0 -> 50px of scroll: the pill densifies from near-invisible to frosted glass
  const bgOpacity = useTransform(scrollY, [0, 50], [0.02, 0.08]);
  const blurPx = useTransform(scrollY, [0, 50], [8, 24]);

  const background = useMotionTemplate`rgba(255, 255, 255, ${bgOpacity})`;
  const backdropFilter = useMotionTemplate`blur(${blurPx}px)`;

  return (
    <header className="fixed inset-x-0 top-6 z-50 flex justify-center px-4 sm:px-6 lg:px-8">
      <motion.nav
        aria-label="Main navigation"
        style={{ background, backdropFilter, WebkitBackdropFilter: backdropFilter }}
        className={`w-full max-w-5xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-[border-radius] duration-300 ${
          open ? 'rounded-3xl' : 'rounded-full'
        }`}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3 sm:px-6">
          <a
            href="#top"
            className="text-lg font-black tracking-tighter text-white"
          >
            CivicLens<span className="text-gradient-accent">AI</span>
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="group relative text-sm font-medium text-gray-300 transition-colors hover:text-white"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 block h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={SIGNUP_HREF}
              className="hidden rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.35)] active:scale-95 sm:block"
            >
              Sign Up
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="rounded-full p-2 text-white transition-colors hover:bg-white/10 md:hidden"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="mt-2">
                <a
                  href={SIGNUP_HREF}
                  onClick={() => setOpen(false)}
                  className="block rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-black active:scale-95"
                >
                  Sign Up
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </motion.nav>
    </header>
  );
}
