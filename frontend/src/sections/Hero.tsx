import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowRight, 
  FaDownload, 
  FaGithub, 
  FaLinkedin, 
  FaEnvelope, 
  FaTwitter,
  FaInfoCircle,
  FaDiscord
} from 'react-icons/fa';
import { sanitizeUrl } from '../utils/security';

// Hardcoded Hero Profile Details (Only Resume URL is dynamic via props from Admin Panel)
const HERO_STATIC_DATA = {
  name: 'PAWAN KUMAR',
  title: 'Algorithmic Software Developer By Implementing AI',
  tagline: 'Transforming complex business requirements into elegant, high-performance software solutions with clean, scalable code.',
  availability: 'WELCOME TO MY UNIVERSE',
  socials: [
    { name: 'GitHub', icon: FaGithub, url: 'https://github.com/POWER-WORLD' },
    { name: 'LinkedIn', icon: FaLinkedin, url: 'https://www.linkedin.com/in/pawankumar3253702/' },
    { name: 'Twitter', icon: FaTwitter, url: 'https://x.com/Pawan3253702' },
    { name: 'Email', icon: FaEnvelope, url: 'mailto:pk0403564@gmail.com' },
    { name: 'Discord', icon: FaDiscord, url: 'https://discord.com/users/pawankumar3253702' },
  ],
};

// Preset wave gradient color themes applied to each word of the name
const WORD_GRADIENT_THEMES = [
  // Word 1 (e.g. PAWAN): Dynamic Cyan -> Indigo -> Fuchsia Wave
  {
    gradient: 'from-cyan-400 via-indigo-300 to-fuchsia-400',
    dropShadow: 'drop-shadow-[0_0_25px_rgba(0,229,255,0.7)]',
  },
  // Word 2 (e.g. KUMAR): Radiant Amber -> Coral Pink -> Deep Purple Wave
  {
    gradient: 'from-amber-400 via-rose-400 to-purple-400',
    dropShadow: 'drop-shadow-[0_0_25px_rgba(255,0,127,0.7)]',
  },
  // Word 3 (if any): Emerald -> Neon Teal -> Cyan Wave
  {
    gradient: 'from-emerald-400 via-teal-300 to-cyan-400',
    dropShadow: 'drop-shadow-[0_0_25px_rgba(57,255,20,0.7)]',
  },
];

/**
 * Universal Resume Download Engine
 * Handles Google Drive links and direct URLs reliably.
 */
export function downloadResumeFile(url: string, defaultFilename = 'Pawan_Kumar_Resume.pdf'): boolean {
  const safeUrl = sanitizeUrl(url);
  if (!safeUrl || safeUrl === '#' || safeUrl.trim() === '') return false;

  // 1. Handle Google Drive URLs
  let downloadUrl = url;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
  if (driveMatch && driveMatch[1]) {
    downloadUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  // 2. Standard HTTP/HTTPS links
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.download = defaultFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return true;
}

interface HeroProps {
  data?: {
    resumeUrl?: string;
    [key: string]: any;
  };
  resumeUrl?: string;
}

export default function Hero({ data, resumeUrl: propResumeUrl }: HeroProps) {
  const activeResumeUrl = data?.resumeUrl || propResumeUrl || '';
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = element.getBoundingClientRect().top + window.scrollY - 80;
      const event = new CustomEvent('trigger-blackhole-transit', {
        detail: { targetScrollY: offset },
        cancelable: true,
      });
      const handled = !window.dispatchEvent(event);
      if (!handled) {
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!activeResumeUrl || activeResumeUrl === '#') {
      setToastMessage('Resume update pending from Admin Panel.');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    const success = downloadResumeFile(activeResumeUrl);
    if (!success) {
      setToastMessage('Could not initiate resume download. Please check Admin link.');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 90,
        damping: 14,
      },
    },
  };

  const nameWords = HERO_STATIC_DATA.name.trim().split(/\s+/);

  return (
    <section
      id="home"
      className="w-full relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center py-8 md:py-12 scroll-mt-20 text-center select-none overflow-hidden bg-transparent"
    >

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 z-50 p-[1.5px] rounded-full bg-linear-to-r from-amber-400 via-orange-500 to-red-500 animate-wave-gradient bg-[length:200%_200%] backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-950/10 text-amber-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
              <FaInfoCircle className="text-amber-400 shrink-0 text-base" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center relative z-10"
      >
        {/* 1. WELCOME TO MY UNIVERSE Capsule Pill Badge (Top) */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold tracking-widest text-cyan-400 border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.15)] uppercase font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span>{HERO_STATIC_DATA.availability}</span>
          </div>
        </motion.div>

        {/* 2. PAWAN KUMAR (Big Bold Animated Name - Single line on tablet/desktop) */}
        <motion.h1 
          variants={itemVariants}
          className="font-orbitron font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-none mb-3 sm:mb-4 flex flex-wrap md:flex-nowrap justify-center gap-x-3 sm:gap-x-5 md:gap-x-6 whitespace-normal md:whitespace-nowrap w-full"
        >
          {(() => {
            let cumulativeCharIndex = 0;
            return nameWords.map((word, wordIndex) => {
              const theme = WORD_GRADIENT_THEMES[wordIndex % WORD_GRADIENT_THEMES.length];
              const wordLetters = Array.from(word);
              
              return (
                <span 
                  key={wordIndex}
                  className="inline-flex items-center space-x-0.5 sm:space-x-1 py-1"
                >
                  {wordLetters.map((char, charIndex) => {
                    const globalIndex = cumulativeCharIndex++;
                    return (
                      <motion.span
                        key={charIndex}
                        initial={{ opacity: 0, y: 35, scale: 0.8 }}
                        animate={{
                          opacity: 1,
                          y: [0, -6, 0],
                          scale: 1,
                        }}
                        transition={{
                          opacity: { duration: 0.4, delay: 0.1 + globalIndex * 0.04 },
                          scale: { duration: 0.4, delay: 0.1 + globalIndex * 0.04 },
                          y: {
                            duration: 2.6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.4 + globalIndex * 0.08,
                          },
                        }}
                        whileHover={{
                          scale: 1.25,
                          y: -12,
                          rotate: [0, -6, 6, 0],
                          transition: { type: 'spring', stiffness: 400, damping: 10 },
                        }}
                        className={`inline-block cursor-default select-none bg-gradient-to-r ${theme.gradient} bg-[length:250%_250%] animate-wave-gradient bg-clip-text text-transparent ${theme.dropShadow}`}
                      >
                        {char}
                      </motion.span>
                    );
                  })}
                </span>
              );
            });
          })()}
        </motion.h1>

        {/* 3. Title (Cyan Glowing Header directly below Name, matching reference image) */}
        <motion.h2
          variants={itemVariants}
          className="font-orbitron font-extrabold text-lg sm:text-2xl md:text-3xl lg:text-4xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 animate-wave-gradient bg-[length:200%_200%] text-center my-3 sm:my-4 drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]"
        >
          {HERO_STATIC_DATA.title}
        </motion.h2>

        {/* 4. Tagline (2-line centered clean text, matching reference image) */}
        <motion.p
          variants={itemVariants}
          className="text-slate-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed text-center mb-8 px-4 font-sans font-normal"
        >
          {HERO_STATIC_DATA.tagline}
        </motion.p>

        {/* 5. CTA Buttons (Side-by-Side Capsules matching reference image) */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto mb-10 sm:mb-12"
        >
          {/* Explore Projects (Cyan/Indigo Gradient Capsule) */}
          <button
            onClick={() => handleScrollToSection('projects')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:shadow-[0_0_35px_rgba(0,229,255,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
          >
            <span className="font-display font-bold">Explore Projects</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300 text-xs" />
          </button>

          {/* Download Resume (Dark Transparent Glass Capsule) */}
          <button
            type="button"
            onClick={handleDownloadClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full border border-white/10 hover:border-accent/40 bg-bg-dark/40 hover:bg-bg-dark/60 text-white font-semibold text-sm tracking-wide backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(108,99,255,0.25)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
          >
            <span className="font-display">Download Resume</span>
            <FaDownload className="text-xs group-hover:-translate-y-0.5 transition-transform duration-300 text-cyan-400" />
            {activeResumeUrl && activeResumeUrl !== '#' && (
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] ml-1 animate-pulse" title="Resume Ready" />
            )}
          </button>
        </motion.div>

        {/* 6. Social Links (Centered Glass Circles matching reference image) */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
          {HERO_STATIC_DATA.socials.map((social, i) => {
            const Icon = social.icon;
            const safeSocialUrl = sanitizeUrl(social.url);
            return (
              <motion.a
                key={i}
                href={safeSocialUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                title={social.name}
                whileHover={{ y: -4, scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full border border-white/10 bg-bg-dark/40 text-gray-300 hover:text-white hover:border-accent/40 hover:bg-bg-dark/60 hover:shadow-[0_0_15px_rgba(108,99,255,0.25)] transition-all duration-300 text-base backdrop-blur-md"
              >
                <Icon />
              </motion.a>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer group z-10"
        onClick={() => handleScrollToSection('about')}
      >
        <span className="text-[10px] text-gray-400 group-hover:text-cyan-400 font-mono tracking-widest uppercase transition-colors duration-200">
          Scroll Down
        </span>
        <div className="w-5 h-9 rounded-full border border-white/20 group-hover:border-cyan-400/60 flex justify-center p-1.5 transition-colors duration-200 bg-slate-950/20 backdrop-blur-sm">
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.9)]"
          />
        </div>
      </motion.div>
    </section>
  );
}
