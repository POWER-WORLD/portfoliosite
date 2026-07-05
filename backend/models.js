import mongoose from 'mongoose';

// Personal Info Schema
const PersonalInfoSchema = new mongoose.Schema({
  name: { type: String, default: 'Pawan Kumar' },
  title: { type: String, default: 'Full Stack & React Engineer' },
  tagline: { type: String, default: 'Crafting high-performance web applications.' },
  location: { type: String, default: '' },
  email: { type: String, default: '' },
  resumeUrl: { type: String, default: '#' },
  resumes: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// About Schema
const AboutSchema = new mongoose.Schema({
  story: { type: String, default: '' },
  highlights: [{
    title: { type: String, required: true },
    desc: { type: String, required: true }
  }],
  education: [{
    degree: { type: String, required: true },
    school: { type: String, required: true },
    year: { type: String, required: true },
    description: { type: String, default: '' }
  }]
}, { timestamps: true });

// Skill Schema
const SkillCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  categoryType: { type: String, default: 'Technical' }, // e.g. 'Frontend', 'Backend', 'DevOps', 'Architecture', 'Leadership'
  description: { type: String, default: '' },
  icon: { type: String, required: true }, // Name of the Fa icon component, e.g. "FaCode"
  capabilities: [{ type: String }], // Array of domain capability highlights
  skills: [{
    name: { type: String, required: true },
    level: { type: Number, required: true, min: 0, max: 100 },
    experience: { type: String, default: '' }, // e.g. "5+ Years", "4 Years"
    tag: { type: String, default: 'Advanced' }, // e.g. "Expert", "Advanced", "Proficient", "Core Specialty"
    icon: { type: String, default: '' }
  }]
}, { timestamps: true });

// Project Schema
const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['all', 'fullstack', 'frontend', 'backend', 'android', 'ios', 'desktop', 'game', 'web3', 'python', 'ai_ml', 'other', 'creative'] 
  },
  tags: [{ type: String }],
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' } // Base64 string or standard URL
}, { timestamps: true });

// Experience Schema
const ExperienceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  period: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: true });

// Certificate Schema
const CertificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: { type: String, required: true },
  date: { type: String, required: true },
  credentialUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' } // Base64 or standard URL
}, { timestamps: true });

// Achievement Schema
const AchievementSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  label: { type: String, required: true },
  suffix: { type: String, default: '' }
}, { timestamps: true });

// Admin Password hash Schema
const AdminPasswordSchema = new mongoose.Schema({
  hash: { type: String, required: true }
});

// Contact Message Schema
const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true }
}, { timestamps: true });

export const PersonalInfo = mongoose.model('PersonalInfo', PersonalInfoSchema);
export const About = mongoose.model('About', AboutSchema);
export const SkillCategory = mongoose.model('SkillCategory', SkillCategorySchema);
export const Project = mongoose.model('Project', ProjectSchema);
export const Experience = mongoose.model('Experience', ExperienceSchema);
export const Certificate = mongoose.model('Certificate', CertificateSchema);
export const Achievement = mongoose.model('Achievement', AchievementSchema);
export const AdminPassword = mongoose.model('AdminPassword', AdminPasswordSchema);
export const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema);

