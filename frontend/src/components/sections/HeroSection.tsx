

interface HeroSectionProps {
  onNavClick: (sectionId: string) => void;
}

export default function HeroSection({ onNavClick }: HeroSectionProps) {
  const skills = [
    "React", "TypeScript", "Node.js", "Express", "MongoDB", 
    "Prisma", "AWS", "Google Cloud", "Tailwind CSS", "Docker", "REST APIs"
  ];

  return (
    <section id="home" className="py-12 md:py-24 flex flex-col items-center text-center gap-6">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-sky-950/40 border border-sky-500/20 text-sky-300 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
        Available for new opportunities
      </div>
      
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
        Hi, I'm <span className="text-gradient-sky glow-text-sky">Aura Dev</span>
        <br />
        Full-Stack Software Engineer
      </h1>

      <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
        I craft visually stunning, highly interactive, and functionally robust web applications. Specializing in the React ecosystem, cloud infrastructure, and modern backend services.
      </p>

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <button 
          onClick={() => onNavClick('projects')} 
          className="glass-btn-primary px-8 py-3 rounded-xl shadow-lg cursor-pointer"
        >
          View My Work
        </button>
        <button 
          onClick={() => onNavClick('contact')} 
          className="glass-btn px-8 py-3 rounded-xl cursor-pointer"
        >
          Get in Touch
        </button>
      </div>

      {/* Core Skills Badges */}
      <div className="mt-16 w-full max-w-4xl">
        <h3 className="text-xs font-bold text-sky-400/80 uppercase tracking-widest mb-6">Expertise Stack</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((skill) => (
            <span 
              key={skill} 
              className="px-4 py-2 text-sm font-semibold text-slate-200 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm shadow-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
