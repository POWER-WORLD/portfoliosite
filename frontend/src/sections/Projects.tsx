import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaFolderOpen, FaCode } from 'react-icons/fa';
import SectionHeader from '../components/SectionHeader';

import { CategoryFilter, PROJECT_CATEGORIES, getCategoryLabel } from '../constants';
import { sanitizeUrl } from '../utils/security';

interface ProjectsProps {
  data?: any[];
}

export default function Projects({ data }: ProjectsProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const projects = data && data.length > 0 ? data : [];

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    return project.category === filter;
  });

  const availableCategories = PROJECT_CATEGORIES.filter((cat) => {
    if (cat.value === 'all') return true;
    return projects.some((p) => p.category === cat.value);
  });

  const existingCategoryValues = new Set<string>(projects.map((p) => p.category));
  const additionalCategories = Array.from(existingCategoryValues)
    .filter((catVal) => catVal && !PROJECT_CATEGORIES.some((c) => c.value === catVal))
    .map((catVal) => ({
      label: getCategoryLabel(catVal),
      value: catVal as CategoryFilter,
    }));

  const categories = [...availableCategories, ...additionalCategories];

  if (projects.length === 0) {
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

  return (
    <section id="projects" className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center py-16 md:py-24 scroll-mt-20 relative select-none overflow-hidden bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="My Creations"
          title="Featured Work"
          highlightText="Work"
          badgeColor="accent"
        />

      {/* Filter Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-16">
        {categories.map((cat) => {
          const isActive = filter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`relative px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold tracking-wide uppercase transition-all duration-300 border cursor-pointer ${
                isActive
                  ? 'border-accent bg-accent/15 text-white shadow-[0_0_15px_rgba(108,99,255,0.3)] scale-105'
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Project Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project: any) => {
            const projId = project._id || project.id || project.title;
            const isImgFailed = failedImages[projId];
            const safeGithub = sanitizeUrl(project.githubUrl);
            const safeLive = sanitizeUrl(project.liveUrl);

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                key={projId}
                className="glass-card overflow-hidden flex flex-col justify-between group"
              >
                {/* Project Image & Overlay */}
                <div className="relative overflow-hidden aspect-video border-b border-white/[0.06] bg-gradient-to-br from-bg-dark to-slate-900 flex items-center justify-center">
                  {project.imageUrl && !isImgFailed ? (
                    <img
                      src={sanitizeUrl(project.imageUrl)}
                      alt={project.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750 ease-out"
                      onError={() => handleImageError(projId)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 font-mono text-xs bg-slate-950/60 p-4 text-center">
                      <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-xl">
                        <FaCode />
                      </div>
                      <span className="text-gray-300 font-sans font-semibold text-sm">{project.title}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">[Interactive workpiece]</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-bg-dark/10 to-transparent opacity-60" />
                  
                  {/* Visual Accent Corner Glow */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-accent/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Card Body */}
                <div className="p-6 md:p-8 flex flex-col justify-between flex-grow space-y-6">
                  <div className="space-y-4">
                    {/* Category Indicator & Title */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold tracking-wider text-secondary uppercase font-mono">
                        {getCategoryLabel(project.category)}
                      </span>
                      <h3 className="font-display font-bold text-xl md:text-2xl text-white group-hover:text-glow transition-all duration-300">
                        {project.title}
                      </h3>
                    </div>

                    <p className="text-sm md:text-base text-gray-300 font-light leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Tags & CTAs */}
                  <div className="space-y-6 pt-4 border-t border-white/[0.06]">
                    {/* Tech Tags Grid */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full text-[10px] md:text-xs font-medium tracking-wide text-gray-300 bg-white/[0.02] border border-white/[0.06] group-hover:border-white/[0.12] transition-colors duration-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions Links */}
                    <div className="flex items-center gap-6 pt-2">
                      {safeGithub && safeGithub !== '#' && (
                        <a
                          href={safeGithub}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs md:text-sm font-semibold tracking-wider text-gray-300 hover:text-white transition-colors duration-300"
                        >
                          <FaGithub className="text-base" />
                          Repository
                        </a>
                      )}
                      {safeLive && safeLive !== '#' && (
                        <a
                          href={safeLive}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs md:text-sm font-semibold tracking-wider text-secondary hover:text-glow-secondary hover:text-white transition-all duration-300"
                        >
                          <FaExternalLinkAlt className="text-xs" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      </div>
    </section>
  );
}
