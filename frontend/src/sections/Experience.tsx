import { motion } from 'framer-motion';
import { EXPERIENCE_DATA } from '../constants';

export default function Experience() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 90, damping: 15 },
    },
  };

  return (
    <section id="experience" className="py-24 px-6 max-w-7xl mx-auto relative select-none">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center space-y-4 mb-20">
        <span className="text-sm font-semibold tracking-widest text-secondary uppercase">
          Timeline
        </span>
        <h2 className="font-display font-bold text-3xl md:text-5xl">
          Professional Experience
        </h2>
        <div className="w-12 h-1 bg-gradient-to-r from-secondary to-accent rounded-full" />
      </div>

      {/* Experience Timeline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10% 0px' }}
        className="relative border-l border-white/[0.06] pl-8 md:pl-12 ml-4 md:ml-12 max-w-4xl mx-auto space-y-16"
      >
        {EXPERIENCE_DATA.map((job, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="relative group"
          >
            {/* Timeline Orb */}
            <div className="absolute -left-[45px] md:-left-[61px] top-1.5 w-8 h-8 rounded-full border-2 border-white/[0.08] bg-bg-dark flex items-center justify-center group-hover:border-accent transition-all duration-300">
              <div className="w-3.5 h-3.5 rounded-full bg-white/[0.12] group-hover:bg-accent transition-all duration-300 group-hover:shadow-[0_0_10px_#6C63FF]" />
            </div>

            {/* Content Card (Fully transparent floating border) */}
            <div className="glass-panel p-8 rounded-3xl group-hover:border-accent/40 group-hover:shadow-[0_0_25px_rgba(108,99,255,0.05)] transition-all duration-500 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-xl md:text-2xl text-white group-hover:text-glow transition-all duration-300">
                    {job.role}
                  </h3>
                  <span className="text-sm text-secondary font-semibold">
                    {job.company}
                  </span>
                </div>
                <span className="text-xs font-mono text-gray-500 font-medium px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04]">
                  {job.period}
                </span>
              </div>

              <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed pt-2">
                {job.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
