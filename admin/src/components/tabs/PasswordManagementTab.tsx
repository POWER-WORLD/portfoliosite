import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import ConfirmModal from '../ConfirmModal';
import { FaKey, FaLock, FaTrash, FaPlus, FaToggleOn, FaToggleOff, FaShieldAlt } from 'react-icons/fa';

export default function PasswordManagementTab() {
  // Admin login password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Resume download passcodes state
  const [passwords, setPasswords] = useState<any[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // General message state
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Delete modal state
  const [deleteItem, setDeleteItem] = useState<{ id: string; label: string; code: string } | null>(null);

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const data = await adminApi.getResumePasswords();
      setPasswords(data || []);
    } catch (err: any) {
      console.error('Failed to load passcodes:', err);
      setErrorMsg(err.message || 'Failed to load resume download passcodes.');
    }
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setAdminLoading(true);
    try {
      await adminApi.changeAdminPassword({ currentPassword, newPassword });
      setSuccessMsg('Admin login password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to change admin login password.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAddPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!/^\d{4}$/.test(newCode)) {
      setErrorMsg('Passcode must be exactly 4 digits (numeric only).');
      return;
    }

    if (!newLabel.trim()) {
      setErrorMsg('Please enter a descriptive label.');
      return;
    }

    setPassLoading(true);
    try {
      const created = await adminApi.addResumePassword({
        code: newCode,
        label: newLabel.trim(),
        isActive: true,
      });
      setSuccessMsg(`Passcode "${created.code}" created successfully for "${created.label}"!`);
      setNewCode('');
      setNewLabel('');
      fetchPasswords();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate download passcode.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean, label: string) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await adminApi.updateResumePassword(id, { isActive: !currentStatus });
      setSuccessMsg(`Passcode status for "${label}" updated!`);
      fetchPasswords();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update passcode status.');
    }
  };

  const confirmDeletePasscode = async () => {
    if (!deleteItem) return;
    const { id, label, code } = deleteItem;
    setDeleteItem(null);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await adminApi.deleteResumePassword(id);
      setSuccessMsg(`Passcode "${code}" for "${label}" has been deleted.`);
      fetchPasswords();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete passcode.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteItem)}
        title="Delete Download Passcode"
        message={`Are you sure you want to delete the passcode "${deleteItem?.code}" (${deleteItem?.label})? Users will no longer be able to use it to download your resume.`}
        confirmLabel="Delete Passcode"
        onConfirm={confirmDeletePasscode}
        onCancel={() => setDeleteItem(null)}
      />

      {/* Alert Banner */}
      {(successMsg || errorMsg) && (
        <div className={`alert ${successMsg ? 'alert-success' : 'alert-danger'}`}>
          <span>{successMsg || errorMsg}</span>
        </div>
      )}

      {/* Grid of Sections */}
      <div className="grid-split-2">
        {/* Left Section: Create and List Passcodes */}
        <div className="glass-panel" style={{ border: '1px solid var(--accent, #6c63ff)', boxShadow: '0 0 25px rgba(108,99,255,0.12)' }}>
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaKey style={{ color: 'var(--secondary)' }} /> Resume Download Passcodes
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-gray, #94a3b8)', marginTop: '0.3rem' }}>
              Generate 4-digit passwords to share with recruiters or visitors. Only active codes will permit resume downloads.
            </p>
          </div>

          {/* Form to Add New Passcode */}
          <div style={{ background: 'rgba(255,255,255,0.015)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color, rgba(255,255,255,0.08))', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaPlus style={{ fontSize: '0.85rem' }} /> Generate New Passcode
            </h3>
            <form onSubmit={handleAddPasscode}>
              <div className="form-row">
                <div className="form-group">
                  <label>4-Digit Code (e.g. 9845)</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Enter exactly 4 digits"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Label / Purpose (e.g. Google Recruiter)</label>
                  <input
                    type="text"
                    placeholder="Enter name or group"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={passLoading} style={{ marginTop: '0.5rem' }}>
                {passLoading ? 'Generating...' : 'Create Passcode'}
              </button>
            </form>
          </div>

          {/* List of Passcodes */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              Generated Passcodes ({passwords.length})
            </h3>
            {passwords.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-gray)' }}>
                No passcodes generated yet. Use the form above to create your first passcode.
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Code</th>
                      <th>Label / Recruiter</th>
                      <th style={{ width: '150px' }}>Status</th>
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passwords.map((pw) => (
                      <tr key={pw._id}>
                        <td>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                            {pw.code}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{pw.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>
                            Created: {new Date(pw.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(pw._id, pw.isActive, pw.label)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: pw.isActive ? 'var(--success)' : 'var(--text-gray)',
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title={pw.isActive ? 'Deactivate Passcode' : 'Activate Passcode'}
                            >
                              {pw.isActive ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              fontWeight: 700,
                              color: pw.isActive ? 'var(--success)' : 'var(--text-gray)',
                              background: pw.isActive ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                              border: pw.isActive ? '1px solid rgba(0, 230, 118, 0.2)' : '1px solid var(--border-color)',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '6px',
                              textTransform: 'uppercase'
                            }}>
                              {pw.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger btn-icon"
                            onClick={() => setDeleteItem({ id: pw._id, label: pw.label, code: pw.code })}
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Change Admin Login Password */}
        <div className="glass-panel">
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaShieldAlt style={{ color: 'var(--primary)' }} /> Super Admin Login Credentials
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-gray, #94a3b8)', marginTop: '0.3rem' }}>
              Update your Super Admin password. This updates the hashed value stored in the database.
            </p>
          </div>

          <form onSubmit={handleAdminPasswordChange} className="space-y-6">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Enter current admin password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Verify new admin password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={adminLoading} style={{ width: '100%', marginTop: '1rem' }}>
              {adminLoading ? 'Updating credentials...' : 'Update Admin Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
