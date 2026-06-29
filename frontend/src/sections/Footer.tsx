import { SOCIAL_LINKS } from '../constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    const event = new CustomEvent('trigger-blackhole-transit', {
      detail: { targetScrollY: 0 },
      cancelable: true,
    });
    const handled = !window.dispatchEvent(event);
    if (!handled) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer className="w-full border-t border-white/[0.04] bg-bg-dark/10 backdrop-blur-sm relative select-none z-10">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Animated logo signature */}
        <a
          href="#home"
          onClick={handleScrollToTop}
          className="font-display font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary hover:scale-105 hover:text-glow transition-all duration-300 select-none cursor-pointer"
        >
          PAWAN<span className="text-white">.</span>DEV
        </a>

        {/* Copyright notice */}
        <p className="text-xs text-gray-500 font-medium tracking-wide">
          &copy; {currentYear} Pawan Kumar. All Rights Reserved. Built with React & Vite.
        </p>

        {/* Social Icons list */}
        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map((social, i) => (
            <a
              key={i}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="p-2.5 rounded-full border border-white/[0.04] bg-white/[0.01] text-gray-500 hover:text-white hover:border-accent/30 hover:shadow-[0_0_12px_rgba(108,99,255,0.15)] transition-all duration-300 text-sm"
            >
              <social.icon />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
