import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import { NAV_ITEMS, NAV_ITEMS as navItems } from '../constants';

interface NavbarProps {
  activeSection: string;
}

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
    <header className="fixed top-0 left-0 w-full z-50 border-b border-white/[0.04] bg-bg-dark/20 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Custom Premium Logo */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleScrollTo('home');
          }}
          className="font-display font-black text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary hover:scale-105 transition-transform duration-300 select-none"
        >
          ALEX<span className="text-white">.</span>DEV
        </a>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleScrollTo(item.id)}
                className={`relative py-2 text-sm font-medium tracking-wide uppercase transition-colors duration-300 cursor-pointer ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeNavbarIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-secondary rounded-full shadow-[0_0_12px_#6C63FF]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Contact CTA */}
        <div className="hidden md:block">
          <button
            onClick={() => handleScrollTo('contact')}
            className="relative px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide overflow-hidden group border border-accent/30 hover:border-secondary/50 transition-all duration-500 cursor-pointer"
          >
            {/* Background glowing sweep */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent to-secondary blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10" />
            <span className="text-white group-hover:text-bg-dark font-bold transition-colors duration-500">
              Get In Touch
            </span>
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white hover:text-accent transition-colors duration-300 text-xl cursor-pointer"
          aria-label="Toggle Menu"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden w-full border-t border-white/[0.04] bg-bg-dark/90 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col space-y-6">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleScrollTo(item.id)}
                    className={`text-left text-lg font-semibold uppercase tracking-wider py-1 border-l-2 pl-4 transition-all duration-300 ${
                      isActive
                        ? 'border-accent text-white font-bold'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => handleScrollTo('contact')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-secondary text-bg-dark font-bold text-center tracking-wider hover:shadow-[0_0_15px_rgba(108,99,255,0.4)] transition-all duration-300"
              >
                Get In Touch
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
