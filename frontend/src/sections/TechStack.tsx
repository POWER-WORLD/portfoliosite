import { useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
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
  SiCodeclimate,
} from 'react-icons/si';
import { FaCode, FaAws } from 'react-icons/fa';
import SectionHeader from '../components/SectionHeader';

/* ─────────── Types ─────────── */
interface TechItem {
  _id?: string;
  name: string;
  icon?: string;
  color: string;
}

interface TechStackProps {
  data?: TechItem[];
}

/* ─────────── Icon Registry ─────────── */
const IconMap: Record<string, React.ComponentType<{ style?: React.CSSProperties; className?: string }>> = {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiMongodb,
  SiNextdotjs,
  SiTailwindcss,
  SiFramermotion: SiFramer,
  SiGraphql,
  SiDocker,
  SiGit,
  SiGithub,
  SiPython,
  SiPostgresql,
  SiMysql,
  SiRedis,
  SiAmazonaws: FaAws,
  SiFirebase,
  SiSupabase,
  SiFigma,
  SiCodeclimate,
  FaCode,
};

function getIcon(iconName: string) {
  return IconMap[iconName] || FaCode;
}

/* ─────────── Sub-components ─────────── */

/**
 * A single tech pill rendered inside a marquee track.
 *
 * Note: `.tech-pill` hover border/shadow/icon-filter rules in index.css use
 * `color-mix(in srgb, var(--pill-color) …)` — that CSS function cannot be
 * expressed as a Tailwind arbitrary value, so those four rules live in
 * index.css under the "TechStack" section.  Everything else is pure Tailwind.
 */
function TechPill({ tech }: { tech: TechItem }) {
  const Icon = getIcon(tech.icon || 'FaCode');

  return (
    <div
      // `tech-pill` provides the color-mix hover styles from index.css
      className="tech-pill group relative inline-flex items-center gap-2.5 px-[1.1rem] py-[0.55rem] mx-2 rounded-full bg-white/[0.028] border border-white/[0.07] backdrop-blur-[16px] cursor-default whitespace-nowrap transition-[background,border-color,box-shadow,transform] duration-[350ms] ease-[ease] overflow-hidden hover:bg-white/[0.055] hover:-translate-y-[3px] hover:scale-[1.04]"
      style={{ '--pill-color': tech.color } as React.CSSProperties}
    >
      {/* Shimmer sweep — slides across on hover */}
      <span
        className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.09)_50%,transparent_70%)] [background-size:200%_100%] [background-position:200%_0] group-hover:[background-position:-200%_0] transition-[background-position] duration-[550ms] ease-[ease] pointer-events-none"
        aria-hidden
      />

      {/* Icon + bloom glow */}
      <span className="relative flex items-center justify-center flex-shrink-0" aria-hidden>
        {/* `tech-pill__icon` filter rules in index.css handle color-mix drop-shadow */}
        <Icon
          className="tech-pill__icon text-[1.05rem] relative z-[1] transition-[filter,transform] duration-[350ms] ease-[ease] group-hover:scale-[1.18] group-hover:-rotate-[5deg]"
          style={{ color: tech.color }}
        />
        {/* Bloom ring */}
        <span
          className="absolute inset-[-4px] rounded-full opacity-0 blur-[8px] transition-opacity duration-[350ms] ease-[ease] group-hover:opacity-25"
          style={{ background: tech.color }}
        />
      </span>

      {/* Label */}
      <span className="text-[0.8rem] font-semibold tracking-[0.04em] text-white/70 transition-colors duration-300 font-sans group-hover:text-white">
        {tech.name}
      </span>
    </div>
  );
}

/** One infinite-scrolling marquee row */
function MarqueeRow({
  items,
  reverse = false,
  speed = 40,
}: {
  items: TechItem[];
  reverse?: boolean;
  speed?: number;
}) {
  const doubled = [...items, ...items];

  return (
    // Edge-fade mask + hover-pause class (pauses animation on hover via index.css)
    <div className="hover-pause w-full overflow-hidden py-[0.6rem] [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]">
      {/* `animate-scroll-left/right` speed is overridden by `--marquee-speed` in index.css */}
      <div
        className={`flex w-max ${reverse ? 'animate-scroll-right' : 'animate-scroll-left'}`}
        style={{ '--marquee-speed': `${speed}s` } as React.CSSProperties}
      >
        {doubled.map((tech, idx) => (
          <TechPill key={`${tech._id ?? tech.name}-${idx}`} tech={tech} />
        ))}
      </div>
    </div>
  );
}

/* ─────────── Ambient orbs ─────────── */
function AmbientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Left purple orb */}
      <div className="absolute rounded-full blur-[80px] pointer-events-none w-[340px] h-[340px] left-[-80px] top-[10%] bg-[radial-gradient(circle,rgba(108,99,255,0.18)_0%,transparent_70%)] animate-drift-slow" />
      {/* Right cyan orb */}
      <div className="absolute rounded-full blur-[80px] pointer-events-none w-[280px] h-[280px] right-[-60px] bottom-[5%] bg-[radial-gradient(circle,rgba(0,229,255,0.15)_0%,transparent_70%)] animate-drift-slow-reverse" />
      {/* Center ellipse */}
      <div className="absolute rounded-full blur-[80px] pointer-events-none w-[420px] h-[160px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(108,99,255,0.06)_0%,transparent_70%)]" />
    </div>
  );
}

/* ─────────── Stat bar ─────────── */
function StatBar({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="flex items-center justify-center gap-3 mb-8"
    >
      <div className="h-px w-[60px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
      <span className="text-[0.72rem] tracking-[0.12em] uppercase text-white/35 font-mono whitespace-nowrap">
        <span className="text-[#00e5ff] font-bold [text-shadow:0_0_8px_rgba(0,229,255,0.5)]">
          {count}
        </span>{' '}
        technologies mastered
      </span>
      <div className="h-px w-[60px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
    </motion.div>
  );
}

/* ─────────── Main Export ─────────── */
export default function TechStack({ data }: TechStackProps) {
  const techItems: TechItem[] = data && data.length > 0 ? data : [];
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10% 0px' });

  const [rowA, rowB] = useMemo(() => {
    const mid = Math.ceil(techItems.length / 2);
    return [techItems.slice(0, mid), techItems.slice(mid)];
  }, [techItems]);

  if (techItems.length === 0) return null;

  return (
    <section
      id="techstack"
      ref={sectionRef}
      className="w-full py-10 md:py-16 scroll-mt-20 relative select-none overflow-hidden bg-transparent"
    >
      {/* Ambient background */}
      <AmbientOrbs />

      {/* Dot-grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none [background-image:linear-gradient(rgba(108,99,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(108,99,255,0.04)_1px,transparent_1px)] [background-size:50px_50px] [mask-image:radial-gradient(ellipse_80%_60%_at_center,black_30%,transparent_80%)] [-webkit-mask-image:radial-gradient(ellipse_80%_60%_at_center,black_30%,transparent_80%)]"
        aria-hidden
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badgeText="Ecosystem"
          title="Technologies & Tools"
          highlightText="Tools"
          badgeColor="secondary"
        />

        <StatBar count={techItems.length} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative space-y-3"
        >
          {/* Top rule */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'left' }}
            className="h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent mb-4"
          />

          {rowA.length > 0 && <MarqueeRow items={rowA} reverse={false} speed={38} />}
          {rowB.length > 0 && <MarqueeRow items={rowB} reverse={true} speed={44} />}

          {/* Bottom rule */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'right' }}
            className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent mt-4"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-8 text-xs tracking-widest uppercase font-mono text-white/20"
        >
          hover to pause · continuous learning
        </motion.p>
      </div>
    </section>
  );
}
