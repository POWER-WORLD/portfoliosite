import { motion } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';

interface AboutProps {
  data?: {
    story?: string;
    highlights?: { title: string; desc: string }[];
    education?: { degree: string; school: string; year: string; description: string }[];
  };
}

export default function About({ data }: AboutProps) {
  const story = data?.story || '';
  const highlights = data?.highlights || [];
  const education = data?.education || [];

  if (!story && highlights.length === 0 && education.length === 0) {
    return null; // Don't render empty section if database has no about entries yet
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section id="about" className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center py-8 md:py-12 scroll-mt-20 relative select-none overflow-hidden bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start"
        >
        {/* Left Column: Biography & Highlights */}
        <div className="lg:col-span-7 space-y-8 md:space-y-10">
          <SectionHeader
            badgeText="My Journey"
            title="About Me"
            align="left"
            badgeColor="accent"
          />

          {story && (
            <motion.p
              variants={itemVariants}
              className="text-gray-300 text-base md:text-lg leading-relaxed font-light"
            >
              {story}
            </motion.p>
          )}

          {/* Stat highlights (Transparent, floating border blocks) */}
          {highlights.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4"
            >
              {highlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="glass-card p-6 flex flex-col items-center justify-center text-center group"
                >
                  <span className="font-display font-extrabold text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
                    {highlight.title}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-2">
                    {highlight.desc}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right Column: Education Timeline */}
        {education.length > 0 && (
          <div className="lg:col-span-5 space-y-8 md:space-y-10">
            <SectionHeader
              badgeText="Academics"
              title="Education"
              align="left"
              badgeColor="secondary"
            />

            {/* Vertical Timeline */}
            <div className="relative border-l border-white/[0.06] pl-6 md:pl-8 ml-2 space-y-10">
              {education.map((edu, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="relative group"
                >
                  {/* Connector Dot */}
                  <div className="absolute -left-[33px] md:-left-[41px] top-1.5 w-6 h-6 rounded-full border-2 border-white/[0.08] bg-bg-dark flex items-center justify-center group-hover:border-secondary transition-all duration-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/[0.15] group-hover:bg-secondary transition-colors duration-300 group-hover:shadow-[0_0_8px_#00E5FF]" />
                  </div>

                  {/* Event details */}
                  <div className="space-y-2">
                    <span className="text-xs text-secondary font-mono tracking-wider font-medium">
                      {edu.year}
                    </span>
                    <h4 className="font-display font-bold text-lg md:text-xl text-white group-hover:text-secondary transition-colors duration-300">
                      {edu.degree}
                    </h4>
                    <p className="text-sm text-gray-300 font-semibold">
                      {edu.school}
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed font-light pt-1">
                      {edu.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      </div>
    </section>
  );
}
