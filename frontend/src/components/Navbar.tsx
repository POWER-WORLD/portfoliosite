import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import { NAV_ITEMS } from '../constants';
import { useScrollLock } from '../hooks/useScrollLock';
import { sanitizeUrl } from '../utils/security';

interface NavbarProps {
  activeSection: string;
}

// Preset wave gradient color themes applied to each menu item for maximum visual animation
const NAV_ITEM_THEMES = [
  // 1. HOME: Dynamic Cyan -> Indigo -> Fuchsia Wave
  {
    gradient: 'from-cyan-400 via-indigo-300 to-fuchsia-400',
    dropShadow: 'drop-shadow-[0_0_10px_rgba(0,229,255,0.7)]',
    badgeColor: 'text-cyan-400',
    glowColor: '#00E5FF',
  },
  // 2. ABOUT: Radiant Amber -> Rose -> Purple Wave
  {
    gradient: 'from-amber-400 via-rose-400 to-purple-400',
    dropShadow: 'drop-shadow-[0_0_10px_rgba(255,0,127,0.7)]',
    badgeColor: 'text-rose-400',
    glowColor: '#FF007F',
  },
  // 3. SKILLS: Emerald -> Neon Teal -> Cyan Wave
  {
    gradient: 'from-emerald-400 via-teal-300 to-cyan-400',
    dropShadow: 'drop-shadow-[0_0_10px_rgba(57,255,20,0.7)]',
    badgeColor: 'text-emerald-400',
    glowColor: '#39FF14',
  },
  // 4. PROJECTS: Sky Blue -> Violet -> Pink Wave
  {
    gradient: 'from-sky-400 via-violet-400 to-pink-500',
    dropShadow: 'drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]',
    badgeColor: 'text-violet-400',
    glowColor: '#A855F7',
  },
  // 5. CONTACT: Electric Teal -> Fuchsia -> Amber Wave
  {
    gradient: 'from-teal-300 via-fuchsia-400 to-amber-300',
    dropShadow: 'drop-shadow-[0_0_10px_rgba(217,70,239,0.7)]',
    badgeColor: 'text-fuchsia-400',
    glowColor: '#D946EF',
  },
];

// 1. UFO SVG Component
const UFO = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
  return (
    <motion.div
      onClick={onClick}
      className="relative cursor-pointer select-none"
      animate={{
        y: isOpen ? [0, -2, 0] : [-3, 3],
        rotate: isOpen ? [0, 2, -2, 0] : 0,
      }}
      transition={
        isOpen
          ? { duration: 0.5, ease: 'easeInOut' }
          : { repeat: Infinity, repeatType: 'reverse', duration: 3, ease: 'easeInOut' }
      }
      whileHover={{ scale: 1.1, filter: 'drop-shadow(0 0 15px rgba(0, 229, 255, 0.9))' }}
      whileTap={{ scale: 0.95 }}
    >
      <svg
        width="90"
        height="60"
        viewBox="0 0 100 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glass dome gradient */}
          <radialGradient id="ufoDomeGrad" cx="50%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#6C63FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#050816" stopOpacity="0.2" />
          </radialGradient>

          {/* Metallic Hull gradient */}
          <linearGradient id="ufoHullGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="50%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="ufoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tractor beam emitter base projection - glows when menu is open */}
        {isOpen && (
          <motion.path
            d="M40 44 L60 44 L75 60 L25 60 Z"
            fill="url(#beamBaseGrad)"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3], scaleY: 1 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originY: 0 }}
          />
        )}

        {/* Upper glass dome */}
        <ellipse cx="50" cy="24" rx="20" ry="12" fill="url(#ufoDomeGrad)" stroke="#00E5FF" strokeWidth="1" strokeOpacity="0.6" />

        {/* Small Alien inside */}
        <g id="alien-occupant" className="alien-glow">
          {/* Alien Head */}
          <path
            d="M 46 23 C 46 17, 54 17, 54 23 C 54 27, 51 29, 50 30 C 49 29, 46 27, 46 23 Z"
            fill="#39FF14"
            opacity="0.85"
          />
          {/* Slanted Eyes */}
          <ellipse cx="48.5" cy="22.5" rx="0.8" ry="1.6" fill="#000000" transform="rotate(-15 48.5 22.5)" />
          <ellipse cx="51.5" cy="22.5" rx="0.8" ry="1.6" fill="#000000" transform="rotate(15 51.5 22.5)" />
        </g>

        {/* Saucer main body */}
        {/* Metal ring/hull */}
        <path
          d="M 12 34 C 12 28, 88 28, 88 34 C 88 40, 12 40, 12 34 Z"
          fill="url(#ufoHullGrad)"
          stroke="#4B5563"
          strokeWidth="1.5"
        />

        {/* Saucer lower hull */}
        <path
          d="M 28 39 C 32 46, 68 46, 72 39 Z"
          fill="#111827"
          stroke="#1F2937"
          strokeWidth="1"
        />

        {/* Thruster / Emitter bulb */}
        <ellipse
          cx="50"
          cy="42"
          rx="8"
          ry="3"
          fill={isOpen ? '#00E5FF' : '#4B5563'}
          filter="url(#ufoGlow)"
          className="transition-colors duration-500"
        />

        {/* Rim Lights (Sequential Blinking) */}
        <g id="rim-lights">
          {/* Light 1 */}
          <circle cx="20" cy="34" r="1.5" fill="#00E5FF" filter="url(#ufoGlow)">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" begin="0s" repeatCount="indefinite" />
          </circle>
          {/* Light 2 */}
          <circle cx="32" cy="35.5" r="1.5" fill="#39FF14" filter="url(#ufoGlow)">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" begin="0.25s" repeatCount="indefinite" />
          </circle>
          {/* Light 3 */}
          <circle cx="44" cy="36.5" r="1.5" fill="#00E5FF" filter="url(#ufoGlow)">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
          </circle>
          {/* Light 4 */}
          <circle cx="56" cy="36.5" r="1.5" fill="#00E5FF" filter="url(#ufoGlow)">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" begin="0.75s" repeatCount="indefinite" />
          </circle>
          {/* Light 5 */}
          <circle cx="68" cy="35.5" r="1.5" fill="#39FF14" filter="url(#ufoGlow)">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" begin="1s" repeatCount="indefinite" />
          </circle>
          {/* Light 6 */}
          <circle cx="80" cy="34" r="1.5" fill="#00E5FF" filter="url(#ufoGlow)">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" begin="1.25s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
      {/* Glow gradient for the tractor beam base */}
      <svg className="absolute -z-10" width="0" height="0">
        <defs>
          <linearGradient id="beamBaseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
};

export default function Navbar({ activeSection }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  // useScrollLock(isOpen);

  const handleScrollTo = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky navbar
      const navbarOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarOffset;

      const event = new CustomEvent('trigger-blackhole-transit', {
        detail: { targetScrollY: offsetPosition },
        cancelable: true,
      });
      const handled = !window.dispatchEvent(event);
      if (!handled) {
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        {/* Custom Premium Logo (navbarlogo2.png) with Animated Wave Gradient Border */}
        <a
          href={sanitizeUrl('#home')}
          onClick={(e) => {
            e.preventDefault();
            handleScrollTo('home');
          }}
          className="group relative p-[1.5px] rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-400 animate-wave-gradient bg-[length:200%_200%] shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.7)] hover:scale-105 transition-all duration-300 select-none flex items-center overflow-hidden"
        >
          <div className="bg-bg-dark/80 px-2.5 py-1 rounded-[10px] backdrop-blur-md flex items-center justify-center">
            <img
              src="/navbarlogo2.png"
              alt="Pawan Kumar Portfolio Logo"
              className="h-10 sm:h-11 w-auto inline-block filter drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] transition-all duration-300 group-hover:brightness-110"
            />
          </div>
        </a>

        {/* Center Slot for UFO Menu Toggle */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
          <UFO isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </div>

        {/* Futuristic Envelope Icon for "Get In Touch" with Animated Wave Gradient Border */}
        <div className="flex items-center">
          <div className="p-[1.5px] rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 via-indigo-500 to-emerald-400 animate-wave-gradient bg-[length:250%_250%] shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.8)] transition-all duration-300 group hover:scale-105">
            <button
              onClick={() => handleScrollTo('contact')}
              aria-label="Get In Touch"
              className="relative p-3 rounded-full bg-bg-dark/80 text-cyan-300 hover:text-white transition-all duration-300 cursor-pointer flex items-center justify-center overflow-hidden backdrop-blur-md"
            >
              {/* Corner Bracket Overlays with HUD wave gradient colors */}
              <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-cyan-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-fuchsia-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              <span className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-indigo-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-emerald-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />

              <FaEnvelope className="text-sm md:text-base relative z-10 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]" />

              {/* Glowing dot in the corner of the contact button */}
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-alien-green shadow-[0_0_8px_#39FF14] animate-ping" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Holographic Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click-outside overlay — transparent, no blur so page is still visible */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-20"
            />

            {/* ── Dropdown card ── */}
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className={[
                // position
                'absolute top-[82px] left-1/2 -translate-x-1/2 z-40',
                // mobile: 92vw capped at 360px
                'w-[92vw] max-w-[360px]',
                // desktop: shrink-wrap to content, never exceed viewport
                'md:w-max md:max-w-[calc(100vw-48px)]',
                // border gradient wrapper
                'p-[1px] rounded-2xl',
                'bg-gradient-to-b from-cyan-500/50 via-accent/25 to-transparent',
                'shadow-[0_20px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(0,229,255,0.12)]',
              ].join(' ')}
            >
              {/* inner glass panel — shrinks to fit on desktop */}
              <div className={[
                'bg-[rgba(5,8,22,0.82)] backdrop-blur-2xl rounded-[15px] relative',
                // mobile: column layout with padding
                'flex flex-col py-5 px-4',
                // desktop: single row, less padding
                'md:flex-row md:items-center md:py-2 md:px-2 md:gap-1',
              ].join(' ')}>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-cyan-400/70 rounded-tl-[15px]" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-accent/70 rounded-tr-[15px]" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-accent/70 rounded-bl-[15px]" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-cyan-400/70 rounded-br-[15px]" />

                {/* ── Mobile-only header ── */}
                <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-white/10 md:hidden">
                  <span className="font-orbitron text-[9px] font-semibold text-cyan-400 tracking-widest uppercase drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]">
                    [SYS: NAV_MENU]
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 font-mono text-[8px] text-alien-green shadow-[0_0_8px_rgba(57,255,20,0.25)] animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-alien-green shadow-[0_0_4px_#39FF14]" />
                    ONLINE
                  </span>
                </div>

                {/* ── Nav items list ── */}
                <nav>
                  <ul className={[
                    'list-none relative z-10',
                    // mobile: vertical stack, full width items
                    'flex flex-col gap-2.5',
                    // desktop: single row, no wrap, auto-width items
                    'md:flex-row md:flex-nowrap md:gap-1.5',
                  ].join(' ')}>
                    {NAV_ITEMS.map((item, index) => {
                      const isActive = activeSection === item.id;
                      const theme = NAV_ITEM_THEMES[index % NAV_ITEM_THEMES.length];
                      const itemLetters = Array.from(item.label);
                      const formattedIndex = String(index + 1).padStart(2, '0');

                      return (
                        <li key={item.id} className="md:shrink-0">
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22, delay: index * 0.035 }}
                            className={[
                              'p-[1px] rounded-xl transition-all duration-300',
                              isActive
                                ? `bg-gradient-to-r ${theme.gradient} animate-wave-gradient bg-[length:200%_200%] shadow-[0_0_12px_rgba(0,229,255,0.2)]`
                                : 'bg-white/[0.05] hover:bg-gradient-to-r hover:' + theme.gradient + ' hover:animate-wave-gradient hover:bg-[length:200%_200%] hover:shadow-[0_0_8px_rgba(0,229,255,0.12)]',
                            ].join(' ')}
                          >
                            <button
                              onClick={() => handleScrollTo(item.id)}
                              className={[
                                'group relative flex items-center gap-2.5 cursor-pointer',
                                'rounded-[11px] bg-[rgba(5,8,22,0.88)] backdrop-blur-md',
                                'transition-all duration-300 overflow-hidden whitespace-nowrap',
                                // mobile: full-width, bigger padding, left-align with number badge
                                'w-full justify-between px-4 py-3',
                                // desktop: auto-width, tighter padding, centered
                                'md:w-auto md:justify-center md:px-3 md:py-1.5',
                              ].join(' ')}
                            >
                              {/* hover glow */}
                              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 via-purple-500/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              {/* content row */}
                              <span className="flex items-center gap-2 relative z-10">
                                {/* number badge — visible only on mobile */}
                                <span className={`font-orbitron font-extrabold text-[10px] md:hidden ${theme.badgeColor} drop-shadow-[0_0_5px_currentColor]`}>
                                  [{formattedIndex}]
                                </span>

                                {/* animated label letters */}
                                <span className="inline-flex items-center space-x-px">
                                  {itemLetters.map((char, ci) => (
                                    <motion.span
                                      key={ci}
                                      animate={{ y: [0, -2, 0] }}
                                      transition={{
                                        duration: 2.4,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: index * 0.1 + ci * 0.08,
                                      }}
                                      whileHover={{
                                        scale: 1.3,
                                        y: -4,
                                        rotate: [0, -5, 5, 0],
                                        transition: { type: 'spring', stiffness: 420, damping: 10 },
                                      }}
                                      className={`inline-block font-orbitron font-black text-xs tracking-widest bg-gradient-to-r ${theme.gradient} bg-[length:250%_250%] animate-wave-gradient bg-clip-text text-transparent ${theme.dropShadow}`}
                                    >
                                      {char}
                                    </motion.span>
                                  ))}
                                </span>
                              </span>

                              {/* active dot / hover hint */}
                              <span className="relative z-10 md:ml-1">
                                {isActive ? (
                                  <motion.span
                                    layoutId="activeAlienIndicator"
                                    className="block w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                                    style={{ backgroundColor: theme.glowColor }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                  />
                                ) : (
                                  <span className="text-[8px] font-share-tech text-gray-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    ▸
                                  </span>
                                )}
                              </span>
                            </button>
                          </motion.div>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* ── Mobile-only footer ── */}
                <div className="flex justify-between items-center mt-4 pt-2.5 border-t border-white/10 md:hidden">
                  <span className="font-mono text-[8px] text-cyan-400/50">[SECTOR: NAV]</span>
                  <span className="font-orbitron font-bold text-[8px] text-accent drop-shadow-[0_0_4px_rgba(108,99,255,0.4)]">
                    SYS_v1.0.9
                  </span>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

