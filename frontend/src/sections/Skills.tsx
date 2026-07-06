import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FaIcons from 'react-icons/fa';
import { FaLayerGroup, FaThLarge, FaCheckCircle, FaStar, FaSlidersH, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { safeClamp } from '../utils/security';

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
}

function getIconComponent(icon: any) {
  if (typeof icon === 'string') {
    const IconComponent = (FaIcons as any)[icon];
    return IconComponent || FaIcons.FaCode;
  }
  return icon || FaIcons.FaCode;
}

export default function Skills({ data }: SkillsProps) {
  const categories = useMemo(() => (data && data.length > 0 ? data : []), [data]);

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  // Extract unique category types for filtering
  const filterOptions = useMemo(() => {
    const typesSet = new Set<string>();
    categories.forEach((cat) => {
      if (cat.categoryType) {
        typesSet.add(cat.categoryType);
      }
    });
    return ['ALL', ...Array.from(typesSet)];
  }, [categories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (activeFilter === 'ALL') return categories;
    return categories.filter((cat) => cat.categoryType === activeFilter);
  }, [categories, activeFilter]);

  if (categories.length === 0) {
    return null;
  }

  const toggleExpand = (idx: number) => {
    setExpandedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { y: 35, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 85, damping: 14 },
    },
  };

  return (
    <section id="skills" className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 md:py-16 scroll-mt-20 relative select-none overflow-hidden bg-transparent">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-accent/10 via-secondary/10 to-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-8 md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-widest"
          >
            <FaStar className="text-secondary text-xs" />
            <span>Extensive Expertise & Capabilities</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white"
          >
            Skills & <span className="bg-gradient-to-r from-accent via-secondary to-white bg-clip-text text-transparent">Capabilities Matrix</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
          >
            A comprehensive breakdown of engineering proficiencies, architectural capabilities, and domain strengths crafted through years of high-impact technical work.
          </motion.p>
        </div>

        {/* Interactive Controls Bar: Filter Pills + View Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-3 sm:p-4 rounded-3xl">
        
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`relative px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'text-white shadow-[0_0_20px_rgba(108,99,255,0.4)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterBg"
                    className="absolute inset-0 bg-gradient-to-r from-accent to-secondary rounded-2xl -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <span>{filter === 'ALL' ? 'All Domains' : filter}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/[0.08] p-1.5 rounded-2xl self-end sm:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
              viewMode === 'cards'
                ? 'bg-accent text-white shadow-[0_0_12px_rgba(108,99,255,0.5)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FaSlidersH className="text-xs" />
            <span>Card Bars</span>
          </button>

          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
              viewMode === 'matrix'
                ? 'bg-secondary text-black font-bold shadow-[0_0_12px_rgba(0,229,255,0.5)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FaThLarge className="text-xs" />
            <span>Matrix Grid</span>
          </button>
        </div>
      </div>

      {/* Main Content Area with AnimatePresence for view switching */}
      <AnimatePresence mode="wait">
        {viewMode === 'cards' ? (
          /* ==================== VIEW MODE 1: CARDS & PROGRESS BARS ==================== */
          <motion.div
            key="cards-view"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
          >
            {filteredCategories.map((category, catIdx) => {
              const Icon = getIconComponent(category.icon);
              const isExpanded = Boolean(expandedCards[catIdx]);

              return (
                <motion.div
                  key={category._id || catIdx}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden group border border-white/[0.08] hover:border-accent/40 transition-all duration-500 hover:shadow-[0_10px_35px_rgba(108,99,255,0.15)] flex flex-col justify-between"
                >
                  {/* Subtle Top Gradient Accent Border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-secondary to-accent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Background Radial Glow */}
                  <div className="absolute -top-12 -right-12 w-44 h-44 bg-accent/10 rounded-full blur-3xl group-hover:bg-secondary/15 transition-all duration-500 pointer-events-none" />

                  <div>
                    {/* Header Row: Icon + Title + Category Type Tag */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-secondary group-hover:text-white group-hover:border-secondary/40 group-hover:bg-secondary/10 transition-all duration-500 text-2xl shadow-inner">
                          <Icon />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-xl sm:text-2xl text-white group-hover:text-glow transition-all duration-300">
                            {category.title}
                          </h3>
                          {category.description && (
                            <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {category.categoryType && (
                        <span className="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-accent/15 text-accent border border-accent/30 shadow-[0_0_10px_rgba(108,99,255,0.2)]">
                          {category.categoryType}
                        </span>
                      )}
                    </div>

                    {/* Skills Progress Bars List */}
                    <div className="space-y-5 my-6">
                      {category.skills?.map((skill, skillIdx) => (
                        <div key={skillIdx} className="space-y-2">
                          <div className="flex justify-between items-center text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-200 font-semibold group-hover:text-white transition-colors duration-300">
                                {skill.name}
                              </span>
                              {skill.experience && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-gray-400 font-mono border border-white/[0.04]">
                                  {skill.experience}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              {skill.tag && (
                                <span className="text-[11px] font-bold text-accent font-sans">
                                  {skill.tag}
                                </span>
                              )}
                              <span className="text-secondary font-mono font-bold text-sm bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
                                {safeClamp(skill.level)}%
                              </span>
                            </div>
                          </div>

                          {/* Animated Progress Track */}
                          <div className="w-full h-2.5 rounded-full bg-white/[0.04] overflow-hidden p-0.5 border border-white/[0.04] relative">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${safeClamp(skill.level)}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 * skillIdx }}
                              className="h-full bg-gradient-to-r from-accent via-secondary to-accent rounded-full relative shadow-[0_0_12px_rgba(0,229,255,0.6)]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Domain Capability Highlights Bullet Section */}
                  {category.capabilities && category.capabilities.length > 0 && (
                    <div className="pt-4 border-t border-white/[0.06] mt-4">
                      <button
                        onClick={() => toggleExpand(catIdx)}
                        className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 hover:text-secondary transition-colors duration-300 py-1"
                      >
                        <span className="flex items-center gap-2 uppercase tracking-wider text-[11px]">
                          <FaCheckCircle className="text-secondary text-xs" />
                          Domain Capabilities ({category.capabilities.length})
                        </span>
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mt-3"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {category.capabilities.map((cap, capIdx) => (
                                <div
                                  key={capIdx}
                                  className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                                  <span className="line-clamp-1">{cap}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* ==================== VIEW MODE 2: DOMAIN CAPABILITIES MATRIX ==================== */
          <motion.div
            key="matrix-view"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {filteredCategories.map((category, catIdx) => {
              const Icon = getIconComponent(category.icon);

              return (
                <motion.div
                  key={category._id || catIdx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="glass-panel p-6 rounded-3xl border border-white/[0.08] relative overflow-hidden flex flex-col justify-between group hover:border-secondary/50 transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20 text-xl">
                        <Icon />
                      </div>
                      <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                        {category.categoryType || 'Technical'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-xl text-white group-hover:text-secondary transition-colors duration-300">
                        {category.title}
                      </h3>
                      {category.description && (
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {category.description}
                        </p>
                      )}
                    </div>

                    {/* Skill Badges Cloud */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {category.skills?.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.04] text-gray-200 border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-200"
                        >
                          {s.name} <span className="text-secondary font-mono text-[11px]">({safeClamp(s.level)}%)</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Capabilities List */}
                  {category.capabilities && category.capabilities.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FaLayerGroup className="text-accent text-xs" /> Core Capabilities
                      </span>
                      <div className="space-y-1.5">
                        {category.capabilities.map((cap, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-2 text-xs text-gray-300">
                            <span className="text-secondary text-xs">&rsaquo;</span>
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </section>
  );
}
