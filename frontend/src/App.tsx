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
import { fetchPortfolioData } from './services/api';

function App() {
  const [portfolioData, setPortfolioData] = useState<any>(null);

  useEffect(() => {
    fetchPortfolioData().then((data) => {
      if (data) {
        setPortfolioData(data);
      }
    });
  }, []);

  return (
    <MainLayout>
      {/* Sections rendering sequentially above the single fixed galaxy background */}
      <Hero data={portfolioData?.personalInfo} />
      <About data={portfolioData?.about} />
      <Skills data={portfolioData?.skills} />
      <Projects data={portfolioData?.projects} />
      <Experience data={portfolioData?.experience} />
      <Certificates data={portfolioData?.certificates} />
      <TechStack />
      <Achievements data={portfolioData?.achievements} />
      <Contact personalInfo={portfolioData?.personalInfo} />
      <Footer personalInfo={portfolioData?.personalInfo} />
    </MainLayout>
  );
}

export default App;

