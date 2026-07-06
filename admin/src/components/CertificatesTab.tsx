import React, { useState } from 'react';
import { adminApi } from '../api';
import { FaPlus, FaTrash, FaEdit, FaTimes, FaAward, FaCrown } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';
import { sanitizeUrl } from '../utils/security';

interface CertificatesTabProps {
  initialCertificates: any[];
  initialAchievements: any[];
  onRefresh: () => void;
}

export default function CertificatesTab({ initialCertificates, initialAchievements, onRefresh }: CertificatesTabProps) {
  const certs = initialCertificates || [];
  const achievements = initialAchievements || [];

  // Certificate Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<any | null>(null);
  const [deleteCertId, setDeleteCertId] = useState<string | null>(null);
  const [deleteAchId, setDeleteAchId] = useState<string | null>(null);

  // Certificate Form state
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [date, setDate] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [certImageUrl, setCertImageUrl] = useState('');
  const [certImageFile, setCertImageFile] = useState<File | null>(null);

  // Achievements Form state (we can add/edit achievements inline)
  const [newAchValue, setNewAchValue] = useState(0);
  const [newAchLabel, setNewAchLabel] = useState('');
  const [newAchSuffix, setNewAchSuffix] = useState('');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const openCertNewModal = () => {
    setEditingCert(null);
    setTitle('');
    setOrganization('');
    setDate('');
    setCredentialUrl('');
    setCertImageUrl('');
    setCertImageFile(null);
    setCertModalOpen(true);
  };

  const openCertEditModal = (cert: any) => {
    setEditingCert(cert);
    setTitle(cert.title || '');
    setOrganization(cert.organization || '');
    setDate(cert.date || '');
    setCredentialUrl(cert.credentialUrl || '');
    setCertImageUrl(cert.imageUrl || '');
    setCertImageFile(null);
    setCertModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAlert({ type: 'danger', text: 'File size exceeds 5MB limit.' });
      return;
    }

    setCertImageFile(file);
    setCertImageUrl(URL.createObjectURL(file));
  };

  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !organization.trim() || !date.trim()) return;

    setLoading(true);
    setAlert(null);

    let finalCertImageUrl = certImageUrl;

    try {
      if (certImageFile) {
        const uploadRes = await adminApi.uploadFile(certImageFile);
        finalCertImageUrl = uploadRes.url;
      }

      const payload = { 
        title, 
        organization, 
        date, 
        credentialUrl: sanitizeUrl(credentialUrl), 
        imageUrl: sanitizeUrl(finalCertImageUrl, '') 
      };

      if (editingCert) {
        await adminApi.updateCertificate(editingCert._id, payload);
        setAlert({ type: 'success', text: 'Certificate details updated!' });
      } else {
        await adminApi.addCertificate(payload);
        setAlert({ type: 'success', text: 'New Certificate registered!' });
      }
      setCertModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to save certificate' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteCert = async () => {
    if (!deleteCertId) return;
    const id = deleteCertId;
    setDeleteCertId(null);
    setLoading(true);
    setAlert(null);
    try {
      await adminApi.deleteCertificate(id);
      setAlert({ type: 'success', text: 'Certificate removed successfully!' });
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to delete certificate' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchLabel.trim()) return;

    setLoading(true);
    setAlert(null);
    try {
      await adminApi.addAchievement({ value: newAchValue, label: newAchLabel, suffix: newAchSuffix });
      setAlert({ type: 'success', text: 'Achievement Metric Added!' });
      setNewAchValue(0);
      setNewAchLabel('');
      setNewAchSuffix('');
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to add achievement' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAch = async () => {
    if (!deleteAchId) return;
    const id = deleteAchId;
    setDeleteAchId(null);
    setLoading(true);
    setAlert(null);
    try {
      await adminApi.deleteAchievement(id);
      setAlert({ type: 'success', text: 'Achievement metric deleted!' });
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to delete achievement' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-split-cert">
      
      {/* Confirm Delete Modals */}
      <ConfirmModal
        isOpen={Boolean(deleteCertId)}
        title="Delete Certificate Credential"
        message="Are you sure you want to delete this digital certificate credential? This action cannot be undone."
        confirmLabel="Delete Credential"
        onConfirm={confirmDeleteCert}
        onCancel={() => setDeleteCertId(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deleteAchId)}
        title="Delete Achievement Metric"
        message="Are you sure you want to remove this count achievement metric?"
        confirmLabel="Delete Metric"
        onConfirm={confirmDeleteAch}
        onCancel={() => setDeleteAchId(null)}
      />

      {/* Left Pane: Certificates Management */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {alert && (
          <div className={`alert alert-${alert.type}`}>
            <span>{alert.text}</span>
          </div>
        )}

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem' }}>Certificate Credentials</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>Professional certificates and training completions</p>
            </div>
            <button className="btn btn-primary" onClick={openCertNewModal}>
              <FaPlus /> Register Certificate
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {certs.map((cert) => (
              <div 
                key={cert._id} 
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)', 
                  padding: '1.25rem', 
                  borderRadius: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  {cert.imageUrl ? (
                    <img 
                      src={sanitizeUrl(cert.imageUrl)} 
                      alt={cert.title} 
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                    />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', flexShrink: 0 }}>
                      <FaAward style={{ fontSize: '1.5rem' }} />
                    </div>
                  )}
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem' }}>{cert.title}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                      {cert.organization} &bull; <span style={{ fontFamily: 'monospace' }}>{cert.date}</span>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                  <button type="button" className="btn btn-secondary btn-icon" onClick={() => openCertEditModal(cert)}>
                    <FaEdit />
                  </button>
                  <button type="button" className="btn btn-danger btn-icon" onClick={() => setDeleteCertId(cert._id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
            {certs.length === 0 && (
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>No certificates configured. Add a credential to begin.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Pane: Achievements/Metrics Management */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Metric Form */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.25rem' }}><FaCrown style={{ color: 'var(--secondary)', marginRight: '0.5rem' }} /> Add Metric Achievement</h3>
          <form onSubmit={handleAddAchievement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Metric Value (Number)</label>
              <input 
                type="number" 
                value={newAchValue} 
                onChange={(e) => setNewAchValue(parseInt(e.target.value) || 0)} 
                required 
              />
            </div>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Suffix (e.g. +, %)</label>
                <input 
                  type="text" 
                  value={newAchSuffix} 
                  onChange={(e) => setNewAchSuffix(e.target.value)} 
                  placeholder="+" 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Label</label>
                <input 
                  type="text" 
                  value={newAchLabel} 
                  onChange={(e) => setNewAchLabel(e.target.value)} 
                  placeholder="e.g. Years of Experience" 
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'fit-content', marginTop: '0.5rem' }}>
              <FaPlus /> Add Metric
            </button>
          </form>
        </div>

        {/* Metric list */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.25rem' }}>Active Metric Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {achievements.map((ach) => (
              <div 
                key={ach._id} 
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)', 
                  padding: '1rem 1.25rem', 
                  borderRadius: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--secondary)', fontSize: '1.5rem', fontFamily: 'monospace', display: 'block' }}>
                    {ach.value}{ach.suffix}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-white)', fontWeight: 500 }}>{ach.label}</span>
                </div>
                <button type="button" className="btn btn-danger btn-icon" onClick={() => setDeleteAchId(ach._id)}>
                  <FaTrash />
                </button>
              </div>
            ))}
            {achievements.length === 0 && (
              <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem' }}>No achievements metrics configured.</p>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {certModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-container">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.35rem' }}>{editingCert ? 'Modify Certificate Credential' : 'Register New Certificate'}</h3>
              <button type="button" className="modal-close" onClick={() => setCertModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCertSubmit} className="space-y-6">
              <div className="form-group">
                <label>Certificate Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. AWS Certified Solutions Architect" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Issuing Organization</label>
                  <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} required placeholder="e.g. Amazon Web Services" />
                </div>
                <div className="form-group">
                  <label>Issue Date</label>
                  <input type="text" value={date} onChange={(e) => setDate(e.target.value)} required placeholder="e.g. Dec 2025, Jan 2026" />
                </div>
              </div>

              <div className="form-group">
                <label>Credential Verification URL</label>
                <input type="text" value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} placeholder="https://aws.amazon.com/verification" />
              </div>

              {/* Cover Image upload */}
              <div className="form-group">
                <label>Credential Badge/Logo</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input 
                    type="text" 
                    value={certImageUrl} 
                    onChange={(e) => setCertImageUrl(e.target.value)} 
                    placeholder="Paste public logo URL (or upload local file below)" 
                  />
                  <div className="file-upload-dropzone">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                      Click to upload local credential logo (Max 2MB)
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'block', margin: '0.5rem auto 0 auto', fontSize: '0.85rem', color: 'var(--text-gray)' }} 
                    />
                  </div>
                  {certImageUrl && (
                    <div className="file-upload-preview">
                      <img src={certImageUrl} alt="Upload preview" />
                      <button type="button" className="file-upload-clear" onClick={() => { setCertImageUrl(''); setCertImageFile(null); }}>&times;</button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCertModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Deploy Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
