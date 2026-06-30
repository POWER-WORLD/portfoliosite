import React, { useState } from 'react';
import { adminApi } from '../api';
import { FaCode, FaServer, FaToolbox, FaTrash, FaPlus, FaSave } from 'react-icons/fa';

interface SkillsTabProps {
  initialSkills: any[];
  onRefresh: () => void;
}

const STATIC_ICONS = [
  { name: 'FaCode', label: 'Frontend Code (FaCode)' },
  { name: 'FaServer', label: 'Backend Database (FaServer)' },
  { name: 'FaToolbox', label: 'DevOps Tooling (FaToolbox)' },
];

export default function SkillsTab({ initialSkills, onRefresh }: SkillsTabProps) {
  const categories = initialSkills || [];
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // New Category Form State
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('FaCode');

  // New Skill Form State (inside category edit modal/form)
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(80);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    setAlert(null);
    try {
      const payload = {
        title: newTitle,
        icon: newIcon,
        skills: []
      };
      await adminApi.addSkillCategory(payload);
      setAlert({ type: 'success', text: 'Skill Category added successfully!' });
      setNewTitle('');
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to add category' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Entire skill category?')) return;

    setLoading(true);
    setAlert(null);
    try {
      await adminApi.deleteSkillCategory(id);
      setAlert({ type: 'success', text: 'Category deleted!' });
      if (editingCategory?._id === id) setEditingCategory(null);
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to delete' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (category: any) => {
    setEditingCategory(JSON.parse(JSON.stringify(category))); // Deep copy
    setNewSkillName('');
    setNewSkillLevel(80);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim() || !editingCategory) return;
    const skillsList = editingCategory.skills || [];
    editingCategory.skills = [...skillsList, { name: newSkillName, level: newSkillLevel }];
    setEditingCategory({ ...editingCategory });
    setNewSkillName('');
    setNewSkillLevel(80);
  };

  const handleRemoveSkill = (skillIdx: number) => {
    if (!editingCategory) return;
    editingCategory.skills = editingCategory.skills.filter((_: any, idx: number) => idx !== skillIdx);
    setEditingCategory({ ...editingCategory });
  };

  const handleSkillLevelChange = (skillIdx: number, level: number) => {
    if (!editingCategory) return;
    editingCategory.skills[skillIdx].level = level;
    setEditingCategory({ ...editingCategory });
  };

  const handleSaveCategorySkills = async () => {
    if (!editingCategory) return;
    setLoading(true);
    setAlert(null);
    try {
      await adminApi.updateSkillCategory(editingCategory._id, editingCategory);
      setAlert({ type: 'success', text: 'Skill levels saved!' });
      setEditingCategory(null);
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to save skill changes' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.text}</span>
        </div>
      )}

      {/* Grid of existing skill categories + editor panel */}
      <div style={{ display: 'grid', gridTemplateColumns: editingCategory ? '1fr 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left pane: categories list & add category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Create Category form */}
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1.25rem' }}>Create Skill Category</h3>
            <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="e.g. Mobile Engineering, Web3" 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Visual Icon</label>
                <select value={newIcon} onChange={(e) => setNewIcon(e.target.value)}>
                  {STATIC_ICONS.map((ico) => (
                    <option key={ico.name} value={ico.name}>{ico.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'fit-content' }}>
                <FaPlus /> Create Category
              </button>
            </form>
          </div>

          {/* List display */}
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1.25rem' }}>Active Skill Categories</h3>
            {categories.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {categories.map((cat) => {
                  let IconComp = FaCode;
                  if (cat.icon === 'FaServer') IconComp = FaServer;
                  if (cat.icon === 'FaToolbox') IconComp = FaToolbox;
                  
                  return (
                    <div 
                      key={cat._id} 
                      style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid var(--border-color)', 
                        padding: '1.25rem', 
                        borderRadius: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        ...(editingCategory?._id === cat._id ? { borderColor: 'var(--primary)', background: 'rgba(108,99,255,0.04)' } : {})
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ color: 'var(--secondary)', fontSize: '1.2rem' }}><IconComp /></div>
                        <div>
                          <strong style={{ display: 'block' }}>{cat.title}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-gray)' }}>{cat.skills?.length || 0} skill items configured</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => handleStartEdit(cat)}>
                          Configure Skills
                        </button>
                        <button type="button" className="btn btn-danger btn-icon" onClick={() => handleDeleteCategory(cat._id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>No skill categories created yet.</p>
            )}
          </div>
        </div>

        {/* Right pane: configure skills inside selected category */}
        {editingCategory && (
          <div className="glass-panel" style={{ borderLeft: '3px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Editing Category</span>
                <h3 style={{ fontSize: '1.5rem' }}>{editingCategory.title}</h3>
              </div>
              <button type="button" className="modal-close" onClick={() => setEditingCategory(null)}>&times;</button>
            </div>

            {/* List of skills in category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              {editingCategory.skills && editingCategory.skills.map((skill: any, idx: number) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{skill.name}</strong>
                    <button type="button" className="btn btn-danger" onClick={() => handleRemoveSkill(idx)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                      Remove
                    </button>
                  </div>
                  <div className="range-slider-container">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={skill.level} 
                      onChange={(e) => handleSkillLevelChange(idx, parseInt(e.target.value))}
                    />
                    <span className="range-slider-value">{skill.level}%</span>
                  </div>
                </div>
              ))}
              {(!editingCategory.skills || editingCategory.skills.length === 0) && (
                <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>No skills added inside this category. Create one below.</p>
              )}
            </div>

            {/* Form to add skill inside category */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Add Skill Element</h4>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input 
                  type="text" 
                  placeholder="e.g. Next.js, Framer Motion" 
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ marginBottom: '0.4rem', display: 'block', fontSize: '0.75rem' }}>Initial Level</label>
                <div className="range-slider-container">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={newSkillLevel} 
                    onChange={(e) => setNewSkillLevel(parseInt(e.target.value))}
                  />
                  <span className="range-slider-value">{newSkillLevel}%</span>
                </div>
              </div>
              <button type="button" className="btn btn-secondary" onClick={handleAddSkill} style={{ width: 'fit-content' }}>
                <FaPlus /> Add to Category
              </button>
            </div>

            {/* Actions for editing category */}
            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button type="button" className="btn btn-primary" onClick={handleSaveCategorySkills} disabled={loading}>
                <FaSave /> Save Changes
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingCategory(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
