import { useState } from 'react';
import { Code, Github, ExternalLink } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  category: 'Fullstack' | 'Frontend' | 'Backend';
  tags: string[];
  githubUrl: string;
  demoUrl: string;
}

export default function ProjectsSection() {
  const [projectFilter, setProjectFilter] = useState<'All' | 'Fullstack' | 'Frontend' | 'Backend'>('All');

  const projects: Project[] = [
    {
      title: "OmniTask AI",
      description: "Next-generation collaborative task management system integrated with LLM agents to automatically schedule and prioritize team milestones based on developer logs.",
      category: "Fullstack",
      tags: ["React", "Node.js", "Express", "MongoDB", "OpenAI API"],
      githubUrl: "https://github.com",
      demoUrl: "https://example.com"
    },
    {
      title: "GlassyUI Component Library",
      description: "A premium open-source React component library crafted with high-performance CSS and glassmorphic designs to help developers build premium web apps quickly.",
      category: "Frontend",
      tags: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
      githubUrl: "https://github.com",
      demoUrl: "https://example.com"
    },
    {
      title: "LogTelemetry Core API",
      description: "A lightweight, secure, and blazing fast request logging and telemetry microservice capable of ingestion rates of 10k requests per second using raw web sockets.",
      category: "Backend",
      tags: ["Node.js", "TypeScript", "Prisma", "PostgreSQL", "Redis"],
      githubUrl: "https://github.com",
      demoUrl: "https://example.com"
    }
  ];

  const filteredProjects = projectFilter === 'All' 
    ? projects 
    : projects.filter(p => p.category === projectFilter);

  return (
    <section id="projects" className="scroll-mt-28 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-center md:text-left">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
            <Code className="w-7 h-7 text-sky-400" />
            Featured Projects
          </h2>
          <p className="text-slate-400 mt-2">A curated list of design systems, API services, and complete products.</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex justify-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm self-center md:self-end">
          {(['All', 'Fullstack', 'Frontend', 'Backend'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setProjectFilter(tab)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                projectFilter === tab 
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                  : 'text-slate-400 hover:text-sky-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.title} className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-sky-300 bg-sky-950/40 border border-sky-500/30 rounded-full">
                  {project.category}
                </span>
                <div className="flex items-center gap-2">
                  <a 
                    href={project.githubUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-1.5 hover:bg-sky-950/30 rounded-lg text-slate-300 hover:text-sky-400 transition"
                    title="View Source"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a 
                    href={project.demoUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-1.5 hover:bg-sky-950/30 rounded-lg text-slate-300 hover:text-sky-400 transition"
                    title="Live Preview"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 leading-snug">{project.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">{project.description}</p>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 text-[11px] font-mono font-medium text-slate-400 bg-white/5 border border-white/10 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
