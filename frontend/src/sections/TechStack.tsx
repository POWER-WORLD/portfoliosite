import { motion } from 'framer-motion';
import { TECH_STACK_ICONS } from '../constants';

export default function TechStack() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto relative select-none">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-3 mb-16">
        <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
          Ecosystem
        </span>
        <h2 className="font-display font-bold text-2xl md:text-4xl">
          Technologies & Tools
        </h2>
        <div className="w-12 h-1 bg-gradient-to-r from-secondary to-accent rounded-full" />
      </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10% 0px' }}
        className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto"
      >
        {TECH_STACK_ICONS.map((tech, idx) => {
          // Randomized floating variables
          const randomDuration = 3 + Math.random() * 2; // 3 to 5s
          const randomDelay = Math.random() * 2;       // 0 to 2s
          
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: randomDuration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: randomDelay,
              }}
              className="glass-panel px-6 py-3 rounded-full flex items-center justify-center gap-2.5 group hover:border-accent/40 hover:shadow-[0_0_15px_rgba(108,99,255,0.06)] transition-all duration-300 cursor-default"
            >
              {/* Small Dot matching Tech Color */}
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: tech.color,
                  boxShadow: `0 0 8px ${tech.color}`,
                }}
              />
              <span className="text-sm font-semibold tracking-wide text-gray-300 group-hover:text-white transition-colors duration-300">
                {tech.name}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
