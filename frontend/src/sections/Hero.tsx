import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowRight, 
  FaDownload, 
  FaGithub, 
  FaLinkedin, 
  FaEnvelope, 
  FaTwitter,
  FaCode, 
  FaInfoCircle,
  FaRocket,
  FaTerminal,
  FaLaptopCode
} from 'react-icons/fa';

// Hardcoded Hero Profile Details (Only Resume URL is dynamic via props from Admin Panel)
const HERO_STATIC_DATA = {
  name: 'PAWAN KUMAR',
  title: 'Algorithmic Software Developer By Implementing AI',
  availability: 'Available for new opportunities',
  socials: [
    { 
      name: 'GitHub', 
      icon: FaGithub, 
      url: 'https://github.com',
      borderGradient: 'from-cyan-400 via-indigo-500 to-blue-500',
      textGlow: 'text-cyan-300',
      boxShadow: 'shadow-[0_0_20px_rgba(0,229,255,0.35)]',
    },
    { 
      name: 'LinkedIn', 
      icon: FaLinkedin, 
      url: 'https://linkedin.com',
      borderGradient: 'from-blue-400 via-sky-500 to-indigo-500',
      textGlow: 'text-blue-300',
      boxShadow: 'shadow-[0_0_20px_rgba(59,130,246,0.35)]',
    },
    { 
      name: 'Twitter', 
      icon: FaTwitter, 
      url: 'https://x.com',
      borderGradient: 'from-sky-400 via-purple-500 to-pink-500',
      textGlow: 'text-sky-300',
      boxShadow: 'shadow-[0_0_20px_rgba(56,189,248,0.35)]',
    },
    { 
      name: 'Email', 
      icon: FaEnvelope, 
      url: 'mailto:pawankumar@example.com',
      borderGradient: 'from-emerald-400 via-teal-400 to-cyan-400',
      textGlow: 'text-emerald-300',
      boxShadow: 'shadow-[0_0_20px_rgba(57,255,20,0.35)]',
    },
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
  // Word 4 (if any): Electric Violet -> Magenta -> Sky Wave
  {
    gradient: 'from-violet-400 via-pink-400 to-sky-400',
    dropShadow: 'drop-shadow-[0_0_25px_rgba(168,85,247,0.7)]',
  },
];

/**
 * Universal Resume Download Engine
 * Handles Base64 Data URIs, Google Drive links, and direct URLs reliably.
 */
export function downloadResumeFile(url: string, defaultFilename = 'Pawan_Kumar_Resume.pdf'): boolean {
  if (!url || url === '#' || url.trim() === '') return false;

  // 1. Handle Base64 Data URIs (e.g. data:application/pdf;base64,...)
  if (url.startsWith('data:')) {
    try {
      const parts = url.split(';base64,');
      const contentType = parts[0].replace('data:', '') || 'application/pdf';
      const raw = window.atob(parts[1]);
      const uInt8Array = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      return true;
    } catch (err) {
      console.error('Failed to decode Base64 resume file:', err);
      return false;
    }
  }

  // 2. Handle Google Drive URLs (convert /file/d/ID/view to /uc?export=download&id=ID)
  let downloadUrl = url;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
  if (driveMatch && driveMatch[1]) {
    downloadUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  // 3. Standard HTTP/HTTPS links
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
  // Extract resumeUrl exclusively from Admin Panel API (via data prop or fallback prop)
  const activeResumeUrl = data?.resumeUrl || propResumeUrl || '';
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Smooth scroll helper
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

  // Stagger Animations
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
    hidden: { y: 30, opacity: 0 },
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

  // Split name into distinct words for individual wave gradient styling
  const nameWords = HERO_STATIC_DATA.name.trim().split(/\s+/);

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 py-16 sm:py-24 text-center select-none overflow-hidden bg-transparent"
    >
      {/* Background Animated Multi-Color Wave Ambient Lights */}
      <motion.div 
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -40, 40, 0],
          scale: [1, 1.2, 0.85, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] md:w-[650px] h-[350px] sm:h-[500px] md:h-[650px] bg-gradient-to-tr from-cyan-500/20 via-indigo-600/15 to-fuchsia-600/10 rounded-full blur-[130px] pointer-events-none -z-10 animate-wave-gradient bg-[length:200%_200%]" 
      />
      <motion.div 
        animate={{
          x: [0, -50, 50, 0],
          y: [0, 50, -50, 0],
          scale: [1, 0.85, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] sm:w-[450px] md:w-[600px] h-[300px] sm:h-[450px] md:h-[600px] bg-gradient-to-br from-amber-500/15 via-rose-600/15 to-purple-600/15 rounded-full blur-[130px] pointer-events-none -z-10 animate-wave-gradient bg-[length:200%_200%]" 
      />

      {/* Cyber Grid Mask Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0e_1px,transparent_1px)] [background-size:30px_30px] opacity-70 pointer-events-none -z-10" />

      {/* Floating Side Tech Cards (90% Transparent Glass) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0, y: [0, -12, 0] }}
        transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }, opacity: { delay: 0.8 } }}
        className="hidden lg:flex absolute left-8 top-1/3 p-[1.5px] rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 animate-wave-gradient bg-[length:200%_200%] shadow-[0_0_25px_rgba(0,229,255,0.3)] hover:scale-105 transition-transform duration-300"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-[14px] bg-slate-950/10 backdrop-blur-md">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 shadow-inner">
            <FaRocket className="text-lg" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Performance</p>
            <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200">AI & Algorithmic Dev</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0, y: [0, 12, 0] }}
        transition={{ y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }, opacity: { delay: 1.0 } }}
        className="hidden lg:flex absolute right-8 top-1/3 p-[1.5px] rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-rose-500 animate-wave-gradient bg-[length:200%_200%] shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:scale-105 transition-transform duration-300"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-[14px] bg-slate-950/10 backdrop-blur-md">
          <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 shadow-inner">
            <FaCode className="text-lg" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Architecture</p>
            <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-200">Scalable Systems</p>
          </div>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 z-50 p-[1.5px] rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 animate-wave-gradient bg-[length:200%_200%] backdrop-blur-md"
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
        className="max-w-6xl mx-auto flex flex-col items-center w-full relative z-10"
      >
        {/* 1. Status / Availability Badge (90% Transparent Inner Container) */}
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <div className="p-[1.5px] rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-wave-gradient bg-[length:200%_200%] shadow-[0_0_20px_rgba(57,255,20,0.35)] hover:scale-105 transition-all duration-300">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-950/10 backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.9)]"></span>
              </span>
              <span className="font-mono text-[11px] sm:text-xs uppercase tracking-widest font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 animate-wave-gradient bg-[length:200%_200%]">
                {HERO_STATIC_DATA.availability}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 2. Name with Distinct Wave Gradient Color Per Word & Floating Letters */}
        <motion.h1 
          variants={itemVariants}
          className="font-orbitron font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tight leading-none mb-6 sm:mb-8 flex flex-wrap justify-center gap-x-5 sm:gap-x-10 gap-y-3"
        >
          {nameWords.map((word, wordIndex) => {
            const theme = WORD_GRADIENT_THEMES[wordIndex % WORD_GRADIENT_THEMES.length];
            const wordLetters = Array.from(word);
            
            return (
              <span 
                key={wordIndex}
                className="inline-flex items-center space-x-0.5 sm:space-x-1 py-1"
              >
                {wordLetters.map((char, charIndex) => {
                  const globalIndex = wordIndex * 6 + charIndex;
                  return (
                    <motion.span
                      key={charIndex}
                      initial={{ opacity: 0, y: 35, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        y: [0, -8, 0],
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
                        y: -14,
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
          })}
        </motion.h1>

        {/* 3. Hero Title Capsule (90% Transparent Inner Container) */}
        <motion.div variants={itemVariants} className="my-4 sm:my-6 px-2 flex justify-center w-full max-w-4xl">
          <div className="relative group w-full">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1 rounded-2xl sm:rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 via-pink-500 to-emerald-400 blur-lg opacity-70 group-hover:opacity-100 transition duration-700 animate-border-hue" />
            
            {/* Glowing Border Capsule with 90% Transparent Fill */}
            <div className="relative p-[2px] rounded-2xl sm:rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 via-pink-500 to-emerald-400 animate-border-hue animate-title-glow shadow-[0_0_35px_rgba(0,229,255,0.4)]">
              <div className="px-6 py-3.5 sm:px-10 sm:py-4.5 rounded-[14px] sm:rounded-full bg-slate-950/10 backdrop-blur-xl border border-white/10 flex items-center justify-center gap-3 sm:gap-4">
                <FaTerminal className="text-cyan-400 text-lg sm:text-2xl shrink-0 animate-pulse" />
                
                <h2 className="font-orbitron font-extrabold text-base sm:text-xl md:text-2xl lg:text-3xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-purple-300 bg-[length:200%_200%] animate-wave-gradient text-center drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">
                  {HERO_STATIC_DATA.title}
                </h2>

                <FaLaptopCode className="text-purple-400 text-lg sm:text-2xl shrink-0 animate-pulse hidden sm:block" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4. Tagline Wrapped in a 90% Transparent Wave Border Glass Card */}
        <motion.div variants={itemVariants} className="my-4 sm:my-6 max-w-3xl px-2 w-full">
          <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-indigo-500/60 via-purple-500/60 to-pink-500/60 animate-wave-gradient bg-[length:200%_200%] shadow-[0_0_30px_rgba(108,99,255,0.25)] hover:border-indigo-400 transition-all duration-300">
            <div className="px-6 py-5 rounded-[14px] bg-slate-950/10 backdrop-blur-xl border border-white/10">
              <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed font-sans font-normal">
                Transforming{' '}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 animate-wave-gradient bg-[length:200%_200%] underline decoration-cyan-400/40 decoration-wavy underline-offset-4">
                  complex business requirements
                </span>{' '}
                into{' '}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-pink-400 to-rose-300 animate-wave-gradient bg-[length:200%_200%] underline decoration-pink-400/40 decoration-wavy underline-offset-4">
                  elegant, high-performance software
                </span>{' '}
                solutions with{' '}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 animate-wave-gradient bg-[length:200%_200%] underline decoration-emerald-400/40 decoration-wavy underline-offset-4">
                  clean, scalable code
                </span>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 5. CTA Buttons with 90% Transparent Interiors */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto my-6 sm:my-8"
        >
          {/* Explore Projects Button */}
          <div className="w-full sm:w-auto p-[2px] rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 animate-wave-gradient bg-[length:250%_250%] shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:shadow-[0_0_40px_rgba(0,229,255,0.7)] hover:scale-105 active:scale-95 transition-all duration-300">
            <button
              onClick={() => handleScrollToSection('projects')}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-slate-950/10 hover:bg-slate-900/20 text-white font-bold text-sm tracking-wider font-display cursor-pointer relative overflow-hidden group backdrop-blur-md"
            >
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
              <FaCode className="text-base text-cyan-200" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200 animate-wave-gradient">Explore Projects</span>
              <FaArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300 text-xs text-cyan-200" />
            </button>
          </div>

          {/* Download Resume Button */}
          <div className="w-full sm:w-auto p-[2px] rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-wave-gradient bg-[length:250%_250%] shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.65)] hover:scale-105 active:scale-95 transition-all duration-300">
            <button
              type="button"
              onClick={handleDownloadClick}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-slate-950/10 hover:bg-slate-900/20 text-white font-bold text-sm tracking-wider font-display backdrop-blur-xl cursor-pointer group"
            >
              <FaDownload className="text-xs group-hover:-translate-y-0.5 transition-transform duration-300 text-emerald-400" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-teal-200 animate-wave-gradient">Download Resume</span>
              {activeResumeUrl && activeResumeUrl !== '#' && (
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] ml-1 animate-pulse" title="Resume Ready" />
              )}
            </button>
          </div>
        </motion.div>

        {/* 6. Social Links - 90% Transparent Glass Circles */}
        <motion.div variants={itemVariants} className="flex items-center gap-4 sm:gap-6 my-2">
          {HERO_STATIC_DATA.socials.map((social, i) => {
            const Icon = social.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -6, scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className={`p-[1.5px] rounded-full bg-gradient-to-r ${social.borderGradient} animate-wave-gradient bg-[length:200%_200%] ${social.boxShadow} transition-all duration-300`}
              >
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="flex items-center justify-center p-3.5 sm:p-4 rounded-full bg-slate-950/10 hover:bg-slate-900/20 text-gray-200 hover:text-white transition-colors duration-200 text-lg sm:text-xl backdrop-blur-md"
                >
                  <Icon className={`${social.textGlow} transition-transform duration-200`} />
                </a>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* 7. Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group z-10"
        onClick={() => handleScrollToSection('about')}
      >
        <span className="text-[10px] sm:text-xs text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 animate-wave-gradient bg-[length:200%_200%] font-mono tracking-widest uppercase font-bold">
          Scroll Down
        </span>
        <div className="p-[1.5px] rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 animate-wave-gradient bg-[length:200%_200%] shadow-[0_0_15px_rgba(0,229,255,0.4)]">
          <div className="w-5 sm:w-6 h-9 sm:h-10 rounded-full bg-slate-950/10 flex justify-center p-1.5 backdrop-blur-md">
            <motion.div
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.9)]"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
