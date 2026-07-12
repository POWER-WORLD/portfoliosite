import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { 
  PersonalInfo, 
  About, 
  SkillCategory, 
  Project, 
  Experience, 
  Certificate, 
  Achievement,
  AdminPassword,
  ResumePassword,
  ContactMessage,
  TechStack,
  SkillsWelcome
} from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';

// Load environmental variables
dotenv.config();

const router = express.Router();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_DB_URL;
const supabaseKey = process.env.SUPABASE_DB_KEY;
let supabase;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('[Supabase Warning] SUPABASE_DB_URL or SUPABASE_DB_KEY is not defined in backend env.');
}

// Configure multer memory storage for binary uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max limit (matches the frontend config)
  }
});

// ----------------------------------------------------
// FILE UPLOADS (SUPABASE STORAGE)
// ----------------------------------------------------
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client is not configured on the server.' });
    }

    // Sanitize file name to avoid issues with special characters in paths
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${Date.now()}-${cleanFileName}`;

    // Determine storage folder based on MIME type or extension
    let folder = 'others';
    if (file.mimetype.startsWith('image/')) {
      folder = 'images';
    } else if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      folder = 'resumes';
    }

    const filePath = `${folder}/${uniqueFileName}`;
    const bucketName = process.env.SUPABASE_BUCKET || 'portfoliosite_files';

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('[Supabase Upload Error]', error);
      return res.status(500).json({ error: `Supabase upload failed: ${error.message}` });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return res.json({ url: publicUrl });
  } catch (err) {
    console.error('[Upload API Error]', err);
    return res.status(500).json({ error: err.message || 'Server error during upload.' });
  }
});

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------
router.post('/auth/login', async (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password string is required' });
  }
  try {
    let adminRecord = await AdminPassword.findOne();
    if (!adminRecord) {
      // Fallback/auto-create a default admin password if database is not seeded
      const salt = await bcrypt.genSalt(10);
      const defaultHash = await bcrypt.hash('admin123', salt);
      adminRecord = new AdminPassword({ hash: defaultHash });
      await adminRecord.save();
    }

    const isMatch = await bcrypt.compare(password, adminRecord.hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server authentication secret is not configured.' });
    }
    // Generate JWT token
    const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '7d' });
    return res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Check if token is valid
router.get('/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true });
});

// Change admin login password
router.put('/auth/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  try {
    let adminRecord = await AdminPassword.findOne();
    if (!adminRecord) {
      // Fallback/auto-create a default admin password if database is not seeded
      const salt = await bcrypt.genSalt(10);
      const defaultHash = await bcrypt.hash('admin123', salt);
      adminRecord = new AdminPassword({ hash: defaultHash });
      await adminRecord.save();
    }

    const isMatch = await bcrypt.compare(currentPassword, adminRecord.hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const salt = await bcrypt.genSalt(10);
    adminRecord.hash = await bcrypt.hash(newPassword, salt);
    await adminRecord.save();

    return res.json({ success: true, message: 'Admin login password updated successfully' });
  } catch (error) {
    console.error('Change admin password error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ----------------------------------------------------
// PUBLIC PORTFOLIO FEED
// ----------------------------------------------------
router.get('/portfolio', async (req, res) => {
  try {
    const rawPersonalInfo = await PersonalInfo.findOne() || {};
    const personalInfo = rawPersonalInfo.toObject ? rawPersonalInfo.toObject() : { ...rawPersonalInfo };
    const hasResume = !!(personalInfo.resumeUrl && personalInfo.resumeUrl !== '#');
    delete personalInfo.resumeUrl;
    delete personalInfo.resumes;
    personalInfo.hasResume = hasResume;

    const about = await About.findOne() || {};
    const skills = await SkillCategory.find() || [];
    const projects = await Project.find() || [];
    const experience = await Experience.find().sort({ createdAt: -1 }) || [];
    const certificates = await Certificate.find() || [];
    const achievements = await Achievement.find() || [];
    const techStack = await TechStack.find() || [];
    const skillsWelcome = await SkillsWelcome.findOne() || {
      title: 'Welcome to My Tech Stack',
      message: 'This book showcases my core competencies, architectural capabilities, and tech stack proficiencies.'
    };

    res.json({
      personalInfo,
      about,
      skills,
      projects,
      experience,
      certificates,
      achievements,
      techStack,
      skillsWelcome
    });
  } catch (error) {
    console.error('Fetch portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// ----------------------------------------------------
// PERSONAL INFO (PUT)
// ----------------------------------------------------
router.put('/personal-info', authMiddleware, async (req, res) => {
  try {
    let info = await PersonalInfo.findOne();
    if (!info) {
      info = new PersonalInfo(req.body);
    } else {
      Object.assign(info, req.body);
    }
    await info.save();
    res.json(info);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Resume URL explicitly
router.patch('/personal-info/resume', authMiddleware, async (req, res) => {
  try {
    const { resumeUrl } = req.body;
    let info = await PersonalInfo.findOne();
    if (!info) {
      info = new PersonalInfo({ resumeUrl: resumeUrl || '#' });
    } else {
      info.resumeUrl = resumeUrl || '#';
    }
    await info.save();
    res.json({ success: true, resumeUrl: info.resumeUrl });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ----------------------------------------------------
// MULTIPLE RESUMES MANAGEMENT
// ----------------------------------------------------

// Add a new resume entry
router.post('/personal-info/resumes', authMiddleware, async (req, res) => {
  try {
    const { title, url, isActive } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL/File are required.' });
    }
    let info = await PersonalInfo.findOne();
    if (!info) {
      info = new PersonalInfo({});
    }

    const newResume = {
      id: Date.now().toString(),
      title,
      url,
      isActive: Boolean(isActive || info.resumes.length === 0),
      createdAt: new Date()
    };

    if (newResume.isActive) {
      info.resumes.forEach(r => r.isActive = false);
      info.resumeUrl = url;
    }

    info.resumes.push(newResume);
    await info.save();
    res.status(201).json(info);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Set active resume by ID
router.patch('/personal-info/resumes/:id/active', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let info = await PersonalInfo.findOne();
    if (!info) return res.status(404).json({ error: 'Personal info record not found' });

    let activeUrl = '#';
    let found = false;

    info.resumes.forEach(r => {
      if (r.id === id) {
        r.isActive = true;
        activeUrl = r.url;
        found = true;
      } else {
        r.isActive = false;
      }
    });

    if (!found) {
      return res.status(404).json({ error: 'Resume entry not found' });
    }

    info.resumeUrl = activeUrl;
    await info.save();
    res.json(info);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete resume entry by ID
router.delete('/personal-info/resumes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let info = await PersonalInfo.findOne();
    if (!info) return res.status(404).json({ error: 'Personal info record not found' });

    const wasActive = info.resumes.some(r => r.id === id && r.isActive);
    info.resumes = info.resumes.filter(r => r.id !== id);

    if (wasActive) {
      if (info.resumes.length > 0) {
        info.resumes[0].isActive = true;
        info.resumeUrl = info.resumes[0].url;
      } else {
        info.resumeUrl = '#';
      }
    }

    await info.save();
    res.json(info);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ----------------------------------------------------
// ABOUT (PUT)
// ----------------------------------------------------
router.put('/about', authMiddleware, async (req, res) => {
  try {
    let aboutObj = await About.findOne();
    if (!aboutObj) {
      aboutObj = new About(req.body);
    } else {
      Object.assign(aboutObj, req.body);
    }
    await aboutObj.save();
    res.json(aboutObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ----------------------------------------------------
// SKILLS (CRUD)
// ----------------------------------------------------
router.post('/skills', authMiddleware, async (req, res) => {
  try {
    const newCategory = new SkillCategory(req.body);
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/skills/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await SkillCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Skill category not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/skills/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await SkillCategory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Skill category not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Skills Welcome endpoints
router.get('/skills-welcome', async (req, res) => {
  try {
    const welcome = await SkillsWelcome.findOne() || {
      title: 'Welcome to My Tech Stack',
      message: 'This book showcases my core competencies, architectural capabilities, and tech stack proficiencies.'
    };
    res.json(welcome);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills welcome note' });
  }
});

router.put('/skills-welcome', authMiddleware, async (req, res) => {
  try {
    let welcome = await SkillsWelcome.findOne();
    if (!welcome) {
      welcome = new SkillsWelcome(req.body);
    } else {
      Object.assign(welcome, req.body);
    }
    await welcome.save();
    res.json(welcome);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ----------------------------------------------------
// PROJECTS (CRUD)
// ----------------------------------------------------
router.post('/projects', authMiddleware, async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ----------------------------------------------------
// EXPERIENCE (CRUD)
// ----------------------------------------------------
router.post('/experience', authMiddleware, async (req, res) => {
  try {
    const newExp = new Experience(req.body);
    await newExp.save();
    res.status(201).json(newExp);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/experience/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Experience not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/experience/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Experience.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Experience not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ----------------------------------------------------
// CERTIFICATES (CRUD)
// ----------------------------------------------------
router.post('/certificates', authMiddleware, async (req, res) => {
  try {
    const newCert = new Certificate(req.body);
    await newCert.save();
    res.status(201).json(newCert);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/certificates/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Certificate not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/certificates/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Certificate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Certificate not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ----------------------------------------------------
// ACHIEVEMENTS (CRUD)
// ----------------------------------------------------
router.post('/achievements', authMiddleware, async (req, res) => {
  try {
    const newAchievement = new Achievement(req.body);
    await newAchievement.save();
    res.status(201).json(newAchievement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/achievements/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Achievement not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/achievements/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Achievement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Achievement not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ----------------------------------------------------
// TECH STACK (CRUD)
// ----------------------------------------------------
router.post('/techstack', authMiddleware, async (req, res) => {
  try {
    const newTech = new TechStack(req.body);
    await newTech.save();
    res.status(201).json(newTech);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/techstack/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await TechStack.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Technology not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/techstack/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await TechStack.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Technology not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ----------------------------------------------------
// CONTACT (POST)
// ----------------------------------------------------
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const newMsg = new ContactMessage({ name, email, subject, message });
    await newMsg.save();
    res.status(201).json({ success: true, message: 'Message saved successfully' });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ error: 'Failed to submit contact message' });
  }
});

// ----------------------------------------------------
// CONTACT MESSAGES MANAGEMENT (ADMIN ONLY)
// ----------------------------------------------------
router.get('/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.delete('/messages/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Message not found' });
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

router.delete('/messages', authMiddleware, async (req, res) => {
  try {
    await ContactMessage.deleteMany({});
    res.json({ message: 'All messages deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all messages' });
  }
});

router.post('/messages/:id/reply', authMiddleware, async (req, res) => {
  try {
    const { replyText } = req.body;
    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Save reply to database
    message.replies.push({ text: replyText });
    await message.save();
    
    res.json({
      success: true,
      message: 'Reply logged successfully',
      reply: message.replies[message.replies.length - 1]
    });
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({ error: error.message || 'Failed to record reply' });
  }
});

// ----------------------------------------------------
// RESUME DOWNLOAD PASSWORDS MANAGEMENT (ADMIN & PUBLIC)
// ----------------------------------------------------

// Verify a 4-digit code and return active resume url (PUBLIC)
router.post('/resume/verify', async (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password string is required' });
  }

  // Validate format (exactly 4 digits)
  if (!/^\d{4}$/.test(password)) {
    return res.status(400).json({ error: 'Password must be exactly 4 digits' });
  }

  try {
    const matchedPass = await ResumePassword.findOne({ code: password, isActive: true });
    if (!matchedPass) {
      return res.status(401).json({ error: 'Invalid or deactivated passcode' });
    }

    const personalInfo = await PersonalInfo.findOne();
    if (!personalInfo || !personalInfo.resumeUrl || personalInfo.resumeUrl === '#') {
      return res.status(404).json({ error: 'Resume file is not available at the moment' });
    }

    return res.json({ resumeUrl: personalInfo.resumeUrl });
  } catch (error) {
    console.error('Verify resume password error:', error);
    return res.status(500).json({ error: 'Server error during verification' });
  }
});

// List all download passwords (ADMIN ONLY)
router.get('/resume/passwords', authMiddleware, async (req, res) => {
  try {
    const passwords = await ResumePassword.find().sort({ createdAt: -1 });
    return res.json(passwords);
  } catch (error) {
    console.error('Fetch resume passwords error:', error);
    return res.status(500).json({ error: 'Failed to fetch resume passwords' });
  }
});

// Create new download password (ADMIN ONLY)
router.post('/resume/passwords', authMiddleware, async (req, res) => {
  const { code, label, isActive } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Password code is required' });
  }

  if (!/^\d{4}$/.test(code)) {
    return res.status(400).json({ error: 'Password must be exactly 4 digits' });
  }

  try {
    // Check if code already exists
    const existing = await ResumePassword.findOne({ code });
    if (existing) {
      return res.status(400).json({ error: 'This passcode already exists. Please choose a unique 4-digit code.' });
    }

    const newPass = new ResumePassword({
      code,
      label: label || '',
      isActive: isActive !== undefined ? isActive : true
    });
    await newPass.save();
    return res.status(201).json(newPass);
  } catch (error) {
    console.error('Create resume password error:', error);
    return res.status(500).json({ error: 'Failed to create resume password' });
  }
});

// Update download password (ADMIN ONLY)
router.put('/resume/passwords/:id', authMiddleware, async (req, res) => {
  const { code, label, isActive } = req.body;
  
  if (code !== undefined) {
    if (typeof code !== 'string' || !/^\d{4}$/.test(code)) {
      return res.status(400).json({ error: 'Password must be exactly 4 digits' });
    }
  }

  try {
    const current = await ResumePassword.findById(req.params.id);
    if (!current) {
      return res.status(404).json({ error: 'Password not found' });
    }

    // Check uniqueness if code is being changed
    if (code !== undefined && code !== current.code) {
      const existing = await ResumePassword.findOne({ code });
      if (existing) {
        return res.status(400).json({ error: 'This passcode already exists. Please choose a unique 4-digit code.' });
      }
      current.code = code;
    }

    if (label !== undefined) current.label = label;
    if (isActive !== undefined) current.isActive = isActive;

    await current.save();
    return res.json(current);
  } catch (error) {
    console.error('Update resume password error:', error);
    return res.status(500).json({ error: 'Failed to update resume password' });
  }
});

// Delete download password (ADMIN ONLY)
router.delete('/resume/passwords/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await ResumePassword.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Password not found' });
    }
    return res.json({ success: true, message: 'Password deleted successfully' });
  } catch (error) {
    console.error('Delete resume password error:', error);
    return res.status(500).json({ error: 'Failed to delete resume password' });
  }
});

export default router;
