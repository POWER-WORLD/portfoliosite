import { motion } from 'framer-motion';
import { FaArrowRight, FaDownload } from 'react-icons/fa';
import { PERSONAL_INFO, SOCIAL_LINKS } from '../constants';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
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
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Letter animations for the name
  const nameLetters = Array.from(PERSONAL_INFO.name);
  const letterVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.4 + i * 0.05,
        type: 'spring' as const,
        stiffness: 120,
        damping: 12,
      },
    }),
  };

  const handleScrollToProjects = () => {
    const element = document.getElementById('projects');
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

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-6 py-20 text-center select-none"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto flex flex-col items-center"
      >
        {/* Intro Tag */}
        <motion.span
          variants={itemVariants}
          className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-secondary border border-secondary/20 bg-secondary/5 uppercase mb-6"
        >
          Welcome to my universe
        </motion.span>

        {/* Name with character stagger */}
        <h1 className="font-display font-black text-5xl md:text-8xl tracking-tight leading-none mb-6">
          {nameLetters.map((char, index) => (
            <motion.span
              key={index}
              custom={index}
              variants={letterVariants}
              className={`inline-block ${
                char === ' ' ? 'mr-4 md:mr-6' : 'hover:text-accent transition-colors duration-200'
              }`}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        {/* Title */}
        <motion.h2
          variants={itemVariants}
          className="font-display text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-secondary to-accent bg-[length:200%_auto] animate-[shimmer_5s_linear_infinite] mb-6"
        >
          {PERSONAL_INFO.title}
        </motion.h2>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="text-base md:text-lg text-gray-400 max-w-2xl leading-relaxed mb-10"
        >
          {PERSONAL_INFO.tagline}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-4 mb-14"
        >
          <button
            onClick={handleScrollToProjects}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-accent to-secondary text-bg-dark font-bold tracking-wider hover:shadow-[0_0_20px_rgba(108,99,255,0.4)] transition-all duration-300 cursor-pointer group"
          >
            Explore Projects
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          
          <a
            href={PERSONAL_INFO.resumeUrl}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/10 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.05] text-white font-semibold tracking-wider transition-all duration-300"
          >
            Download Resume
            <FaDownload className="text-xs" />
          </a>
        </motion.div>

        {/* Social Icons */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-6"
        >
          {SOCIAL_LINKS.map((social, i) => (
            <a
              key={i}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="p-3 rounded-full border border-white/[0.05] bg-white/[0.01] text-gray-400 hover:text-white hover:border-accent/40 hover:shadow-[0_0_15px_rgba(108,99,255,0.2)] transition-all duration-300 text-lg"
            >
              <social.icon />
            </a>
          ))}
        </motion.div>
      </motion.div>

      {/* Animated Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => {
          const aboutSec = document.getElementById('about');
          if (aboutSec) {
            const offset = aboutSec.getBoundingClientRect().top + window.scrollY - 80;
            const event = new CustomEvent('trigger-blackhole-transit', {
              detail: { targetScrollY: offset },
              cancelable: true,
            });
            const handled = !window.dispatchEvent(event);
            if (!handled) {
              window.scrollTo({ top: offset, behavior: 'smooth' });
            }
          }
        }}
      >
        <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">Scroll</span>
        <div className="w-[24px] h-[40px] rounded-full border border-gray-600 flex justify-center p-1.5">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-1.5 h-1.5 bg-accent rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
