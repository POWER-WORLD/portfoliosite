import { 
  FaGithub, 
  FaLinkedin, 
  FaEnvelope, 
  FaCode, 
  FaServer, 
  FaToolbox 
} from 'react-icons/fa';

export interface NavItem {
  label: string;
  id: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Skills', id: 'skills' },
  { label: 'Projects', id: 'projects' },
  { label: 'Experience', id: 'experience' },
  { label: 'Certificates', id: 'certificates' },
  { label: 'Contact', id: 'contact' },
];

export const SOCIAL_LINKS = [
  { icon: FaGithub, url: 'https://github.com', label: 'GitHub' },
  { icon: FaLinkedin, url: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: FaEnvelope, url: 'mailto:developer@example.com', label: 'Email' },
];

export const PERSONAL_INFO = {
  name: 'Pawan Kumar',
  title: 'Senior Frontend Architect & React Engineer',
  tagline: 'Crafting pixel-perfect, highly-performant, and visually stunning digital experiences on the web.',
  location: 'San Francisco, CA',
  email: 'pawan.kumar@dev.io',
  resumeUrl: '#', // Placeholder/Static PDF link
};

export const ABOUT_DATA = {
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

export const SKILL_CATEGORIES = [
  {
    title: 'Frontend Architecture',
    icon: FaCode,
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
    icon: FaServer,
    skills: [
      { name: 'Node.js / Express', level: 85 },
      { name: 'MongoDB (Mongoose)', level: 80 },
      { name: 'PostgreSQL / SQL', level: 75 },
      { name: 'REST & GraphQL APIs', level: 85 },
    ],
  },
  {
    title: 'DevOps & Tooling',
    icon: FaToolbox,
    skills: [
      { name: 'Git & GitHub Actions', level: 90 },
      { name: 'Docker / Containers', level: 70 },
      { name: 'AWS (S3/EC2/CloudFront)', level: 75 },
      { name: 'Vite / Webpack', level: 90 },
    ],
  },
];

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'fullstack' | 'creative';
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  // We can use premium mock image gradients or paths. We will render visual cards.
  imageUrl: string; 
}

export const PROJECTS_DATA: Project[] = [
  {
    id: 'aetherdev',
    title: 'AetherDev - Collaborative Workspace',
    description: 'A premium developer dashboard featuring real-time collaborative canvas boards, state synchronization via WebSockets, and automatic Figma wireframe exports.',
    category: 'fullstack',
    tags: ['React 19', 'Node.js', 'Socket.io', 'MongoDB', 'Tailwind CSS'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    imageUrl: '/aetherdev.png',
  },
  {
    id: 'vortex-defi',
    title: 'Vortex DeFi - Web3 Dashboard',
    description: 'Multi-chain decentralized exchange aggregator with real-time gas trackers, detailed portfolio graphs, price prediction models, and ledger hardware safety integrations.',
    category: 'frontend',
    tags: ['Next.js', 'TypeScript', 'Ethers.js', 'Framer Motion', 'Recharts'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    imageUrl: '/vortex.png',
  },
  {
    id: 'nebula-cms',
    title: 'Nebula CMS - Headless Content Engine',
    description: 'A developer-first headless CMS built on Node.js/MongoDB. Features include a dynamic schema builder, live preview rendering, auto-generated GraphQL interfaces, and webhooks.',
    category: 'fullstack',
    tags: ['React', 'Node.js', 'GraphQL', 'MongoDB', 'Redis'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    imageUrl: '/nebula.png',
  },
  {
    id: 'titan-ui',
    title: 'Titan UI - Premium Component System',
    description: 'An award-winning component library designed with raw performance in mind. Zero layout thrashing, built-in accessibility compliance (WCAG AA), and buttery-smooth micro-animations.',
    category: 'creative',
    tags: ['React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Oxlint'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    imageUrl: '/titan.png',
  },
];

export const EXPERIENCE_DATA = [
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

export interface Certificate {
  title: string;
  organization: string;
  date: string;
  credentialUrl: string;
  imageUrl: string;
}

export const CERTIFICATES_DATA: Certificate[] = [
  {
    title: 'AWS Certified Solutions Architect – Associate',
    organization: 'Amazon Web Services (AWS)',
    date: 'Dec 2025',
    credentialUrl: 'https://aws.amazon.com',
    imageUrl: 'aws_cert.jpg',
  },
  {
    title: 'Advanced React & Frontend Engineering Design Patterns',
    organization: 'Frontend Masters',
    date: 'Oct 2025',
    credentialUrl: 'https://frontendmasters.com',
    imageUrl: 'react_cert.jpg',
  },
  {
    title: 'MongoDB Database Administrator & Mongoose Specialist',
    organization: 'MongoDB University',
    date: 'Aug 2025',
    credentialUrl: 'https://mongodb.com',
    imageUrl: 'mongodb_cert.jpg',
  },
];

export const ACHIEVEMENTS_DATA = [
  { value: 6, label: 'Years of Experience', suffix: '+' },
  { value: 50, label: 'Projects Completed', suffix: '+' },
  { value: 100, label: 'GitHub Contributions', suffix: 'k+' },
  { value: 99, label: 'Lighthouse Performance Score', suffix: '%' },
];

export const TECH_STACK_ICONS = [
  { name: 'React', color: '#61DAFB' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Node.js', color: '#339933' },
  { name: 'MongoDB', color: '#47A248' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'Tailwind CSS', color: '#06B6D4' },
  { name: 'Framer Motion', color: '#F43F5E' },
  { name: 'GraphQL', color: '#E10098' },
  { name: 'Docker', color: '#2496ED' },
  { name: 'Git', color: '#F05032' },
];
