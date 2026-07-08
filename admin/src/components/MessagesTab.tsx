import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';
import { 
  FaEnvelope, 
  FaTrash, 
  FaCheckCircle, 
  FaSpinner, 
  FaSearch, 
  FaExternalLinkAlt, 
  FaInbox 
} from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  replies: Array<{ text: string; createdAt: string; _id: string }>;
  createdAt: string;
}

export default function MessagesTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'replied'>('all');
  
  const [draftReply, setDraftReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Modals state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const data = await adminApi.getMessages();
      setMessages(data || []);
      // If a message was selected, update its state from the fresh data
      if (selectedMessage) {
        const updatedSelected = data.find((m: Message) => m._id === selectedMessage._id);
        setSelectedMessage(updatedSelected || null);
      }
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to load messages' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = (msg: Message) => {
    setSelectedMessage(msg);
    setDraftReply('');
    setAlert(null);
  };

  const handleDeleteSingle = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    setAlert(null);
    try {
      await adminApi.deleteMessage(deleteId);
      setAlert({ type: 'success', text: 'Message deleted successfully' });
      if (selectedMessage?._id === deleteId) {
        setSelectedMessage(null);
      }
      setDeleteId(null);
      await fetchMessages();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to delete message' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeleteAllOpen(false);
    setActionLoading(true);
    setAlert(null);
    try {
      await adminApi.deleteAllMessages();
      setAlert({ type: 'success', text: 'All messages deleted successfully' });
      setSelectedMessage(null);
      await fetchMessages();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to delete all messages' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplyMailto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !draftReply.trim()) return;

    setActionLoading(true);
    setAlert(null);
    try {
      // 1. Log the reply in database
      await adminApi.replyToMessage(selectedMessage._id, draftReply);
      
      // 2. Build mailto link
      const email = encodeURIComponent(selectedMessage.email);
      const subject = encodeURIComponent(`Re: ${selectedMessage.subject}`);
      
      // Format reply body with context
      const formattedBody = `Hello ${selectedMessage.name},\n\nIn response to your message:\n"${selectedMessage.message}"\n\n${draftReply}\n\nBest regards,\nPawan Kumar`;
      const body = encodeURIComponent(formattedBody);
      
      const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
      
      // 3. Open mail client
      window.location.href = mailtoUrl;

      setAlert({ type: 'success', text: 'Reply logged and mail client opened!' });
      setDraftReply('');
      await fetchMessages();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to save reply' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplyLogOnly = async () => {
    if (!selectedMessage || !draftReply.trim()) return;

    setActionLoading(true);
    setAlert(null);
    try {
      await adminApi.replyToMessage(selectedMessage._id, draftReply);
      setAlert({ type: 'success', text: 'Reply logged in database (marked as replied)!' });
      setDraftReply('');
      await fetchMessages();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to save reply' });
    } finally {
      setActionLoading(false);
    }
  };

  // Filtering & Searching logic
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());
      
    const isReplied = msg.replies && msg.replies.length > 0;
    
    if (filterType === 'unread') {
      return matchesSearch && !isReplied;
    }
    if (filterType === 'replied') {
      return matchesSearch && isReplied;
    }
    return matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* Alert Banner */}
      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.5rem' }}>
          <span>{alert.text}</span>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action is permanent and cannot be undone."
        confirmLabel="Delete Message"
        onConfirm={handleDeleteSingle}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmModal
        isOpen={deleteAllOpen}
        title="Delete ALL Messages"
        message="Are you sure you want to wipe your entire inbox? This will delete all messages from the database permanently."
        confirmLabel="Delete All"
        onConfirm={handleDeleteAll}
        onCancel={() => setDeleteAllOpen(false)}
      />

      {/* Toolbar / Actions Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {/* Statistics info */}
        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-gray)', fontSize: '0.9rem' }}>
          <div>Total: <strong style={{ color: '#fff' }}>{messages.length}</strong></div>
          <div>Replied: <strong style={{ color: 'var(--success)' }}>{messages.filter(m => m.replies && m.replies.length > 0).length}</strong></div>
          <div>Pending: <strong style={{ color: 'var(--secondary)' }}>{messages.filter(m => !m.replies || m.replies.length === 0).length}</strong></div>
        </div>

        {/* Delete All Action */}
        {messages.length > 0 && (
          <button 
            type="button" 
            className="btn btn-danger" 
            onClick={() => setDeleteAllOpen(true)}
            disabled={actionLoading}
            style={{ padding: '0.5rem 1.25rem' }}
          >
            <FaTrash /> Clear Entire Inbox
          </button>
        )}
      </div>

      {/* Main Split Grid */}
      <div className="messages-layout-grid">
        {/* Left Side: Message List */}
        <div className="messages-sidebar-panel glass-panel">
          {/* Search and Filters */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <FaSearch style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)' 
              }} />
              <input 
                type="text" 
                placeholder="Search inbox..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', fontSize: '0.88rem' }}
              />
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '0.25rem', border: '1px solid var(--border-color)' }}>
              <button 
                type="button"
                onClick={() => setFilterType('all')}
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              >
                All
              </button>
              <button 
                type="button"
                onClick={() => setFilterType('unread')}
                className={`filter-btn ${filterType === 'unread' ? 'active' : ''}`}
              >
                Pending
              </button>
              <button 
                type="button"
                onClick={() => setFilterType('replied')}
                className={`filter-btn ${filterType === 'replied' ? 'active' : ''}`}
              >
                Replied
              </button>
            </div>
          </div>

          {/* Messages Scroll View */}
          <div className="messages-list-scroll">
            {loading && messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', color: 'var(--text-gray)' }}>
                <FaSpinner className="animate-spin" style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--primary)' }} />
                <span>Loading inbox...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-gray)' }}>
                <FaInbox style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.3 }} />
                <p style={{ fontSize: '0.9rem' }}>No messages found matching criteria.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?._id === msg._id;
                const hasReplied = msg.replies && msg.replies.length > 0;
                return (
                  <div 
                    key={msg._id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`message-list-item ${isSelected ? 'selected' : ''} ${hasReplied ? 'replied' : 'new-msg'}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                        {msg.name}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.25rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {msg.subject}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-gray)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {msg.message}
                    </p>

                    {/* Status indicator tag */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      {hasReplied ? (
                        <span className="status-badge status-replied">
                          <FaCheckCircle style={{ fontSize: '0.7rem' }} /> Replied
                        </span>
                      ) : (
                        <span className="status-badge status-pending">New Message</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Message Details & Reply Console */}
        <div className="message-detail-panel glass-panel">
          {selectedMessage ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                {/* Header Information */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  borderBottom: '1px solid var(--border-color)', 
                  paddingBottom: '1.25rem',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                      {selectedMessage.subject}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-gray)' }}>
                        From: <strong style={{ color: '#fff' }}>{selectedMessage.name}</strong>
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>|</span>
                      <span style={{ color: 'var(--text-gray)' }}>
                        Email: <a href={`mailto:${selectedMessage.email}`} className="email-link" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>{selectedMessage.email}</a>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                      {formatDate(selectedMessage.createdAt)}
                    </span>
                    <button 
                      type="button"
                      className="btn btn-danger btn-icon"
                      onClick={() => setDeleteId(selectedMessage._id)}
                      disabled={actionLoading}
                      title="Delete message"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Original Message Text */}
                <div style={{ marginBottom: '2rem' }}>
                  <label>Message Content</label>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '16px', 
                    padding: '1.25rem', 
                    lineHeight: 1.6, 
                    fontSize: '0.95rem',
                    color: '#e2e8f0',
                    whiteSpace: 'pre-wrap',
                    minHeight: '80px'
                  }}>
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Reply Conversation Thread */}
                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <label>Reply History</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {selectedMessage.replies.map((rep) => (
                        <div 
                          key={rep._id} 
                          style={{ 
                            alignSelf: 'flex-end',
                            background: 'rgba(108, 99, 255, 0.1)', 
                            border: '1px solid rgba(108, 99, 255, 0.25)', 
                            borderRadius: '16px 16px 0 16px', 
                            padding: '1rem', 
                            maxWidth: '85%',
                            boxShadow: '0 4px 12px rgba(108, 99, 255, 0.05)'
                          }}
                        >
                          <div style={{ fontSize: '0.9rem', color: '#fff', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {rep.text}
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-gray)', marginTop: '0.4rem', fontFamily: 'monospace' }}>
                            Replied at: {formatDate(rep.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                <form onSubmit={handleReplyMailto} className="space-y-4">
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Draft Email Reply</span>
                      <span style={{ fontSize: '0.75rem', textTransform: 'none', color: 'var(--text-muted)' }}>
                        Opens your native mail app upon click
                      </span>
                    </label>
                    <textarea
                      placeholder={`Write a reply to ${selectedMessage.name}...`}
                      value={draftReply}
                      onChange={(e) => setDraftReply(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {/* Log only fallback */}
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleReplyLogOnly}
                      disabled={actionLoading || !draftReply.trim()}
                      title="Save reply to database without opening email client"
                      style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}
                    >
                      Log Reply Only
                    </button>

                    {/* Mailto delivery action */}
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={actionLoading || !draftReply.trim()}
                      style={{ fontSize: '0.85rem', padding: '0.6rem 1.4rem' }}
                    >
                      {actionLoading ? (
                        <>
                          <FaSpinner className="animate-spin" /> Drafting...
                        </>
                      ) : (
                        <>
                          Send Email Reply <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              minHeight: '300px', 
              color: 'var(--text-gray)',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '24px',
                background: 'rgba(108, 99, 255, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: '1.25rem',
                border: '1px solid rgba(108, 99, 255, 0.15)'
              }}>
                <FaEnvelope />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No Message Selected
              </h3>
              <p style={{ maxWidth: '300px', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Click a contact message from the inbox list on the left to read it, reply, or manage its logs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
