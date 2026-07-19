import { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import Hero from './sections/Hero';
import About from './sections/About';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Experience from './sections/Experience';
import Certificates from './sections/Certificates';
import TechStack from './sections/TechStack';
import Achievements from './sections/Achievements';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import PortfolioSkeleton from './components/PortfolioSkeleton';
import { fetchPortfolioData } from './services/api';
import type { PersonalInfo } from './constants';

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio data shape returned by /api/portfolio
// ─────────────────────────────────────────────────────────────────────────────
interface PortfolioData {
  personalInfo: PersonalInfo;
  about: {
    story: string;
    highlights: { title: string; desc: string }[];
    education: { degree: string; school: string; year: string; description: string }[];
  };
  skills: any[];
  skillsWelcome: { title: string; message: string };
  projects: any[];
  experience: any[];
  certificates: any[];
  techStack: any[];
  achievements: any[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Client-side cache initializer (Stale-While-Revalidate pattern)
// ─────────────────────────────────────────────────────────────────────────────
const getCachedPortfolioData = (): PortfolioData | null => {
  try {
    const cached = localStorage.getItem('portfolio_data_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      // Ensure the cached data has critical properties before returning it
      if (parsed && parsed.personalInfo && parsed.about && parsed.skills) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Cache] Failed to parse local storage portfolio data:', err);
  }
  return null;
};

function App() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(getCachedPortfolioData);
  const [loading, setLoading] = useState<boolean>(!portfolioData);

  useEffect(() => {
    let isMounted = true;

    // Revalidate in the background
    fetchPortfolioData().then((data: PortfolioData | null) => {
      if (isMounted) {
        if (data) {
          setPortfolioData(data);
          try {
            localStorage.setItem('portfolio_data_cache', JSON.stringify(data));
          } catch (err) {
            console.warn('[Cache] Failed to save portfolio data to local storage:', err);
          }
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !portfolioData) {
    return (
      <ErrorBoundary>
        <MainLayout>
          <PortfolioSkeleton />
        </MainLayout>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout>
        <>
          <Hero         data={portfolioData.personalInfo} />
          <About        data={portfolioData.about} />
          <Skills       data={portfolioData.skills} welcome={portfolioData.skillsWelcome} />
          <Projects     data={portfolioData.projects} />
          <Experience   data={portfolioData.experience} />
          <Certificates data={portfolioData.certificates} />
          <TechStack    data={portfolioData.techStack} />
          <Achievements data={portfolioData.achievements} />
          <Contact      personalInfo={portfolioData.personalInfo} />
          <Footer       personalInfo={portfolioData.personalInfo} />
        </>
      </MainLayout>
    </ErrorBoundary>
  );
}

export default App;
