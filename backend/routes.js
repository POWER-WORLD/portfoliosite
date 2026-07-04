import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { 
  PersonalInfo, 
  About, 
  SkillCategory, 
  Project, 
  Experience, 
  Certificate, 
  Achievement,
  AdminPassword,
  ContactMessage
} from './models.js';

const router = express.Router();

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
// AUTHENTICATION
// ----------------------------------------------------
router.post('/auth/login', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  try {
    // Dynamically reload .env to ensure any changes to ADMIN_PASSWORD take effect immediately
    dotenv.config({ override: true });

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

    res.json({
      personalInfo,
      about,
      skills,
      projects,
      experience,
      certificates,
      achievements
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

export default router;

