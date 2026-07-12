import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowRight,
  FaDownload,
  FaInfoCircle,
} from 'react-icons/fa';
import { sanitizeUrl } from '../utils/security';
import { PERSONAL_INFO, SOCIAL_LINKS } from '../constants';
import type { PersonalInfo } from '../constants';
import { verifyResumePassword } from '../services/api';

// ─── Name word gradient themes — one per word, cycles if name has more words ───
const WORD_GRADIENT_THEMES = [
  // Word 1: Cyan → Indigo → Fuchsia
  {
    gradient: 'from-cyan-400 via-indigo-300 to-fuchsia-400',
    dropShadow: 'drop-shadow-[0_0_25px_rgba(0,229,255,0.7)]',
  },
  // Word 2: Amber → Rose → Purple
  {
    gradient: 'from-amber-400 via-rose-400 to-purple-400',
    dropShadow: 'drop-shadow-[0_0_25px_rgba(255,0,127,0.7)]',
  },
  // Word 3+: Emerald → Teal → Cyan
  {
    gradient: 'from-emerald-400 via-teal-300 to-cyan-400',
    dropShadow: 'drop-shadow-[0_0_25px_rgba(57,255,20,0.7)]',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RESUME DOWNLOAD ENGINE
// Handles both Google Drive share links and direct file URLs.
// The filename is derived from the person's name (from DB) when available.
// ─────────────────────────────────────────────────────────────────────────────
export function downloadResumeFile(
  url: string,
  personName?: string,
): boolean {
  const safeUrl = sanitizeUrl(url);
  if (!safeUrl || safeUrl === '#' || safeUrl.trim() === '') return false;

  // Build a clean filename from the person's DB name, or use a generic fallback
  const cleanName = personName
    ? personName.trim().replace(/\s+/g, '_')
    : 'Resume';
  const filename = `${cleanName}_Resume.pdf`;

  // Convert Google Drive share links to a direct download URL
  let downloadUrl = url;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch?.[1]) {
    downloadUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  const a = document.createElement('a');
  a.href = downloadUrl;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface HeroProps {
  /** personalInfo document from MongoDB, passed down from App.tsx */
  data?: Partial<PersonalInfo>;
}

export default function Hero({ data }: HeroProps) {
  // Destructure all needed fields from the DB data object
  const {
    name: heroName = '',
    title: heroTitle = '',
    tagline: heroTagline = '',
    hasResume = false,
  } = data ?? {};

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Passcode modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // ── Scroll helpers ──────────────────────────────────────────────────────────
  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    const offset = element.getBoundingClientRect().top + window.scrollY - 80;
    const event = new CustomEvent('trigger-blackhole-transit', {
      detail: { targetScrollY: offset },
      cancelable: true,
    });
    const handled = !window.dispatchEvent(event);
    if (!handled) {
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  // ── Resume download button click ───────────────────────────────────────────
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!hasResume) {
      setToastMessage('Resume update pending from Admin Panel.');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    // Reset password state and open modal
    setPasscode(['', '', '', '']);
    setPasscodeError(null);
    setShowPasswordModal(true);
  };

  // ── Passcode inputs change handler ─────────────────────────────────────────
  const handleInputChange = (value: string, index: number) => {
    const cleanVal = value.replace(/\D/g, ''); // Numeric only
    if (!cleanVal) {
      const newPass = [...passcode];
      newPass[index] = '';
      setPasscode(newPass);
      return;
    }

    const newPass = [...passcode];
    newPass[index] = cleanVal.slice(-1); // Only store last entered digit
    setPasscode(newPass);
    setPasscodeError(null);

    // Auto-focus next input field
    if (index < 3) {
      const nextEl = document.getElementById(`digit-${index + 1}`);
      nextEl?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newPass = [...passcode];
      if (newPass[index]) {
        newPass[index] = '';
        setPasscode(newPass);
      } else if (index > 0) {
        newPass[index - 1] = '';
        setPasscode(newPass);
        const prevEl = document.getElementById(`digit-${index - 1}`);
        prevEl?.focus();
      }
    }
  };

  const handleVerifySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const codeStr = passcode.join('');
    if (codeStr.length !== 4) {
      setPasscodeError('Please enter all 4 digits.');
      return;
    }

    setVerifying(true);
    setPasscodeError(null);
    try {
      const res = await verifyResumePassword(codeStr);
      if (res.success && res.resumeUrl) {
        setToastMessage('Passcode verified! Initiating download...');
        setTimeout(() => setToastMessage(null), 3500);
        
        setShowPasswordModal(false);
        setPasscode(['', '', '', '']);
        
        downloadResumeFile(res.resumeUrl, heroName);
      } else {
        setPasscodeError(res.error || 'Invalid passcode. Please try again.');
        setPasscode(['', '', '', '']);
        document.getElementById('digit-0')?.focus();
      }
    } catch (err: any) {
      setPasscodeError('An error occurred during verification. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // ── Framer Motion variants ──────────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 90, damping: 14 },
    },
  };

  // Split the DB name into words for per-letter animation; filter empty strings
  const nameWords = heroName.trim().split(/\s+/).filter(Boolean);

  return (
    <section
      id="home"
      className="w-full relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center py-8 md:py-12 scroll-mt-20 text-center select-none overflow-hidden bg-transparent"
    >
      {/* ── Toast Notification ────────────────────────────────────────────── */}
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
        {/* ── 1. Availability Badge ─────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold tracking-widest text-cyan-400 border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.15)] uppercase font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span>{PERSONAL_INFO.availability}</span>
          </div>
        </motion.div>

        {/* ── 2. Animated Name (from DB) ────────────────────────────────────── */}
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

        {/* ── 3. Title (from DB) ────────────────────────────────────────────── */}
        {heroTitle && (
          <motion.h2
            variants={itemVariants}
            className="font-orbitron font-extrabold text-lg sm:text-2xl md:text-3xl lg:text-4xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 animate-wave-gradient bg-[length:200%_200%] text-center my-3 sm:my-4 drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]"
          >
            {heroTitle}
          </motion.h2>
        )}

        {/* ── 4. Tagline (from DB) ──────────────────────────────────────────── */}
        {heroTagline && (
          <motion.p
            variants={itemVariants}
            className="text-slate-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed text-center mb-8 px-4 font-sans font-normal"
          >
            {heroTagline}
          </motion.p>
        )}

        {/* ── 5. CTA Buttons ────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto mb-10 sm:mb-12"
        >
          {/* Explore Projects */}
          <button
            onClick={() => handleScrollToSection('projects')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:shadow-[0_0_35px_rgba(0,229,255,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
          >
            <span className="font-display font-bold">Explore Projects</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300 text-xs" />
          </button>

          {/* Download Resume with Tooltip wrapper */}
          <div className="relative group/tooltip w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full border border-white/10 hover:border-accent/40 bg-bg-dark/40 hover:bg-bg-dark/60 text-white font-semibold text-sm tracking-wide backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(108,99,255,0.25)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
            >
              <span className="font-display">Download Resume</span>
              <FaDownload className="text-xs group-hover:-translate-y-0.5 transition-transform duration-300 text-cyan-400" />
              {hasResume && (
                <span
                  className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] ml-1 animate-pulse"
                  title="Resume Ready"
                />
              )}
            </button>
            
            {/* Tooltip on hover */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 px-3.5 py-2 bg-slate-950/90 border border-white/10 rounded-xl text-[10px] sm:text-xs text-cyan-400 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 shadow-xl whitespace-nowrap z-25 font-mono select-none pointer-events-none tracking-wider uppercase">
              contact for password
            </div>
          </div>
        </motion.div>

        {/* ── 6. Social Links ───────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
          {SOCIAL_LINKS.filter((social) => social.showInHero).map((social, i) => {
            const Icon = social.icon;
            const safeSocialUrl = sanitizeUrl(social.url);
            return (
              <motion.a
                key={i}
                href={safeSocialUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.ariaLabel}
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

      {/* ── Scroll Down Indicator ─────────────────────────────────────────── */}
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
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.9)]"
          />
        </div>
      </motion.div>

      {/* ── Passcode Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl shadow-2xl z-10 text-center"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer text-lg"
              >
                &times;
              </button>

              {/* Title & Description */}
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
                  <FaDownload className="text-lg" />
                </div>
                <h3 className="text-xl font-orbitron font-extrabold text-white tracking-wide">
                  Unlock Resume Download
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs">
                  Please enter the 4-digit passcode to verify authorization and proceed with the download.
                </p>
              </div>

              {/* Passcode Inputs Form */}
              <form onSubmit={handleVerifySubmit}>
                <div className="flex justify-center gap-3 mb-4">
                  {passcode.map((digit, index) => (
                    <input
                      key={index}
                      id={`digit-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`w-12 h-14 text-center text-xl font-bold bg-slate-950/40 text-white border ${
                        passcodeError ? 'border-red-500/50 focus:border-red-500 animate-pulse' : 'border-white/10 focus:border-cyan-400'
                      } rounded-xl focus:outline-none focus:shadow-[0_0_12px_rgba(6,182,212,0.2)] transition-all duration-200`}
                      autoFocus={index === 0}
                      required
                    />
                  ))}
                </div>

                {/* Error message */}
                {passcodeError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 font-semibold mb-4"
                  >
                    {passcodeError}
                  </motion.p>
                )}

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {verifying ? 'Verifying Passcode...' : 'Verify & Download'}
                </button>

                <p className="mt-4 text-[10px] text-slate-500 font-mono tracking-wide uppercase">
                  Don't have a code? Please{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      handleScrollToSection('contact');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer transition-colors duration-200"
                  >
                    contact me
                  </button>{' '}
                  to request access.
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
