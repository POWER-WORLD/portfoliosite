import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaAward, 
  FaCertificate, 
  FaMedal, 
  FaGraduationCap, 
  FaTrophy, 
  FaRibbon, 
  FaExternalLinkAlt, 
  FaTimes, 
  FaExpand, 
  FaCheckCircle, 
  FaShieldAlt 
} from 'react-icons/fa';
import { type Certificate } from '../constants';

interface CertificatesProps {
  data?: Certificate[];
}

const CERT_ICON_TYPES = [
  { icon: FaAward, color: 'text-accent', bg: 'from-accent/20 to-purple-500/10 border-accent/40' },
  { icon: FaCertificate, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/10 border-cyan-400/40' },
  { icon: FaMedal, color: 'text-amber-400', bg: 'from-amber-500/20 to-orange-500/10 border-amber-400/40' },
  { icon: FaGraduationCap, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/10 border-emerald-400/40' },
  { icon: FaTrophy, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-amber-500/10 border-yellow-400/40' },
  { icon: FaRibbon, color: 'text-rose-400', bg: 'from-rose-500/20 to-pink-500/10 border-rose-400/40' },
];

export default function Certificates({ data }: CertificatesProps) {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const certs = data && data.length > 0 ? data : [];

  if (certs.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { y: 35, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 90, damping: 15 },
    },
  };

  return (
    <section id="certificates" className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 md:py-20 scroll-mt-20 relative select-none overflow-hidden bg-transparent">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-accent text-xs font-semibold uppercase tracking-widest backdrop-blur-md shadow-inner">
            <FaShieldAlt className="text-accent text-xs animate-pulse" /> Verified Credentials
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white">
            Certifications & <span className="bg-gradient-to-r from-accent via-cyan-400 to-secondary bg-clip-text text-transparent">Accomplishments</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-accent via-secondary to-purple-500 rounded-full" />
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {certs.map((cert, idx) => {
            const iconConfig = CERT_ICON_TYPES[idx % CERT_ICON_TYPES.length];
            const IconComponent = iconConfig.icon;

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                onClick={() => setSelectedCert(cert)}
                className="group relative rounded-3xl cursor-pointer p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent hover:from-accent/50 hover:via-secondary/40 hover:to-accent/20 transition-all duration-500"
              >
                <div className="bg-transparent p-6 sm:p-8 rounded-[23px] h-full flex flex-col justify-between items-start text-left relative overflow-hidden border border-white/10">
  
  <div className="space-y-6 w-full relative z-10">
    {/* Header Row: Static Transparent Badges */}
    <div className="flex items-center justify-between w-full">
      <div className={`p-3.5 rounded-2xl bg-transparent border ${iconConfig.color} w-fit text-2xl`}>
        <IconComponent />
      </div>
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-transparent border border-emerald-500/40 text-[10px] font-semibold text-emerald-400 font-mono">
        <FaCheckCircle className="text-[9px]" /> Verified
      </span>
    </div>

    {/* Text Info */}
    <div className="space-y-2">
      <span className="text-[11px] font-bold tracking-widest text-secondary uppercase font-mono bg-transparent px-2.5 py-0.5 rounded-md border border-secondary/40 inline-block">
        {cert.organization}
      </span>
      <h3 className="font-display font-bold text-lg text-white leading-snug">
        {cert.title}
      </h3>
    </div>
  </div>

  {/* Card Footer */}
  <div className="w-full flex items-center justify-between mt-8 pt-4 border-t border-white/10 text-xs font-mono text-gray-400 relative z-10">
    <span className="text-gray-400 font-mono text-[11px]">{cert.date}</span>
    <span className="text-cyan-400 flex items-center gap-1.5 font-sans font-semibold cursor-pointer">
      View Credentials <FaExternalLinkAlt className="text-[10px]" />
    </span>
  </div>
  
</div>


              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop filter blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedCert(null);
                setIsImageExpanded(false);
              }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-xl cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 25 }}
              transition={{ type: 'spring' as const, stiffness: 320, damping: 26 }}
              className="relative w-full max-w-3xl glass-panel rounded-3xl p-1 bg-gradient-to-b from-accent/40 via-secondary/20 to-purple-500/30 overflow-hidden z-10 shadow-[0_0_80px_rgba(108,99,255,0.3)] max-h-[90vh] flex flex-col"
            >
              <div className="bg-slate-950/90 rounded-[23px] p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden">
                {/* Radial Glow Inside Modal */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-secondary/15 blur-3xl pointer-events-none rounded-full" />

                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedCert(null);
                    setIsImageExpanded(false);
                  }}
                  className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors duration-300 text-base cursor-pointer z-20 p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 shadow-lg"
                  aria-label="Close Modal"
                >
                  <FaTimes />
                </button>

                <div className="overflow-y-auto pr-1 my-auto space-y-6 custom-scrollbar relative z-10">
                  {selectedCert.imageUrl ? (
                    /* Uploaded Certificate View */
                    <div className="space-y-5 pt-1">
                      {/* Document Frame */}
                      <div className="relative group rounded-2xl overflow-hidden border border-white/15 bg-slate-900/90 p-2 shadow-2xl">
                        {/* Decorative Top Viewer Header */}
                        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-white/[0.03] rounded-lg border border-white/5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <FaShieldAlt className="text-emerald-400 text-[10px]" /> Verified Document
                          </span>
                        </div>

                        <div className="relative overflow-hidden rounded-xl bg-black/60 flex items-center justify-center min-h-[220px]">
                          <img
                            src={selectedCert.imageUrl}
                            alt={selectedCert.title}
                            className="w-full max-h-[45vh] object-contain rounded-xl mx-auto cursor-zoom-in group-hover:scale-[1.01] transition-transform duration-300"
                            onClick={() => setIsImageExpanded(true)}
                          />

                          {/* Hover Zoom Banner */}
                          <button
                            onClick={() => setIsImageExpanded(true)}
                            className="absolute bottom-4 right-4 bg-slate-900/90 hover:bg-accent text-white text-xs px-3.5 py-2 rounded-xl border border-white/20 opacity-90 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 backdrop-blur-md cursor-pointer shadow-xl"
                          >
                            <FaExpand className="text-[11px]" /> Click for full screen
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-center">
                        <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase font-mono bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 inline-block">
                          {selectedCert.organization} &bull; {selectedCert.date}
                        </span>
                        <h3 className="font-display font-bold text-xl md:text-2xl text-white">
                          {selectedCert.title}
                        </h3>
                      </div>
                    </div>
                  ) : (
                    /* Dynamic Styled Vector Certificate Fallback */
                    <div className="border-2 border-double border-accent/30 rounded-2xl p-6 md:p-8 bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-slate-900/80 space-y-6 relative overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-radial from-accent/10 via-transparent to-transparent blur-3xl" />
                      
                      <div className="relative space-y-6">
                        <div className="flex justify-center">
                          <div className="p-4 rounded-full bg-gradient-to-tr from-accent/20 to-secondary/20 border border-accent/40 text-4xl text-accent shadow-xl">
                            <FaAward className="animate-pulse" />
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-center">
                          <span className="text-xs font-semibold tracking-widest text-secondary uppercase font-mono bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20 inline-block">
                            Certificate of Achievement
                          </span>
                          <h3 className="font-display font-extrabold text-2xl md:text-3xl text-white">
                            {selectedCert.title}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-300 font-light max-w-md mx-auto leading-relaxed text-center">
                          This document certifies that the individual has successfully completed all coursework, assignments, and examinations required by the issuing organization.
                        </p>

                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4 text-xs font-mono text-gray-400">
                          <div className="border-r border-white/10 pr-2 text-center">
                            <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Organization</span>
                            <span className="text-white font-sans font-semibold">{selectedCert.organization}</span>
                          </div>
                          <div className="pl-2 text-center">
                            <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Issue Date</span>
                            <span className="text-white font-sans font-semibold">{selectedCert.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 pt-4 border-t border-white/10 relative z-10">
                  {selectedCert.imageUrl && (
                    <a
                      href={selectedCert.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/10 text-cyan-300 hover:text-white font-semibold text-xs transition-all duration-300 shadow-md"
                    >
                      View Original Image <FaExternalLinkAlt className="text-[10px]" />
                    </a>
                  )}
                  {selectedCert.credentialUrl && selectedCert.credentialUrl !== '#' && (
                    <a
                      href={selectedCert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-accent via-cyan-400 to-secondary text-slate-950 font-bold tracking-wider hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs"
                    >
                      Verify Credential <FaExternalLinkAlt className="text-[10px]" />
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCert(null);
                      setIsImageExpanded(false);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-white/15 hover:border-white/30 bg-white/[0.03] text-gray-300 hover:text-white font-semibold text-xs transition-all duration-300 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox / Fullscreen Image Preview */}
      <AnimatePresence>
        {isImageExpanded && selectedCert?.imageUrl && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setIsImageExpanded(false)}
                className="absolute -top-12 right-0 text-white/80 hover:text-white text-xl p-2.5 cursor-pointer bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-colors"
                aria-label="Close Preview"
              >
                <FaTimes />
              </button>

              <div className="p-2 bg-slate-900/90 border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] max-w-full">
                <img
                  src={selectedCert.imageUrl}
                  alt={selectedCert.title}
                  className="max-w-full max-h-[78vh] object-contain rounded-xl"
                />
              </div>

              <div className="mt-4 flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 text-xs text-gray-300 font-medium backdrop-blur-md">
                <span className="text-cyan-400 font-bold">{selectedCert.title}</span>
                <span>&bull;</span>
                <span>{selectedCert.organization}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}


