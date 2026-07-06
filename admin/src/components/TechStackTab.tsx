import React, { useState, useRef } from 'react';
import { adminApi } from '../api';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';
import { FaTrash, FaPlus, FaSave, FaEdit, FaEye, FaTimes } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';

interface TechStackTabProps {
  initialTechStack: any[];
  onRefresh: () => void;
}

export const TECH_PRESETS = [
  { name: 'React', icon: 'SiReact', color: '#61DAFB' },
  { name: 'TypeScript', icon: 'SiTypescript', color: '#3178C6' },
  { name: 'JavaScript', icon: 'SiJavascript', color: '#F7DF1E' },
  { name: 'Node.js', icon: 'SiNodedotjs', color: '#339933' },
  { name: 'MongoDB', icon: 'SiMongodb', color: '#47A248' },
  { name: 'Next.js', icon: 'SiNextdotjs', color: '#FFFFFF' },
  { name: 'Tailwind CSS', icon: 'SiTailwindcss', color: '#06B6D4' },
  { name: 'Framer Motion', icon: 'SiFramermotion', color: '#F43F5E' },
  { name: 'GraphQL', icon: 'SiGraphql', color: '#E10098' },
  { name: 'Docker', icon: 'SiDocker', color: '#2496ED' },
  { name: 'Git', icon: 'SiGit', color: '#F05032' },
  { name: 'GitHub', icon: 'SiGithub', color: '#FFFFFF' },
  { name: 'Python', icon: 'SiPython', color: '#3776AB' },
  { name: 'PostgreSQL', icon: 'SiPostgresql', color: '#4169E1' },
  { name: 'MySQL', icon: 'SiMysql', color: '#4479A1' },
  { name: 'Redis', icon: 'SiRedis', color: '#DC382D' },
  { name: 'AWS', icon: 'SiAmazonaws', color: '#FF9900' },
  { name: 'Firebase', icon: 'SiFirebase', color: '#FFCA28' },
  { name: 'Supabase', icon: 'SiSupabase', color: '#3ECF8E' },
  { name: 'Figma', icon: 'SiFigma', color: '#F24E1E' }
];

function RenderIcon({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) {
  let IconComponent = FaIcons.FaCode;
  try {
    if (iconName.startsWith('Si')) {
      IconComponent = (SiIcons as any)[iconName] || SiIcons.SiCodeclimate;
    } else if (iconName.startsWith('Fa')) {
      IconComponent = (FaIcons as any)[iconName] || FaIcons.FaCode;
    }
  } catch (e) {
    IconComponent = FaIcons.FaCode;
  }
  return <IconComponent className={className} style={style} />;
}

export default function TechStackTab({ initialTechStack, onRefresh }: TechStackTabProps) {
  const techItems = initialTechStack || [];
  const [editingTech, setEditingTech] = useState<any | null>(null);
  const [deleteTechId, setDeleteTechId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('SiReact');
  const [color, setColor] = useState('#61DAFB');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const handleApplyPreset = (preset: { name: string; icon: string; color: string }) => {
    if (editingTech) {
      setEditingTech({
        ...editingTech,
        name: preset.name,
        icon: preset.icon,
        color: preset.color
      });
    } else {
      setName(preset.name);
      setIcon(preset.icon);
      setColor(preset.color);
    }
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !icon.trim() || !color.trim()) return;

    setLoading(true);
    setAlert(null);
    try {
      const payload = {
        name: name.trim(),
        icon: icon.trim(),
        color: color.trim()
      };
      await adminApi.addTechStack(payload);
      setAlert({ type: 'success', text: `${payload.name} created successfully!` });
      setName('');
      setIcon('SiReact');
      setColor('#61DAFB');
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to add technology' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (tech: any) => {
    setEditingTech({ ...tech });
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech || !editingTech.name.trim() || !editingTech.icon.trim() || !editingTech.color.trim()) return;

    setLoading(true);
    setAlert(null);
    try {
      await adminApi.updateTechStack(editingTech._id, {
        name: editingTech.name.trim(),
        icon: editingTech.icon.trim(),
        color: editingTech.color.trim()
      });
      setAlert({ type: 'success', text: `${editingTech.name} updated successfully!` });
      setEditingTech(null);
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to update technology' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTechId) return;
    const id = deleteTechId;
    setDeleteTechId(null);
    setLoading(true);
    setAlert(null);
    try {
      await adminApi.deleteTechStack(id);
      setAlert({ type: 'success', text: 'Technology deleted successfully.' });
      if (editingTech?._id === id) setEditingTech(null);
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to delete technology' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTechId)}
        title="Delete Technology"
        message="Are you sure you want to delete this technology from your tech stack ecosystem?"
        confirmLabel="Delete Tech"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTechId(null)}
      />

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.text}</span>
        </div>
      )}

      {/* Main Responsive Split Grid */}
      <div className="grid-split-skills">
        
        {/* Left Column: Form & Presets */}
        <div ref={formRef} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Preset Technology Badges Selector */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--secondary)' }}>
              Popular Brand Presets
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '1.25rem' }}>
              Click any badge to automatically load its name, brand color, and official icon.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {TECH_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '50px',
                    padding: '0.35rem 0.85rem',
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = preset.color;
                    e.currentTarget.style.boxShadow = `0 0 10px ${preset.color}33`;
                    e.currentTarget.style.background = `${preset.color}0a`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <RenderIcon iconName={preset.icon} style={{ color: preset.color }} />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Create or Edit Form */}
          <div className="glass-panel" style={{ border: editingTech ? '1px solid var(--primary)' : '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ 
                padding: '0.5rem', 
                borderRadius: '10px', 
                background: editingTech ? 'rgba(108,99,255,0.15)' : 'rgba(0,229,255,0.15)', 
                color: editingTech ? 'var(--primary)' : 'var(--secondary)' 
              }}>
                {editingTech ? <FaEdit /> : <FaPlus />}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {editingTech ? `Edit ${editingTech.name}` : 'Add Technology / Tool'}
              </h3>
            </div>

            <form onSubmit={editingTech ? handleUpdate : handleSaveNew} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Technology Name</label>
                <input
                  type="text"
                  value={editingTech ? editingTech.name : name}
                  onChange={(e) => editingTech ? setEditingTech({ ...editingTech, name: e.target.value }) : setName(e.target.value)}
                  placeholder="e.g. React"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>React Icon Name</label>
                  <input
                    type="text"
                    value={editingTech ? editingTech.icon : icon}
                    onChange={(e) => editingTech ? setEditingTech({ ...editingTech, icon: e.target.value }) : setIcon(e.target.value)}
                    placeholder="e.g. SiReact or FaNodeJs"
                    required
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)', marginTop: '0.35rem', display: 'block' }}>
                    Prefix with <strong>Si</strong> for SimpleIcons or <strong>Fa</strong> for FontAwesome.
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Brand / Badge Color</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="color"
                      value={editingTech ? editingTech.color : color}
                      onChange={(e) => editingTech ? setEditingTech({ ...editingTech, color: e.target.value }) : setColor(e.target.value)}
                      style={{
                        padding: '0.2rem',
                        height: '42px',
                        width: '54px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: 'transparent',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <input
                      type="text"
                      value={editingTech ? editingTech.color : color}
                      onChange={(e) => editingTech ? setEditingTech({ ...editingTech, color: e.target.value }) : setColor(e.target.value)}
                      placeholder="#61DAFB"
                      style={{ flex: 1, fontFamily: 'monospace' }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: editingTech ? 'none' : 1 }}>
                  <FaSave /> {editingTech ? 'Update Tech' : 'Save Technology'}
                </button>
                {editingTech && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditingTech(null)}
                    style={{ flex: 1 }}
                  >
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          
          {/* Dynamic Badge Preview Card */}
          <div className="glass-panel" style={{ background: 'rgba(8,7,16,0.95)', border: '1px solid rgba(0,229,255,0.2)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--secondary)' }}>
              <FaEye />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Live Badge Preview
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.01)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
              <div
                className="glass-panel"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  boxShadow: `0 0 15px ${(editingTech ? editingTech.color : color)}0f`,
                  cursor: 'default',
                  width: 'fit-content'
                }}
              >
                <RenderIcon 
                  iconName={editingTech ? editingTech.icon : icon} 
                  style={{ 
                    color: editingTech ? editingTech.color : color,
                    fontSize: '1.15rem',
                    filter: `drop-shadow(0 0 5px ${(editingTech ? editingTech.color : color)})`
                  }} 
                />
                <span style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 600, 
                  color: '#e2e8f0',
                  letterSpacing: '0.02em'
                }}>
                  {editingTech ? (editingTech.name || 'Preview Tech') : (name || 'Preview Tech')}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Active Technologies List */}
        <div className="glass-panel" style={{ minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Active Technologies & Tools</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
              {techItems.length} Badges
            </span>
          </div>

          {techItems.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
              {techItems.map((tech) => {
                const isSelected = editingTech?._id === tech._id;
                return (
                  <div
                    key={tech._id}
                    style={{
                      background: isSelected ? 'rgba(108,99,255,0.06)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: '20px',
                      padding: '1.15rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Visual Brand Glow on Hover */}
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      right: '-15px',
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      background: tech.color,
                      opacity: 0.06,
                      filter: 'blur(10px)',
                      pointerEvents: 'none'
                    }} />

                    {/* Icon & Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: `${tech.color}15`,
                        border: `1px solid ${tech.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tech.color,
                        fontSize: '1.4rem'
                      }}>
                        <RenderIcon iconName={tech.icon} />
                      </div>
                      <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{tech.name}</strong>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-gray)' }}>
                        {tech.color}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                      <button
                        type="button"
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleStartEdit(tech)}
                        style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem 0.5rem', borderRadius: '10px' }}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-icon"
                        onClick={() => setDeleteTechId(tech._id)}
                        style={{ padding: '0.35rem', borderRadius: '10px' }}
                        title="Delete technology"
                      >
                        <FaTrash style={{ fontSize: '0.8rem' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', border: '1px dashed var(--border-color)', borderRadius: '20px', color: 'var(--text-gray)', gap: '0.5rem' }}>
              <p style={{ fontSize: '0.9rem' }}>No technologies in your tech stack yet.</p>
              <p style={{ fontSize: '0.75rem' }}>Click some brand presets on the left or add a custom one to start.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
