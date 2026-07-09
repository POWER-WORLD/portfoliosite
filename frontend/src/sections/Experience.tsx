import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';
import { 
  FaBriefcase, 
  FaGraduationCap, 
  FaBook, 
  FaKeyboard, 
  FaAward, 
  FaHandsHelping, 
  FaRocket,
  FaExternalLinkAlt,
  FaChevronRight,
  FaCode
} from 'react-icons/fa';

interface Job {
  _id?: string;
  role: string;
  company?: string;
  period: string;
  description: string;
  category?: 'work' | 'internship' | 'academic_project' | 'freelance' | 'volunteer' | 'leadership' | 'side_gig';
  keyLearningOutcomes?: string;
  technologies?: string[];
  link?: string;
}

interface ExperienceProps {
  data?: Job[];
}

type FilterType = 'all' | 'work' | 'internship' | 'academic_project' | 'freelance' | 'leadership' | 'volunteer' | 'side_gig';

const filters: { value: FilterType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All Timeline', icon: null },
  { value: 'work', label: 'Professional Work', icon: <FaBriefcase className="text-xs" /> },
  { value: 'internship', label: 'Internships', icon: <FaGraduationCap className="text-xs" /> },
  { value: 'academic_project', label: 'Academic Projects', icon: <FaBook className="text-xs" /> },
  { value: 'freelance', label: 'Freelance Gigs', icon: <FaKeyboard className="text-xs" /> },
  { value: 'leadership', label: 'Leadership Roles', icon: <FaAward className="text-xs" /> },
  { value: 'volunteer', label: 'Volunteer Service', icon: <FaHandsHelping className="text-xs" /> },
  { value: 'side_gig', label: 'Side Gigs', icon: <FaRocket className="text-xs" /> },
];

const categoryMeta: Record<string, { label: string; icon: React.ReactNode; gradient: string; glow: string; badgeBorder: string; badgeText: string }> = {
  work: { 
    label: 'Work Experience', 
    icon: <FaBriefcase className="text-sm" />, 
    gradient: 'from-[#6C63FF] to-[#3B30FF]', 
    glow: '#6C63FF',
    badgeBorder: 'border-[#6C63FF]/30',
    badgeText: 'text-[#6C63FF]'
  },
  internship: { 
    label: 'Internship', 
    icon: <FaGraduationCap className="text-sm" />, 
    gradient: 'from-[#00E5FF] to-[#0097A7]', 
    glow: '#00E5FF',
    badgeBorder: 'border-[#00E5FF]/30',
    badgeText: 'text-[#00E5FF]'
  },
  academic_project: { 
    label: 'Academic Project', 
    icon: <FaBook className="text-sm" />, 
    gradient: 'from-[#FFD54F] to-[#F57F17]', 
    glow: '#FFD54F',
    badgeBorder: 'border-[#FFD54F]/30',
    badgeText: 'text-[#FFD54F]'
  },
  freelance: { 
    label: 'Freelance Work', 
    icon: <FaKeyboard className="text-sm" />, 
    gradient: 'from-[#B388FF] to-[#6200EA]', 
    glow: '#B388FF',
    badgeBorder: 'border-[#B388FF]/30',
    badgeText: 'text-[#B388FF]'
  },
  leadership: { 
    label: 'Leadership Role', 
    icon: <FaAward className="text-sm" />, 
    gradient: 'from-[#FF8A80] to-[#D50000]', 
    glow: '#FF8A80',
    badgeBorder: 'border-[#FF8A80]/30',
    badgeText: 'text-[#FF8A80]'
  },
  volunteer: { 
    label: 'Volunteer Work', 
    icon: <FaHandsHelping className="text-sm" />, 
    gradient: 'from-[#81C784] to-[#2E7D32]', 
    glow: '#81C784',
    badgeBorder: 'border-[#81C784]/30',
    badgeText: 'text-[#81C784]'
  },
  side_gig: { 
    label: 'Side Gig', 
    icon: <FaRocket className="text-sm" />, 
    gradient: 'from-[#FFB74D] to-[#E65100]', 
    glow: '#FFB74D',
    badgeBorder: 'border-[#FFB74D]/30',
    badgeText: 'text-[#FFB74D]'
  },
};

export default function Experience({ data }: ExperienceProps) {
  const jobs = data && data.length > 0 ? data : [];
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  if (jobs.length === 0) {
    return null;
  }

  const filteredJobs = jobs.filter(job => {
    if (activeFilter === 'all') return true;
    return (job.category || 'work') === activeFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 90, damping: 15 },
    },
  };

  return (
    <section id="experience" className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center py-16 md:py-24 scroll-mt-20 relative select-none overflow-hidden bg-transparent">
      {/* Ambient background glows */}
      <div className="absolute top-[15%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#6C63FF]/[0.015] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[-15%] w-[450px] h-[450px] rounded-full bg-[#00E5FF]/[0.015] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badgeText="Timeline"
          title="Professional & Academic Journey"
          tagline='explore academic journey in which including from intership to work experience'
          highlightText="Journey"
          badgeColor="secondary"
        />

        {/* Dynamic Category Filter Bar with Edge Fades */}
        <div className="w-full relative mx-auto mb-8">
          {/* Scroll fades on mobile viewports */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg-dark to-transparent pointer-events-none z-20 md:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg-dark to-transparent pointer-events-none z-20 md:hidden" />

          <div className="w-full flex justify-start md:justify-center overflow-x-auto no-scrollbar scroll-smooth px-2 py-2">
            <div className="flex gap-2 flex-nowrap md:flex-wrap bg-white/[0.01] border border-white/[0.04] p-1.5 rounded-full backdrop-blur-md">
              {filters.map((filter) => {
                const isActive = activeFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`relative px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 whitespace-nowrap transition-all duration-300 cursor-pointer select-none ${
                      isActive
                        ? 'text-bg-dark font-bold'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Glowing Slide Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeFilterGlow"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-accent to-[#5046E5] shadow-[0_0_15px_rgba(108,99,255,0.4)]"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {filter.icon}
                      {filter.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Premium Split-Grid Experience Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Timeline Spine Line (Centered mathematically at 16px on mobile, 184px on desktop) */}
          <div className="absolute left-[16px] md:left-[184px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-[#6C63FF] via-[#00E5FF] to-transparent opacity-30" />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-10% 0px' }}
            className="space-y-12 relative"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredJobs.map((job) => {
                const category = job.category || 'work';
                const meta = categoryMeta[category] || categoryMeta.work;
                return (
                  <motion.div
                    key={job._id || job.role + job.period}
                    variants={itemVariants}
                    layout
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="relative grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 md:gap-12 group"
                  >
                    {/* Left Column: Period & Badge (Desktop Only) */}
                    <div className="hidden md:flex flex-col items-end justify-start pt-3.5 pr-8 text-right space-y-2.5 select-none">
                      <span className="text-sm font-mono font-bold text-gray-400">
                        {job.period}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-white/[0.01] border ${meta.badgeBorder} ${meta.badgeText}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                    </div>

                    {/* Timeline Spine Orb (Centered perfectly on the vertical line) */}
                    <div 
                      className="absolute left-[2px] md:left-[164px] top-2 md:top-3 w-7 h-7 md:w-10 md:h-10 rounded-full border border-white/[0.08] bg-bg-dark flex items-center justify-center group-hover:border-transparent transition-all duration-500 z-10"
                    >
                      <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/[0.03] to-white/[0.01] group-hover:from-white/[0.08] group-hover:to-white/[0.03] transition-all duration-300" />
                      
                      {/* Category specific color glow ring */}
                      <div 
                        className="absolute -inset-[1px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${meta.glow}, transparent)`
                        }}
                      />
                      
                      {/* Icon */}
                      <div 
                        className="relative z-10 text-xs md:text-sm text-gray-400 group-hover:text-white transition-all duration-300"
                        style={{ filter: `drop-shadow(0 0 3px ${meta.glow}40)` }}
                      >
                        {meta.icon}
                      </div>
                    </div>

                    {/* Right Column: Content Card */}
                    <div className="pl-9 md:pl-0">
                      <div className="glass-card p-6 md:p-8 space-y-4 relative overflow-hidden transition-all duration-500 border border-white/[0.05] rounded-[1.5rem]">
                        {/* Ambient category colored radial glow inside the card on hover */}
                        <div 
                          className="absolute -right-20 -top-20 w-44 h-44 rounded-full opacity-0 group-hover:opacity-[0.04] blur-3xl transition-opacity duration-500 pointer-events-none"
                          style={{ backgroundColor: meta.glow }}
                        />

                        {/* Interactive dynamic category color outline on hover */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 border rounded-[1.5rem] pointer-events-none"
                          style={{ 
                            borderColor: `${meta.glow}50`, 
                            boxShadow: `inset 0 0 20px ${meta.glow}08, 0 10px 30px ${meta.glow}10` 
                          }}
                        />

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 relative z-10">
                          <div className="space-y-1">
                            {/* Mobile-only Category Badge & Period */}
                            <div className="flex flex-wrap items-center gap-2 md:hidden mb-2">
                              <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/[0.02] border ${meta.badgeBorder} ${meta.badgeText}`}>
                                {meta.icon}
                                {meta.label}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400 bg-white/[0.02] border border-white/[0.06] px-2 py-0.5 rounded-full">
                                {job.period}
                              </span>
                            </div>

                            <h3 className="font-display font-bold text-xl text-white group-hover:text-glow transition-all duration-300 pt-0.5 leading-snug">
                              {job.role}
                            </h3>

                            {job.company && (
                              <div className="text-sm font-semibold text-secondary">
                                {job.company}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description Section */}
                        <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed relative z-10">
                          {job.description}
                        </p>

                        {/* Internship / Volunteer / Leadership Key Learning Outcomes */}
                        {job.keyLearningOutcomes && (
                          <div className="mt-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] relative z-10">
                            <h4 className="text-xs uppercase font-mono tracking-wider text-secondary font-bold mb-2 flex items-center gap-1.5">
                              <FaChevronRight className="text-[10px]" /> Key Outcomes & Learnings
                            </h4>
                            <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed">
                              {job.keyLearningOutcomes}
                            </p>
                          </div>
                        )}

                        {/* Technologies & Core Skills Used */}
                        {job.technologies && job.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2 relative z-10">
                            {job.technologies.map((tech, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] md:text-xs font-mono font-medium text-gray-300 px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/[0.06] flex items-center gap-1 hover:border-white/[0.15] hover:bg-white/[0.04] hover:text-white transition-all duration-300 select-none"
                              >
                                <FaCode className="text-[10px] text-accent/80" />
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actionable Project / Resource URL Link */}
                        {job.link && (
                          <div className="pt-2 relative z-10">
                            <a
                              href={job.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-mono font-semibold transition-colors duration-300 group/link"
                              style={{ color: meta.glow }}
                            >
                              <span className="hover:underline">View Project Resources</span>
                              <FaExternalLinkAlt className="text-[9px] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-300" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Empty State when no jobs match filter */}
          {filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-gray-400 space-y-2"
            >
              <p className="text-lg font-medium font-display">No timeline records found</p>
              <p className="text-sm font-light">There are currently no items configured under this filter.</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
