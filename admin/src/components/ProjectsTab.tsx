import React, { useState } from 'react';
import { adminApi } from '../api';
import { FaPlus, FaTrash, FaEdit, FaGithub, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';

interface ProjectsTabProps {
  initialProjects: any[];
  onRefresh: () => void;
}

export default function ProjectsTab({ initialProjects, onRefresh }: ProjectsTabProps) {
  const projects = initialProjects || [];
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'frontend' | 'fullstack' | 'creative'>('frontend');
  const [tagsText, setTagsText] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const openNewModal = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setCategory('frontend');
    setTagsText('');
    setGithubUrl('');
    setLiveUrl('');
    setImageUrl('');
    setModalOpen(true);
  };

  const openEditModal = (project: any) => {
    setEditingProject(project);
    setTitle(project.title || '');
    setDescription(project.description || '');
    setCategory(project.category || 'frontend');
    setTagsText(project.tags ? project.tags.join(', ') : '');
    setGithubUrl(project.githubUrl || '');
    setLiveUrl(project.liveUrl || '');
    setImageUrl(project.imageUrl || '');
    setModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      window.alert('File size exceeds the 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string); // base64 string
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    setAlert(null);

    // Process comma separated tags into array
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title,
      description,
      category,
      tags,
      githubUrl,
      liveUrl,
      imageUrl,
    };

    try {
      if (editingProject) {
        await adminApi.updateProject(editingProject._id, payload);
        setAlert({ type: 'success', text: 'Project updated!' });
      } else {
        await adminApi.addProject(payload);
        setAlert({ type: 'success', text: 'Project added!' });
      }
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to save project' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project? This action cannot be undone.')) return;

    setLoading(true);
    setAlert(null);
    try {
      await adminApi.deleteProject(id);
      setAlert({ type: 'success', text: 'Project deleted successfully!' });
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to delete project' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Portfolio Workpieces</h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Showcase applications and web projects</p>
        </div>
        <button className="btn btn-primary" onClick={openNewModal}>
          <FaPlus /> Add New Project
        </button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.text}</span>
        </div>
      )}

      {/* Projects Grid Display */}
      <div className="cards-grid">
        {projects.map((proj) => (
          <div key={proj._id} className="item-card">
            <div>
              {proj.imageUrl ? (
                <img src={proj.imageUrl} alt={proj.title} className="item-card-img" style={{ marginBottom: '1rem' }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  No Preview Image
                </div>
              )}
              
              <div className="item-card-header">
                <div>
                  <h3 className="item-card-title">{proj.title}</h3>
                  <span className="item-card-subtitle" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>{proj.category}</span>
                </div>
              </div>
              
              <p className="item-card-desc" style={{ marginTop: '0.75rem' }}>{proj.description}</p>
              
              {proj.tags && proj.tags.length > 0 && (
                <div className="tags-list" style={{ marginTop: '1rem' }}>
                  {proj.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="item-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--text-gray)' }}>
                {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer"><FaGithub /></a>}
                {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noreferrer"><FaExternalLinkAlt /></a>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-icon" onClick={() => openEditModal(proj)}>
                  <FaEdit />
                </button>
                <button type="button" className="btn btn-danger btn-icon" onClick={() => handleDelete(proj._id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem' }}>No projects configured. Click the button to add one.</p>
        )}
      </div>

      {/* Project Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-container">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.35rem' }}>{editingProject ? 'Modify Project details' : 'Draft New Project'}</h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label>Project Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. AetherDev Dashboard" />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required placeholder="Detailed summary of features, tech, and challenges..." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={(e: any) => setCategory(e.target.value)}>
                    <option value="frontend">Frontend Work</option>
                    <option value="fullstack">Full Stack System</option>
                    <option value="creative">Creative Tech</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Technologies (Comma Separated)</label>
                  <input type="text" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="e.g. React 19, TypeScript, Express" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>GitHub Repository URL</label>
                  <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username/project" />
                </div>
                <div className="form-group">
                  <label>Live Demo URL</label>
                  <input type="text" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://example.com" />
                </div>
              </div>

              {/* Image Input (Base64 file uploader + manual URL input) */}
              <div className="form-group">
                <label>Project Cover Image</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input 
                    type="text" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    placeholder="Paste public image URL (or upload local file below)" 
                  />
                  <div className="file-upload-dropzone">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                      Click to upload local preview screenshot (Max 5MB)
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'block', margin: '0.5rem auto 0 auto', fontSize: '0.85rem', color: 'var(--text-gray)' }} 
                    />
                  </div>
                  {imageUrl && (
                    <div className="file-upload-preview">
                      <img src={imageUrl} alt="Upload preview" />
                      <button type="button" className="file-upload-clear" onClick={() => setImageUrl('')}>&times;</button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Deploy Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
