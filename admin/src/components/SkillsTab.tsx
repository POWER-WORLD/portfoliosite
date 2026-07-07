import React, { useState, useRef, useEffect } from 'react';
import { adminApi } from '../api';
import * as FaIcons from 'react-icons/fa';
import { FaTrash, FaPlus, FaSave, FaEye, FaEdit, FaCheck, FaArrowLeft } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';
import { safeClamp } from '../utils/security';

interface SkillsTabProps {
  initialSkills: any[];
  initialWelcome?: { title: string; message: string };
  onRefresh: () => void;
}

export const ICON_OPTIONS = [
  { name: 'FaCode', label: 'Code & Frontend (FaCode)', category: 'Frontend' },
  { name: 'FaServer', label: 'Server & Backend (FaServer)', category: 'Backend' },
  { name: 'FaCloud', label: 'Cloud & Infrastructure (FaCloud)', category: 'DevOps' },
  { name: 'FaLayerGroup', label: 'UI/UX & Design Systems (FaLayerGroup)', category: 'UI/UX' },
  { name: 'FaToolbox', label: 'Tools & DevOps (FaToolbox)', category: 'Tools' },
  { name: 'FaDatabase', label: 'Databases & Storage (FaDatabase)', category: 'Backend' },
  { name: 'FaMobile', label: 'Mobile Apps (FaMobile)', category: 'Frontend' },
  { name: 'FaBrain', label: 'AI & Data Systems (FaBrain)', category: 'AI' },
  { name: 'FaPalette', label: 'Design & Visuals (FaPalette)', category: 'UI/UX' },
  { name: 'FaRocket', label: 'Performance & Speed (FaRocket)', category: 'Optimization' },
  { name: 'FaTerminal', label: 'Scripting & CLI (FaTerminal)', category: 'Tools' },
  { name: 'FaShieldAlt', label: 'Security & Auth (FaShieldAlt)', category: 'Security' },
  { name: 'FaDraftingCompass', label: 'Architecture & System Design (FaDraftingCompass)', category: 'Architecture' },
  { name: 'FaCogs', label: 'Engineering & Automation (FaCogs)', category: 'Tools' },
  { name: 'FaUsers', label: 'Leadership & Management (FaUsers)', category: 'Soft Skills' },
  { name: 'FaGlobe', label: 'Web Services & APIs (FaGlobe)', category: 'Backend' },
];

export const CATEGORY_TYPES = [
  'Frontend',
  'Backend',
  'DevOps',
  'Architecture',
  'UI/UX',
  'Leadership',
  'Technical'
];

export const PROFICIENCY_TAGS = [
  'Expert',
  'Core Specialty',
  'Mastery',
  'Advanced',
  'Proficient'
];

function RenderIcon({ iconName, className }: { iconName: string; className?: string }) {
  const IconComponent = (FaIcons as any)[iconName] || FaIcons.FaCode;
  return <IconComponent className={className} />;
}

export default function SkillsTab({ initialSkills, initialWelcome, onRefresh }: SkillsTabProps) {
  const categories = initialSkills || [];
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Welcome Note States
  const [welcomeTitle, setWelcomeTitle] = useState(initialWelcome?.title || 'Welcome to My Tech Stack');
  const [welcomeMessage, setWelcomeMessage] = useState(initialWelcome?.message || 'This book showcases my core competencies, architectural capabilities, and tech stack proficiencies.');
  const [savingWelcome, setSavingWelcome] = useState(false);

  useEffect(() => {
    if (initialWelcome) {
      setWelcomeTitle(initialWelcome.title || 'Welcome to My Tech Stack');
      setWelcomeMessage(initialWelcome.message || 'This book showcases my core competencies, architectural capabilities, and tech stack proficiencies.');
    }
  }, [initialWelcome]);

  // New Category Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('Frontend');
  const [newDescription, setNewDescription] = useState('');
  const [newIcon, setNewIcon] = useState('FaCode');

  // Skill editing state (inside category editor)
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(85);
  const [newSkillExp, setNewSkillExp] = useState('4+ Yrs');
  const [newSkillTag, setNewSkillTag] = useState('Advanced');

  // Capability bullet input
  const [newCapabilityText, setNewCapabilityText] = useState('');

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
        categoryType: newCategoryType,
        description: newDescription,
        icon: newIcon,
        capabilities: [],
        skills: []
      };
      await adminApi.addSkillCategory(payload);
      setAlert({ type: 'success', text: 'Skill category created successfully!' });
      setNewTitle('');
      setNewDescription('');
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to add category' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    const id = deleteCategoryId;
    setDeleteCategoryId(null);
    setLoading(true);
    setAlert(null);
    try {
      await adminApi.deleteSkillCategory(id);
      setAlert({ type: 'success', text: 'Skill category deleted successfully.' });
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
    setNewSkillLevel(85);
    setNewSkillExp('4+ Yrs');
    setNewSkillTag('Advanced');
    setNewCapabilityText('');
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Add Skill Item
  const handleAddSkill = () => {
    if (!newSkillName.trim() || !editingCategory) return;
    const skillsList = editingCategory.skills || [];
    editingCategory.skills = [
      ...skillsList,
      {
        name: newSkillName.trim(),
        level: safeClamp(newSkillLevel),
        experience: newSkillExp.trim(),
        tag: newSkillTag
      }
    ];
    setEditingCategory({ ...editingCategory });
    setNewSkillName('');
    setNewSkillLevel(85);
    setNewSkillExp('4+ Yrs');
    setNewSkillTag('Advanced');
  };

  // Remove Skill Item
  const handleRemoveSkill = (skillIdx: number) => {
    if (!editingCategory) return;
    editingCategory.skills = editingCategory.skills.filter((_: any, idx: number) => idx !== skillIdx);
    setEditingCategory({ ...editingCategory });
  };

  // Modify Skill Item Attributes
  const handleSkillChange = (skillIdx: number, field: string, value: any) => {
    if (!editingCategory) return;
    editingCategory.skills[skillIdx][field] = field === 'level' ? safeClamp(value) : value;
    setEditingCategory({ ...editingCategory });
  };

  // Capability list operations
  const handleAddCapability = () => {
    if (!newCapabilityText.trim() || !editingCategory) return;
    const caps = editingCategory.capabilities || [];
    editingCategory.capabilities = [...caps, newCapabilityText.trim()];
    setEditingCategory({ ...editingCategory });
    setNewCapabilityText('');
  };

  const handleRemoveCapability = (capIdx: number) => {
    if (!editingCategory) return;
    editingCategory.capabilities = editingCategory.capabilities.filter((_: any, idx: number) => idx !== capIdx);
    setEditingCategory({ ...editingCategory });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    setLoading(true);
    setAlert(null);
    try {
      await adminApi.updateSkillCategory(editingCategory._id, editingCategory);
      setAlert({ type: 'success', text: 'Category & skill details saved successfully!' });
      setEditingCategory(null);
      onRefresh();
    } catch (err: any) {
      setAlert({ type: 'danger', text: err.message || 'Failed to save changes' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCategoryId)}
        title="Delete Skill Category"
        message="Are you sure you want to delete this skill category and all its associated skills?"
        confirmLabel="Delete Category"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setDeleteCategoryId(null)}
      />

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.text}</span>
        </div>
      )}

      {/* Skills Book Welcome Note Settings */}
      <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary)', padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(108,99,255,0.15)', color: 'var(--primary)' }}>
            <FaEdit />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Skills Book Welcome Note</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Welcome Page Title</label>
            <input
              type="text"
              value={welcomeTitle}
              onChange={(e) => setWelcomeTitle(e.target.value)}
              placeholder="e.g. Welcome to My Tech Stack"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Welcome Message / Preface</label>
            <textarea
              rows={3}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Describe the layout of this skills book or write a short intro..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              setSavingWelcome(true);
              setAlert(null);
              try {
                await adminApi.updateSkillsWelcome({ title: welcomeTitle, message: welcomeMessage });
                setAlert({ type: 'success', text: 'Welcome note updated successfully!' });
                onRefresh();
              } catch (err: any) {
                setAlert({ type: 'danger', text: err.message || 'Failed to update welcome note' });
              } finally {
                setSavingWelcome(false);
              }
            }}
            disabled={savingWelcome || loading}
            style={{ width: 'fit-content', marginTop: '0.5rem' }}
          >
            <FaSave /> {savingWelcome ? 'Saving...' : 'Save Welcome Note'}
          </button>
        </div>
      </div>

      {/* Main Grid: Categories List vs Detailed Config Editor */}
      <div className={editingCategory ? "grid-split-skills" : ""}>
        
        {/* Left Column: Create New Category & Active Categories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Create Category Form */}
          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(108,99,255,0.15)', color: 'var(--primary)' }}>
                <FaPlus />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create Skill Category</h3>
            </div>

            <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="e.g. Frontend Engineering & React" 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Category Badge Type</label>
                  <select value={newCategoryType} onChange={(e) => setNewCategoryType(e.target.value)}>
                    {CATEGORY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Visual Icon</label>
                  <select value={newIcon} onChange={(e) => setNewIcon(e.target.value)}>
                    {ICON_OPTIONS.map((ico) => (
                      <option key={ico.name} value={ico.name}>{ico.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category Summary / Description</label>
                <input 
                  type="text" 
                  value={newDescription} 
                  onChange={(e) => setNewDescription(e.target.value)} 
                  placeholder="e.g. Architecting high-performance client web apps with modern React ecosystem." 
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'fit-content', marginTop: '0.5rem' }}>
                <FaPlus /> Create Category
              </button>
            </form>
          </div>

          {/* Active Categories List */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Active Skill Categories</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                {categories.length} Categories
              </span>
            </div>

            {categories.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {categories.map((cat) => {
                  const isSelected = editingCategory?._id === cat._id;
                  return (
                    <div 
                      key={cat._id} 
                      style={{ 
                        background: isSelected ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.02)', 
                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)', 
                        padding: '1.25rem', 
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '12px', 
                            background: 'rgba(0,229,255,0.1)', 
                            border: '1px solid rgba(0,229,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--secondary)',
                            fontSize: '1.2rem',
                            flexShrink: 0
                          }}>
                            <RenderIcon iconName={cat.icon} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '1.05rem' }}>{cat.title}</strong>
                              <span style={{ 
                                fontSize: '0.68rem', 
                                background: 'rgba(108,99,255,0.2)', 
                                color: 'var(--primary)', 
                                border: '1px solid rgba(108,99,255,0.3)',
                                padding: '0.1rem 0.4rem', 
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                fontWeight: 700 
                              }}>
                                {cat.categoryType || 'Technical'}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginTop: '0.2rem' }}>
                              {cat.skills?.length || 0} skills configured &bull; {cat.capabilities?.length || 0} capabilities listed
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            type="button" 
                            className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleStartEdit(cat)}
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                          >
                            <FaEdit /> {isSelected ? 'Editing' : 'Configure'}
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-danger btn-icon" 
                            onClick={() => setDeleteCategoryId(cat._id)}
                            title="Delete category"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      {cat.description && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-gray)', lineClamp: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {cat.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>No skill categories created yet. Create your first category above.</p>
            )}
          </div>
        </div>

        {/* Right Column: Active Category Deep Config Editor + Live Preview */}
        {editingCategory ? (
          <div ref={editorRef} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Category Meta & Capability Configurator */}
            <div className="glass-panel" style={{ border: '1px solid var(--primary)', borderLeft: '4px solid var(--secondary)', boxShadow: '0 0 25px rgba(108,99,255,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                    Configuring Category
                  </span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{editingCategory.title}</h3>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button type="button" className="btn btn-primary" onClick={handleSaveCategory} disabled={loading} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                    <FaSave /> Save Changes
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingCategory(null)} style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}>
                    <FaArrowLeft /> Done Editing
                  </button>
                </div>
              </div>

              {/* Editable Category Header Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Title</label>
                  <input 
                    type="text" 
                    value={editingCategory.title} 
                    onChange={(e) => setEditingCategory({ ...editingCategory, title: e.target.value })} 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Category Badge Type</label>
                    <select 
                      value={editingCategory.categoryType || 'Frontend'} 
                      onChange={(e) => setEditingCategory({ ...editingCategory, categoryType: e.target.value })}
                    >
                      {CATEGORY_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Visual Icon</label>
                    <select 
                      value={editingCategory.icon} 
                      onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    >
                      {ICON_OPTIONS.map((ico) => (
                        <option key={ico.name} value={ico.name}>{ico.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Category Subtitle / Description</label>
                  <textarea 
                    rows={2}
                    value={editingCategory.description || ''} 
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} 
                    placeholder="Provide a overview of what this skill domain encompasses..."
                  />
                </div>

                {/* Capabilities Highlights Editor */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '16px' }}>
                  <label style={{ marginBottom: '0.75rem', display: 'block' }}>Domain Capability Highlights</label>
                  
                  {/* Current capabilities chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {editingCategory.capabilities && editingCategory.capabilities.map((cap: string, cIdx: number) => (
                      <span key={cIdx} style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.4rem', 
                        background: 'rgba(0,229,255,0.1)', 
                        border: '1px solid rgba(0,229,255,0.2)',
                        color: '#00e5ff',
                        padding: '0.3rem 0.7rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}>
                        <FaCheck style={{ fontSize: '0.7rem' }} /> {cap}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveCapability(cIdx)} 
                          style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', marginLeft: '0.2rem' }}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    {(!editingCategory.capabilities || editingCategory.capabilities.length === 0) && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>No domain capability highlights added yet.</span>
                    )}
                  </div>

                  {/* Add capability input */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. Micro-Frontend & SSR Architecture" 
                      value={newCapabilityText}
                      onChange={(e) => setNewCapabilityText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCapability(); } }}
                      style={{ fontSize: '0.85rem', flex: 1, minWidth: '180px' }}
                    />
                    <button type="button" className="btn btn-secondary" onClick={handleAddCapability} style={{ whiteSpace: 'nowrap' }}>
                      <FaPlus /> Add Bullet
                    </button>
                  </div>
                </div>
              </div>

              {/* Skills List Editor */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Skills & Proficiency Items</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {editingCategory.skills && editingCategory.skills.map((skill: any, idx: number) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '14px' }}>
                      
                      <div className="skill-item-editor-grid" style={{ marginBottom: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>Skill Name</label>
                          <input 
                            type="text" 
                            value={skill.name} 
                            onChange={(e) => handleSkillChange(idx, 'name', e.target.value)} 
                            style={{ fontSize: '0.88rem', padding: '0.6rem 0.8rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>Experience Years</label>
                          <input 
                            type="text" 
                            value={skill.experience || ''} 
                            onChange={(e) => handleSkillChange(idx, 'experience', e.target.value)} 
                            placeholder="e.g. 5+ Yrs"
                            style={{ fontSize: '0.88rem', padding: '0.6rem 0.8rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>Proficiency Tag</label>
                          <select 
                            value={skill.tag || 'Advanced'} 
                            onChange={(e) => handleSkillChange(idx, 'tag', e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '0.6rem 2rem 0.6rem 0.8rem' }}
                          >
                            {PROFICIENCY_TAGS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        <button 
                          type="button" 
                          className="btn btn-danger btn-icon" 
                          onClick={() => handleRemoveSkill(idx)}
                          style={{ alignSelf: 'flex-end', marginBottom: '0.1rem' }}
                          title="Remove Skill"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      {/* Level range slider */}
                      <div className="range-slider-container">
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)', minWidth: '70px' }}>Level %:</span>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={skill.level} 
                          onChange={(e) => handleSkillChange(idx, 'level', parseInt(e.target.value))}
                        />
                        <span className="range-slider-value">{skill.level}%</span>
                      </div>
                    </div>
                  ))}

                  {(!editingCategory.skills || editingCategory.skills.length === 0) && (
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>No skills added in this category yet. Add one below.</p>
                  )}
                </div>

                {/* Form to append new skill */}
                <div style={{ background: 'rgba(108,99,255,0.03)', border: '1px dashed var(--primary-glow)', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>+ Add New Skill Item</h4>
                  
                  <div className="skill-item-add-grid">
                    <input 
                      type="text" 
                      placeholder="Skill Name (e.g. Next.js 15)" 
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Exp (e.g. 4+ Yrs)" 
                      value={newSkillExp}
                      onChange={(e) => setNewSkillExp(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                    <select 
                      value={newSkillTag} 
                      onChange={(e) => setNewSkillTag(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    >
                      {PROFICIENCY_TAGS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="range-slider-container">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)', minWidth: '70px' }}>Level %:</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={newSkillLevel} 
                      onChange={(e) => setNewSkillLevel(parseInt(e.target.value))}
                    />
                    <span className="range-slider-value">{newSkillLevel}%</span>
                  </div>

                  <button type="button" className="btn btn-secondary" onClick={handleAddSkill} style={{ width: 'fit-content' }}>
                    <FaPlus /> Add Skill to Category
                  </button>
                </div>
              </div>

              {/* Save Category Actions */}
              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-primary" onClick={handleSaveCategory} disabled={loading}>
                  <FaSave /> Save Category & Skills
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCategory(null)}>
                  Cancel
                </button>
              </div>
            </div>

            {/* Live Interactive Frontend Card Preview */}
            <div className="glass-panel" style={{ background: 'rgba(8,7,16,0.95)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: '24px', padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--secondary)' }}>
                <FaEye />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Live Frontend Preview
                </span>
              </div>

              {/* Preview Card */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                borderRadius: '20px', 
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ 
                    padding: '0.75rem', 
                    borderRadius: '14px', 
                    background: 'rgba(108,99,255,0.1)', 
                    border: '1px solid rgba(108,99,255,0.2)',
                    color: '#00e5ff',
                    fontSize: '1.3rem' 
                  }}>
                    <RenderIcon iconName={editingCategory.icon} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{editingCategory.title || 'Category Title'}</h4>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(0,229,255,0.15)', color: '#00e5ff', padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                        {editingCategory.categoryType || 'Technical'}
                      </span>
                    </div>
                    {editingCategory.description && (
                      <p style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.2rem' }}>{editingCategory.description}</p>
                    )}
                  </div>
                </div>

                {/* Progress bars preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  {editingCategory.skills?.map((sk: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#fff', fontWeight: 600 }}>{sk.name}</span>
                          {sk.experience && (
                            <span style={{ fontSize: '0.65rem', color: '#a0aec0', background: 'rgba(255,255,255,0.06)', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>
                              {sk.experience}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {sk.tag && (
                            <span style={{ fontSize: '0.65rem', color: '#6c63ff', fontWeight: 700 }}>
                              {sk.tag}
                            </span>
                          )}
                          <span style={{ color: '#00e5ff', fontFamily: 'monospace', fontWeight: 700 }}>{sk.level}%</span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: `${sk.level}%`, height: '100%', background: 'linear-gradient(to right, #6c63ff, #00e5ff)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Capabilities preview */}
                {editingCategory.capabilities && editingCategory.capabilities.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.85rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                      Capabilities & Strengths
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {editingCategory.capabilities.map((c: string, idx: number) => (
                        <span key={idx} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          &bull; {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
