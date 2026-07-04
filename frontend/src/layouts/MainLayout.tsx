import { type ReactNode, useEffect } from 'react';
import Lenis from 'lenis';
import GalaxyBackground from '../components/GalaxyBackground';
import Navbar from '../components/Navbar';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { NAV_ITEMS } from '../constants';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  // Use scroll spy hook to track active section for navbar highlight
  const sectionIds = NAV_ITEMS.map((item) => item.id);
  const activeSection = useScrollSpy(sectionIds);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Handle smooth navigation scrolling via Lenis
    const handleTransitScroll = (e: Event) => {
      const customEvent = e as CustomEvent<{ targetScrollY: number }>;
      if (customEvent.detail && typeof customEvent.detail.targetScrollY === 'number') {
        lenis.scrollTo(customEvent.detail.targetScrollY, { duration: 1.2 });
      }
    };

    window.addEventListener('trigger-blackhole-transit', handleTransitScroll);

    // Clean up
    return () => {
      window.removeEventListener('trigger-blackhole-transit', handleTransitScroll);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen text-white select-none">
      {/* 3D Galaxy Canvas Background (fixed behind everything) */}
      <GalaxyBackground />

      {/* Header Sticky Navbar */}
      <Navbar activeSection={activeSection || 'home'} />

      {/* Main Content Sections (positioned on top, transparent) */}
      <main className="relative z-10 w-full overflow-x-hidden pt-20">
        {children}
      </main>
    </div>
  );
}
