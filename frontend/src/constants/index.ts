import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaDiscord,
  FaTwitter,
  FaHackerrank,
} from 'react-icons/fa';
import { SiCodechef, SiLeetcode } from 'react-icons/si';

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// These are static UI labels — no database equivalent.
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL LINKS
// Hardcoded by design — social profile URLs have no database model on the backend.
// To change links, edit this file and redeploy.
// ─────────────────────────────────────────────────────────────────────────────
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
    ariaLabel: 'LinkedIn Profile',
    colorType: 'secondary',
    showInHero: true,
    showInContact: true,
  },
  {
    name: 'Email',
    icon: FaEnvelope,
    url: 'mailto:pk0403564@gmail.com',
    ariaLabel: 'Send Email',
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
    ariaLabel: 'Twitter / X Profile',
    colorType: 'accent',
    showInHero: false,
    showInContact: true,
  },
  {
    name: 'GitHub',
    icon: FaGithub,
    url: 'https://github.com/POWER-WORLD',
    ariaLabel: 'GitHub Profile',
    colorType: 'accent',
    showInHero: true,
    showInContact: true,
  },
  {
    name: 'LeetCode',
    icon: SiLeetcode,
    url: 'https://leetcode.com/u/pawankumar3253702/',
    ariaLabel: 'LeetCode Profile',
    colorType: 'accent',
    showInHero: true,
    showInContact: true,
  },
  {
    name: 'HackerRank',
    icon: FaHackerrank,
    url: 'https://www.hackerrank.com/profile/pk3253702',
    ariaLabel: 'HackerRank Profile',
    colorType: 'accent',
    showInHero: true,
    showInContact: true,
  },
  {
    name: 'Codechef',
    icon: SiCodechef,
    url: 'https://www.codechef.com/users/pk3253702',
    ariaLabel: 'CodeChef Profile',
    colorType: 'accent',
    showInHero: true,
    showInContact: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PERSONAL INFO (UI-ONLY STATIC FIELDS)
// All user content fields (name, title, tagline, email, location, resumeUrl)
// are managed exclusively via MongoDB and served through /api/portfolio.
// Only UI badge text that has no database counterpart lives here.
// ─────────────────────────────────────────────────────────────────────────────
export const PERSONAL_INFO = {
  /** Hero section badge — static UI label, not stored in DB. */
  availability: 'WELCOME TO MY UNIVERSE',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT CATEGORIES
// Static filter options for the Projects carousel UI.
// The enum values must match the `category` field in the Project MongoDB model.
// ─────────────────────────────────────────────────────────────────────────────
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

/** Returns a human-readable label for a project category value. */
export const getCategoryLabel = (categoryValue: string): string => {
  const found = PROJECT_CATEGORIES.find((cat) => cat.value === categoryValue);
  if (found) return found.label;
  if (categoryValue === 'creative') return 'Creative Tech';
  return categoryValue;
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED TYPE INTERFACES
// These describe the shape of DB documents as returned by /api/portfolio.
// ─────────────────────────────────────────────────────────────────────────────

/** Shape of a certificate document returned from MongoDB. */
export interface Certificate {
  _id?: string;
  title: string;
  organization: string;
  date: string;
  credentialUrl: string;
  imageUrl: string;
}

/** Shape of a project document returned from MongoDB. */
export interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: CategoryFilter;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
}

/** Shape of personalInfo returned from /api/portfolio. */
export interface PersonalInfo {
  _id?: string;
  name: string;
  title: string;
  tagline: string;
  location: string;
  email: string;
  hasResume?: boolean;
}
