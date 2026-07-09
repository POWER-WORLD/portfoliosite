import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FaIcons from 'react-icons/fa';
import { FaStar, FaBookOpen, FaChevronLeft, FaChevronRight, FaCheckCircle, FaBookmark } from 'react-icons/fa';
import { safeClamp } from '../utils/security';
import SectionHeader from '../components/SectionHeader';

interface Skill {
  name: string;
  level: number;
  experience?: string;
  tag?: string;
  icon?: string;
}

interface SkillCategory {
  _id?: string;
  title: string;
  categoryType?: string;
  description?: string;
  icon: any;
  capabilities?: string[];
  skills: Skill[];
}

interface SkillsProps {
  data?: SkillCategory[];
  welcome?: { title: string; message: string };
}

function getIconComponent(icon: any) {
  if (typeof icon === 'string') {
    const IconComponent = (FaIcons as any)[icon];
    return IconComponent || FaIcons.FaCode;
  }
  return icon || FaIcons.FaCode;
}

export default function Skills({ data, welcome }: SkillsProps) {
  const categories = useMemo(() => (data && data.length > 0 ? data : []), [data]);
  const welcomeData = useMemo(() => welcome || {
    title: 'Welcome to My Tech Stack',
    message: 'This digital grimoire showcases my engineering proficiencies, domain strengths, and system design specialties. Flip through the pages to explore.'
  }, [welcome]);

  // Spread state (for desktop side-by-side pages)
  const [currentSpread, setCurrentSpread] = useState(0);
  const [targetSpread, setTargetSpread] = useState(0);
  const [animatingState, setAnimatingState] = useState<'next' | 'prev' | null>(null);

  // Mobile single page state
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePageIndex, setMobilePageIndex] = useState(0);
  const [mobileDirection, setMobileDirection] = useState(0);

  // Mobile swipe gestures state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNextPage();
    } else if (isRightSwipe) {
      handlePrevPage();
    }
  };

  const totalSpreads = useMemo(() => 1 + categories.length, [categories]);
  const totalPages = useMemo(() => totalSpreads * 2, [totalSpreads]);

  // Handle window resizing to detect mobile layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSpread, animatingState, isMobile, mobilePageIndex]);

  if (categories.length === 0) {
    return null;
  }

  const handleNextPage = () => {
    if (isMobile) {
      if (mobilePageIndex < totalPages - 1) {
        setMobileDirection(1);
        setMobilePageIndex((prev) => prev + 1);
      }
    } else {
      if (currentSpread < totalSpreads - 1 && animatingState === null) {
        setTargetSpread(currentSpread + 1);
        setAnimatingState('next');
      }
    }
  };

  const handlePrevPage = () => {
    if (isMobile) {
      if (mobilePageIndex > 0) {
        setMobileDirection(-1);
        setMobilePageIndex((prev) => prev - 1);
      }
    } else {
      if (currentSpread > 0 && animatingState === null) {
        setTargetSpread(currentSpread - 1);
        setAnimatingState('prev');
      }
    }
  };

  const handleJumpToSpread = (spreadIdx: number) => {
    if (isMobile) {
      const pageIndex = spreadIdx * 2;
      setMobileDirection(pageIndex > mobilePageIndex ? 1 : -1);
      setMobilePageIndex(pageIndex);
    } else {
      if (animatingState !== null) return;
      if (spreadIdx === currentSpread) return;
      setTargetSpread(spreadIdx);
      if (spreadIdx > currentSpread) {
        setAnimatingState('next');
      } else {
        setAnimatingState('prev');
      }
    }
  };

  const handleAnimationEnd = () => {
    setCurrentSpread(targetSpread);
    setAnimatingState(null);
  };

  // Determine which page content is on each side
  let leftStaticSpread = currentSpread;
  let rightStaticSpread = currentSpread;
  let flippingFrontSpread = currentSpread;
  let flippingBackSpread = currentSpread;

  if (animatingState === 'next') {
    leftStaticSpread = currentSpread;
    rightStaticSpread = targetSpread;
    flippingFrontSpread = currentSpread;
    flippingBackSpread = targetSpread;
  } else if (animatingState === 'prev') {
    leftStaticSpread = targetSpread;
    rightStaticSpread = currentSpread;
    flippingFrontSpread = targetSpread;
    flippingBackSpread = currentSpread;
  }

  // Helper to render responsive page footers
  const renderPageFooter = (pageNumber: number, side: 'left' | 'right', isFlipping = false) => {
    if (isMobile) {
      const isPrevDisabled = mobilePageIndex === 0;
      const isNextDisabled = mobilePageIndex === totalPages - 1;
      return (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.05]">
          {!isFlipping ? (
            <button 
              onClick={handlePrevPage}
              disabled={isPrevDisabled}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors duration-300 z-30 cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/5 hover:border-white/12 transition-all"><FaChevronLeft /></div>
              <span className="hidden xs:inline">Turn Back</span>
            </button>
          ) : (
            <div className="w-[40px]" />
          )}

          <span className="text-xs font-mono font-semibold text-gray-500">
            Page {pageNumber}
          </span>

          {!isFlipping ? (
            <button 
              onClick={handleNextPage}
              disabled={isNextDisabled}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-secondary disabled:opacity-20 disabled:pointer-events-none transition-colors duration-300 z-30 cursor-pointer"
            >
              <span className="hidden xs:inline">Turn Next</span>
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/5 hover:border-white/12 transition-all text-secondary"><FaChevronRight /></div>
            </button>
          ) : (
            <div className="w-[40px]" />
          )}
        </div>
      );
    }

    // Desktop view - keep original layout
    if (side === 'left') {
      return (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.05]">
          {!isFlipping ? (
            <button 
              onClick={handlePrevPage}
              disabled={currentSpread === 0}
              className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors duration-300 z-30 cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/5 hover:border-white/12 transition-all"><FaChevronLeft /></div>
              <span>Turn Back</span>
            </button>
          ) : (
            <div className="w-[80px]" />
          )}
          <span className="text-xs font-mono font-semibold text-gray-500">
            Page {pageNumber}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.05]">
          <span className="text-xs font-mono font-semibold text-gray-500">
            Page {pageNumber}
          </span>
          {!isFlipping ? (
            <button 
              onClick={handleNextPage}
              disabled={currentSpread === totalSpreads - 1}
              className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-secondary disabled:opacity-20 disabled:pointer-events-none transition-colors duration-300 ml-auto z-30 cursor-pointer"
            >
              <span>Turn Next</span>
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/5 hover:border-white/12 transition-all text-secondary"><FaChevronRight /></div>
            </button>
          ) : (
            <div className="w-[80px]" />
          )}
        </div>
      );
    }
  };

  // Render individual page content
  const renderPageContent = (spreadIdx: number, side: 'left' | 'right', isFlipping = false) => {
    if (spreadIdx === 0) {
      if (side === 'left') {
        return (
          <div key="welcome-page" className="flex-1 flex flex-col justify-between h-full text-left p-4 sm:p-6">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-accent/20 text-accent border border-accent/30 shadow-[0_0_10px_rgba(108,99,255,0.2)]">
                  Introduction
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-4xl shadow-inner cyan-glow shrink-0">
                  <FaBookOpen />
                </div>
                <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-none text-glow">
                  {welcomeData.title}
                </h3>
              </div>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-sans mb-8">
                {welcomeData.message}
              </p>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-md">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaBookmark className="text-secondary text-[10px]" /> Reader Instructions
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-mono space-y-1">
                  {isMobile ? (
                    <>
                      &bull; Swipe left or right to flip pages.<br />
                      &bull; Use the bottom navigation arrows.<br />
                      &bull; Use the Directory below to jump to sections.
                    </>
                  ) : (
                    <>
                      &bull; Use bottom corner arrows to flip pages.<br />
                      &bull; Use your keyboard <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-semibold">Left</kbd> & <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-semibold">Right</kbd> arrow keys.<br />
                      &bull; Use the Index on the right to jump directly to any section.
                    </>
                  )}
                </p>
              </div>
            </div>

            {renderPageFooter(isMobile ? mobilePageIndex + 1 : 1, 'left', isFlipping)}
          </div>
        );
      } else {
        return (
          <div key="toc-page" className="flex-1 flex flex-col justify-between h-full text-left p-4 sm:p-6">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-secondary/20 text-secondary border border-secondary/30 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  Directory
                </span>
              </div>

              <h3 className="font-display font-black text-2xl lg:text-3xl text-white tracking-tight mb-2 uppercase leading-none">
                Table of Contents
              </h3>
              <p className="text-xs text-gray-400 font-sans mb-6">
                Click any chapter to jump directly to its details.
              </p>

              <div className="space-y-3 max-h-[310px] overflow-y-auto no-scrollbar pr-1">
                {categories.map((cat, idx) => {
                  const Icon = getIconComponent(cat.icon);
                  const isCatActive = isMobile 
                    ? Math.floor(mobilePageIndex / 2) === idx + 1
                    : currentSpread === idx + 1;
                  return (
                    <button
                      key={cat._id || idx}
                      onClick={() => handleJumpToSpread(idx + 1)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group text-left cursor-pointer border ${
                        isCatActive 
                          ? 'bg-accent/15 border-accent/40 text-white' 
                          : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.12] text-gray-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg bg-black/40 border ${isCatActive ? 'border-accent/40 text-accent text-glow' : 'border-white/[0.05] text-gray-400 group-hover:text-secondary'} text-sm shrink-0`}>
                          <Icon />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold tracking-wide truncate">
                          {cat.title}
                        </span>
                      </div>
                      
                      {/* Dotted leader lines for real book effect */}
                      <div className="hidden sm:block flex-1 border-b border-dotted border-white/10 mx-3 mt-1.5" />

                      <span className="text-[10px] font-mono font-bold text-secondary text-glow-secondary shrink-0 ml-2">
                        P. {(idx + 1) * 2 + 1} &rsaquo;
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {renderPageFooter(isMobile ? mobilePageIndex + 1 : 2, 'right', isFlipping)}
          </div>
        );
      }
    } else {
      const catIdx = spreadIdx - 1;
      const category = categories[catIdx];
      if (!category) return null;
      const Icon = getIconComponent(category.icon);

      if (side === 'left') {
        return (
          <div key={`cat-intro-${spreadIdx}`} className="flex-1 flex flex-col justify-between h-full text-left p-4 sm:p-6">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-accent/20 text-accent border border-accent/30 shadow-[0_0_10px_rgba(108,99,255,0.2)]">
                  Chapter {spreadIdx}: {category.categoryType || 'Technical'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3.5 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary text-3xl shadow-inner cyan-glow shrink-0">
                  <Icon />
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-white tracking-tight leading-snug">
                  {category.title}
                </h3>
              </div>

              {category.description && (
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans mb-6">
                  {category.description}
                </p>
              )}

              {category.capabilities && category.capabilities.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FaCheckCircle className="text-secondary text-[11px]" /> Core Strengths
                  </h4>
                  <div className="grid grid-cols-1 gap-2 max-h-[190px] overflow-y-auto no-scrollbar pr-1">
                    {category.capabilities.map((cap, capIdx) => (
                      <div
                        key={capIdx}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300 hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_6px_rgba(0,229,255,0.8)] shrink-0" />
                        <span className="line-clamp-1">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {renderPageFooter(isMobile ? mobilePageIndex + 1 : spreadIdx * 2 + 1, 'left', isFlipping)}
          </div>
        );
      } else {
        return (
          <div key={`cat-skills-${spreadIdx}`} className="flex-1 flex flex-col justify-between h-full text-left p-4 sm:p-6">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-secondary/20 text-secondary border border-secondary/30 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  Proficiencies
                </span>
              </div>

              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
                Technical Proficiencies
              </h4>

              <div className="space-y-4 max-h-[310px] overflow-y-auto no-scrollbar pr-1">
                {category.skills?.map((skill, skillIdx) => (
                  <div key={skillIdx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-200 font-semibold tracking-wide">
                          {skill.name}
                        </span>
                        {skill.experience && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-gray-400 font-mono border border-white/[0.04]">
                            {skill.experience}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {skill.tag && (
                          <span className="text-[10px] font-bold text-accent font-sans">
                            {skill.tag}
                          </span>
                        )}
                        <span className="text-secondary font-mono font-bold text-[11px] bg-secondary/10 px-1.5 py-0.2 rounded border border-secondary/20 shadow-sm">
                          {safeClamp(skill.level)}%
                        </span>
                      </div>
                    </div>

                    {/* Animated Progress Track */}
                    <div className="w-full h-2.5 rounded-full bg-white/[0.04] overflow-hidden p-0.5 border border-white/[0.04] relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${safeClamp(skill.level)}%` }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.05 * skillIdx }}
                        className="h-full bg-gradient-to-r from-accent via-secondary to-accent rounded-full relative shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {renderPageFooter(isMobile ? mobilePageIndex + 1 : spreadIdx * 2 + 2, 'right', isFlipping)}
          </div>
        );
      }
    }
  };

  // Mobile variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <section id="skills" className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center py-10 md:py-16 scroll-mt-20 relative select-none overflow-hidden bg-transparent">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-accent/10 via-secondary/10 to-accent/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-wave-gradient" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Interactive Knowledge Codex"
          badgeIcon={FaStar}
          title="Skills & Expertise Codex"
          highlightText="Expertise Codex"
          tagline="An interactive 3D digital book compiling engineering proficiencies, architectural capabilities, and domain strengths crafted through years of high-impact work."
          badgeColor="accent"
        />

        {isMobile ? (
          /* ==================== MOBILE SCREEN VIEW (SINGLE PAGE CARD SLIDER) ==================== */
          <div 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="flex justify-center items-center py-6 w-full touch-pan-y"
          >
            <div className="glass-card relative w-full max-w-[420px] h-[540px] p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
              
              {/* Decorative side stack lines */}
              <div className="absolute right-1 top-4 bottom-4 w-1 bg-white/[0.03] rounded-full" />
              <div className="absolute right-2 top-6 bottom-6 w-1 bg-white/[0.02] rounded-full" />

              <AnimatePresence mode="wait" custom={mobileDirection}>
                <motion.div
                  key={mobilePageIndex}
                  custom={mobileDirection}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="flex-1 flex flex-col justify-between"
                >
                  {renderPageContent(Math.floor(mobilePageIndex / 2), mobilePageIndex % 2 === 0 ? 'left' : 'right')}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* ==================== DESKTOP/TABLET SCREEN VIEW (3D SPREAD BOOK) ==================== */
          <div className="w-full flex justify-center py-0">
            {/* Main book frame (wrapper) */}
            <div className="w-full relative select-none px-1">
              
              {/* 1. Realistic Hardcover Book Backing */}
              {/* <div className="absolute inset-y-[-14px] inset-x-[-18px] bg-gradient-to-br from-[#1c1d31] via-[#0d0e1b] to-[#04050a] rounded-[24px] border-[5px] border-[#2c2f4e] shadow-[0_25px_60px_rgba(0,0,0,0.95),_0_0_40px_rgba(108,99,255,0.08)] pointer-events-none z-0" /> */}
              
              {/* 2. Metallic Gold/Brass Corner Protectors */}
              {/* Top Left */}
              {/* <div className="absolute top-[-14px] left-[-18px] w-[35px] h-[35px] bg-gradient-to-br from-[#d4af37] via-[#aa7c11] to-[#664600] rounded-tl-[24px] border-r border-b border-[#ffd700]/30 shadow-md pointer-events-none z-50" /> */}
              {/* Top Right */}
              {/* <div className="absolute top-[-14px] right-[-18px] w-[35px] h-[35px] bg-gradient-to-bl from-[#d4af37] via-[#aa7c11] to-[#664600] rounded-tr-[24px] border-l border-b border-[#ffd700]/30 shadow-md pointer-events-none z-50" /> */}
              {/* Bottom Left */}
              {/* <div className="absolute bottom-[-14px] left-[-18px] w-[35px] h-[35px] bg-gradient-to-tr from-[#d4af37] via-[#aa7c11] to-[#664600] rounded-bl-[24px] border-r border-t border-[#ffd700]/30 shadow-md pointer-events-none z-50" /> */}
              {/* Bottom Right */}
              {/* <div className="absolute bottom-[-14px] right-[-18px] w-[35px] h-[35px] bg-gradient-to-tl from-[#d4af37] via-[#aa7c11] to-[#664600] rounded-br-[24px] border-l border-t border-[#ffd700]/30 shadow-md pointer-events-none z-50" /> */}

              {/* 3. Underneath Page Stack Sheets (left and right page thickness) */}
              {/* Left Stack */}
              {/* <div className="absolute left-[-4px] top-[4px] bottom-[4px] w-[50%] bg-[#20e02390] border-y border-l border-white/[0.03] rounded-l-2xl shadow-md z-0 pointer-events-none" /> */}
              {/* <div className="absolute left-[-8px] top-[8px] bottom-[8px] w-[50%] bg-[#d02f32] border-y border-l border-white/[0.02] rounded-l-2xl shadow-md z-0 pointer-events-none" /> */}
              {/* <div className="absolute left-[-12px] top-[12px] bottom-[12px] w-[50%] bg-[#344ecf] border-y border-l border-white/[0.01] rounded-l-2xl shadow-md z-0 pointer-events-none" /> */}
              {/* Right Stack */}
              {/* <div className="absolute right-[-4px] top-[4px] bottom-[4px] w-[50%] bg-[#1fdc52] border-y border-r border-white/[0.03] rounded-r-2xl shadow-md z-0 pointer-events-none" /> */}
              {/* <div className="absolute right-[-8px] top-[8px] bottom-[8px] w-[50%] bg-[#c72323] border-y border-r border-white/[0.02] rounded-r-2xl shadow-md z-0 pointer-events-none" /> */}
              {/* <div className="absolute right-[-12px] top-[12px] bottom-[12px] w-[50%] bg-[#4f24d0] border-y border-r border-white/[0.01] rounded-r-2xl shadow-md z-0 pointer-events-none" /> */}

              {/* Perspective book container */}
              <div className="book-perspective w-full h-[700px] relative overflow-visible flex rounded-[18px] border border-white/[0.05] z-10 animate-wave-gradient">
                
                {/* 3D Spine Crease */}
                <div className="absolute left-[50%] top-0 bottom-0 w-[14px] translate-x-[-50%] bg-gradient-to-r from-black/80 via-[#2e3152]/40 to-black/80 z-[45] border-l border-r border-white/5 pointer-events-none" />

                {/* 4. Spiral Binder Rings (6 rings) */}
                {['12%', '28%', '44%', '60%', '76%', '92%'].map((pos, rIdx) => (
                  <div
                    key={rIdx}
                    style={{ top: pos }}
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30px] h-[10px] bg-gradient-to-b from-[#f3f4f6] via-[#9ca3af] to-[#374151] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-[50] pointer-events-none"
                  >
                    <div className="absolute inset-x-1.5 top-0.5 h-[1.5px] bg-white/40 rounded-full" />
                  </div>
                ))}
                
                {/* Left Static Page */}
                <div className="book-page book-page-left  relative overflow-hidden p-8 sm:p-9 flex flex-col justify-between z-10">
                  <div className="absolute -top-24 -left-24 w-60 h-6 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
                  {renderPageContent(leftStaticSpread, 'left')}
                </div>

                {/* Right Static Page */}
                <div className="book-page book-page-right relative overflow-hidden p-8 sm:p-9 flex flex-col justify-between z-10">
                  <div className="absolute -top-24 -right-24 w-60 h-60 bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />
                  {renderPageContent(rightStaticSpread, 'right')}
                </div>

                {/* Flipping Page Overlay */}
                {animatingState !== null && (
                  <motion.div
                    key={`${currentSpread}-${animatingState}`}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: 0,
                      width: '50%',
                      height: '100%',
                      transformOrigin: 'left center',
                      transformStyle: 'preserve-3d',
                      zIndex: 20,
                    }}
                    initial={{ rotateY: animatingState === 'next' ? 0 : -180 }}
                    animate={{ rotateY: animatingState === 'next' ? -180 : 0 }}
                    transition={{ duration: 0.75, ease: 'easeInOut' }}
                    onAnimationComplete={handleAnimationEnd}
                  >
                    {/* Front Face of Turning Page */}
                    <div className="page-face page-face-front book-page book-page-right p-8 sm:p-9 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute -top-24 -right-24 w-60 h-60 bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />
                      {renderPageContent(flippingFrontSpread, 'right', true)}
                    </div>

                    {/* Back Face of Turning Page */}
                    <div className="page-face page-face-back book-page book-page-left p-8 sm:p-9 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute -top-24 -left-24 w-60 h-60 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
                      {renderPageContent(flippingBackSpread, 'left', true)}
                    </div>
                  </motion.div>
                )}

                {/* Page Curl Interactive Prompt Effect */}
                {currentSpread < totalSpreads - 1 && animatingState === null && (
                  <div className="page-curl-indicator-right animate-pulse" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
