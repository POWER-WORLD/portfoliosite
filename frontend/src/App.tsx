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

function App() {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchPortfolioData().then((data) => {
      if (isMounted) {
        if (data) {
          setPortfolioData(data);
        }
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ErrorBoundary>
      <MainLayout>
        {loading ? (
          <PortfolioSkeleton />
        ) : (
          <>
            <Hero data={portfolioData?.personalInfo} />
            <About data={portfolioData?.about} />
            <Skills data={portfolioData?.skills} />
            <Projects data={portfolioData?.projects} />
            <Experience data={portfolioData?.experience} />
            <Certificates data={portfolioData?.certificates} />
            <TechStack data={portfolioData?.techStack} />
            <Achievements data={portfolioData?.achievements} />
            <Contact personalInfo={portfolioData?.personalInfo} />
            <Footer personalInfo={portfolioData?.personalInfo} />
          </>
        )}
      </MainLayout>
    </ErrorBoundary>
  );
}

export default App;
