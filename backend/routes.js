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
  ContactMessage,
  TechStack,
  SkillsWelcome
} from './models.js';

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

// Middleware to verify JWT token
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'portfolio_secret_key');
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

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
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  try {
    // Load .env variables if not already set in environment
    dotenv.config();

    const envPassword = process.env.ADMIN_PASSWORD;
    if (!envPassword) {
      return res.status(500).json({ error: 'ADMIN_PASSWORD environment variable is not configured.' });
    }

    if (password !== envPassword) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }

    // Generate JWT token
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'portfolio_secret_key', { expiresIn: '7d' });
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

// ----------------------------------------------------
// PUBLIC PORTFOLIO FEED
// ----------------------------------------------------
router.get('/portfolio', async (req, res) => {
  try {
    const personalInfo = await PersonalInfo.findOne() || {};
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

export default router;

