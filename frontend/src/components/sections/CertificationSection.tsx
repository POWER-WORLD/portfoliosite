
import { Award } from 'lucide-react';

interface Certification {
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  skills: string[];
}

export default function CertificationSection() {
  const certifications: Certification[] = [
    {
      title: "AWS Certified Solutions Architect - Associate",
      issuer: "Amazon Web Services",
      date: "Dec 2025",
      credentialId: "AWS-ASA-9981",
      skills: ["Cloud Architecture", "EC2", "S3", "Serverless", "IAM"]
    },
    {
      title: "Google Cloud Associate Cloud Engineer",
      issuer: "Google Cloud",
      date: "Sep 2025",
      credentialId: "GCP-ACE-4412",
      skills: ["Kubernetes", "Compute Engine", "GCP IAM", "Cloud Spanner"]
    },
    {
      title: "Advanced React & Frontend Architecture",
      issuer: "Meta Certification",
      date: "Jun 2024",
      credentialId: "META-ADV-REACT-77",
      skills: ["React 18", "State Management", "Performance Optimization", "Webpack"]
    }
  ];

  return (
    <section id="certification" className="scroll-mt-28 flex flex-col gap-8">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
          <Award className="w-7 h-7 text-sky-400" />
          Certifications & Badges
        </h2>
        <p className="text-slate-400 mt-2">Verified professional credentials and technical achievements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {certifications.map((cert) => (
          <div key={cert.title} className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 bg-sky-950/30 border border-sky-500/20 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 leading-snug">{cert.title}</h3>
              <p className="text-sm text-sky-300 font-semibold mb-2">{cert.issuer}</p>
              <p className="text-xs text-slate-400 font-mono mb-4">ID: {cert.credentialId}</p>
            </div>
            
            <div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {cert.skills.map((skill) => (
                  <span key={skill} className="px-2 py-1 text-[10px] font-bold text-sky-300 bg-sky-950/20 border border-sky-500/10 rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="text-xs text-slate-400 font-medium">Issued {cert.date}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
