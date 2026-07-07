import { useState, useEffect } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  useScrollLock(isOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
    >
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
              alt="Logo"
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

      {/* Interactive Holographic Dropdown & Tractor Beam */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Tapered Tractor Beam Projection */}
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ originY: 0 }}
              className="absolute top-[75px] left-1/2 -translate-x-1/2 w-[340px] md:w-[890px] h-[520px] md:h-[240px] pointer-events-none z-30 transition-all duration-500"
            >
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <radialGradient id="beamGrad" cx="50%" cy="0%" r="90%">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.45" />
                    <stop offset="35%" stopColor="#00E5FF" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <polygon points="46,0 54,0 95,100 5,100" fill="url(#beamGrad)" />

                {/* Dynamic scanner light sweep */}
                <line x1="0" y1="0" x2="100" y2="0" stroke="#00E5FF" strokeWidth="0.8" opacity="0.6">
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0,0"
                    to="0,100"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </line>
              </svg>
            </motion.div>

            {/* Backdrop click closer overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20"
            />

            {/* Holographic HUD Container with Outer Animated Wave Gradient Border */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[88px] left-1/2 -translate-x-1/2 w-[94vw] max-w-[900px] md:w-[900px] p-[1.5px] rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 via-fuchsia-500 to-emerald-400 animate-wave-gradient bg-[length:300%_300%] shadow-[0_0_35px_rgba(0,229,255,0.35)] z-40 overflow-hidden"
            >
              <div className="w-full hologram-panel rounded-[10px] flex flex-col items-center py-6 px-4 relative overflow-hidden">
                {/* Cyber Corners */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-fuchsia-400" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-indigo-400" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

                {/* Status Header */}
                <div className="w-full flex justify-between items-center px-3 mb-4 text-[10px] font-share-tech tracking-widest uppercase border-b border-secondary/15 pb-2">
                  <span className="font-orbitron font-semibold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent animate-wave-gradient bg-[length:200%_200%] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]">
                    [SYS: BEAM_ACTIVE]
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full border border-emerald-400/40 bg-emerald-950/40 text-alien-green shadow-[0_0_10px_rgba(57,255,20,0.5)] animate-pulse font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-alien-green shadow-[0_0_6px_#39FF14]" />
                    ONLINE
                  </span>
                </div>

                {/* Staggered Navigation Items with Wave Gradient Colors & Letter Micro-Animations */}
                <div className="flex flex-col md:flex-row w-full gap-2.5 md:gap-2 relative z-10 justify-around">
                  {NAV_ITEMS.map((item, index) => {
                    const isActive = activeSection === item.id;
                    const formattedIndex = String(index + 1).padStart(2, '0');
                    const theme = NAV_ITEM_THEMES[index % NAV_ITEM_THEMES.length];
                    const itemLetters = Array.from(item.label);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`p-[1.5px] rounded-lg transition-all duration-300 w-full md:w-auto ${isActive
                            ? `bg-gradient-to-r ${theme.gradient} animate-wave-gradient bg-[length:200%_200%] shadow-[0_0_20px_rgba(0,229,255,0.5)] scale-[1.02]`
                            : 'bg-slate-800/40 hover:bg-gradient-to-r hover:' + theme.gradient + ' hover:animate-wave-gradient hover:bg-[length:200%_200%] hover:shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                          }`}
                      >
                        <button
                          onClick={() => handleScrollTo(item.id)}
                          className="group flex items-center justify-between md:justify-center w-full md:w-auto px-4 py-2.5 md:px-4 md:py-3.5 rounded-[6px] text-left md:text-center transition-all duration-300 relative cursor-pointer overflow-hidden bg-bg-dark/80 backdrop-blur-md"
                        >
                          {/* Hover subtle glow highlight */}
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r md:bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <div className="flex md:flex-col items-start md:items-center gap-3 md:gap-1.5 font-share-tech tracking-wider text-sm relative z-10 pb-0 md:pb-1">
                            <span className={`text-[10px] font-orbitron font-extrabold ${theme.badgeColor} drop-shadow-[0_0_6px_currentColor]`}>
                              [{formattedIndex}]
                            </span>

                            {/* Animated Word / Letters with Wave Gradient Fill */}
                            <span className="inline-flex items-center space-x-[1px]">
                              {itemLetters.map((char, charIdx) => (
                                <motion.span
                                  key={charIdx}
                                  animate={{
                                    y: [0, -3, 0],
                                  }}
                                  transition={{
                                    duration: 2.4,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: index * 0.1 + charIdx * 0.08,
                                  }}
                                  whileHover={{
                                    scale: 1.25,
                                    y: -5,
                                    rotate: [0, -4, 4, 0],
                                    transition: { type: 'spring', stiffness: 400, damping: 10 },
                                  }}
                                  className={`inline-block font-orbitron font-black text-xs sm:text-sm tracking-widest bg-gradient-to-r ${theme.gradient} bg-[length:250%_250%] animate-wave-gradient bg-clip-text text-transparent ${theme.dropShadow}`}
                                >
                                  {char}
                                </motion.span>
                              ))}
                            </span>
                          </div>

                          {/* Active / Hover Indicator */}
                          <div className="flex items-center gap-2 relative z-10 md:absolute md:bottom-1 md:left-1/2 md:-translate-x-1/2">
                            {isActive ? (
                              <motion.span
                                layoutId="activeAlienIndicator"
                                className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]"
                                style={{ backgroundColor: theme.glowColor, color: theme.glowColor }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              />
                            ) : (
                              <span className="text-[9px] font-share-tech text-gray-500 group-hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:hidden">
                                &lt;ENTER&gt;
                              </span>
                            )}
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Status Footer */}
                <div className="w-full flex justify-between items-center px-3 mt-4 text-[9px] font-share-tech tracking-widest border-t border-secondary/15 pt-2">
                  <span className="text-cyan-400/80 font-mono">[SECTOR: PORTFOLIO]</span>
                  <span className="font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent animate-wave-gradient bg-[length:200%_200%] drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]">
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

