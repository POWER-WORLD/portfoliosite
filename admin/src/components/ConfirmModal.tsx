import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="glass-panel modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          padding: '2rem',
          borderRadius: '24px',
          border: isDanger ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border-color)',
          boxShadow: isDanger ? '0 0 40px rgba(239,68,68,0.15)' : '0 0 30px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: isDanger ? 'rgba(239,68,68,0.12)' : 'rgba(0,229,255,0.12)',
                color: isDanger ? '#f87171' : 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
              }}
            >
              <FaExclamationTriangle />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' }}>{title}</h3>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onCancel}
            aria-label="Close modal"
            style={{ padding: '0.4rem' }}
          >
            <FaTimes />
          </button>
        </div>

        <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ padding: '0.5rem 1.25rem' }}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={isDanger ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={onConfirm}
            style={{ padding: '0.5rem 1.25rem' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
