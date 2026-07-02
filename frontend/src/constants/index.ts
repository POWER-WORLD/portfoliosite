import { 
  FaGithub, 
  FaLinkedin, 
  FaEnvelope
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
  { icon: FaEnvelope, url: 'mailto:', label: 'Email' },
];

export const PERSONAL_INFO = {
  name: 'Pawan Kumar',
  title: 'Full Stack & React Engineer',
  tagline: 'Crafting high-performance, responsive, and visually stunning web applications.',
  location: '',
  email: '',
  resumeUrl: '#',
};

export const ABOUT_DATA = {
  story: '',
  highlights: [],
  education: [],
};

export const SKILL_CATEGORIES: any[] = [];

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'fullstack' | 'creative';
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string; 
}

export const PROJECTS_DATA: Project[] = [];

export const EXPERIENCE_DATA: any[] = [];

export interface Certificate {
  title: string;
  organization: string;
  date: string;
  credentialUrl: string;
  imageUrl: string;
}

export const CERTIFICATES_DATA: Certificate[] = [];

export const ACHIEVEMENTS_DATA: any[] = [];

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
