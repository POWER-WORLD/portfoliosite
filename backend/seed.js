import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { 
  PersonalInfo, 
  About, 
  SkillCategory, 
  Project, 
  Experience, 
  Certificate, 
  Achievement,
  AdminPassword
} from './models.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const PERSONAL_INFO = {
  name: 'Pawan Kumar',
  title: 'Senior Frontend Architect & React Engineer',
  tagline: 'Crafting pixel-perfect, highly-performant, and visually stunning digital experiences on the web.',
  location: 'San Francisco, CA',
  email: 'pawan.kumar@dev.io',
  resumeUrl: '#',
};

const ABOUT_DATA = {
  story: `I am a passionate frontend architect with 6+ years of professional experience building high-performance web applications. I specialize in React, TypeScript, and modern animation technologies. My core focus is bridging the gap between pure engineering and high-fidelity UX/UI design. I enjoy creating products that look beautiful and load instantaneously.`,
  highlights: [
    { title: '6+ Years', desc: 'Industry Experience' },
    { title: '50+', desc: 'Projects Delivered' },
    { title: '99%', desc: 'Performance Scores' },
  ],
  education: [
    {
      degree: 'M.S. in Computer Science',
      school: 'Stanford University',
      year: '2018 - 2020',
      description: 'Specialized in Human-Computer Interaction (HCI) and Distributed Systems.',
    },
    {
      degree: 'B.S. in Software Engineering',
      school: 'UC Berkeley',
      year: '2014 - 2018',
      description: 'Graduated with Honors. Core coursework in Algorithms, Data Structures, and Web Systems.',
    },
  ],
};

const SKILL_CATEGORIES = [
  {
    title: 'Frontend Architecture',
    icon: 'FaCode',
    skills: [
      { name: 'React (19 / Next.js)', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Tailwind CSS', level: 95 },
      { name: 'Framer Motion', level: 85 },
      { name: 'State (Redux/Zustand)', level: 90 },
    ],
  },
  {
    title: 'Backend & Databases',
    icon: 'FaServer',
    skills: [
      { name: 'Node.js / Express', level: 85 },
      { name: 'MongoDB (Mongoose)', level: 80 },
      { name: 'PostgreSQL / SQL', level: 75 },
      { name: 'REST & GraphQL APIs', level: 85 },
    ],
  },
  {
    title: 'DevOps & Tooling',
    icon: 'FaToolbox',
    skills: [
      { name: 'Git & GitHub Actions', level: 90 },
      { name: 'Docker / Containers', level: 70 },
      { name: 'AWS (S3/EC2/CloudFront)', level: 75 },
      { name: 'Vite / Webpack', level: 90 },
    ],
  },
];

const PROJECTS_DATA = [
  {
    title: 'AetherDev - Collaborative Workspace',
    description: 'A premium developer dashboard featuring real-time collaborative canvas boards, state synchronization via WebSockets, and automatic Figma wireframe exports.',
    category: 'fullstack',
    tags: ['React 19', 'Node.js', 'Socket.io', 'MongoDB', 'Tailwind CSS'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Vortex DeFi - Web3 Dashboard',
    description: 'Multi-chain decentralized exchange aggregator with real-time gas trackers, detailed portfolio graphs, price prediction models, and ledger hardware safety integrations.',
    category: 'frontend',
    tags: ['Next.js', 'TypeScript', 'Ethers.js', 'Framer Motion', 'Recharts'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Nebula CMS - Headless Content Engine',
    description: 'A developer-first headless CMS built on Node.js/MongoDB. Features include a dynamic schema builder, live preview rendering, auto-generated GraphQL interfaces, and webhooks.',
    category: 'fullstack',
    tags: ['React', 'Node.js', 'GraphQL', 'MongoDB', 'Redis'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    imageUrl: 'https://images.unsplash.com/photo-1618005198143-e528346d9a59?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Titan UI - Premium Component System',
    description: 'An award-winning component library designed with raw performance in mind. Zero layout thrashing, built-in accessibility compliance (WCAG AA), and buttery-smooth micro-animations.',
    category: 'creative',
    tags: ['React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Oxlint'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
  },
];

const EXPERIENCE_DATA = [
  {
    role: 'Lead Frontend Architect',
    company: 'InnovateTech Solutions',
    period: '2022 - Present',
    description: 'Design and guide the migration of modular micro-frontend ecosystems for multi-tenant SaaS dashboards. Orchestrated React 18/19 optimization pipelines resulting in a 40% speed enhancement in First Input Delay (FID) and a 30% bundle size reduction.',
  },
  {
    role: 'Senior React Developer',
    company: 'QuantumLabs',
    period: '2020 - 2022',
    description: 'Led the development of a real-time collaborative code editor. Integrated custom virtualized lists and complex canvas graphics that handled rendering of 10k+ rows with smooth 60 FPS performance.',
  },
  {
    role: 'Full Stack Engineer',
    company: 'DevFlow Media',
    period: '2018 - 2020',
    description: 'Developed scalable REST/GraphQL APIs in Node.js and MongoDB. Created responsive client dashboards using React and CSS Modules, managing data synchronization and caching using React Query.',
  },
];

const CERTIFICATES_DATA = [
  {
    title: 'AWS Certified Solutions Architect – Associate',
    organization: 'Amazon Web Services (AWS)',
    date: 'Dec 2025',
    credentialUrl: 'https://aws.amazon.com',
    imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=300&q=80',
  },
  {
    title: 'Advanced React & Frontend Engineering Design Patterns',
    organization: 'Frontend Masters',
    date: 'Oct 2025',
    credentialUrl: 'https://frontendmasters.com',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=300&q=80',
  },
  {
    title: 'MongoDB Database Administrator & Mongoose Specialist',
    organization: 'MongoDB University',
    date: 'Aug 2025',
    credentialUrl: 'https://mongodb.com',
    imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=300&q=80',
  },
];

const ACHIEVEMENTS_DATA = [
  { value: 6, label: 'Years of Experience', suffix: '+' },
  { value: 50, label: 'Projects Completed', suffix: '+' },
  { value: 100, label: 'GitHub Contributions', suffix: 'k+' },
  { value: 99, label: 'Lighthouse Performance Score', suffix: '%' },
];

async function seed() {
  const mongoUri = process.env.MONGO_DB || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Neither MONGO_DB nor MONGODB_URI environment variable is set.');
    process.exit(1);
  }

  console.log('Seeding: Connecting to MongoDB...');
  await mongoose.connect(mongoUri);

  try {
    // Clear all existing data
    console.log('Clearing database collection contents...');
    await PersonalInfo.deleteMany({});
    await About.deleteMany({});
    await SkillCategory.deleteMany({});
    await Project.deleteMany({});
    await Experience.deleteMany({});
    await Certificate.deleteMany({});
    await Achievement.deleteMany({});
    await AdminPassword.deleteMany({});

    // Seed Personal Info
    console.log('Seeding Personal Info...');
    await new PersonalInfo(PERSONAL_INFO).save();

    // Seed About
    console.log('Seeding About information...');
    await new About(ABOUT_DATA).save();

    // Seed Skills
    console.log('Seeding Skills categories...');
    for (const cat of SKILL_CATEGORIES) {
      await new SkillCategory(cat).save();
    }

    // Seed Projects
    console.log('Seeding Projects...');
    for (const proj of PROJECTS_DATA) {
      await new Project(proj).save();
    }

    // Seed Experience
    console.log('Seeding Experience records...');
    for (const exp of EXPERIENCE_DATA) {
      await new Experience(exp).save();
    }

    // Seed Certificates
    console.log('Seeding Certificates...');
    for (const cert of CERTIFICATES_DATA) {
      await new Certificate(cert).save();
    }

    // Seed Achievements
    console.log('Seeding Achievements metrics...');
    for (const ach of ACHIEVEMENTS_DATA) {
      await new Achievement(ach).save();
    }

    // Seed default Admin Password hash
    console.log('Seeding Admin credentials...');
    const envPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(envPassword, salt);
    await new AdminPassword({ hash }).save();

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
}

seed();
