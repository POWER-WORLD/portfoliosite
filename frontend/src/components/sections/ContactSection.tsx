import { useState, FormEvent } from 'react';
import { Mail, Send } from 'lucide-react';

interface ContactSectionProps {
  showToast: (toast: { type: 'success' | 'error'; message: string }) => void;
}

export default function ContactSection({ showToast }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) {
      showToast({ type: 'error', message: 'All form fields are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, content }),
      });

      if (!response.ok) {
        throw new Error('API server returned an error');
      }

      showToast({ type: 'success', message: 'Message sent successfully! Thank you.' });
      setName('');
      setEmail('');
      setContent('');
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to send message. Is the backend server running?' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="scroll-mt-28 flex flex-col gap-8 max-w-2xl mx-auto w-full">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
          <Mail className="w-7 h-7 text-sky-400" />
          Get In Touch
        </h2>
        <p className="text-slate-400 mt-2">Have a question or want to work together? Send a message directly.</p>
      </div>

      <div className="glass-card p-8 rounded-3xl">
        <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-name" className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Your Name</label>
              <input
                id="contact-name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input px-4 py-3 rounded-xl text-sm w-full text-white"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-email" className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Email Address</label>
              <input
                id="contact-email"
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input px-4 py-3 rounded-xl text-sm w-full text-white"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-message" className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Message Content</label>
            <textarea
              id="contact-message"
              rows={4}
              placeholder="How can I help you..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="glass-input px-4 py-3 rounded-xl text-sm w-full resize-none text-white"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full glass-btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Sending Message...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Inquiry
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
