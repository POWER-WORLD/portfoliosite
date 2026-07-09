import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Component representing an individual card (layout is static internally)
function ProjectCard({ 
  project, 
  indexLabel,
  isSideCard = false
}: { 
  project: ProcessedProject; 
  indexLabel: string;
  isSideCard?: boolean;
}) {
  const [isImgFailed, setIsImgFailed] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  const safeGithub = project.safeGithubUrl;
  const safeLive = project.safeLiveUrl;

  const themeStyle = {
    '--project-glow': project.colors.glow,
    '--project-accent': project.colors.glowHex,
    '--project-gradient-rgb': project.colors.gradientRgb,
  } as React.CSSProperties;

  return (
    <div
      style={themeStyle}
      className={`relative w-full h-full rounded-3xl border border-white/[0.06] bg-[#070a13]/85 overflow-hidden flex flex-col justify-between group transition-all duration-500 ${
        isSideCard 
          ? 'hover:border-[var(--project-accent)]/20' 
          : 'hover:border-[var(--project-accent)]/30 hover:shadow-[0_0_30px_var(--project-glow)]'
      }`}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--project-accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Cyberpunk corner details */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10 rounded-tl-xl transition-colors duration-300 group-hover:border-[var(--project-accent)]/40" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10 rounded-tr-xl transition-colors duration-300 group-hover:border-[var(--project-accent)]/40" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/10 rounded-bl-xl transition-colors duration-300 group-hover:border-[var(--project-accent)]/40" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/10 rounded-br-xl transition-colors duration-300 group-hover:border-[var(--project-accent)]/40" />

      {/* Content wrapper */}
      <div className="relative w-full h-full flex flex-col justify-between">
        {/* Image Container */}
        <div className="relative w-full h-[230px] overflow-hidden border-b border-white/[0.06] flex-shrink-0 bg-slate-950">
          {project.imageUrl && !isImgFailed ? (
            <>
              {!isImgLoaded && (
                <div className="absolute inset-0 bg-slate-900/80 animate-pulse flex flex-col items-center justify-center gap-2">
                  <FaCode className="text-gray-600 text-2xl animate-bounce" />
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Loading Core...</span>
                </div>
              )}
              <img
                src={project.imageUrl}
                alt={project.title}
                loading="lazy"
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                  isImgLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setIsImgLoaded(true)}
                onError={() => setIsImgFailed(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 font-mono text-xs bg-slate-950/60 p-4 text-center">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-accent text-xl">
                <FaCode />
              </div>
              <span className="text-gray-300 font-sans font-semibold text-sm select-none">{project.title}</span>
            </div>
          )}
          {/* Image Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070a13] via-transparent to-transparent opacity-70 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none z-10" />

          {/* Hologram scanner effect */}
          {!isSideCard && (
            <div 
              className="absolute left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
              style={{
                background: `linear-gradient(90deg, transparent 0%, var(--project-accent) 50%, transparent 100%)`,
                boxShadow: `0 0 10px var(--project-accent)`,
                animation: `hologramScan 4s linear infinite`
              }}
            />
          )}

          {/* Floating Category Badge */}
          <div className="absolute top-4 left-4 z-20">
            <span
              className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase font-mono border backdrop-blur-md bg-[#070a13]/80 select-none"
              style={{
                borderColor: `var(--project-accent)40`,
                color: `var(--project-accent)`,
                boxShadow: `0 0 8px var(--project-accent)15`
              }}
            >
              {getCategoryLabel(project.category)}
            </span>
          </div>

          {/* Index Indicator */}
          <div className="absolute top-4 right-4 z-20 text-[9px] font-mono tracking-widest text-white/30 uppercase font-semibold select-none">
            {indexLabel}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-grow flex flex-col justify-between relative">
          {/* Vertical accent sidebar indicator */}
          <div 
            className="absolute left-0 top-6 w-[2px] h-[36px] rounded-full transition-all duration-300 group-hover:h-[60px]"
            style={{
              background: `linear-gradient(to bottom, var(--project-accent), transparent)`,
              boxShadow: `0 0 8px var(--project-accent)`
            }}
          />
          
          <div className="space-y-3 pl-3">
            <h3
              className="font-display font-bold text-lg text-white select-none transition-colors duration-300 group-hover:text-[var(--project-accent)]"
              style={{
                textShadow: `0 0 10px var(--project-accent)15`
              }}
            >
              {project.title}
            </h3>
            <p className="text-xs text-gray-300 font-light leading-relaxed line-clamp-4 select-none">
              {project.description}
            </p>
          </div>

          {/* Tech Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-4 pl-3 select-none">
              {project.tags.map((tag, tagIdx) => (
                <span
                  key={tagIdx}
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-medium tracking-wide text-gray-400 bg-white/[0.02] border border-white/[0.05] transition-all duration-300 hover:scale-105 hover:border-[var(--project-accent)]/30 hover:text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className={`px-6 pb-6 pt-2 flex items-center gap-3 z-30 ${isSideCard ? 'pointer-events-none opacity-40' : ''}`}>
          {safeGithub && safeGithub !== '#' && (
            <a
              href={safeGithub}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 border border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.04] cursor-pointer"
            >
              <FaGithub className="text-sm" />
              Code
            </a>
          )}
          {safeLive && safeLive !== '#' && (
            <a
              href={safeLive}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 border cursor-pointer"
              style={{
                borderColor: `var(--project-accent)30`,
                color: `var(--project-accent)`,
                background: `var(--project-accent)05`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 15px var(--project-accent)30`;
                e.currentTarget.style.borderColor = `var(--project-accent)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = `var(--project-accent)30`;
              }}
            >
              <FaExternalLinkAlt className="text-[10px]" />
              Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Projects({ data }: ProjectsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1200;
  });

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

  // Responsive window resize tracking
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1200;

  const handlePrev = useCallback(() => {
    if (N === 0) return;
    setCurrentIndex((prev) => (prev - 1 + N) % N);
  }, [N]);

  const handleNext = useCallback(() => {
    if (N === 0) return;
    setCurrentIndex((prev) => (prev + 1) % N);
  }, [N]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleCardClick = useCallback((offset: number) => {
    if (offset === -1) {
      handlePrev();
    } else if (offset === -2) {
      setCurrentIndex((prev) => (prev - 2 + N) % N);
    } else if (offset === 1) {
      handleNext();
    } else if (offset === 2) {
      setCurrentIndex((prev) => (prev + 2) % N);
    }
  }, [N, handlePrev, handleNext]);

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

  // Animation values based on the project's offset in the circular track (supporting 5 cards)
  const getCardStyle = (offset: number, isMobileView: boolean, isTabletView: boolean) => {
    if (isMobileView) {
      if (offset === 0) {
        return {
          x: '0%',
          scale: 1,
          opacity: 1,
          zIndex: 30,
          pointerEvents: 'auto' as const
        };
      }
      return {
        x: offset < 0 ? '-120%' : '120%',
        scale: 0.85,
        opacity: 0,
        zIndex: 0,
        pointerEvents: 'none' as const
      };
    }

    if (isTabletView) {
      if (offset === 0) {
        return {
          x: '0%',
          scale: 1.04,
          opacity: 1,
          zIndex: 30,
          pointerEvents: 'auto' as const
        };
      } else if (offset === -1) {
        return {
          x: '-50%',
          scale: 0.88,
          opacity: 0.5,
          zIndex: 20,
          pointerEvents: 'auto' as const
        };
      } else if (offset === 1) {
        return {
          x: '50%',
          scale: 0.88,
          opacity: 0.5,
          zIndex: 20,
          pointerEvents: 'auto' as const
        };
      } else {
        return {
          x: offset < 0 ? '-100%' : '100%',
          scale: 0.7,
          opacity: 0,
          zIndex: 0,
          pointerEvents: 'none' as const
        };
      }
    }

    // Desktop view: 5 cards visible!
    if (offset === 0) {
      return {
        x: '0%',
        scale: 1.04,
        opacity: 1,
        zIndex: 30,
        pointerEvents: 'auto' as const
      };
    } else if (offset === -1) {
      return {
        x: '-50%',
        scale: 0.88,
        opacity: 0.65,
        zIndex: 20,
        pointerEvents: 'auto' as const
      };
    } else if (offset === 1) {
      return {
        x: '50%',
        scale: 0.88,
        opacity: 0.65,
        zIndex: 20,
        pointerEvents: 'auto' as const
      };
    } else if (offset === -2) {
      return {
        x: '-100%',
        scale: 0.76,
        opacity: 0.35,
        zIndex: 10,
        pointerEvents: 'auto' as const
      };
    } else if (offset === 2) {
      return {
        x: '100%',
        scale: 0.76,
        opacity: 0.35,
        zIndex: 10,
        pointerEvents: 'auto' as const
      };
    } else {
      return {
        x: offset < 0 ? '-150%' : '150%',
        scale: 0.6,
        opacity: 0,
        zIndex: 0,
        pointerEvents: 'none' as const
      };
    }
  };

  return (
    <section
      id="projects"
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

        {/* Carousel Container - Centers card stack horizontally & vertically */}
        <div className="relative w-full max-w-[310px] sm:max-w-[340px] md:max-w-[370px] lg:max-w-[430px] h-[480px] lg:h-[530px] mx-auto mt-12 overflow-visible">
          <AnimatePresence initial={false}>
            {projects.map((project, idx) => {
              const offset = getWrappedOffset(idx, currentIndex, N);
              const isCenter = offset === 0;

              return (
                <motion.div
                  key={project.uniqueId}
                  initial={false}
                  animate={getCardStyle(offset, isMobile, isTablet)}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 25,
                  }}
                  onClick={!isCenter ? () => handleCardClick(offset) : undefined}
                  className="absolute inset-0 w-full h-full"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <ProjectCard
                    project={project}
                    indexLabel={`[ ${String(idx + 1).padStart(2, '0')} // ${String(N).padStart(2, '0')} ]`}
                    isSideCard={!isCenter}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Navigation & Pagination Controls */}
        {N > 1 && (
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={handlePrev}
              className="p-3.5 rounded-xl bg-[#0a0d1a]/60 hover:bg-white/[0.08] border border-white/10 hover:border-accent text-gray-400 hover:text-white transition-all duration-300 cursor-pointer backdrop-blur-md hover:shadow-[0_0_15px_rgba(108,99,255,0.25)] animate-none"
              aria-label="Previous Project"
            >
              <FaChevronLeft className="text-sm" />
            </button>

            <div className="flex items-center gap-2">
              {projects.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => handleDotClick(dotIdx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === dotIdx
                      ? 'w-8 bg-accent shadow-[0_0_10px_rgba(108,99,255,0.5)]'
                      : 'w-2.5 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to project ${dotIdx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-3.5 rounded-xl bg-[#0a0d1a]/60 hover:bg-white/[0.08] border border-white/10 hover:border-accent text-gray-400 hover:text-white transition-all duration-300 cursor-pointer backdrop-blur-md hover:shadow-[0_0_15px_rgba(108,99,255,0.25)] animate-none"
              aria-label="Next Project"
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
