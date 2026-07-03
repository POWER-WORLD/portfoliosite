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
  
  // Resumes list & new resume state
  const [resumes, setResumes] = useState<any[]>(initialInfo?.resumes || []);
  const [activeResumeUrl, setActiveResumeUrl] = useState<string>(initialInfo?.resumeUrl || '');
  
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFileLabel, setNewFileLabel] = useState('');
  const [setAsActive, setSetAsActive] = useState(true);
  const [addingResume, setAddingResume] = useState(false);

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
      setActiveResumeUrl(initialInfo.resumeUrl || '');
      setResumes(initialInfo.resumes || []);
    }
  }, [initialInfo]);

  useEffect(() => {
    if (initialAbout) {
      setStory(initialAbout.story || '');
      setHighlights(initialAbout.highlights || []);
      setEducation(initialAbout.education || []);
    }
  }, [initialAbout]);

  // File picker handler -> Base64
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds 25MB limit. Please upload a smaller file or use an external URL.');
      return;
    }

    setNewFileLabel(file.name);
    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read selected file.');
    };
    reader.readAsDataURL(file);
  };

  // Add new resume entry
  const handleAddResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg('Please provide a title/label for this resume.');
      return;
    }
    if (!newUrl.trim()) {
      setErrorMsg('Please select a file or enter a valid URL.');
      return;
    }

    setAddingResume(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await adminApi.addResume({
        title: newTitle.trim(),
        url: newUrl.trim(),
        isActive: setAsActive
      });

      setSuccessMsg(`Resume "${newTitle}" added successfully!`);
      setNewTitle('');
      setNewUrl('');
      setNewFileLabel('');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add resume.');
    } finally {
      setAddingResume(false);
    }
  };

  // Set selected resume as Active
  const handleSetActive = async (id: string, title: string) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await adminApi.setActiveResume(id);
      setSuccessMsg(`"${title}" is now set as the ACTIVE resume for frontend download!`);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update active resume.');
    }
  };

  // Delete resume
  const handleDeleteResume = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await adminApi.deleteResume(id);
      setSuccessMsg(`Resume "${title}" deleted.`);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete resume.');
    }
  };

  const savePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await adminApi.updatePersonalInfo({ name, title, tagline, location, email, resumeUrl: activeResumeUrl, resumes });
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

  const addHighlight = () => {
    if (!newHighlight.title.trim() || !newHighlight.desc.trim()) return;
    setHighlights([...highlights, newHighlight]);
    setNewHighlight({ title: '', desc: '' });
  };

  const removeHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  const addEducation = () => {
    if (!newEdu.degree.trim() || !newEdu.school.trim() || !newEdu.year.trim()) return;
    setEducation([...education, { ...newEdu }]);
    setNewEdu({ degree: '', school: '', year: '', description: '' });
  };

  const removeEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Alert Messages */}
      {(successMsg || errorMsg) && (
        <div className={`alert ${successMsg ? 'alert-success' : 'alert-danger'}`}>
          <span>{successMsg || errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: MULTIPLE RESUME MANAGEMENT HUB */}
      <div className="glass-panel" style={{ border: '1px solid var(--accent, #6c63ff)', boxShadow: '0 0 25px rgba(108,99,255,0.12)' }}>
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', paddingBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            Multiple Resume Manager & Selector
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-gray, #94a3b8)', marginTop: '0.3rem' }}>
            Upload multiple resume versions (Full Stack, AI, Frontend, etc.) and select which one visitors download from the frontend Hero section.
          </p>
        </div>

        {/* Existing Resumes List */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
            Uploaded Resumes ({resumes.length})
          </h3>

          {resumes.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-gray)' }}>
              No resumes uploaded yet. Use the form below to add your first resume.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {resumes.map((resItem) => (
                <div 
                  key={resItem.id} 
                  style={{
                    background: resItem.isActive ? 'rgba(108,99,255,0.12)' : 'rgba(255,255,255,0.02)',
                    border: resItem.isActive ? '1px solid var(--accent, #6c63ff)' : '1px solid var(--border-color, rgba(255,255,255,0.08))',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1rem', color: '#fff', wordBreak: 'break-word' }}>
                        {resItem.title}
                      </strong>
                      {resItem.isActive ? (
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, background: '#10b981', color: '#000', whiteSpace: 'nowrap' }}>
                          ✓ Active on Frontend
                        </span>
                      ) : (
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'var(--text-gray)', whiteSpace: 'nowrap' }}>
                          Inactive
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-gray, #64748b)', margin: 0 }}>
                      Type: {resItem.url.startsWith('data:') ? 'PDF File Upload' : 'External Link'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {!resItem.isActive && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleSetActive(resItem.id, resItem.title)}
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      >
                        Set Active for Frontend
                      </button>
                    )}

                    <a
                      href={resItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: 'rgba(255,255,255,0.06)', color: '#fff', textDecoration: 'none' }}
                    >
                      Preview / Test ↗
                    </a>

                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      onClick={() => handleDeleteResume(resItem.id, resItem.title)}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', marginLeft: 'auto' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Resume Form */}
        <div style={{ background: 'rgba(255,255,255,0.015)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color, rgba(255,255,255,0.08))' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
            Add New Resume Entry
          </h3>
          <form onSubmit={handleAddResume} className="space-y-4">
            <div className="form-group">
              <label>Resume Label / Name (e.g. "Full Stack Developer 2026")</label>
              <input 
                type="text" 
                placeholder="Enter title for this resume" 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Option 1: Upload PDF File</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px dashed var(--border-color, rgba(255,255,255,0.2))',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                />
                {newFileLabel && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--secondary, #38bdf8)', marginTop: '0.25rem', display: 'block' }}>
                    File: {newFileLabel}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Option 2: External Hosted Link (Google Drive, Cloudinary)</label>
                <input 
                  type="text" 
                  placeholder="https://drive.google.com/file/d/..." 
                  value={newUrl} 
                  onChange={(e) => setNewUrl(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="setActiveCheck" 
                checked={setAsActive} 
                onChange={(e) => setSetAsActive(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="setActiveCheck" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer', margin: 0 }}>
                Set as <strong>ACTIVE</strong> resume immediately after uploading
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={addingResume} style={{ marginTop: '1rem' }}>
              {addingResume ? 'Adding Resume...' : 'Add Resume to Portfolio'}
            </button>
          </form>
        </div>

      </div>

      {/* SECTION 2: PERSONAL CORE PROFILE */}
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
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Core Profile'}
          </button>
        </form>
      </div>

      {/* SECTION 3: STORY & EDUCATION */}
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
