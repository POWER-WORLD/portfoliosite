import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { PROJECTS_DATA, type Project } from '../constants';

type CategoryFilter = 'all' | 'frontend' | 'fullstack' | 'creative';

export default function Projects() {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const filteredProjects = PROJECTS_DATA.filter((project) => {
    if (filter === 'all') return true;
    return project.category === filter;
  });

  const categories: { label: string; value: CategoryFilter }[] = [
    { label: 'All Projects', value: 'all' },
    { label: 'Full Stack', value: 'fullstack' },
    { label: 'Frontend', value: 'frontend' },
    { label: 'Creative Tech', value: 'creative' },
  ];

  return (
    <section id="projects" className="py-24 px-6 max-w-7xl mx-auto relative select-none">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center space-y-4 mb-16">
        <span className="text-sm font-semibold tracking-widest text-accent uppercase">
          My Creations
        </span>
        <h2 className="font-display font-bold text-3xl md:text-5xl">
          Featured Work
        </h2>
        <div className="w-12 h-1 bg-gradient-to-r from-accent to-secondary rounded-full" />
      </div>

      {/* Filter Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
        {categories.map((cat) => {
          const isActive = filter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`relative px-5 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide uppercase transition-all duration-300 border cursor-pointer ${
                isActive
                  ? 'border-accent bg-accent/10 text-white shadow-[0_0_12px_rgba(108,99,255,0.2)]'
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
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
          {filteredProjects.map((project: Project) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              key={project.id}
              className="glass-panel rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-accent/40 hover:shadow-[0_0_30px_rgba(108,99,255,0.1)] transition-all duration-500"
            >
              {/* Project Image & Overlay */}
              <div className="relative overflow-hidden aspect-video border-b border-white/[0.04]">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-bg-dark/10 to-transparent opacity-60" />
                
                {/* Visual Accent Corner Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 flex flex-col justify-between flex-grow space-y-6">
                <div className="space-y-4">
                  {/* Category Indicator & Title */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-wider text-secondary uppercase">
                      {project.category}
                    </span>
                    <h3 className="font-display font-bold text-xl md:text-2xl text-white group-hover:text-glow transition-all duration-300">
                      {project.title}
                    </h3>
                  </div>

                  <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tech Tags & CTAs */}
                <div className="space-y-6 pt-4 border-t border-white/[0.04]">
                  {/* Tech Tags Grid */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-[10px] md:text-xs font-medium tracking-wide text-gray-400 bg-white/[0.02] border border-white/[0.04] group-hover:border-white/[0.08] transition-colors duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions Links */}
                  <div className="flex items-center gap-6">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs md:text-sm font-semibold tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      <FaGithub className="text-base" />
                      Repository
                    </a>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs md:text-sm font-semibold tracking-wider text-secondary hover:text-glow-secondary hover:text-white transition-all duration-300"
                    >
                      <FaExternalLinkAlt className="text-xs" />
                      Live Demo
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
