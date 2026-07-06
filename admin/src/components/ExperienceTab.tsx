import React, { useState } from 'react';
import { adminApi } from '../api';
import { FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';

interface ExperienceTabProps {
  initialExperience: any[];
  onRefresh: () => void;
}

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

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const openNewModal = () => {
    setEditingExp(null);
    setRole('');
    setCompany('');
    setPeriod('');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (exp: any) => {
    setEditingExp(exp);
    setRole(exp.role || '');
    setCompany(exp.company || '');
    setPeriod(exp.period || '');
    setDescription(exp.description || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim() || !company.trim() || !period.trim()) return;

    setLoading(true);
    setAlert(null);

    const payload = { role, company, period, description };

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
          <h2 style={{ fontSize: '1.75rem' }}>Professional Work Timeline</h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Configure employment history and career roles</p>
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
        message="Are you sure you want to delete this career experience record?"
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
              {experience.map((exp) => (
                <tr key={exp._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, width: '160px' }}>{exp.period}</td>
                  <td>
                    <strong style={{ display: 'block', fontSize: '1.05rem' }}>{exp.role}</strong>
                    <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>{exp.company}</span>
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
              ))}
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
              <h3 style={{ fontSize: '1.35rem' }}>{editingExp ? 'Modify Experience timeline' : 'Log Career Experience'}</h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-row">
                <div className="form-group">
                  <label>Role Designation</label>
                  <input type="text" value={role} onChange={(e) => setRole(e.target.value)} required placeholder="e.g. Lead Frontend Architect" />
                </div>
                <div className="form-group">
                  <label>Company / Firm Name</label>
                  <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required placeholder="e.g. InnovateTech Solutions" />
                </div>
              </div>

              <div className="form-group">
                <label>Period of Employment</label>
                <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} required placeholder="e.g. 2022 - Present, May 2020 - Dec 2022" />
              </div>

              <div className="form-group">
                <label>Job Description & Responsibilities</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required placeholder="Detail key actions, optimizations, scaling statistics, and achievements..." />
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
