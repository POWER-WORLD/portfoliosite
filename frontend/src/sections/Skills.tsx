import { motion } from 'framer-motion';
import * as FaIcons from 'react-icons/fa';

interface Skill {
  name: string;
  level: number;
}

interface SkillCategory {
  title: string;
  icon: any;
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
  const categories = data && data.length > 0 ? data : [];

  if (categories.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 80, damping: 15 },
    },
  };

  return (
    <section id="skills" className="py-24 px-6 max-w-7xl mx-auto relative select-none">
      {/* Section Header */}
      <div className="text-center space-y-4 mb-20">
        <span className="text-sm font-semibold tracking-widest text-secondary uppercase">
          Expertise
        </span>
        <h2 className="font-display font-bold text-3xl md:text-5xl">
          Core Capabilities
        </h2>
        <div className="w-12 h-1 bg-gradient-to-r from-secondary to-accent rounded-full mx-auto" />
      </div>

      {/* Skills Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10% 0px' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {categories.map((category, catIdx) => {
          const Icon = getIconComponent(category.icon);
          return (
            <motion.div
              key={catIdx}
              variants={cardVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden group hover:border-accent/40 transition-all duration-500 hover:shadow-[0_0_25px_rgba(108,99,255,0.15)]"
            >
              {/* Background Accent Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Top Row: Icon + Title */}
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-accent group-hover:text-secondary group-hover:border-secondary/30 transition-all duration-500 text-xl">
                  <Icon />
                </div>
                <h3 className="font-display font-bold text-xl text-white group-hover:text-glow transition-all duration-300">
                  {category.title}
                </h3>
              </div>

              {/* Progress bars list */}
              <div className="space-y-6 relative z-10">
                {category.skills?.map((skill, skillIdx) => (
                  <div key={skillIdx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
                        {skill.name}
                      </span>
                      <span className="text-secondary font-mono font-semibold">
                        {skill.level}%
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden p-0.5 border border-white/[0.02]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-accent via-secondary to-accent rounded-full shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
