import React from 'react';
import { FaUserShield, FaExternalLinkAlt } from 'react-icons/fa';
import type { PersonalInfo } from '../constants';

interface FooterProps {
  /** personalInfo from MongoDB passed down from App.tsx */
  personalInfo?: Partial<PersonalInfo>;
}

export default function Footer({ personalInfo }: FooterProps) {
  // All content comes from the DB; degrade gracefully if backend is offline
  const profileName = personalInfo?.name ?? '';
  const firstName = profileName
    ? profileName.trim().split(/\s+/)[0].toUpperCase()
    : 'PAWAN';

  const currentYear = new Date().getFullYear();

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    const event = new CustomEvent('trigger-blackhole-transit', {
      detail: { targetScrollY: 0 },
      cancelable: true,
    });
    const handled = !window.dispatchEvent(event);
    if (!handled) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full border-t border-white/[0.06] bg-bg-dark/40 backdrop-blur-md relative select-none z-10 py-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Animated logo signature */}
        <a
          href="#home"
          onClick={handleScrollToTop}
          className="font-display font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-accent via-secondary to-accent bg-[length:200%_auto] animate-[shimmer_4s_linear_infinite] hover:scale-105 transition-all duration-300 select-none cursor-pointer"
        >
          {firstName}<span className="text-white">.</span>INFO
        </a>

        {/* Copyright notice — uses DB name; shows firstName if name not yet loaded */}
        <p className="text-xs text-gray-500 font-medium tracking-wide text-center">
          &copy; {currentYear}{' '}
          {profileName || `${firstName}KUMAR`}. All Rights Reserved.{' '}
          Built with love by {firstName}KUMAR<span className="text-white">.</span>INFO.
        </p>

        {/* Admin Portal link */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://pawankumar123admin.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Access Admin Portal"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/30 bg-secondary/5 text-secondary hover:text-white hover:bg-secondary/20 hover:border-secondary hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all duration-300 text-xs font-semibold tracking-wide cursor-pointer group"
          >
            <FaUserShield className="text-sm group-hover:scale-110 transition-transform duration-300" />
            <span>Admin Portal</span>
            <FaExternalLinkAlt className="text-[10px] text-secondary/70 group-hover:text-white transition-colors duration-300" />
          </a>
        </div>
      </div>
    </footer>
  );
}
