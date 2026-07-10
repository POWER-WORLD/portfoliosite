import { 
  FaGithub, 
  FaLinkedin, 
  FaEnvelope,
  FaDiscord,
  FaTwitter,
  FaHackerrank
} from 'react-icons/fa';
import { SiCodechef, SiLeetcode } from 'react-icons/si';

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

export interface SocialLink {
  name: string;
  icon: React.ComponentType<any>;
  url: string;
  ariaLabel: string;
  colorType: 'accent' | 'secondary';
  showInHero: boolean;
  showInContact: boolean;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'LinkedIn',
    icon: FaLinkedin,
    url: 'https://www.linkedin.com/in/pawankumar3253702/',
    ariaLabel: 'LinkedIn',
    colorType: 'secondary',
    showInHero: true,
    showInContact: true,
  },
  {
    name: 'Email',
    icon: FaEnvelope,
    url: 'mailto:pk0403564@gmail.com',
    ariaLabel: 'Email',
    colorType: 'accent',
    showInHero: false,
    showInContact: true,
  },
  {
    name: 'Discord',
    icon: FaDiscord,
    url: 'https://discord.com/users/pawankumar3253702',
    ariaLabel: 'Discord',
    colorType: 'accent',
    showInHero: false,
    showInContact: true,
  },
  {
    name: 'Twitter',
    icon: FaTwitter,
    url: 'https://x.com/Pawan3253702',
    ariaLabel: 'Twitter',
    colorType: 'accent',
    showInHero: false,
    showInContact: true,
  },
  {
    name: 'GitHub',
    icon: FaGithub,
    url: 'https://github.com/POWER-WORLD',
    ariaLabel: 'GitHub',
    colorType: 'accent',
    showInHero: true,
    showInContact: true,
  },
  {
    name: 'LeetCode',
    icon: SiLeetcode,
    url: 'https://leetcode.com/u/pawankumar3253702/',
    ariaLabel: 'LeetCode',
    colorType: 'accent',
    showInHero: true,
    showInContact: true,
  },
  {
    name: 'HackerRank',
    icon: FaHackerrank,
    url: 'https://www.hackerrank.com/profile/pk3253702',
    ariaLabel: 'HackerRank',
    colorType: 'accent',
    showInHero: true,
    showInContact: true,
  },
  {
    name: 'Codechef',
    icon: SiCodechef,
    url: 'https://www.codechef.com/users/pk3253702',
    ariaLabel: 'Codechef',
    colorType: 'accent',
    showInHero: true,
    showInContact: true,
  },
];

export const PERSONAL_INFO = {
  name: 'PAWAN KUMAR',
  title: 'Algorithmic Software Developer By Implementing AI',
  tagline: 'Transforming complex business requirements into elegant, high-performance software solutions with clean, scalable code.',
  availability: 'WELCOME TO MY UNIVERSE',
  location: 'Dehradun, Uttarakhand, India(248007)',
  email: 'pk0403564@gmail.com',
};

export const ABOUT_DATA = {
  story: '',
  highlights: [],
  education: [],
};

export const SKILL_CATEGORIES: any[] = [];

export type CategoryFilter = 
  | 'all' 
  | 'fullstack' 
  | 'frontend' 
  | 'backend' 
  | 'android' 
  | 'ios' 
  | 'desktop' 
  | 'game' 
  | 'web3' 
  | 'python' 
  | 'ai_ml' 
  | 'other' 
  | 'creative';

export interface CategoryOption {
  label: string;
  value: CategoryFilter;
}

export const PROJECT_CATEGORIES: CategoryOption[] = [
  { label: 'All Projects', value: 'all' },
  { label: 'Full Stack', value: 'fullstack' },
  { label: 'Frontend', value: 'frontend' },
  { label: 'Backend', value: 'backend' },
  { label: 'Android Application', value: 'android' },
  { label: 'IOS Application', value: 'ios' },
  { label: 'Desktop Application', value: 'desktop' },
  { label: 'Game Development', value: 'game' },
  { label: 'Web3', value: 'web3' },
  { label: 'Python Scripts', value: 'python' },
  { label: 'AI & ML', value: 'ai_ml' },
  { label: 'Other', value: 'other' },
];

export const getCategoryLabel = (categoryValue: string): string => {
  const found = PROJECT_CATEGORIES.find((cat) => cat.value === categoryValue);
  if (found) return found.label;
  if (categoryValue === 'creative') return 'Creative Tech';
  return categoryValue;
};

export interface Project {
  id: string;
  title: string;
  description: string;
  category: CategoryFilter;
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
