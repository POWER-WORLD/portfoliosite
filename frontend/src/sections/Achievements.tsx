import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ACHIEVEMENTS_DATA } from '../constants';

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

export default function Achievements() {
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
    <section className="py-20 px-6 max-w-7xl mx-auto relative select-none">
      {/* Container grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10% 0px' }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-8 justify-center items-center"
      >
        {ACHIEVEMENTS_DATA.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center justify-center relative overflow-hidden group hover:border-accent/40 transition-all duration-500 hover:-translate-y-1"
          >
            {/* Soft backdrop blur spot */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />

            {/* Counter value */}
            <div className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white tracking-tight flex items-center justify-center">
              <Counter value={stat.value} />
              <span className="text-secondary group-hover:text-glow-secondary transition-all duration-300">
                {stat.suffix}
              </span>
            </div>

            {/* Sub text label */}
            <span className="text-xs md:text-sm text-gray-500 uppercase tracking-widest font-bold mt-3 max-w-[150px] leading-relaxed">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
