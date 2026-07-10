import { useEffect, useState, useRef } from 'react';

export function useScrollSpy(ids: string[], options?: IntersectionObserverInit) {
  const [activeId, setActiveId] = useState<string>('');

  const idsString = ids.join(',');
  const optionsRef = useRef(options);

  // Keep optionsRef up to date with any configuration changes without triggering the effect
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const elements = idsString
      .split(',')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // Use rootMargin to detect active section when it crosses the upper-middle of the screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-30% 0px -50% 0px', // Active when section fills the middle part of the screen
        threshold: 0,
        ...optionsRef.current,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [idsString]);

  return activeId;
}
