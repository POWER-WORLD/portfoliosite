import { motion } from 'framer-motion';
import { SKILL_CATEGORIES } from '../constants';
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
  const categories = data && data.length > 0 ? data : SKILL_CATEGORIES;

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
              className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-accent/40 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Top Row: Icon + Title */}
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-accent group-hover:text-secondary group-hover:border-secondary/30 transition-all duration-500 text-xl">
                  <Icon />
                </div>
                <h3 className="font-display font-bold text-xl text-white group-hover:text-glow transition-all duration-300">
                  {category.title}
                </h3>
              </div>

              {/* Progress bars list */}
              <div className="space-y-6">
                {category.skills.map((skill, skillIdx) => (
                  <div key={skillIdx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
                        {skill.name}
                      </span>
                      <span className="text-secondary font-mono">
                        {skill.level}%
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-accent to-secondary rounded-full"
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

