import { motion } from 'framer-motion';
import { ABOUT_DATA } from '../constants';

export default function About() {
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
    <section id="about" className="py-24 px-6 max-w-7xl mx-auto relative select-none">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10% 0px' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
      >
        {/* Left Column: Biography & Highlights */}
        <div className="lg:col-span-7 space-y-10">
          <motion.div variants={itemVariants} className="space-y-4">
            <span className="text-sm font-semibold tracking-widest text-accent uppercase">
              My Journey
            </span>
            <h2 className="font-display font-bold text-3xl md:text-5xl">
              About Me
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-accent to-secondary rounded-full" />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-base md:text-lg leading-relaxed font-light"
          >
            {ABOUT_DATA.story}
          </motion.p>

          {/* Stat highlights (Transparent, floating border blocks) */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-6 pt-4"
          >
            {ABOUT_DATA.highlights.map((highlight, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-accent/40 transition-all duration-500 hover:-translate-y-1"
              >
                <span className="font-display font-extrabold text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
                  {highlight.title}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-2">
                  {highlight.desc}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Education Timeline */}
        <div className="lg:col-span-5 space-y-10">
          <motion.div variants={itemVariants} className="space-y-4">
            <span className="text-sm font-semibold tracking-widest text-secondary uppercase">
              Academics
            </span>
            <h3 className="font-display font-bold text-2xl md:text-4xl">
              Education
            </h3>
            <div className="w-12 h-1 bg-gradient-to-r from-secondary to-accent rounded-full" />
          </motion.div>

          {/* Vertical Timeline */}
          <div className="relative border-l border-white/[0.06] pl-8 ml-2 space-y-12">
            {ABOUT_DATA.education.map((edu, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative group"
              >
                {/* Connector Dot */}
                <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-2 border-white/[0.08] bg-bg-dark flex items-center justify-center group-hover:border-secondary transition-all duration-300">
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
                  <p className="text-sm text-gray-400 font-semibold">
                    {edu.school}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed font-light pt-2">
                    {edu.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
