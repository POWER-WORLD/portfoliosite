import React, { useState } from 'react';
import { adminApi } from '../../services/api';
import { FaPlus, FaTrash, FaEdit, FaTimes, FaBriefcase, FaGraduationCap, FaBook, FaKeyboard, FaAward, FaHandsHelping, FaRocket } from 'react-icons/fa';
import ConfirmModal from '../ConfirmModal';

interface ExperienceTabProps {
  initialExperience: any[];
  onRefresh: () => void;
}

const categoryMap: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  work: { label: 'Work', icon: <FaBriefcase />, color: 'var(--primary)' },
  internship: { label: 'Internship', icon: <FaGraduationCap />, color: 'var(--secondary)' },
  academic_project: { label: 'Academic Project', icon: <FaBook />, color: '#ffd54f' },
  freelance: { label: 'Freelance', icon: <FaKeyboard />, color: '#b388ff' },
  leadership: { label: 'Leadership', icon: <FaAward />, color: '#ff8a80' },
  volunteer: { label: 'Volunteer', icon: <FaHandsHelping />, color: '#81c784' },
  side_gig: { label: 'Side Gig', icon: <FaRocket />, color: '#ffb74d' },
};

export default function ExperienceTab({ initialExperience, onRefresh }: ExperienceTabProps) {
  const experience = initialExperience || [];
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<any | null>(null);
  const [deleteExpId, setDeleteExpId] = useState<string | null>(null);

  // Form Fields State
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [period, setPeriod] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('work');
  const [keyLearningOutcomes, setKeyLearningOutcomes] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [projectLink, setProjectLink] = useState('');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const openNewModal = () => {
    setEditingExp(null);
    setRole('');
    setCompany('');
    setPeriod('');
    setDescription('');
    setCategory('work');
    setKeyLearningOutcomes('');
    setTechnologies('');
    setProjectLink('');
    setModalOpen(true);
  };

  const openEditModal = (exp: any) => {
    setEditingExp(exp);
    setRole(exp.role || '');
    setCompany(exp.company || '');
    setPeriod(exp.period || '');
    setDescription(exp.description || '');
    setCategory(exp.category || 'work');
    setKeyLearningOutcomes(exp.keyLearningOutcomes || '');
    setTechnologies(exp.technologies ? exp.technologies.join(', ') : '');
    setProjectLink(exp.link || '');
    setModalOpen(true);
  };

  const getRoleLabel = () => {
    switch (category) {
      case 'academic_project': return 'Project / Paper Title';
      case 'side_gig': return 'Initiative / Project Title';
      case 'freelance': return 'Role / Gig Name';
      case 'volunteer': return 'Volunteer Role';
      case 'leadership': return 'Leadership Position';
      case 'internship': return 'Internship Role';
      default: return 'Role Designation';
    }
  };

  const getCompanyLabel = () => {
    switch (category) {
      case 'academic_project': return 'Institution / Course (Optional)';
      case 'side_gig': return 'Platform / Channel / App (Optional)';
      case 'freelance': return 'Client / Platform (Optional)';
      case 'volunteer': return 'Organization / NGO / Club';
      case 'leadership': return 'Organization / Committee';
      default: return 'Company / Firm Name';
    }
  };

  const getDescriptionLabel = () => {
    switch (category) {
      case 'academic_project': return 'Project Description & Research Details';
      case 'side_gig': return 'Initiative Description & Key Metrics';
      case 'freelance': return 'Gig Description & Deliverables';
      case 'volunteer': return 'Volunteer Description & Duties';
      case 'leadership': return 'Leadership Description & Achievements';
      case 'internship': return 'Internship Description & Projects';
      default: return 'Job Description & Responsibilities';
    }
  };

  const getDescriptionPlaceholder = () => {
    switch (category) {
      case 'academic_project': return 'Describe the project goals, methodologies, challenges, and research outcomes...';
      case 'side_gig': return 'Describe the initiative, your workflow, content creation stats, or app functionalities...';
      case 'freelance': return 'Describe the client requirements, your deliverables, project scope, and outcomes...';
      case 'volunteer': return 'Describe the NGO/club mission, your contributions, events coordinated, and service outcomes...';
      case 'leadership': return 'Describe your leadership responsibilities, student representative initiatives, and fest coordination details...';
      case 'internship': return 'Describe the projects you worked on, mentorship you received, and tasks you completed...';
      default: return 'Detail key actions, optimizations, scaling statistics, and achievements...';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCompanyRequired = ['work', 'internship', 'volunteer', 'leadership'].includes(category);
    if (!role.trim() || (isCompanyRequired && !company.trim()) || !period.trim() || !description.trim()) return;

    setLoading(true);
    setAlert(null);

    const techArray = technologies
      ? technologies.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    const payload = {
      role,
      company: company || '',
      period,
      description,
      category,
      keyLearningOutcomes: ['internship', 'leadership', 'volunteer'].includes(category) ? keyLearningOutcomes : '',
      technologies: techArray,
      link: projectLink || '',
    };

    try {
      if (editingExp) {
        await adminApi.updateExperience(editingExp._id, payload);
        setAlert({ type: 'success', text: 'Experience updated!' });
      } else {
        await adminApi.addExperience(payload);
        setAlert({ type: 'success', text: 'Experience added!' });
      }
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to save experience' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteExp = async () => {
    if (!deleteExpId) return;
    const id = deleteExpId;
    setDeleteExpId(null);
    setLoading(true);
    setAlert(null);
    try {
      await adminApi.deleteExperience(id);
      setAlert({ type: 'success', text: 'Experience record deleted!' });
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to delete record' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Professional & Academic Timeline</h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Configure employment history, projects, leadership, and gigs</p>
        </div>
        <button className="btn btn-primary" onClick={openNewModal}>
          <FaPlus /> Add Experience
        </button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.text}</span>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={Boolean(deleteExpId)}
        title="Delete Work Timeline Record"
        message="Are you sure you want to delete this experience record?"
        confirmLabel="Delete Experience"
        onConfirm={confirmDeleteExp}
        onCancel={() => setDeleteExpId(null)}
      />

      {/* Experience Table List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Role / Company</th>
                <th>Description Preview</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {experience.map((exp) => {
                const catInfo = categoryMap[exp.category || 'work'] || categoryMap.work;
                return (
                  <tr key={exp._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, width: '160px' }}>{exp.period}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '1.05rem' }}>{exp.role}</strong>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderColor: catInfo.color, color: catInfo.color, background: 'rgba(255,255,255,0.01)', borderWidth: '1px', borderStyle: 'solid', padding: '0.1rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>
                          {catInfo.icon} {catInfo.label}
                        </span>
                      </div>
                      <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>{exp.company || 'N/A'}</span>
                    </td>
                    <td style={{ color: 'var(--text-gray)', fontSize: '0.88rem', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {exp.description}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary btn-icon" onClick={() => openEditModal(exp)}>
                          <FaEdit />
                        </button>
                        <button type="button" className="btn btn-danger btn-icon" onClick={() => setDeleteExpId(exp._id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {experience.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '2rem' }}>
                    No experience records configured. Click the button to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Experience Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-container">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.35rem' }}>{editingExp ? 'Modify Experience Record' : 'Log Experience Record'}</h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-row">
                <div className="form-group">
                  <label>Experience Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="work">💼 Professional Work</option>
                    <option value="internship">🎓 Internship</option>
                    <option value="academic_project">🔬 Academic Project</option>
                    <option value="freelance">🛠️ Freelance Work</option>
                    <option value="leadership">👑 Leadership Role</option>
                    <option value="volunteer">🤝 Volunteer & Community Service</option>
                    <option value="side_gig">🚀 Personal Side Gig</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Project Link / URL (Optional)</label>
                  <input 
                    type="text" 
                    value={projectLink} 
                    onChange={(e) => setProjectLink(e.target.value)} 
                    placeholder="e.g. https://github.com/username/project" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{getRoleLabel()}</label>
                  <input 
                    type="text" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    required 
                    placeholder="e.g. Lead Frontend Architect / Research Assistant" 
                  />
                </div>
                <div className="form-group">
                  <label>{getCompanyLabel()}</label>
                  <input 
                    type="text" 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)} 
                    required={['work', 'internship', 'volunteer', 'leadership'].includes(category)} 
                    placeholder="e.g. InnovateTech Solutions / Stanford University" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Period / Time Frame</label>
                  <input 
                    type="text" 
                    value={period} 
                    onChange={(e) => setPeriod(e.target.value)} 
                    required 
                    placeholder="e.g. 2022 - Present, Summer 2021" 
                  />
                </div>
                <div className="form-group">
                  <label>Technologies Used (Comma-separated)</label>
                  <input 
                    type="text" 
                    value={technologies} 
                    onChange={(e) => setTechnologies(e.target.value)} 
                    placeholder="e.g. React, TypeScript, Node.js, Go" 
                  />
                </div>
              </div>

              {['internship', 'volunteer', 'leadership'].includes(category) && (
                <div className="form-group">
                  <label>Key Learning Outcomes & Skills Learned</label>
                  <textarea 
                    value={keyLearningOutcomes} 
                    onChange={(e) => setKeyLearningOutcomes(e.target.value)} 
                    rows={3} 
                    placeholder="e.g. Mastered serverless deployment pipelines, coordinated large cross-functional teams..." 
                  />
                </div>
              )}

              <div className="form-group">
                <label>{getDescriptionLabel()}</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={5} 
                  required 
                  placeholder={getDescriptionPlaceholder()} 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Publish Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
