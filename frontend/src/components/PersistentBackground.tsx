import { memo } from 'react';
import Galaxy from './Galaxy';

const PersistentBackground = memo(() => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <Galaxy 
        mouseRepulsion={true}
        mouseInteraction={true}
        density={1}
        glowIntensity={0.4}
        saturation={1}
        hueShift={200}
        twinkleIntensity={0.3}
        rotationSpeed={0.1}
        repulsionStrength={2}
        autoCenterRepulsion={0}
        starSpeed={0.5}
        speed={1}
      />
    </div>
  );
});

PersistentBackground.displayName = 'PersistentBackground';

export default PersistentBackground;
