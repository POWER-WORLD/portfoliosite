import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaFolderOpen, FaCode, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import SectionHeader from '../components/SectionHeader';

import { getCategoryLabel } from '../constants';
import { sanitizeUrl } from '../utils/security';

interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  tags?: string[];
}

interface ProcessedProject extends Project {
  uniqueId: string;
  safeGithubUrl: string;
  safeLiveUrl: string;
  colors: typeof CATEGORY_COLORS_MAP[keyof typeof CATEGORY_COLORS_MAP];
  glowColor: string;
}

interface ProjectsProps {
  data?: Project[];
}

// Share styling between creative and game categories
const PINK_THEME = {
  glow: 'rgba(236, 72, 153, 0.15)', // Pink
  border: 'group-hover:border-pink-500/40',
  badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  shadow: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]',
  accent: 'pink-500',
  text: 'text-pink-400',
  button: 'border-pink-500/30 text-pink-300 hover:bg-pink-500/10',
  glowHex: '#ec4899',
  gradientRgb: '49, 15, 36'
};

// Map project categories to premium glow and accent colors
const CATEGORY_COLORS_MAP = {
  fullstack: {
    glow: 'rgba(168, 85, 247, 0.15)', // Purple
    border: 'group-hover:border-purple-500/40',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    shadow: 'hover:shadow-[0_0_30px_rgba(168, 85, 247, 0.2)]',
    accent: 'purple-500',
    text: 'text-purple-400',
    button: 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10',
    glowHex: '#a855f7',
    gradientRgb: '41, 15, 68'
  },
  frontend: {
    glow: 'rgba(6, 182, 212, 0.15)', // Cyan
    border: 'group-hover:border-cyan-500/40',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    shadow: 'hover:shadow-[0_0_30px_rgba(6, 182, 212, 0.2)]',
    accent: 'cyan-500',
    text: 'text-cyan-400',
    button: 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10',
    glowHex: '#00e5ff',
    gradientRgb: '10, 48, 55'
  },
  backend: {
    glow: 'rgba(16, 185, 129, 0.15)', // Emerald
    border: 'group-hover:border-emerald-500/40',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    shadow: 'hover:shadow-[0_0_30px_rgba(16, 185, 129, 0.2)]',
    accent: 'emerald-500',
    text: 'text-emerald-400',
    button: 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10',
    glowHex: '#10b981',
    gradientRgb: '12, 49, 31'
  },
  creative: PINK_THEME,
  game: PINK_THEME,
  default: {
    glow: 'rgba(108, 99, 255, 0.15)', // Accent / Violet
    border: 'group-hover:border-accent/40',
    badge: 'bg-accent/10 text-secondary border-accent/20',
    shadow: 'hover:shadow-[0_0_30px_rgba(108, 99, 255, 0.2)]',
    accent: 'accent',
    text: 'text-secondary',
    button: 'border-accent/30 text-secondary hover:bg-accent/10',
    glowHex: '#6c63ff',
    gradientRgb: '30, 24, 60'
  }
} as const;

// Helper to compute relative carousel offsets with 3D wrap simulation
const getWrappedOffset = (index: number, activeIndex: number, total: number) => {
  let diff = index - activeIndex;
  if (total > 2) {
    while (diff < -total / 2) diff += total;
    while (diff > total / 2) diff -= total;
  }
  return diff;
};

// Stagger variants for active card inner details
const containerVariants = {
  active: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.04
    }
  },
  inactive: {}
};

const childVariants = {
  active: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 220,
      damping: 18
    }
  },
  inactive: {
    y: 15,
    opacity: 0,
    transition: {
      type: "spring" as const,
      stiffness: 220,
      damping: 18
    }
  }
};

export default function Projects({ data }: ProjectsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Memoize projects structure mapping to avoid sanitizing/parsing on every render
  const projects = useMemo<ProcessedProject[]>(() => {
    if (!data || data.length === 0) return [];
    return data.map((project) => {
      const uniqueId = String(project._id || project.id || project.title);
      const safeGithubUrl = sanitizeUrl(project.githubUrl);
      const safeLiveUrl = sanitizeUrl(project.liveUrl);
      const colors = CATEGORY_COLORS_MAP[project.category as keyof typeof CATEGORY_COLORS_MAP] || CATEGORY_COLORS_MAP.default;

      return {
        ...project,
        uniqueId,
        safeGithubUrl,
        safeLiveUrl,
        colors,
        glowColor: colors.glowHex,
      };
    });
  }, [data]);

  const N = projects.length;

  // Responsive boundary listener using matchMedia instead of window resize events
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const handleImageError = useCallback((id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleImageLoad = useCallback((id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handlePrev = useCallback(() => {
    if (N === 0) return;
    setCurrentIndex((prev) => (prev - 1 + N) % N);
    rotateX.set(0);
    rotateY.set(0);
  }, [N, rotateX, rotateY]);

  const handleNext = useCallback(() => {
    if (N === 0) return;
    setCurrentIndex((prev) => (prev + 1) % N);
    rotateX.set(0);
    rotateY.set(0);
  }, [N, rotateX, rotateY]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const width = box.width;
    const height = box.height;

    const maxRotateX = 7;
    const maxRotateY = 7;

    const rx = -((y / height) - 0.5) * maxRotateX;
    const ry = ((x / width) - 0.5) * maxRotateY;

    rotateX.set(rx);
    rotateY.set(ry);
  }, [isMobile, rotateX, rotateY]);

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  // Keyboard navigation control listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
         activeEl.tagName === 'TEXTAREA' ||
         activeEl.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  if (N === 0) {
    return (
      <section id="projects" className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center py-8 md:py-12 scroll-mt-20 relative select-none overflow-hidden bg-transparent">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badgeText="My Creations"
            title="Featured Work"
            highlightText="Work"
            badgeColor="accent"
          />

          <div className="glass-panel p-12 rounded-3xl text-center max-w-lg mx-auto flex flex-col items-center justify-center space-y-4 border border-white/[0.06]">
            <div className="p-4 rounded-full bg-white/[0.02] border border-white/[0.05] text-gray-400 text-3xl">
              <FaFolderOpen />
            </div>
            <p className="text-gray-400 font-medium text-base">
              No projects published yet. Check back soon for exciting updates!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const getCardStyle = (offset: number) => {
    if (isMobile) {
      if (offset === 0) {
        return {
          x: '0%',
          scale: 1,
          opacity: 1,
          zIndex: 20,
          filter: 'blur(0px)',
          rotateX: 0,
          rotateY: 0,
          z: 0
        };
      }
      return {
        x: offset < 0 ? '-150%' : '150%',
        scale: 0.8,
        opacity: 0,
        zIndex: 0,
        filter: 'blur(5px)',
        rotateX: 0,
        rotateY: 0,
        z: -100
      };
    }

    // Desktop Carousel animation styling (3D track simulation)
    if (offset === 0) {
      return {
        x: '0%',
        scale: 1,
        opacity: 1,
        zIndex: 20,
        filter: 'blur(0px) grayscale(0%) brightness(100%)',
        rotateX: 0,
        rotateY: 0,
        z: 0
      };
    } else if (offset === -1) {
      return {
        x: '-48%',
        scale: 0.86,
        opacity: 0.65,
        zIndex: 10,
        filter: 'blur(1.5px) grayscale(30%) brightness(55%)',
        rotateX: 0,
        rotateY: 34,
        z: -120
      };
    } else if (offset === 1) {
      return {
        x: '48%',
        scale: 0.86,
        opacity: 0.65,
        zIndex: 10,
        filter: 'blur(1.5px) grayscale(30%) brightness(55%)',
        rotateX: 0,
        rotateY: -34,
        z: -120
      };
    } else {
      return {
        x: offset < 0 ? '-200%' : '200%',
        scale: 0.6,
        opacity: 0,
        zIndex: 0,
        filter: 'blur(8px) grayscale(100%)',
        rotateX: 0,
        rotateY: offset < 0 ? 45 : -45,
        z: -300
      };
    }
  };

  const activeProject = projects[currentIndex];
  const activeColors = activeProject?.colors || CATEGORY_COLORS_MAP.default;

  // Compute CSS custom variables once per slide transition to avoid state-driven hover updates
  const activeThemeStyle = {
    '--active-glow-rgba': activeColors.glow,
    '--active-glow-12': activeColors.glow.replace('0.15', '0.12'),
    '--active-glow-28': activeColors.glow.replace('0.15', '0.28'),
    '--active-glow-40': activeColors.glow.replace('0.15', '0.40'),
    '--active-accent': `var(--color-${activeColors.accent === 'accent' ? 'accent' : activeColors.accent})`,
    '--active-accent-12': `var(--color-${activeColors.accent === 'accent' ? 'accent' : activeColors.accent}/12)`,
    '--active-accent-30': `var(--color-${activeColors.accent === 'accent' ? 'accent' : activeColors.accent}/30)`,
    '--active-accent-45': `var(--color-${activeColors.accent === 'accent' ? 'accent' : activeColors.accent}/45)`
  } as React.CSSProperties;

  return (
    <section
      id="projects"
      style={activeThemeStyle}
      className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center py-10 md:py-16 scroll-mt-20 relative select-none overflow-hidden bg-transparent"
    >
      {/* Floating Neon Background Orbs */}
      <div className="absolute top-1/4 left-1/12 w-[380px] h-[380px] rounded-full bg-cyan-500/8 blur-[110px] pointer-events-none animate-drift-slow z-0" />
      <div className="absolute bottom-1/4 right-1/12 w-[380px] h-[380px] rounded-full bg-purple-500/8 blur-[110px] pointer-events-none animate-drift-slow-reverse z-0" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badgeText="My Creations"
          title="Featured Work"
          highlightText="Work"
          badgeColor="accent"
        />

        {/* Carousel Container */}
        <div className="relative w-full max-w-2xl h-[560px] md:h-[500px] mx-auto mt-12 flex items-center justify-center">

          {/* Static Center Card Frame Outline & Glow Overlay */}
          <motion.div
            className="absolute w-full h-full rounded-3xl border border-white/[0.08] pointer-events-none z-30"
            animate={{
              boxShadow: [
                `0 0 25px var(--active-glow-12)`,
                `0 0 50px var(--active-glow-28)`,
                `0 0 25px var(--active-glow-12)`
              ],
              borderColor: [
                `var(--active-accent-12)`,
                `var(--active-accent-30)`,
                `var(--active-accent-12)`
              ]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Sub-grid cyber lines aesthetic */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40 z-0 rounded-3xl" />

            {/* Ambient cyber corner brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/20 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/20 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20 rounded-br-xl" />
          </motion.div>

          {/* Navigation Buttons - Rendered statically inside the frame area */}
          {N > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute bottom-6 left-6 pointer-events-auto z-40 p-3 rounded-xl bg-[#0a0d1a]/60 hover:bg-white/[0.08] border border-white/10 hover:border-[var(--active-accent-45)] text-gray-400 hover:text-white transition-all duration-300 cursor-pointer backdrop-blur-md hover:shadow-[0_0_15px_var(--active-glow-40)]"
                aria-label="Previous Project"
              >
                <FaChevronLeft className="text-sm md:text-base" />
              </button>

              <button
                onClick={handleNext}
                className="absolute bottom-6 right-6 pointer-events-auto z-40 p-3 rounded-xl bg-[#0a0d1a]/60 hover:bg-white/[0.08] border border-white/10 hover:border-[var(--active-accent-45)] text-gray-400 hover:text-white transition-all duration-300 cursor-pointer backdrop-blur-md hover:shadow-[0_0_15px_var(--active-glow-40)]"
                aria-label="Next Project"
              >
                <FaChevronRight className="text-sm md:text-base" />
              </button>
            </>
          )}

          {/* Sliding Content Container */}
          <div className="absolute inset-0 w-full h-full overflow-visible" style={{ perspective: 1200, transformStyle: 'preserve-3d' }}>
            <AnimatePresence initial={false}>
              {projects.map((project, idx) => {
                const projId = project.uniqueId;
                const isImgFailed = failedImages[projId];
                const safeGithub = project.safeGithubUrl;
                const safeLive = project.safeLiveUrl;
                const offset = getWrappedOffset(idx, currentIndex, N);
                const isCenter = offset === 0;

                return (
                  <motion.div
                    key={projId}
                    initial={false}
                    animate={getCardStyle(offset)}
                    whileHover={!isCenter ? { opacity: 0.65, scale: 0.84 } : undefined}
                    drag={isMobile && isCenter ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (!isMobile || !isCenter) return;
                      const threshold = 80;
                      if (info.offset.x < -threshold) {
                        handleNext();
                      } else if (info.offset.x > threshold) {
                        handlePrev();
                      }
                    }}
                    transition={{
                      type: "spring" as const,
                      stiffness: 380,
                      damping: 28,
                      rotateX: { type: "spring" as const, stiffness: 650, damping: 45 },
                      rotateY: { type: "spring" as const, stiffness: 650, damping: 45 }
                    }}
                    onMouseMove={isCenter ? handleMouseMove : undefined}
                    onMouseLeave={isCenter ? handleMouseLeave : undefined}
                    onClick={() => {
                      if (offset === -1) handlePrev();
                      if (offset === 1) handleNext();
                    }}
                    style={{
                      transformStyle: 'preserve-3d' as const,
                      background: isCenter 
                        ? `radial-gradient(circle at 10% 10%, rgba(${project.colors.gradientRgb}, 0.95) 0%, rgba(10, 13, 26, 0.98) 55%, rgba(5, 7, 16, 1) 100%)` 
                        : undefined,
                      boxShadow: isCenter ? 'inset 0 0 24px rgba(255, 255, 255, 0.02)' : undefined,
                      rotateX: isCenter ? rotateX : undefined,
                      rotateY: isCenter ? rotateY : undefined,
                    }}
                    className={`absolute w-full h-full rounded-3xl border border-white/[0.05] bg-[#0a0d1a]/85 overflow-hidden transition-all duration-300 ${
                      isCenter 
                        ? 'pointer-events-auto shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row' 
                        : 'pointer-events-none md:pointer-events-auto cursor-pointer border-white/10 hover:border-white/30'
                    }`}
                  >
                    {isCenter ? (
                      // Active Center Card Layout (Split Column Layout)
                      <>
                        {/* Dynamic Holographic Scan Line */}
                        <div 
                          className="hologram-scanline" 
                          style={{
                            background: `linear-gradient(90deg, transparent 0%, ${project.glowColor}40 10%, ${project.glowColor} 50%, ${project.glowColor}40 90%, transparent 100%)`,
                            boxShadow: `0 0 12px ${project.glowColor}`
                          }}
                        />

                        {/* Project Image Column */}
                        <div className="relative w-full md:w-5/12 h-44 md:h-full overflow-hidden bg-gradient-to-br from-bg-dark to-slate-950 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/[0.06] flex-shrink-0">
                          {project.imageUrl && !isImgFailed ? (
                            <>
                              {!loadedImages[projId] && (
                                <div className="absolute inset-0 bg-slate-900/80 animate-pulse flex flex-col items-center justify-center gap-2">
                                  <FaCode className="text-gray-600 text-2xl animate-bounce" />
                                  <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Loading Core...</span>
                                </div>
                              )}
                              <img
                                src={project.imageUrl}
                                alt={project.title}
                                loading="lazy"
                                className={`w-full h-full object-cover select-none transition-transform duration-700 hover:scale-105 ${
                                  loadedImages[projId] ? 'opacity-100' : 'opacity-0'
                                }`}
                                onLoad={() => handleImageLoad(projId)}
                                onError={() => handleImageError(projId)}
                              />
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 font-mono text-xs bg-slate-950/60 p-4 text-center">
                              <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-xl">
                                <FaCode />
                              </div>
                              <span className="text-gray-300 font-sans font-semibold text-sm select-none">{project.title}</span>
                              <span className="text-[10px] text-gray-500 uppercase tracking-widest select-none">[Interactive workpiece]</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d1a]/80 via-transparent to-transparent opacity-50 pointer-events-none" />
                          <div className="absolute top-0 right-0 w-28 h-28 bg-accent/20 rounded-full blur-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                          {/* Holographic HUD Grid Mesh Overlay */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none z-10" />

                          {/* Premium diagonal reflection shine overlay */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                        </div>

                        {/* Project Details Column */}
                        <motion.div
                          variants={containerVariants}
                          animate="active"
                          className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-between flex-grow relative pb-20 md:pb-24"
                        >
                          {/* Dynamic Vertical Neon Accent Bar */}
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 rounded-full z-20 hidden md:block"
                            style={{
                              background: `linear-gradient(to bottom, transparent 0%, ${project.glowColor} 50%, transparent 100%)`,
                              boxShadow: `0 0 10px ${project.glowColor}`
                            }}
                          />

                          <div className="space-y-4">
                            <motion.div variants={childVariants} className="flex justify-between items-center text-[9px] font-mono tracking-widest text-white/40 uppercase font-semibold">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                                <span>[ CATEGORY: {getCategoryLabel(project.category)} ]</span>
                              </div>
                              <div>
                                <span>[ {String(idx + 1).padStart(2, '0')} // {String(N).padStart(2, '0')} ]</span>
                              </div>
                            </motion.div>

                            <motion.h3
                              variants={childVariants}
                              className="font-display font-bold text-xl md:text-2xl text-white select-none transition-colors duration-300"
                              style={{
                                textShadow: `0 0 12px ${project.glowColor}65`
                              }}
                            >
                              {project.title}
                            </motion.h3>

                            <motion.p variants={childVariants} className="text-xs md:text-sm text-gray-300 font-light leading-relaxed line-clamp-4 md:line-clamp-6 select-none">
                              {project.description}
                            </motion.p>
                          </div>

                          {/* Tech Tags */}
                          <div className="space-y-4 pt-3">
                            {project.tags && project.tags.length > 0 && (
                              <motion.div variants={childVariants} className="flex flex-wrap gap-1.5 select-none">
                                {project.tags.map((tag, tagIdx) => (
                                  <motion.span
                                    key={tagIdx}
                                    whileHover={{
                                      scale: 1.08,
                                      borderColor: `${project.glowColor}60`,
                                      color: '#ffffff'
                                    }}
                                    className="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide text-gray-400 bg-white/[0.02] border border-white/[0.05] transition-colors duration-300 cursor-default"
                                  >
                                    {tag}
                                  </motion.span>
                                ))}
                              </motion.div>
                            )}
                          </div>

                          {/* Code/Demo Action Links - Center positioned at bottom inside the sliding card */}
                          <motion.div
                            variants={childVariants}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30 pointer-events-auto"
                          >
                            {safeGithub && safeGithub !== '#' && (
                              <motion.a
                                href={safeGithub}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{
                                  scale: 1.05,
                                  y: -2,
                                  borderColor: project.glowColor,
                                  boxShadow: `0 0 15px ${project.glowColor}35`
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 border border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.04] cursor-pointer"
                              >
                                <FaGithub className="text-sm" />
                                Code
                              </motion.a>
                            )}
                            {safeLive && safeLive !== '#' && (
                              <motion.a
                                href={safeLive}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{
                                  scale: 1.05,
                                  y: -2,
                                  borderColor: project.glowColor,
                                  boxShadow: `0 0 20px ${project.glowColor}50`
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 border cursor-pointer"
                                style={{
                                  borderColor: `${project.glowColor}30`,
                                  color: project.glowColor,
                                  background: `${project.glowColor}05`
                                }}
                              >
                                <FaExternalLinkAlt className="text-[10px]" />
                                Demo
                              </motion.a>
                            )}
                          </motion.div>
                        </motion.div>
                      </>
                    ) : (
                      // Preview Background Card Layout (Clean stretched cover image with overlay)
                      <div className="relative w-full h-full overflow-hidden flex items-center justify-center group/preview">
                        {project.imageUrl && !isImgFailed ? (
                          <>
                            {!loadedImages[projId] && (
                              <div className="absolute inset-0 bg-slate-900/80 animate-pulse flex items-center justify-center">
                                <FaCode className="text-gray-700 text-lg animate-pulse" />
                              </div>
                            )}
                            <img
                              src={project.imageUrl}
                              alt={project.title}
                              loading="lazy"
                              className={`w-full h-full object-cover select-none grayscale-[30%] blur-[0.5px] group-hover/preview:scale-103 transition-all duration-700 ${
                                loadedImages[projId] ? 'opacity-100' : 'opacity-0'
                              }`}
                              onLoad={() => handleImageLoad(projId)}
                              onError={() => handleImageError(projId)}
                            />
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 font-mono text-xs bg-slate-950/90 p-4 text-center">
                            <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-gray-400 text-lg">
                              <FaCode />
                            </div>
                            <span className="text-gray-400 font-sans font-semibold text-xs select-none">{project.title}</span>
                          </div>
                        )}

                        {/* Stretched Glass tint cover overlay matching category */}
                        <div
                          className="absolute inset-0 transition-opacity duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${project.colors.glow.replace('0.15', '0.45')} 0%, rgba(10, 13, 26, 0.95) 100%)`,
                          }}
                        />

                        {/* Stretched micro-details */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                          <div className="flex justify-between items-start">
                            <span className={`text-[8px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full border ${project.colors.badge} select-none`}>
                              {getCategoryLabel(project.category)}
                            </span>
                            <span className="text-[10px] font-bold text-white/20 font-mono select-none">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-display font-bold text-sm md:text-base text-white/60 group-hover/preview:text-white transition-colors duration-300 line-clamp-1">
                              {project.title}
                            </h4>
                            <span className="text-[8px] text-white/30 tracking-widest uppercase font-mono select-none">
                              [ Click to inspect ]
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
