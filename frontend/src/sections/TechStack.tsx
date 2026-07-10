import { motion } from 'framer-motion';
import { TECH_STACK_ICONS } from '../constants';
import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiMongodb,
  SiNextdotjs,
  SiTailwindcss,
  SiFramer,
  SiGraphql,
  SiDocker,
  SiGit,
  SiGithub,
  SiPython,
  SiPostgresql,
  SiMysql,
  SiRedis,
  SiFirebase,
  SiSupabase,
  SiFigma,
  SiCodeclimate
} from 'react-icons/si';
import { FaCode, FaAws } from 'react-icons/fa';
import SectionHeader from '../components/SectionHeader';

interface TechItem {
  _id?: string;
  name: string;
  icon?: string;
  color: string;
}

interface TechStackProps {
  data?: TechItem[];
}

// Static lookup map to enable tree-shaking on react-icons
const IconMap: Record<string, any> = {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiMongodb,
  SiNextdotjs,
  SiTailwindcss,
  SiFramermotion: SiFramer, // Map to correct existing SimpleIcon
  SiGraphql,
  SiDocker,
  SiGit,
  SiGithub,
  SiPython,
  SiPostgresql,
  SiMysql,
  SiRedis,
  SiAmazonaws: FaAws, // Map to correct existing SimpleIcon
  SiFirebase,
  SiSupabase,
  SiFigma,
  SiCodeclimate,
  FaCode
};

function getIconComponent(iconName: string) {
  const IconComponent = IconMap[iconName];
  return IconComponent || FaCode;
}

export default function TechStack({ data }: TechStackProps) {
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

  // Fallback to static mock constants if database has no records or backend is offline
  const techItems: TechItem[] = data && data.length > 0 
    ? data 
    : (TECH_STACK_ICONS.map(t => ({
        name: t.name,
        color: t.color,
        icon: t.name === 'React' ? 'SiReact' :
              t.name === 'TypeScript' ? 'SiTypescript' :
              t.name === 'Node.js' ? 'SiNodedotjs' :
              t.name === 'MongoDB' ? 'SiMongodb' :
              t.name === 'Next.js' ? 'SiNextdotjs' :
              t.name === 'Tailwind CSS' ? 'SiTailwindcss' :
              t.name === 'Framer Motion' ? 'SiFramermotion' :
              t.name === 'GraphQL' ? 'SiGraphql' :
              t.name === 'Docker' ? 'SiDocker' : 'SiGit'
      })) as TechItem[]);

  return (
    <section id="techstack" className="w-full py-8 md:py-12 scroll-mt-20 relative select-none overflow-hidden bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Ecosystem"
          title="Technologies & Tools"
          highlightText="Tools"
          badgeColor="secondary"
        />

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px' }}
          className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto"
        >
          {techItems.map((tech, idx) => {
            // Randomized floating variables
            const randomDuration = 3 + Math.random() * 2; // 3 to 5s
            const randomDelay = Math.random() * 2;       // 0 to 2s
            const Icon = getIconComponent(tech.icon || 'FaCode');
            
            return (
              <motion.div
                key={tech._id || idx}
                variants={itemVariants}
              >
                <motion.div
                  whileInView={{
                    y: [0, -8, 0],
                  }}
                  viewport={{ once: false }}
                  transition={{
                    duration: randomDuration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: randomDelay,
                  }}
                  className="glass-panel px-6 py-3 rounded-full flex items-center justify-center gap-2.5 group hover:border-accent/40 hover:shadow-[0_0_20px_rgba(108,99,255,0.18)] transition-all duration-300 cursor-default"
                >
                  {/* Brand Logo Icon with Glow */}
                  <Icon
                    style={{
                      color: tech.color,
                      filter: `drop-shadow(0 0 4px ${tech.color}66)`
                    }}
                    className="text-lg group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="text-sm font-semibold tracking-wide text-gray-300 group-hover:text-white transition-colors duration-300">
                    {tech.name}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

