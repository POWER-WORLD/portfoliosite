import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle, FaLinkedin, FaGithub } from 'react-icons/fa';
import { PERSONAL_INFO } from '../constants';
import { submitContactMessage } from '../services/api';
import { sanitizeUrl } from '../utils/security';
import SectionHeader from '../components/SectionHeader';

interface ContactProps {
  personalInfo?: {
    email?: string;
    location?: string;
  };
}

export default function Contact({ personalInfo }: ContactProps) {
  const profile = personalInfo && (personalInfo.email || personalInfo.location) ? personalInfo : PERSONAL_INFO;

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!formState.name.trim()) tempErrors.name = 'Name is required';
    if (!formState.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      tempErrors.email = 'Invalid email address';
    }
    if (!formState.subject.trim()) tempErrors.subject = 'Subject is required';
    if (!formState.message.trim()) tempErrors.message = 'Message is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    // Clear error on type
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const success = await submitContactMessage(formState);
      if (success) {
        setIsSuccess(true);
        setFormState({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        setErrorMessage('Failed to transmit message. Please verify your connection.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 95, damping: 15 },
    },
  };

  return (
    <section id="contact" className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center py-8 md:py-12 scroll-mt-20 relative select-none overflow-hidden bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Get In Touch"
          title="Contact Me"
          highlightText="Me"
          badgeColor="accent"
        />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10% 0px' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch"
      >
        {/* Left Column: Personal info */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8 lg:space-y-12">
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="font-display font-bold text-2xl md:text-3xl">
                Let's construct something epic.
              </h3>
              <p className="text-gray-300 font-light leading-relaxed max-w-sm">
                Have a proposal, an opening, or want to discuss project architectures? Feel free to reach out.
              </p>
            </motion.div>

            {/* Info Items */}
            <div className="space-y-6">
              {profile.email && (
                <motion.div variants={itemVariants} className="flex items-center gap-4 group">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-accent group-hover:text-secondary group-hover:border-secondary/30 transition-all duration-300 text-lg">
                    <FaEnvelope />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Email</span>
                    <a href={sanitizeUrl(`mailto:${profile.email}`)} className="text-white hover:text-accent font-semibold transition-colors duration-300">
                      {profile.email}
                    </a>
                  </div>
                </motion.div>
              )}

              {profile.location && (
                <motion.div variants={itemVariants} className="flex items-center gap-4 group">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-secondary group-hover:text-accent group-hover:border-accent/30 transition-all duration-300 text-lg">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Location</span>
                    <span className="text-white font-semibold">{profile.location}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Social icons */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 pt-4">
            <a
              href={sanitizeUrl('https://github.com')}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-accent/40 hover:text-accent hover:shadow-[0_0_15px_rgba(108,99,255,0.2)] text-gray-400 hover:text-white transition-all duration-300 text-xl"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>
            <a
              href={sanitizeUrl('https://linkedin.com')}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-secondary/40 hover:text-secondary hover:shadow-[0_0_15px_rgba(0,229,255,0.2)] text-gray-400 hover:text-white transition-all duration-300 text-xl"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
          </motion.div>
        </div>

        {/* Right Column: Glassmorphic form */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-7 glass-panel p-6 sm:p-8 md:p-10 rounded-3xl relative overflow-hidden"
        >
          {/* Subtle decoration blur */}
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/[0.02] border focus:bg-white/[0.04] text-white focus:outline-none transition-all duration-300 ${
                    errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent focus:shadow-[0_0_12px_rgba(108,99,255,0.2)]'
                  }`}
                  placeholder="Your Name"
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/[0.02] border focus:bg-white/[0.04] text-white focus:outline-none transition-all duration-300 ${
                    errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent focus:shadow-[0_0_12px_rgba(108,99,255,0.2)]'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formState.subject}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-2xl bg-white/[0.02] border focus:bg-white/[0.04] text-white focus:outline-none transition-all duration-300 ${
                  errors.subject ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent focus:shadow-[0_0_12px_rgba(108,99,255,0.2)]'
                }`}
                placeholder="Collaboration Opportunity"
              />
              {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject}</p>}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                Message
              </label>
              <textarea
                name="message"
                value={formState.message}
                onChange={handleInputChange}
                rows={5}
                className={`w-full px-4 py-3 rounded-2xl bg-white/[0.02] border focus:bg-white/[0.04] text-white focus:outline-none transition-all duration-300 resize-none ${
                  errors.message ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent focus:shadow-[0_0_12px_rgba(108,99,255,0.2)]'
                }`}
                placeholder="Tell me about your project..."
              />
              {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent to-secondary text-bg-dark font-bold tracking-wider hover:shadow-[0_0_20px_rgba(108,99,255,0.4)] transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Send Message
                  <FaPaperPlane className="text-sm" />
                </>
              )}
            </button>

            {/* Success/Error Message Banner */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold"
                >
                  <FaCheckCircle className="text-base" />
                  Your message has been successfully transmitted. I will get back to you shortly!
                </motion.div>
              )}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </motion.div>
      </div>
    </section>
  );
}
