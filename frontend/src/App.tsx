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

function App() {
  return (
    <MainLayout>
      {/* Sections rendering sequentially above the single fixed galaxy background */}
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Certificates />
      <TechStack />
      <Achievements />
      <Contact />
      <Footer />
    </MainLayout>
  );
}

export default App;
