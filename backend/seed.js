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
  AdminPassword,
  TechStack
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
    title: 'Frontend Engineering & React',
    categoryType: 'Frontend',
    description: 'Architecting ultra-fast, modern, micro-frontend client web apps with modern React 19 and Next.js ecosystem.',
    icon: 'FaCode',
    capabilities: [
      'Micro-Frontend & SSR Architecture',
      'Core Web Vitals Optimization (99+ Lighthouse)',
      'Design System Orchestration & Tokens',
      'Real-time WebSocket & State Synchronization'
    ],
    skills: [
      { name: 'React 19 / Next.js 15', level: 96, experience: '6+ Yrs', tag: 'Expert' },
      { name: 'TypeScript & Type Safety', level: 92, experience: '5+ Yrs', tag: 'Core Specialty' },
      { name: 'Tailwind CSS & CSS Modules', level: 95, experience: '6+ Yrs', tag: 'Mastery' },
      { name: 'Framer Motion & Micro-UI FX', level: 88, experience: '4+ Yrs', tag: 'Advanced' },
      { name: 'State Management (Zustand/Redux)', level: 90, experience: '5+ Yrs', tag: 'Advanced' },
    ],
  },
  {
    title: 'Backend & Database Architecture',
    categoryType: 'Backend',
    description: 'Designing resilient REST/GraphQL APIs, highly-available Node.js microservices, and database models.',
    icon: 'FaServer',
    capabilities: [
      'High-Performance REST & GraphQL Endpoints',
      'NoSQL & Relational Schema Modeling (MongoDB/PostgreSQL)',
      'JWT Authentication & Security Middleware',
      'Caching Strategies & Rate Limiting'
    ],
    skills: [
      { name: 'Node.js & Express.js', level: 88, experience: '5+ Yrs', tag: 'Core Specialty' },
      { name: 'MongoDB & Mongoose ODM', level: 85, experience: '4+ Yrs', tag: 'Advanced' },
      { name: 'PostgreSQL & Prisma ORM', level: 80, experience: '3+ Yrs', tag: 'Proficient' },
      { name: 'GraphQL & RESTful Standards', level: 86, experience: '4+ Yrs', tag: 'Advanced' },
    ],
  },
  {
    title: 'DevOps & Cloud Infrastructure',
    categoryType: 'DevOps',
    description: 'Automating continuous integration, automated test pipelines, and scalable cloud hosting infrastructure.',
    icon: 'FaCloud',
    capabilities: [
      'Automated GitHub Actions CI/CD Workflows',
      'Containerization with Docker & Multi-stage builds',
      'AWS Cloud Infrastructure & Edge Deployments',
      'Vite & Webpack Build Pipeline Optimization'
    ],
    skills: [
      { name: 'Git & GitHub Actions CI/CD', level: 92, experience: '5+ Yrs', tag: 'Expert' },
      { name: 'Vite & Webpack Bundling', level: 90, experience: '4+ Yrs', tag: 'Mastery' },
      { name: 'AWS (S3 / CloudFront / EC2)', level: 78, experience: '3+ Yrs', tag: 'Proficient' },
      { name: 'Docker & Containerization', level: 75, experience: '3+ Yrs', tag: 'Proficient' },
    ],
  },
  {
    title: 'UI/UX & Dynamic Animation',
    categoryType: 'Architecture',
    description: 'Crafting interactive digital canvas interfaces, fluid micro-animations, glassmorphic themes, and accessible UI.',
    icon: 'FaLayerGroup',
    capabilities: [
      'Glassmorphic & Dark Theme UX Systems',
      'Fluid Page Motion & Scroll FX',
      'WCAG AA Accessibility Compliance',
      'Responsive Cross-Device Layout Systems'
    ],
    skills: [
      { name: 'Motion Design & Framer Motion', level: 90, experience: '4+ Yrs', tag: 'Core Specialty' },
      { name: 'Component UI Architecture', level: 94, experience: '6+ Yrs', tag: 'Expert' },
      { name: 'Responsive Layouts & Grid Systems', level: 96, experience: '6+ Yrs', tag: 'Mastery' },
      { name: 'Web Performance & Accessibility', level: 88, experience: '5+ Yrs', tag: 'Advanced' },
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

const TECH_STACK_DATA = [
  { name: 'React', icon: 'SiReact', color: '#61DAFB' },
  { name: 'TypeScript', icon: 'SiTypescript', color: '#3178C6' },
  { name: 'Node.js', icon: 'SiNodedotjs', color: '#339933' },
  { name: 'MongoDB', icon: 'SiMongodb', color: '#47A248' },
  { name: 'Next.js', icon: 'SiNextdotjs', color: '#FFFFFF' },
  { name: 'Tailwind CSS', icon: 'SiTailwindcss', color: '#06B6D4' },
  { name: 'Framer Motion', icon: 'SiFramermotion', color: '#F43F5E' },
  { name: 'GraphQL', icon: 'SiGraphql', color: '#E10098' },
  { name: 'Docker', icon: 'SiDocker', color: '#2496ED' },
  { name: 'Git', icon: 'SiGit', color: '#F05032' },
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
    await TechStack.deleteMany({});
    // Clear old AdminPassword records if any exist from legacy schema
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

    // Seed Tech Stack
    console.log('Seeding Tech Stack technologies...');
    for (const tech of TECH_STACK_DATA) {
      await new TechStack(tech).save();
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
}

seed();
