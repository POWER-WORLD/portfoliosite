import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface CounterProps {
  value: number;
  duration?: number;
}

function Counter({ value, duration = 1500 }: CounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [hasStarted, value, duration]);

  return <span ref={elementRef}>{count}</span>;
}

interface StatItem {
  value: number;
  label: string;
  suffix: string;
}

interface AchievementsProps {
  data?: StatItem[];
}

export default function Achievements({ data }: AchievementsProps) {
  const stats = data && data.length > 0 ? data : [];

  if (stats.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 90, damping: 15 },
    },
  };

  return (
    <section id="achievements" className="w-full py-10 md:py-14 scroll-mt-20 relative select-none overflow-hidden bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Container grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-center items-center"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
              className="glass-panel p-6 sm:p-8 rounded-3xl text-center flex flex-col items-center justify-center relative overflow-hidden group hover:border-accent/40 transition-all duration-500 hover:shadow-[0_0_25px_rgba(108,99,255,0.15)]"
            >
              {/* Soft backdrop blur spot */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

              {/* Counter value */}
              <div className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white tracking-tight flex items-center justify-center">
                <Counter value={stat.value} />
                <span className="text-secondary group-hover:text-glow-secondary transition-all duration-300">
                  {stat.suffix}
                </span>
              </div>

              {/* Sub text label */}
              <span className="text-xs md:text-sm text-gray-400 uppercase tracking-widest font-bold mt-3 max-w-[150px] leading-relaxed">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
