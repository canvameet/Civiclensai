import type React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import {
  DribbbleIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
} from './BrandIcons';
import { CITIZEN_HREF, SIGNIN_HREF } from '../routes';

const NAV_LINKS = [
  { label: 'Features', href: '#services' },
  { label: 'How It Works', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

// Authority and Social Feed are intentionally absent — they are admin-only
// surfaces and must not be advertised on the public site.
const COMPANY_LINKS = [
  { label: 'Citizen Portal', href: CITIZEN_HREF },
  { label: 'Documentation', href: '#services' },
];

type BrandIcon = React.FC<{ size?: number; className?: string }>;

const SOCIALS: { label: string; Icon: BrandIcon }[] = [
  { label: 'X', Icon: XIcon },
  { label: 'Instagram', Icon: InstagramIcon },
  { label: 'LinkedIn', Icon: LinkedinIcon },
  { label: 'Dribbble', Icon: DribbbleIcon },
  { label: 'GitHub', Icon: GithubIcon },
];

export default function Footer() {
  return (
    <footer id="contact" className="relative w-full border-t border-white/5 pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-start gap-10 pb-24"
        >
          <h2 className="max-w-3xl text-5xl font-black leading-[1.1] tracking-tighter text-white sm:text-6xl lg:text-7xl">
            Ready to transform{' '}
            <span className="text-gradient-accent">civic engagement</span>?
          </h2>
          <a
            href={SIGNIN_HREF}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.35)] active:scale-95"
          >
            Sign In
            <ArrowUpRight
              size={18}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </motion.div>

        <div className="grid grid-cols-2 gap-10 border-t border-white/5 py-16 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="text-lg font-black tracking-tighter text-white">
              CivicLens<span className="text-gradient-accent">AI</span>
            </span>
            <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-gray-600">
              AI-powered civic issue reporting platform with proactive social media monitoring and intelligent routing.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">
              Navigate
            </h3>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm font-light text-gray-600 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company links">
            <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">
              Platform
            </h3>
            <ul className="flex flex-col gap-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm font-light text-gray-600 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">
              Social
            </h3>
            <ul className="flex flex-wrap gap-3">
              {SOCIALS.map(({ label, Icon }) => (
                <li key={label}>
                  <a
                    href="#contact"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/20 hover:text-white active:scale-95"
                  >
                    <Icon size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 py-8 sm:flex-row">
          <p className="text-xs font-light text-gray-600">
            © {new Date().getFullYear()} CivicLens AI. Hack The Stack 2026. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a
              href="#contact"
              className="text-xs font-light text-gray-600 transition-colors hover:text-white"
            >
              Privacy Policy
            </a>
            <a
              href="#contact"
              className="text-xs font-light text-gray-600 transition-colors hover:text-white"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
