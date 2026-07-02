import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';

interface PersonalTabProps {
  initialInfo: any;
  initialAbout: any;
  onRefresh: () => void;
}

export default function PersonalTab({ initialInfo, initialAbout, onRefresh }: PersonalTabProps) {
  // Personal Info Form State
  const [name, setName] = useState(initialInfo?.name || '');
  const [title, setTitle] = useState(initialInfo?.title || '');
  const [tagline, setTagline] = useState(initialInfo?.tagline || '');
  const [location, setLocation] = useState(initialInfo?.location || '');
  const [email, setEmail] = useState(initialInfo?.email || '');
  const [resumeUrl, setResumeUrl] = useState(initialInfo?.resumeUrl || '');

  // About Story State
  const [story, setStory] = useState(initialAbout?.story || '');

  // Highlights list State
  const [highlights, setHighlights] = useState<any[]>(initialAbout?.highlights || []);
  const [newHighlight, setNewHighlight] = useState({ title: '', desc: '' });

  // Education list State
  const [education, setEducation] = useState<any[]>(initialAbout?.education || []);
  const [newEdu, setNewEdu] = useState({ degree: '', school: '', year: '', description: '' });

  // Loading & Alert States
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state when props load or change
  useEffect(() => {
    if (initialInfo) {
      setName(initialInfo.name || '');
      setTitle(initialInfo.title || '');
      setTagline(initialInfo.tagline || '');
      setLocation(initialInfo.location || '');
      setEmail(initialInfo.email || '');
      setResumeUrl(initialInfo.resumeUrl || '');
    }
  }, [initialInfo]);

  useEffect(() => {
    if (initialAbout) {
      setStory(initialAbout.story || '');
      setHighlights(initialAbout.highlights || []);
      setEducation(initialAbout.education || []);
    }
  }, [initialAbout]);

  const savePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await adminApi.updatePersonalInfo({ name, title, tagline, location, email, resumeUrl });
      setSuccessMsg('Personal Core Profile saved successfully!');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update personal info.');
    } finally {
      setLoading(false);
    }
  };

  const saveAboutStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await adminApi.updateAbout({ story, highlights, education });
      setSuccessMsg('Biography & Academic Details updated successfully!');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update about details.');
    } finally {
      setLoading(false);
    }
  };

  // Add/remove highlight helpers
  const addHighlight = () => {
    if (!newHighlight.title.trim() || !newHighlight.desc.trim()) return;
    setHighlights([...highlights, newHighlight]);
    setNewHighlight({ title: '', desc: '' });
  };

  const removeHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  // Add/remove education helpers
  const addEducation = () => {
    if (!newEdu.degree.trim() || !newEdu.school.trim() || !newEdu.year.trim()) return;
    setEducation([...education, { ...newEdu }]);
    setNewEdu({ degree: '', school: '', year: '', description: '' });
  };

  const removeEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Messages */}
      {(successMsg || errorMsg) && (
        <div className={`alert ${successMsg ? 'alert-success' : 'alert-danger'}`}>
          <span>{successMsg || errorMsg}</span>
        </div>
      )}

      {/* Section 1: Personal Info */}
      <div className="glass-panel">
        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Personal Core Profile</h2>
        <form onSubmit={savePersonalInfo} className="space-y-6">
          <div className="form-row">
            <div className="form-group">
              <label>Full Display Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Professional Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Short Tagline / Hook Statement</label>
            <textarea value={tagline} onChange={(e) => setTagline(e.target.value)} rows={2} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Resume Download URL</label>
              <input type="text" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Core Profile'}
          </button>
        </form>
      </div>

      {/* Section 2: Story & Education */}
      <div className="glass-panel">
        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Biography, Highlights & Academics</h2>
        <form onSubmit={saveAboutStory} className="space-y-6">
          <div className="form-group">
            <label>My Story / About Paragraph</label>
            <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={5} placeholder="Write your background, interests, and engineering approach..." />
          </div>

          {/* Highlights Editor */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '0.75rem' }}>Key Highlights / Metric Cards</label>
            
            {/* Added list */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              {highlights.map((hl, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <strong style={{ color: 'var(--secondary)' }}>{hl.title}</strong>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--text-gray)' }}>{hl.desc}</span>
                  </div>
                  <button type="button" className="btn btn-danger btn-icon" onClick={() => removeHighlight(idx)} style={{ padding: '0.2rem 0.5rem', borderRadius: '6px' }}>&times;</button>
                </div>
              ))}
              {highlights.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>No highlights added yet.</p>}
            </div>

            {/* Inputs to add */}
            <div className="form-row" style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input 
                  type="text" 
                  placeholder="Title (e.g. 6+ Years)" 
                  value={newHighlight.title}
                  onChange={(e) => setNewHighlight({ ...newHighlight, title: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input 
                  type="text" 
                  placeholder="Description (e.g. Industry Experience)" 
                  value={newHighlight.desc}
                  onChange={(e) => setNewHighlight({ ...newHighlight, desc: e.target.value })}
                />
              </div>
              <button type="button" className="btn btn-secondary" onClick={addHighlight}>
                Add Highlight
              </button>
            </div>
          </div>

          {/* Education Timeline Editor */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '0.75rem' }}>Education & Academic Milestones</label>
            
            {/* Added list */}
            <div className="data-table-container" style={{ marginBottom: '1rem' }}>
              {education.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Degree</th>
                      <th>School</th>
                      <th>Year</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {education.map((edu, idx) => (
                      <tr key={idx}>
                        <td><strong>{edu.degree}</strong></td>
                        <td>{edu.school}</td>
                        <td style={{ fontFamily: 'monospace' }}>{edu.year}</td>
                        <td>
                          <button type="button" className="btn btn-danger btn-icon" onClick={() => removeEducation(idx)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>No education history added yet.</p>
              )}
            </div>

            {/* Inputs to add education */}
            <div className="form-group" style={{ background: 'rgba(255,255,255,0.01)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="Degree (e.g. B.S. in Computer Science)" 
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                />
                <input 
                  type="text" 
                  placeholder="School (e.g. Stanford University)" 
                  value={newEdu.school}
                  onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })}
                />
                <input 
                  type="text" 
                  placeholder="Year (e.g. 2018 - 2020)" 
                  value={newEdu.year}
                  onChange={(e) => setNewEdu({ ...newEdu, year: e.target.value })}
                />
              </div>
              <textarea 
                placeholder="Description of coursework, achievements, or specialization..." 
                value={newEdu.description}
                onChange={(e) => setNewEdu({ ...newEdu, description: e.target.value })}
                rows={2}
              />
              <button type="button" className="btn btn-secondary" onClick={addEducation} style={{ width: 'fit-content' }}>
                Add Academic Entry
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Biography & Academic Details'}
          </button>
        </form>
      </div>

    </div>
  );
}
