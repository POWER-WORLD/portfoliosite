import { useState, useEffect } from 'react';
import Login from './components/Login';
import PersonalTab from './components/tabs/PersonalTab';
import SkillsTab from './components/tabs/SkillsTab';
import ProjectsTab from './components/tabs/ProjectsTab';
import ExperienceTab from './components/tabs/ExperienceTab';
import CertificatesTab from './components/tabs/CertificatesTab';
import TechStackTab from './components/tabs/TechStackTab';
import ErrorBoundary from './components/ErrorBoundary';
import { adminApi, removeToken, getToken } from './services/api';
import MessagesTab from './components/tabs/MessagesTab';
import PasswordManagementTab from './components/tabs/PasswordManagementTab';
import { 
  FaUser, 
  FaCode, 
  FaBriefcase, 
  FaGraduationCap, 
  FaAward, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaLaptopCode,
  FaEnvelope,
  FaKey
} from 'react-icons/fa';


type TabType = 'personal' | 'skills' | 'projects' | 'experience' | 'certs' | 'techstack' | 'messages' | 'passwords';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authenticate session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      const isValid = await adminApi.verifyToken();
      setIsAuthenticated(isValid);
      if (isValid) {
        loadData();
      } else {
        setLoading(false);
      }
    };
    checkAuth();

    const handleSessionExpired = () => {
      setIsAuthenticated(false);
      setPortfolioData(null);
    };

    window.addEventListener('admin-session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('admin-session-expired', handleSessionExpired);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPortfolio();
      setPortfolioData(data);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    loadData();
  };

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
    setPortfolioData(null);
  };

  if (loading && isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderTabContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <div className="spinner"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'personal':
        return (
          <PersonalTab 
            initialInfo={portfolioData?.personalInfo} 
            initialAbout={portfolioData?.about} 
            onRefresh={loadData} 
          />
        );
      case 'skills':
        return (
          <SkillsTab 
            initialSkills={portfolioData?.skills} 
            initialWelcome={portfolioData?.skillsWelcome}
            onRefresh={loadData} 
          />
        );
      case 'projects':
        return (
          <ProjectsTab 
            initialProjects={portfolioData?.projects} 
            onRefresh={loadData} 
          />
        );
      case 'experience':
        return (
          <ExperienceTab 
            initialExperience={portfolioData?.experience} 
            onRefresh={loadData} 
          />
        );
      case 'certs':
        return (
          <CertificatesTab 
            initialCertificates={portfolioData?.certificates} 
            initialAchievements={portfolioData?.achievements} 
            onRefresh={loadData} 
          />
        );
      case 'techstack':
        return (
          <TechStackTab 
            initialTechStack={portfolioData?.techStack} 
            onRefresh={loadData} 
          />
        );
      case 'messages':
        return (
          <MessagesTab />
        );
      case 'passwords':
        return (
          <PasswordManagementTab />
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  const nameInitial = portfolioData?.personalInfo?.name 
    ? portfolioData.personalInfo.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'A';

  return (
    <ErrorBoundary>
      <div className="admin-container">
        {/* Mobile Top Header */}
        <header className="mobile-header">
          <div className="mobile-header-brand">
            <span className="brand-logo" style={{ fontSize: '1.2rem' }}>PAWANKUMAR.INFO</span>
            <span className="brand-tag" style={{ fontSize: '0.65rem' }}>CMS</span>
          </div>
          <button 
            type="button" 
            className="mobile-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </header>

        {/* Mobile Sidebar Backdrop Overlay */}
        <div 
          className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`} 
          onClick={() => setSidebarOpen(false)} 
          aria-hidden="true"
        />

        {/* Sidebar Navigation */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div>
            <div className="brand">
              <span className="brand-logo">PAWAN.INFO</span>
              <span className="brand-tag">CMS</span>
            </div>

            <nav className="nav-menu">
              <li className="nav-item">
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('personal'); setSidebarOpen(false); }} 
                  className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
                >
                  <FaUser className="nav-icon" /> Core Profile
                </button>
              </li>
              <li className="nav-item">
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('skills'); setSidebarOpen(false); }} 
                  className={`nav-link ${activeTab === 'skills' ? 'active' : ''}`}
                >
                  <FaCode className="nav-icon" /> Core Skills
                </button>
              </li>
              <li className="nav-item">
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('techstack'); setSidebarOpen(false); }} 
                  className={`nav-link ${activeTab === 'techstack' ? 'active' : ''}`}
                >
                  <FaLaptopCode className="nav-icon" /> Tech Stack
                </button>
              </li>
              <li className="nav-item">
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('projects'); setSidebarOpen(false); }} 
                  className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`}
                >
                  <FaBriefcase className="nav-icon" /> Project Cards
                </button>
              </li>
              <li className="nav-item">
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('experience'); setSidebarOpen(false); }} 
                  className={`nav-link ${activeTab === 'experience' ? 'active' : ''}`}
                >
                  <FaGraduationCap className="nav-icon" /> Professional Timeline
                </button>
              </li>
              <li className="nav-item">
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('certs'); setSidebarOpen(false); }} 
                  className={`nav-link ${activeTab === 'certs' ? 'active' : ''}`}
                >
                  <FaAward className="nav-icon" /> Certs & Metrics
                </button>
              </li>
              <li className="nav-item">
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('messages'); setSidebarOpen(false); }} 
                  className={`nav-link ${activeTab === 'messages' ? 'active' : ''}`}
                >
                  <FaEnvelope className="nav-icon" /> Messages Inbox
                </button>
              </li>
              <li className="nav-item">
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('passwords'); setSidebarOpen(false); }} 
                  className={`nav-link ${activeTab === 'passwords' ? 'active' : ''}`}
                >
                  <FaKey className="nav-icon" /> Security & Passwords
                </button>
              </li>
            </nav>
          </div>

          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="user-avatar">{nameInitial}</div>
              <div className="user-info">
                <span className="user-name">{portfolioData?.personalInfo?.name || 'Administrator'}</span>
                <span className="user-role">Super Admin</span>
              </div>
            </div>
            <button type="button" onClick={handleLogout} className="nav-link" style={{ color: 'var(--error)' }}>
              <FaSignOutAlt className="nav-icon" /> Logout Session
            </button>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="main-content">
          <header className="page-header">
            <div>
              <h1 className="page-title">
                {activeTab === 'personal' && 'Core Portfolio Profile'}
                {activeTab === 'skills' && 'Skills & Capabilities'}
                {activeTab === 'projects' && 'Projects Showcase'}
                {activeTab === 'experience' && 'Professional Timeline'}
                {activeTab === 'certs' && 'Credentials & Metrics'}
                {activeTab === 'techstack' && 'Technologies & Tools'}
                {activeTab === 'messages' && 'Visitor Messages & Inquiries'}
                {activeTab === 'passwords' && 'Passcode & Admin Security'}
              </h1>
              <p className="page-subtitle">
                {activeTab === 'personal' && 'Manage your display information, narrative biography, and education history.'}
                {activeTab === 'skills' && 'Organize tech stack categories and proficiency percentage indicators.'}
                {activeTab === 'projects' && 'Configure custom cards, cover images, descriptions, and code links.'}
                {activeTab === 'experience' && 'Edit your career path roles, employment periods, and job duties.'}
                {activeTab === 'certs' && 'Modify your digital certifications and count metrics.'}
                {activeTab === 'techstack' && 'Manage selectable technology items, brand icons, and hex colors.'}
                {activeTab === 'messages' && 'View, manage, and reply to messages sent by visitors from your portfolio contact form.'}
                {activeTab === 'passwords' && 'Manage resume download numeric passwords and update your admin login credentials.'}
              </p>
            </div>
          </header>

          <section style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {renderTabContent()}
          </section>
        </main>
      </div>
    </ErrorBoundary>
  );
}
