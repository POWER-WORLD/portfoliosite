import { motion } from 'framer-motion';

interface SectionHeaderProps {
  badgeText?: string;
  badgeIcon?: React.ComponentType<{ className?: string }>;
  title: string;
  highlightText?: string;
  tagline?: string;
  align?: 'left' | 'center';
  badgeColor?: 'accent' | 'secondary';
  hideLine?: boolean;
}

export default function SectionHeader({
  badgeText,
  badgeIcon: BadgeIcon,
  title,
  highlightText,
  tagline,
  align = 'center',
  badgeColor = 'accent',
  hideLine = false,
}: SectionHeaderProps) {
  const isLeft = align === 'left';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  // Helper to highlight a portion of the text
  const renderTitle = () => {
    if (!highlightText) return title;

    const parts = title.split(highlightText);
    if (parts.length === 1) return title;

    return (
      <>
        {parts[0]}
        <span className="bg-gradient-to-r from-accent via-secondary to-white bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          {highlightText}
        </span>
        {parts.slice(1).join(highlightText)}
      </>
    );
  };

  const badgeColorClass =
    badgeColor === 'secondary'
      ? 'text-secondary border-secondary/20 bg-secondary/10 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
      : 'text-accent border-accent/20 bg-accent/10 shadow-[0_0_15px_rgba(108,99,255,0.1)]';

  const dotColorClass = badgeColor === 'secondary' ? 'bg-secondary' : 'bg-accent';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px' }}
      className={`flex flex-col ${isLeft ? 'items-start text-left' : 'items-center text-center'} space-y-4 mb-10 md:mb-12`}
    >
      {/* 1. Capsule Pill Badge */}
      {badgeText && (
        <motion.div variants={itemVariants} className="inline-block">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest border backdrop-blur-md uppercase font-mono ${badgeColorClass}`}
          >
            {BadgeIcon ? (
              <BadgeIcon className="text-xs animate-pulse" />
            ) : (
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColorClass}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColorClass}`}></span>
              </span>
            )}
            <span>{badgeText}</span>
          </div>
        </motion.div>
      )}

      {/* 2. Main Title */}
      <motion.h2
        variants={itemVariants}
        className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-white leading-tight"
      >
        {renderTitle()}
      </motion.h2>

      {/* 3. Gradient Accent Line */}
      {!hideLine && (
        <motion.div
          variants={itemVariants}
          className={`w-16 h-1.5 bg-gradient-to-r from-accent via-secondary to-accent/60 rounded-full ${isLeft ? 'mr-auto' : 'mx-auto'}`}
        />
      )}

      {/* 4. Description/Tagline */}
      {tagline && (
        <motion.p
          variants={itemVariants}
          className="text-gray-400 max-w-2xl text-sm sm:text-base leading-relaxed font-light mt-1"
        >
          {tagline}
        </motion.p>
      )}
    </motion.div>
  );
}
