import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaAward, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { type Certificate } from '../constants';

interface CertificatesProps {
  data?: Certificate[];
}

export default function Certificates({ data }: CertificatesProps) {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
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
    <section id="certificates" className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 md:py-16 scroll-mt-20 relative select-none overflow-hidden bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-10 md:mb-12">
          <span className="text-sm font-semibold tracking-widest text-accent uppercase">
            Verifications
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl">
            Certifications
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-accent to-secondary rounded-full" />
        </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10% 0px' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {certs.map((cert, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            onClick={() => setSelectedCert(cert)}
            className="glass-panel p-6 sm:p-8 rounded-3xl cursor-pointer group hover:border-secondary/40 hover:shadow-[0_0_25px_rgba(0,229,255,0.1)] transition-all duration-500 flex flex-col justify-between items-start text-left relative overflow-hidden"
          >
            {/* Background vector glow */}
            <div className="absolute -right-12 -top-12 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/15 transition-all duration-500" />

            <div className="space-y-6 w-full relative z-10">
              {/* Badge Icon */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-secondary group-hover:text-accent group-hover:border-accent/30 transition-all duration-500 w-fit text-2xl">
                <FaAward />
              </div>

              {/* Text info */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-mono">
                  {cert.organization}
                </span>
                <h3 className="font-display font-bold text-lg text-white group-hover:text-glow-secondary transition-all duration-300 leading-snug">
                  {cert.title}
                </h3>
              </div>
            </div>

            {/* Card Footer (Date) */}
            <div className="w-full flex items-center justify-between mt-8 pt-4 border-t border-white/[0.06] text-xs font-mono text-gray-400 relative z-10">
              <span>{cert.date}</span>
              <span className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 font-sans font-semibold">
                View Credentials <FaExternalLinkAlt className="text-[10px]" />
              </span>
            </div>
          </motion.div>
        ))}
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
              onClick={() => setSelectedCert(null)}
              className="absolute inset-0 bg-bg-dark/80 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 md:p-10 text-center overflow-hidden z-10 shadow-[0_0_50px_rgba(108,99,255,0.2)]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCert(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors duration-300 text-lg cursor-pointer"
                aria-label="Close Modal"
              >
                <FaTimes />
              </button>

              {/* Dynamic Styled Vector Certificate */}
              <div className="border-2 border-double border-accent/20 rounded-2xl p-6 md:p-8 bg-gradient-to-br from-white/[0.01] to-white/[0.03] space-y-8 relative overflow-hidden">
                {/* Certificate Glow */}
                <div className="absolute inset-0 bg-radial from-accent/5 to-transparent blur-3xl" />
                
                <div className="relative space-y-6">
                  <div className="flex justify-center text-5xl text-accent">
                    <FaAward className="animate-pulse" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
                      Certificate of Achievement
                    </span>
                    <h3 className="font-display font-black text-2xl md:text-3xl text-white">
                      {selectedCert.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-300 font-light max-w-md mx-auto leading-relaxed">
                    This document certifies that the individual has successfully completed all coursework, assignments, and examinations required by the issuing organization.
                  </p>

                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4 text-xs font-mono text-gray-400">
                    <div className="border-r border-white/[0.06] pr-2">
                      <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Organization</span>
                      <span className="text-white font-sans font-semibold">{selectedCert.organization}</span>
                    </div>
                    <div className="pl-2">
                      <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Issue Date</span>
                      <span className="text-white font-sans font-semibold">{selectedCert.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                {selectedCert.credentialUrl && selectedCert.credentialUrl !== '#' && (
                  <a
                    href={selectedCert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accent to-secondary text-bg-dark font-bold tracking-wider hover:shadow-[0_0_15px_rgba(108,99,255,0.3)] transition-all duration-300 text-sm"
                  >
                    Verify Credential
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedCert(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.01] text-gray-300 hover:text-white font-semibold text-sm transition-all duration-300 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
