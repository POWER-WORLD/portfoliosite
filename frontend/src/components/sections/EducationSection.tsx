
import { GraduationCap, BookOpen } from 'lucide-react';

interface Education {
  degree: string;
  school: string;
  duration: string;
  description: string;
  grade: string;
}

export default function EducationSection() {
  const educationList: Education[] = [
    {
      degree: "Master of Science in Computer Science",
      school: "Stanford University",
      duration: "2023 - 2025",
      description: "Distributed Systems focus. Completed advanced coursework in Machine Learning, Web Scale Systems, and Human-Computer Interaction.",
      grade: "GPA: 3.92/4.0"
    },
    {
      degree: "Bachelor of Technology in Software Engineering",
      school: "Massachusetts Institute of Technology (MIT)",
      duration: "2019 - 2023",
      description: "Acquired a solid foundation in computer architecture, database management, software development principles, and advanced algorithms.",
      grade: "GPA: 3.88/4.0"
    }
  ];

  return (
    <section id="education" className="scroll-mt-28 flex flex-col gap-8">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
          <GraduationCap className="w-7 h-7 text-sky-400" />
          Education History
        </h2>
        <p className="text-slate-400 mt-2">Academic background and research foundations.</p>
      </div>

      <div className="relative border-l border-sky-500/20 ml-4 md:ml-6 flex flex-col gap-10">
        {educationList.map((edu, idx) => (
          <div key={idx} className="relative pl-8 md:pl-10 group">
            
            {/* Timeline node */}
            <div className="absolute -left-3 top-1.5 w-6 h-6 rounded-full bg-slate-950 border-2 border-sky-400 flex items-center justify-center shadow-sm group-hover:border-sky-500 transition-colors">
              <BookOpen className="w-3 h-3 text-sky-400 group-hover:text-sky-300" />
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">{edu.degree}</h3>
                  <p className="text-sm text-sky-400 font-semibold">{edu.school}</p>
                </div>
                <div className="flex flex-col md:items-end">
                  <span className="px-3 py-1 text-xs font-bold text-sky-300 bg-sky-950/40 border border-sky-500/20 rounded-full w-fit">
                    {edu.duration}
                  </span>
                  <span className="text-xs text-slate-400 font-mono mt-1">{edu.grade}</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{edu.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
