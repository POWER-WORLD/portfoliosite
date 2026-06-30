import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import { NAV_ITEMS } from '../constants';

interface NavbarProps {
  activeSection: string;
}

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
      whileHover={{ scale: 1.1, filter: 'drop-shadow(0 0 12px rgba(0, 229, 255, 0.8))' }}
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
      className="fixed top-0 left-0 w-full z-50 transition-all"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        {/* Custom Premium Logo (navbarlogo2.png) */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleScrollTo('home');
          }}
          className="hover:scale-105 transition-transform duration-300 select-none flex items-center"
        >
          <img
            src="/navbarlogo2.png"
            alt="Logo"
            className="h-12 w-auto inline-block"
          />
        </a>

        {/* Center Slot for UFO Menu Toggle */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
          <UFO isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />

          {/* Subtle text label pointing to the UFO */}
          {/* <span className="text-[8px] font-share-tech tracking-[0.2em] text-gray-500 uppercase mt-[-4px] select-none pointer-events-none animate-pulse">
            {isOpen ? '[CLOSE]' : '[MENU]'}
          </span> */}
        </div>

        {/* Futuristic Envelope Icon for "Get In Touch" (Visible on all sizes) */}
        <div className="flex items-center">
          <button
            onClick={() => handleScrollTo('contact')}
            aria-label="Get In Touch"
            className="relative p-3 rounded-full border border-secondary/30 bg-secondary/5 text-secondary hover:text-white hover:border-secondary/80 hover:bg-secondary/20 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300 cursor-pointer flex items-center justify-center group overflow-hidden"
          >
            {/* Corner Bracket Overlays for a HUD design */}
            <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-secondary opacity-60 group-hover:opacity-100" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-secondary opacity-60 group-hover:opacity-100" />
            <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-secondary opacity-60 group-hover:opacity-100" />
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-secondary opacity-60 group-hover:opacity-100" />

            <FaEnvelope className="text-sm md:text-base relative z-10 transition-transform duration-300 group-hover:scale-110" />

            {/* Glowing dot in the corner of the contact button */}
            <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-alien-green animate-ping" />
          </button>
        </div>
      </div>

      {/* Interactive Holographic Dropdown & Tractor Beam */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Tapered Tractor Beam Projection (Behind dropdown, responsive sizing) */}
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

            {/* Holographic HUD Container (responsive: wide on desktop, compact on mobile) */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[88px] left-1/2 -translate-x-1/2 w-[300px] md:w-[850px] hologram-panel rounded-xl overflow-hidden z-40 border border-secondary/30 flex flex-col items-center py-6 px-4 transition-all duration-500"
            >
              {/* Cyber Corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-secondary" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-secondary" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-secondary" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-secondary" />

              {/* Status Header */}
              <div className="w-full flex justify-between items-center px-2 mb-4 text-[10px] font-share-tech text-secondary/70 tracking-widest uppercase border-b border-secondary/10 pb-2">
                <span>[SYS: BEAM_ACTIVE]</span>
                <span className="animate-pulse text-alien-green">● ONLINE</span>
              </div>

              {/* Staggered Navigation Items (Row on desktop, Column on mobile) */}
              <div className="flex flex-col md:flex-row w-full gap-2 md:gap-1.5 relative z-10 justify-around">
                {NAV_ITEMS.map((item, index) => {
                  const isActive = activeSection === item.id;
                  const formattedIndex = String(index + 1).padStart(2, '0');

                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleScrollTo(item.id)}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`group flex items-center justify-between md:justify-center w-full md:w-auto px-4 py-2.5 md:px-4 md:py-4 rounded text-left md:text-center transition-all duration-300 relative cursor-pointer overflow-hidden ${isActive
                          ? 'bg-secondary/10 border border-secondary/30 text-white'
                          : 'border border-transparent text-gray-400 hover:text-secondary'
                        }`}
                    >
                      {/* Hover highlight background */}
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r md:bg-gradient-to-b from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="flex md:flex-col items-start md:items-center gap-3 md:gap-1 font-share-tech tracking-wider text-sm relative z-10 pb-0 md:pb-1">
                        <span className={`text-[9px] font-orbitron ${isActive ? 'text-secondary' : 'text-gray-600 group-hover:text-secondary/50'}`}>
                          [{formattedIndex}]
                        </span>
                        <span className={`transition-all duration-300 ${isActive ? 'cyan-text-glow font-bold text-secondary' : 'group-hover:translate-x-1 md:group-hover:translate-x-0 md:group-hover:translate-y-[-2px]'}`}>
                          {item.label}
                        </span>
                      </div>

                      {/* Active indicator (Right on mobile, absolute bottom-center on desktop) */}
                      <div className="flex items-center gap-2 relative z-10 md:absolute md:bottom-1 md:left-1/2 md:-translate-x-1/2">
                        {isActive ? (
                          <motion.span
                            layoutId="activeAlienIndicator"
                            className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_#00E5FF]"
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          />
                        ) : (
                          <span className="text-[10px] font-share-tech text-gray-600 group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:hidden">
                            &lt;ENTER&gt;
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Status Footer */}
              <div className="w-full flex justify-between items-center px-2 mt-4 text-[9px] font-share-tech text-gray-500 tracking-widest border-t border-secondary/10 pt-2">
                <span>[SECTOR: PORTFOLIO]</span>
                <span>SYS_v1.0.9</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
