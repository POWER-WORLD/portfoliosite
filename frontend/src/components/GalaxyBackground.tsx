import { useEffect, useRef } from 'react';

interface GalaxyParticle {
  x: number;
  y: number;
  z: number;
  r: number;
  theta: number;
  speed: number;
  size: number;
  color: string;
  twinklePhase: number;
  twinkleSpeed: number;
  isSupergiant: boolean;
  incl: number;
  node: number;
}

interface NebulaCloud {
  x: number;
  y: number;
  z: number;
  r: number;
  theta: number;
  speed: number;
  size: number;
  color: string;
  incl: number;
  node: number;
}

interface DustParticle {
  x: number;
  y: number;
  z: number;
  r: number;
  theta: number;
  speed: number;
  size: number;
  color: string;
  incl: number;
  node: number;
}

interface FallingStar {
  x: number;
  y: number;
  z: number;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
  isSupergiant: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  speed: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface MeteorSpark {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface CosmicDust {
  x: number;
  y: number;
  size: number;
  speedY: number;
  driftSpeed: number;
  driftRange: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
}

interface AccretionParticle {
  r: number;
  theta: number;
  speed: number;
  size: number;
  color: string;
  y: number;
}

interface ConstellationStar {
  x: number;
  y: number;
  size: number;
  phase: number;
}

interface Constellation {
  relX: number;
  relY: number;
  z: number;
  stars: ConstellationStar[];
  connections: [number, number][];
  scale: number;
  speed: number;
}

export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse movement parallax camera values
    let targetRotX = 0.22;
    let targetRotY = 0;
    let rotX = 0.22;
    let rotY = 0;
    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const nx = (e.clientX / window.innerWidth) - 0.5;
      const ny = (e.clientY / window.innerHeight) - 0.5;
      targetRotX = 0.22 + ny * 0.32;
      targetRotY = nx * 0.42;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Scroll and Parallax Tracking
    let lastScrollY = window.scrollY;
    let scrollVel = 0;
    let scrollSpeed = 0;
    let currentScrollY = window.scrollY;
    let lerpScrollY = window.scrollY;

    const handleScroll = () => {
      currentScrollY = window.scrollY;
      if (transitState === 'idle') {
        const diff = currentScrollY - lastScrollY;
        scrollVel += diff * 0.24;
        scrollSpeed += Math.abs(diff) * 0.24;
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Wormhole Transit State Machine
    let transitState: 'idle' | 'collapsing' | 'recovering' = 'idle';
    let transitProgress = 0; // 0 to 1 during collapse, then 1 to 0 during recovery
    let transitTargetScrollY = 0;

    const handleTransit = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.targetScrollY === 'number') {
        customEvent.preventDefault(); // Cancel default behavior indicator
        transitState = 'collapsing';
        transitProgress = 0;
        transitTargetScrollY = customEvent.detail.targetScrollY;
      }
    };

    window.addEventListener('trigger-blackhole-transit', handleTransit);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Cosmic Color Palette
    const colors = [
      'rgba(110, 99, 255, ',   // Neon Violet/Purple
      'rgba(0, 242, 254, ',    // Neon Cyan / Electric Blue
      'rgba(255, 0, 110, ',    // Neon Pink/Magenta
      'rgba(255, 215, 0, ',    // Electric Gold/Yellow
      'rgba(255, 75, 43, ',    // Vibrant Orange
      'rgba(147, 51, 234, ',   // Deep Royal Violet
      'rgba(0, 255, 198, ',    // Neon Mint/Turquoise
      'rgba(255, 255, 255, ',  // Pure Core White
    ];

    // Helper: Draw standard bright star flare (4-pointed cross)
    const drawStarFlare = (
      cContext: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      color: string,
      alpha: number
    ) => {
      cContext.fillStyle = color + alpha.toFixed(2) + ')';
      cContext.beginPath();
      cContext.moveTo(cx, cy - size * 2.8);
      cContext.quadraticCurveTo(cx, cy, cx + size * 2.8, cy);
      cContext.quadraticCurveTo(cx, cy, cx, cy + size * 2.8);
      cContext.quadraticCurveTo(cx, cy, cx - size * 2.8, cy);
      cContext.quadraticCurveTo(cx, cy, cx, cy - size * 2.8);
      cContext.closePath();
      cContext.fill();

      cContext.strokeStyle = color + (alpha * 0.4).toFixed(2) + ')';
      cContext.lineWidth = 0.7;
      cContext.beginPath();
      cContext.moveTo(cx - size * 4.5, cy);
      cContext.lineTo(cx + size * 4.5, cy);
      cContext.moveTo(cx, cy - size * 4.5);
      cContext.lineTo(cx, cy + size * 4.5);
      cContext.stroke();

      cContext.beginPath();
      cContext.arc(cx, cy, size * 0.6, 0, 2 * Math.PI);
      cContext.fillStyle = 'rgba(255, 255, 255, ' + alpha.toFixed(2) + ')';
      cContext.fill();
    };

    // Helper: Draw ultimate Google Gemini Logo inspired Supergiant star
    const drawGeminiLogoStar = (
      cContext: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      alpha: number
    ) => {
      const glowRadius = size * 6.5;
      const grad = cContext.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      grad.addColorStop(0, '#ffffff'); 
      grad.addColorStop(0.2, 'rgba(0, 242, 254, ' + alpha.toFixed(2) + ')'); 
      grad.addColorStop(0.5, 'rgba(110, 99, 255, ' + (alpha * 0.75).toFixed(2) + ')'); 
      grad.addColorStop(0.8, 'rgba(255, 0, 110, ' + (alpha * 0.45).toFixed(2) + ')'); 
      grad.addColorStop(1, 'rgba(255, 0, 110, 0)');

      cContext.fillStyle = grad;

      // 1. Draw Google Gemini curved 4-pointed sparkle
      cContext.beginPath();
      cContext.moveTo(cx, cy - size * 3.5);
      cContext.quadraticCurveTo(cx, cy, cx + size * 3.5, cy);
      cContext.quadraticCurveTo(cx, cy, cx, cy + size * 3.5);
      cContext.quadraticCurveTo(cx, cy, cx - size * 3.5, cy);
      cContext.quadraticCurveTo(cx, cy, cx, cy - size * 3.5);
      cContext.closePath();
      cContext.fill();

      // 2. Draw soft halo ring
      cContext.beginPath();
      cContext.arc(cx, cy, size * 2.4, 0, 2 * Math.PI);
      cContext.strokeStyle = 'rgba(0, 242, 254, ' + (alpha * 0.25).toFixed(2) + ')';
      cContext.lineWidth = 0.5;
      cContext.stroke();

      // 3. Draw 8 diffraction spikes
      cContext.lineWidth = 0.75;

      // Primary 4 spikes (long)
      cContext.strokeStyle = 'rgba(255, 255, 255, ' + (alpha * 0.6).toFixed(2) + ')';
      cContext.beginPath();
      cContext.moveTo(cx - size * 7.5, cy);
      cContext.lineTo(cx + size * 7.5, cy);
      cContext.moveTo(cx, cy - size * 7.5);
      cContext.lineTo(cx, cy + size * 7.5);
      cContext.stroke();

      // Secondary 4 spikes (diagonals)
      cContext.strokeStyle = 'rgba(110, 99, 255, ' + (alpha * 0.45).toFixed(2) + ')';
      cContext.beginPath();
      const diag = size * 4.6;
      cContext.moveTo(cx - diag, cy - diag);
      cContext.lineTo(cx + diag, cy + diag);
      cContext.moveTo(cx + diag, cy - diag);
      cContext.lineTo(cx - diag, cy + diag);
      cContext.stroke();
    };

    // Helper: Gravitational lensing warp logic around center black hole
    const applyLensing = (
      px: number,
      py: number,
      k: number, // Transit collapse progress (0 to 1)
      bhX: number,
      bhY: number,
      bhNormScale: number
    ): { x: number; y: number; visible: boolean } => {
      const dx = px - bhX;
      const dy = py - bhY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Scale black hole gravity strength and horizon radius dynamically during transit collapse
      const baseHorizon = 8.5;
      const horizonRadius = (baseHorizon + Math.pow(k, 3) * Math.max(width, height) * 0.85) * bhNormScale;
      const lensingStrength = (180 + Math.pow(k, 3) * Math.max(width, height) * 0.9) * bhNormScale * bhNormScale;

      if (dist < horizonRadius) {
        return { x: px, y: py, visible: false }; // Swallowed
      }

      // Einstein light path deflection
      const warp = 1 + lensingStrength / (dist * dist + 15);
      return {
        x: bhX + dx * warp,
        y: bhY + dy * warp,
        visible: true,
      };
    };

    // 1. Generate Galaxy Structure
    const galaxyParticles: GalaxyParticle[] = [];
    const nebulaClouds: NebulaCloud[] = [];
    const dustParticles: DustParticle[] = [];
    const accretionParticles: AccretionParticle[] = [];

    const galaxyCount = 1350;
    const maxRadius = Math.min(width, height) * 0.52;

    // A. Generate regular star particles in 3D sphere/spheroid
    for (let i = 0; i < galaxyCount; i++) {
      const r = Math.pow(Math.random(), 2.0) * maxRadius;
      const theta = Math.random() * Math.PI * 2;

      // Inclination: 25% stars in a spherical halo, 75% in a thick oblate spheroid
      const isHalo = Math.random() < 0.25 || i < 150;
      const incl = isHalo 
        ? Math.random() * Math.PI 
        : (Math.random() - 0.5) * 0.65;
      const node = Math.random() * Math.PI * 2;

      const speed = (0.0006 + (1.0 - r / maxRadius) * 0.0024) * (0.85 + Math.random() * 0.3);

      let color = colors[0];
      if (r < maxRadius * 0.15) {
        color = Math.random() < 0.65 ? colors[7] : colors[3];
      } else {
        const rand = Math.random();
        if (rand < 0.3) color = colors[1];
        else if (rand < 0.55) color = colors[2];
        else if (rand < 0.72) color = colors[0];
        else if (rand < 0.88) color = colors[4];
        else color = colors[6];
      }

      const size = Math.random() * 1.35 + 0.45;
      const isSupergiant = Math.random() < 0.055; 

      const x_prime = r * Math.cos(theta);
      const z_prime = r * Math.sin(theta);
      const x = x_prime * Math.cos(node) - z_prime * Math.cos(incl) * Math.sin(node);
      const y = -z_prime * Math.sin(incl);
      const z = x_prime * Math.sin(node) + z_prime * Math.cos(incl) * Math.cos(node);

      galaxyParticles.push({
        x,
        y,
        z,
        r,
        theta,
        speed,
        size,
        color,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.015 + Math.random() * 0.035,
        isSupergiant,
        incl,
        node,
      });
    }

    // B. Generate Nebula Clouds (Fuzzy rotating gas clouds in 3D)
    const nebulaCount = 90;
    for (let i = 0; i < nebulaCount; i++) {
      const r = Math.pow(Math.random(), 1.6) * maxRadius;
      const theta = Math.random() * Math.PI * 2;
      const incl = (Math.random() - 0.5) * 0.85;
      const node = Math.random() * Math.PI * 2;

      const speed = (0.0008 + (1.0 - r / maxRadius) * 0.0022) * 0.95;

      let color = colors[0];
      const rand = Math.random();
      if (rand < 0.35) color = colors[1];
      else if (rand < 0.7) color = colors[2];
      else color = colors[4];

      const size = Math.random() * 45 + 35;

      const x_prime = r * Math.cos(theta);
      const z_prime = r * Math.sin(theta);
      const x = x_prime * Math.cos(node) - z_prime * Math.cos(incl) * Math.sin(node);
      const y = -z_prime * Math.sin(incl);
      const z = x_prime * Math.sin(node) + z_prime * Math.cos(incl) * Math.cos(node);

      nebulaClouds.push({ x, y, z, r, theta, speed, size, color, incl, node });
    }

    // C. Generate Dark Dust Lanes (light-absorbing lanes in 3D)
    const dustCount = 300;
    for (let i = 0; i < dustCount; i++) {
      const r = (0.15 + Math.pow(Math.random(), 1.7) * 0.8) * maxRadius;
      const theta = Math.random() * Math.PI * 2;
      const incl = (Math.random() - 0.5) * 0.75;
      const node = Math.random() * Math.PI * 2;

      const speed = (0.0008 + (1.0 - r / maxRadius) * 0.0022) * (0.8 + Math.random() * 0.4);

      const color = Math.random() < 0.5 ? 'rgba(35, 12, 3, ' : 'rgba(16, 6, 22, ';
      const size = Math.random() * 3.5 + 1.8;

      const x_prime = r * Math.cos(theta);
      const z_prime = r * Math.sin(theta);
      const x = x_prime * Math.cos(node) - z_prime * Math.cos(incl) * Math.sin(node);
      const y = -z_prime * Math.sin(incl);
      const z = x_prime * Math.sin(node) + z_prime * Math.cos(incl) * Math.cos(node);

      dustParticles.push({ x, y, z, r, theta, speed, size, color, incl, node });
    }

    // D. Generate Accretion Disk particles
    const accretionCount = 75;
    for (let i = 0; i < accretionCount; i++) {
      const r = 8.5 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.08;
      const size = Math.random() * 1.4 + 0.4;
      const y = (Math.random() - 0.5) * 1.5;
      
      const rand = Math.random();
      const color = rand < 0.45 
        ? 'rgba(255, 110, 0, ' 
        : (rand < 0.8 ? 'rgba(255, 205, 0, ' : 'rgba(255, 255, 255, ');

      accretionParticles.push({ r, theta, speed, size, color, y });
    }

    // 2. Generate Travel Stars (Depth tunnel background stars)
    const fallingStars: FallingStar[] = [];
    const fallingStarCount = 380;
    const fov = 650; 

    for (let i = 0; i < fallingStarCount; i++) {
      const x = (Math.random() - 0.5) * width * 2.5;
      const y = (Math.random() - 0.5) * height * 2.5;
      const z = Math.random() * fov * 1.5;
      const size = Math.random() * 1.85 + 0.5;
      const twinklePhase = Math.random() * Math.PI * 2;
      const twinkleSpeed = 0.015 + Math.random() * 0.04;
      const colorIndex = Math.floor(Math.random() * (colors.length - 1));
      const color = colors[colorIndex];
      const isSupergiant = Math.random() < 0.07; 

      fallingStars.push({
        x,
        y,
        z,
        size,
        twinklePhase,
        twinkleSpeed,
        color,
        isSupergiant,
      });
    }

    // 3. Generate Cosmic Dust (Vertical falling background embers)
    const cosmicDust: CosmicDust[] = [];
    const cosmicDustCount = 150; 
    for (let i = 0; i < cosmicDustCount; i++) {
      cosmicDust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.25 + 0.4,
        speedY: 0.22 + Math.random() * 0.5,
        driftSpeed: 0.003 + Math.random() * 0.007,
        driftRange: 0.6 + Math.random() * 1.2,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.02,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // 4. Gemini Constellations (Deep Background)
    const constellations: Constellation[] = [];

    const twinStars = [
      { x: -65, y: -90, size: 2.4, phase: 0 },   
      { x: -25, y: -80, size: 1.5, phase: 1 },
      { x: 15, y: -70, size: 1.6, phase: 2 },
      { x: 60, y: -60, size: 2.7, phase: 3 },    
      { x: -55, y: -25, size: 1.3, phase: 4 },
      { x: -20, y: -20, size: 1.4, phase: 5 },
      { x: 20, y: -15, size: 1.3, phase: 6 },
      { x: 60, y: -5, size: 1.7, phase: 7 },
      { x: -50, y: 35, size: 1.6, phase: 8 },
      { x: 10, y: 40, size: 1.4, phase: 9 },
      { x: 55, y: 45, size: 1.8, phase: 10 }
    ];
    const twinConnections: [number, number][] = [
      [0, 1], [1, 2], [2, 3],
      [0, 4], [4, 8],
      [3, 7], [7, 10],
      [1, 5], [5, 9],
      [4, 5], [5, 6], [6, 7]
    ];

    const sparkleStars = [
      { x: 0, y: -50, size: 1.8, phase: 0 },
      { x: 40, y: 0, size: 1.8, phase: 1.5 },
      { x: 0, y: 50, size: 1.8, phase: 3.0 },
      { x: -40, y: 0, size: 1.8, phase: 4.5 },
      { x: 0, y: 0, size: 2.8, phase: 1.0 } 
    ];
    const sparkleConnections: [number, number][] = [
      [0, 4], [1, 4], [2, 4], [3, 4],
      [0, 1], [1, 2], [2, 3], [3, 0]
    ];

    const crossStars = [
      { x: 0, y: -30, size: 1.4, phase: 0 },
      { x: 30, y: 0, size: 1.4, phase: 1.2 },
      { x: 0, y: 30, size: 1.4, phase: 2.4 },
      { x: -30, y: 0, size: 1.4, phase: 3.6 }
    ];
    const crossConnections: [number, number][] = [
      [0, 2], [1, 3]
    ];

    constellations.push({
      relX: -0.32,
      relY: -0.32,
      z: fov * 1.3,
      stars: twinStars,
      connections: twinConnections,
      scale: 0.95,
      speed: 0.015,
    });

    constellations.push({
      relX: 0.35,
      relY: -0.38,
      z: fov * 1.0,
      stars: sparkleStars,
      connections: sparkleConnections,
      scale: 0.9,
      speed: 0.018,
    });

    constellations.push({
      relX: -0.38,
      relY: 0.38,
      z: fov * 1.2,
      stars: crossStars,
      connections: crossConnections,
      scale: 0.8,
      speed: 0.012,
    });

    const shootingStars: ShootingStar[] = [];
    const meteorSparks: MeteorSpark[] = [];

    let autoRotAngle = 0;

    // Main Loop
    const render = () => {
      ctx.fillStyle = '#020208';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Smooth scroll interpolation
      lerpScrollY += (currentScrollY - lerpScrollY) * 0.09;

      // Feed scroll into camera tilt (scroll-driven rotation)
      const scrollRotation = Math.tanh(lerpScrollY * 0.00035) * 0.35;

      // Blend mouse tilt + scroll tilt into a single target
      rotX += ((targetRotX + scrollRotation) - rotX) * 0.04;
      rotY += (targetRotY - rotY) * 0.04;

      autoRotAngle += 0.00035;

      // Wormhole transit state updates
      const k = transitProgress; // Collapse ratio (0.0 to 1.0)
      if (transitState === 'collapsing') {
        transitProgress += 0.038; // Collapses in ~26 frames (~430ms)
        if (transitProgress >= 1.0) {
          transitProgress = 1.0;

          // Reposition window at peak collapse
          window.scrollTo(0, transitTargetScrollY);
          currentScrollY = transitTargetScrollY;
          lerpScrollY = transitTargetScrollY;

          transitState = 'recovering';
        }
      } else if (transitState === 'recovering') {
        transitProgress -= 0.038;
        if (transitProgress <= 0) {
          transitProgress = 0;
          transitState = 'idle';
        }
      }

      const currentRotX = rotX;
      // During transit, rotate the camera rapidly to simulate rotational gravity vortex
      const currentRotY = rotY + autoRotAngle + Math.pow(k, 1.8) * 1.8;

      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);
      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);

      // Scroll speed damping
      scrollVel *= 0.93;
      scrollSpeed *= 0.93;
      const starSpeed = 0.22; // Constant slow drift speed

      // Small bounded vertical drift (clamped to ~55px max via tanh)
      const galaxyScrollOffset = Math.tanh(lerpScrollY * 0.0003) * 55;

      // Compute projected black hole position in 3D space
      const bhTempY = -galaxyScrollOffset;
      const bhRy = bhTempY * cosX;
      const bhFinalZ = bhTempY * sinX;
      const bhScale = fov / (fov + bhFinalZ + 250);
      const bhX = cx;
      const bhY = bhRy * bhScale + cy;
      const bhNormalizedScale = bhScale * (fov + 250) / fov;

      // Foreground queues for depth-sorting
      const fgNebulaeQueue: Array<{
        x: number;
        y: number;
        size: number;
        color: string;
        alpha: number;
      }> = [];

      const fgGalaxyQueue: Array<{
        x: number;
        y: number;
        size: number;
        color: string;
        alpha: number;
        isSupergiant: boolean;
      }> = [];

      const fgAccretionQueue: Array<{
        x: number;
        y: number;
        size: number;
        color: string;
        alpha: number;
      }> = [];

      const fgDustQueue: Array<{
        x: number;
        y: number;
        size: number;
        color: string;
        alpha: number;
      }> = [];

      // Draw background glow nebulae (fade them out during collapse)
      const nebulaFade = (1.0 - k * 0.8);
      const neb1Grad = ctx.createRadialGradient(
        bhX - rotY * 140,
        bhY - rotX * 140,
        0,
        bhX - rotY * 140,
        bhY - rotX * 140,
        maxRadius * 1.5
      );
      neb1Grad.addColorStop(0, `rgba(102, 0, 255, ${0.08 * nebulaFade})`);
      neb1Grad.addColorStop(0.5, `rgba(255, 0, 110, ${0.025 * nebulaFade})`);
      neb1Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb1Grad;
      ctx.fillRect(0, 0, width, height);

      const neb2Grad = ctx.createRadialGradient(
        bhX + rotY * 170,
        bhY + rotX * 130,
        0,
        bhX + rotY * 170,
        bhY + rotX * 130,
        maxRadius * 1.2
      );
      neb2Grad.addColorStop(0, `rgba(0, 242, 254, ${0.06 * nebulaFade})`);
      neb2Grad.addColorStop(0.6, `rgba(255, 215, 0, ${0.015 * nebulaFade})`);
      neb2Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb2Grad;
      ctx.fillRect(0, 0, width, height);

      // ----------------------------------------------------
      // DRAW LAYER 0: Deep Background Gemini Constellations (Lighter)
      // ----------------------------------------------------
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < constellations.length; i++) {
        const c = constellations[i];

        const ccx = c.relX * width;
        const ccy = c.relY * height;

        // Project center constellation in 3D (Shifted back by cameraDistance = 250, collapse z towards center)
        const targetZ = c.z * (1.0 - k * 0.95);
        let rx = ccx * cosY - targetZ * sinY;
        let rz = ccx * sinY + targetZ * cosY;
        let ry = ccy * cosX - rz * sinX;
        let finalZ = ccy * sinX + rz * cosX;

        const scale = fov / (fov + finalZ + 250);
        if (finalZ + 250 < -fov) continue;

        const projCX = rx * scale + width / 2;
        const projCY = ry * scale + height / 2;

        if (projCX < -250 || projCX > width + 250 || projCY < -250 || projCY > height + 250) continue;

        // Constellation local rotation
        const constAngle = autoRotAngle * 0.15;
        const cosConst = Math.cos(constAngle);
        const sinConst = Math.sin(constAngle);

        const projectedStars = c.stars.map((s) => {
          s.phase += c.speed;
          // Scale local offsets inward during collapse
          const localScale = c.scale * scale * (1.0 - k * 0.95);
          const lx = (s.x * cosConst - s.y * sinConst) * localScale;
          const ly = (s.x * sinConst + s.y * cosConst) * localScale;
          
          const rawX = projCX + lx;
          const rawY = projCY + ly;
          const starSize = s.size * scale;
          const starAlpha = (0.12 + 0.58 * (Math.sin(s.phase) * 0.5 + 0.5)) * (1.0 - k * 0.8);

          // Apply lensing to deep background stars
          const lensed = applyLensing(rawX, rawY, k, bhX, bhY, bhNormalizedScale);

          return {
            x: lensed.x,
            y: lensed.y,
            size: starSize,
            alpha: lensed.visible ? starAlpha : 0,
          };
        });

        // Draw connections
        ctx.strokeStyle = `rgba(0, 242, 254, ${(0.08 * (1.0 - k * 0.9)).toFixed(2)})`;
        ctx.lineWidth = 0.55;
        c.connections.forEach(([startIdx, endIdx]) => {
          const start = projectedStars[startIdx];
          const end = projectedStars[endIdx];
          if (start.alpha > 0 && end.alpha > 0) {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
          }
        });

        // Draw stars
        projectedStars.forEach((star, idx) => {
          if (star.alpha <= 0) return;
          const isCoreConstellationStar = idx === 0 || idx === 3 || (c.stars.length === 5 && idx === 4);
          
          if (isCoreConstellationStar && star.size > 1.2 && star.alpha > 0.15) {
            drawGeminiLogoStar(ctx, star.x, star.y, star.size * 0.85, star.alpha);
          } else {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(0, 242, 254, ' + star.alpha.toFixed(2) + ')';
            ctx.fill();
          }
        });
      }

      // ----------------------------------------------------
      // DRAW LAYER 1: Nebula Clouds (Lighter Blending)
      // ----------------------------------------------------
      for (let i = 0; i < nebulaClouds.length; i++) {
        const p = nebulaClouds[i];

        // Angular momentum boost: spin gas clouds faster during collapse
        const cloudSpinBoost = 1.0 + k * 18;
        p.theta += p.speed * cloudSpinBoost;

        const currentR = p.r * (1.0 - k * 0.95);
        const x_prime = currentR * Math.cos(p.theta);
        const z_prime = currentR * Math.sin(p.theta);

        p.x = x_prime * Math.cos(p.node) - z_prime * Math.cos(p.incl) * Math.sin(p.node);
        p.y = -z_prime * Math.sin(p.incl);
        p.z = x_prime * Math.sin(p.node) + z_prime * Math.cos(p.incl) * Math.cos(p.node);

        let rx = p.x * cosY - p.z * sinY;
        let rz = p.x * sinY + p.z * cosY;
        // Apply scrolling Y parallax offset
        const tempY = p.y * (1.0 - k * 0.95) - galaxyScrollOffset;
        let ry = tempY * cosX - rz * sinX;
        let finalZ = tempY * sinX + rz * cosX;

        const scale = fov / (fov + finalZ + 250);
        if (finalZ + 250 < -fov) continue;

        const projX = rx * scale + width / 2;
        const projY = ry * scale + height / 2;

        if (projX < -p.size || projX > width + p.size || projY < -p.size || projY > height + p.size) continue;

        const size = p.size * scale * (1.0 - k * 0.92);
        if (size < 2) continue;

        const alpha = 0.045 * (1.0 - k * 0.7);

        if (finalZ > bhFinalZ) {
          const cloudGrad = ctx.createRadialGradient(projX, projY, 0, projX, projY, size);
          cloudGrad.addColorStop(0, p.color + alpha.toFixed(3) + ')');
          cloudGrad.addColorStop(0.5, p.color + (alpha * 0.33).toFixed(3) + ')');
          cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.arc(projX, projY, size, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          fgNebulaeQueue.push({ x: projX, y: projY, size, color: p.color, alpha });
        }
      }

      // ----------------------------------------------------
      // DRAW LAYER 1.5: Volumetric Galactic Nucleus Glow (Lighter Blending)
      // ----------------------------------------------------
      const nucleusGlow = ctx.createRadialGradient(bhX, bhY, 0, bhX, bhY, maxRadius * 0.45 * bhNormalizedScale);
      nucleusGlow.addColorStop(0, 'rgba(255, 240, 215, ' + (0.28 * (1.0 - k * 0.8)).toFixed(3) + ')'); // hot core glow
      nucleusGlow.addColorStop(0.2, 'rgba(255, 175, 90, ' + (0.16 * (1.0 - k * 0.8)).toFixed(3) + ')'); // stellar density
      nucleusGlow.addColorStop(0.55, 'rgba(110, 99, 255, ' + (0.05 * (1.0 - k * 0.8)).toFixed(3) + ')'); // violet transition
      nucleusGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = nucleusGlow;
      ctx.beginPath();
      ctx.arc(bhX, bhY, maxRadius * 0.45 * bhNormalizedScale, 0, 2 * Math.PI);
      ctx.fill();

      // ----------------------------------------------------
      // DRAW LAYER 2: Galaxy Particles & Accretion Disk (Lighter)
      // ----------------------------------------------------
      for (let i = 0; i < galaxyParticles.length; i++) {
        const p = galaxyParticles[i];

        // Angular momentum boost: spin galaxy stars faster during collapse
        const starSpinBoost = 1.0 + k * 22;
        p.theta += p.speed * starSpinBoost;

        const currentR = p.r * (1.0 - k * 0.95);
        const x_prime = currentR * Math.cos(p.theta);
        const z_prime = currentR * Math.sin(p.theta);

        p.x = x_prime * Math.cos(p.node) - z_prime * Math.cos(p.incl) * Math.sin(p.node);
        p.y = -z_prime * Math.sin(p.incl);
        p.z = x_prime * Math.sin(p.node) + z_prime * Math.cos(p.incl) * Math.cos(p.node);

        let rx = p.x * cosY - p.z * sinY;
        let rz = p.x * sinY + p.z * cosY;
        const tempY = p.y * (1.0 - k * 0.95) - galaxyScrollOffset;
        let ry = tempY * cosX - rz * sinX;
        let finalZ = tempY * sinX + rz * cosX;

        const scale = fov / (fov + finalZ + 250);
        if (finalZ + 250 < -fov) continue;

        const projX = rx * scale + width / 2;
        const projY = ry * scale + height / 2;

        if (projX < 0 || projX > width || projY < 0 || projY > height) continue;

        p.twinklePhase += p.twinkleSpeed;
        const twinkle = 0.42 + 0.58 * (Math.sin(p.twinklePhase) * 0.5 + 0.5);

        // Interstellar Extinction (dim background stars)
        const depthFactor = (finalZ + maxRadius) / (maxRadius * 2);
        const extinction = Math.max(0.18, 1.0 - depthFactor * 0.72);
        
        const alpha = 0.78 * twinkle * extinction * (1.0 - k * 0.55);
        const size = p.size * scale * (1.0 - k * 0.85);

        if (finalZ > bhFinalZ) {
          const lensed = applyLensing(projX, projY, k, bhX, bhY, bhNormalizedScale);
          if (!lensed.visible) continue;

          if (p.isSupergiant && size > 1.2 && alpha > 0.25) {
            drawGeminiLogoStar(ctx, lensed.x, lensed.y, size, alpha);
          } else if (size > 2.5 && alpha > 0.45) {
            drawStarFlare(ctx, lensed.x, lensed.y, size, p.color, alpha);
          } else {
            ctx.beginPath();
            ctx.arc(lensed.x, lensed.y, size, 0, 2 * Math.PI);
            ctx.fillStyle = p.color + alpha.toFixed(2) + ')';
            ctx.fill();
          }
        } else {
          fgGalaxyQueue.push({
            x: projX,
            y: projY,
            size,
            color: p.color,
            alpha,
            isSupergiant: p.isSupergiant,
          });
        }
      }

      // Draw Accretion Disk particles orbiting the Event Horizon
      for (let i = 0; i < accretionParticles.length; i++) {
        const p = accretionParticles[i];

        const accretionSpinBoost = 1.0 + k * 28;
        p.theta += p.speed * accretionSpinBoost;
        
        const currentAccretionR = p.r * (1.0 - k * 0.9);
        const x = currentAccretionR * Math.cos(p.theta);
        const z = currentAccretionR * Math.sin(p.theta);

        let rx = x * cosY - z * sinY;
        let rz = x * sinY + z * cosY;
        const tempY = p.y * (1.0 - k * 0.9) - galaxyScrollOffset;
        let ry = tempY * cosX - rz * sinX;
        let finalZ = tempY * sinX + rz * cosX;

        const scale = fov / (fov + finalZ + 250);
        if (finalZ + 250 < -fov) continue;

        const projX = rx * scale + width / 2;
        const projY = ry * scale + height / 2;

        const size = p.size * scale * 1.5 * (1.0 + k * 1.8);

        // Relativistic Beaming (Doppler Beaming Effect)
        const beaming = -Math.cos(p.theta); // ranges from -1 to 1 (left approaching = bright, right receding = dim)
        const beamAlpha = 0.45 + 0.55 * (beaming * 0.5 + 0.5); // 0.45 to 1.0
        const baseAlpha = 0.95 * (1.0 - k * 0.25);
        const alpha = baseAlpha * beamAlpha;

        let particleColor = p.color;
        if (beaming > 0.4) {
          particleColor = 'rgba(230, 245, 255, '; // Hot bright white-blue
        } else if (beaming > 0.0) {
          particleColor = 'rgba(255, 235, 180, '; // Bright yellow-white
        } else if (beaming > -0.5) {
          particleColor = 'rgba(255, 120, 0, ';  // Warm orange
        } else {
          particleColor = 'rgba(230, 40, 10, ';   // Cooler crimson/red
        }

        if (finalZ > bhFinalZ) {
          const lensed = applyLensing(projX, projY, k, bhX, bhY, bhNormalizedScale);
          if (!lensed.visible) continue;

          ctx.beginPath();
          ctx.arc(lensed.x, lensed.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = particleColor + alpha.toFixed(2) + ')';
          ctx.fill();
        } else {
          fgAccretionQueue.push({
            x: projX,
            y: projY,
            size,
            color: particleColor,
            alpha,
          });
        }
      }

      // ----------------------------------------------------
      // DRAW LAYER 3: Dark Dust Lanes (Source-over, light-absorbing)
      // ----------------------------------------------------
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < dustParticles.length; i++) {
        const p = dustParticles[i];

        const dustSpinBoost = 1.0 + k * 22;
        p.theta += p.speed * dustSpinBoost;

        const currentR = p.r * (1.0 - k * 0.95);
        const x_prime = currentR * Math.cos(p.theta);
        const z_prime = currentR * Math.sin(p.theta);

        p.x = x_prime * Math.cos(p.node) - z_prime * Math.cos(p.incl) * Math.sin(p.node);
        p.y = -z_prime * Math.sin(p.incl);
        p.z = x_prime * Math.sin(p.node) + z_prime * Math.cos(p.incl) * Math.cos(p.node);

        let rx = p.x * cosY - p.z * sinY;
        let rz = p.x * sinY + p.z * cosY;
        const tempY = p.y * (1.0 - k * 0.95) - galaxyScrollOffset;
        let ry = tempY * cosX - rz * sinX;
        let finalZ = tempY * sinX + rz * cosX;

        const scale = fov / (fov + finalZ + 250);
        if (finalZ + 250 < -fov) continue;

        const projX = rx * scale + width / 2;
        const projY = ry * scale + height / 2;

        if (projX < 0 || projX > width || projY < 0 || projY > height) continue;

        const depthFactor = (finalZ + maxRadius) / (maxRadius * 2);
        const extinction = Math.max(0.2, 1.0 - depthFactor * 0.65);

        const size = p.size * scale * 1.45 * (1.0 - k * 0.9);
        const alpha = 0.26 * extinction * (1.0 - k);

        if (finalZ > bhFinalZ) {
          const lensed = applyLensing(projX, projY, k, bhX, bhY, bhNormalizedScale);
          if (!lensed.visible) continue;

          ctx.beginPath();
          ctx.arc(lensed.x, lensed.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = p.color + alpha.toFixed(2) + ')';
          ctx.fill();
        } else {
          fgDustQueue.push({
            x: projX,
            y: projY,
            size,
            color: p.color,
            alpha,
          });
        }
      }

      // ----------------------------------------------------
      // DRAW LAYER 4: Lensed Accretion Disk (Background) & Event Horizon
      // ----------------------------------------------------
      // Scale horizon and rings exponentially during transit collapse
      const currentHorizonRadius = (7.5 + Math.pow(k, 3) * Math.max(width, height) * 0.85) * bhNormalizedScale;
      const currentRingRadius = (11 + Math.pow(k, 3) * Math.max(width, height) * 0.88) * bhNormalizedScale;

      // Draw lensed Einstein Ring (Double-layered for extreme realism)
      // 1. Soft blue/cyan outer lensing glow
      ctx.beginPath();
      ctx.arc(bhX, bhY, currentRingRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(0, 242, 254, ' + (0.35 * (1.0 - k * 0.6)).toFixed(2) + ')';
      ctx.lineWidth = (4.0 + k * 15.0) * bhNormalizedScale;
      ctx.stroke();

      // 2. Core intense white ring
      ctx.beginPath();
      ctx.arc(bhX, bhY, currentRingRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.95 * (1.0 - k * 0.6)).toFixed(2) + ')';
      ctx.lineWidth = (1.5 + k * 8.0) * bhNormalizedScale;
      ctx.stroke();

      // Draw lensed accretion disk gas rings
      const fgDiskSegments: Array<{
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        color: string;
        lineWidth: number;
      }> = [];

      const ringCount = 12;
      const segmentCount = 72; // every 5 degrees

      for (let rIdx = 0; rIdx < ringCount; rIdx++) {
        const rFactor = rIdx / (ringCount - 1);
        const R = (13.5 + rFactor * 28.0) * bhNormalizedScale;
        const baseWidth = (1.5 + (1.0 - rFactor) * 2.0) * bhNormalizedScale;

        for (let sIdx = 0; sIdx < segmentCount; sIdx++) {
          const theta1 = (sIdx * 2 * Math.PI) / segmentCount;
          const theta2 = ((sIdx + 1) * 2 * Math.PI) / segmentCount;

          // Point 1
          const x1 = R * Math.cos(theta1);
          const z1 = R * Math.sin(theta1);
          const rx1 = x1 * cosY - z1 * sinY;
          const rz1 = x1 * sinY + z1 * cosY;
          const tempY1 = -galaxyScrollOffset;
          const projRy1 = tempY1 * cosX - rz1 * sinX;
          const projFinalZ1 = tempY1 * sinX + rz1 * cosX;
          const scale1 = fov / (fov + projFinalZ1 + 250);
          const projX1 = rx1 * scale1 + width / 2;
          const projY1 = projRy1 * scale1 + height / 2;

          // Point 2
          const x2 = R * Math.cos(theta2);
          const z2 = R * Math.sin(theta2);
          const rx2 = x2 * cosY - z2 * sinY;
          const rz2 = x2 * sinY + z2 * cosY;
          const tempY2 = -galaxyScrollOffset;
          const projRy2 = tempY2 * cosX - rz2 * sinX;
          const projFinalZ2 = tempY2 * sinX + rz2 * cosX;
          const scale2 = fov / (fov + projFinalZ2 + 250);
          const projX2 = rx2 * scale2 + width / 2;
          const projY2 = projRy2 * scale2 + height / 2;

          // Relativistic Beaming
          const midTheta = (theta1 + theta2) / 2;
          const beaming = -Math.cos(midTheta);
          const beamFactor = 0.45 + 0.55 * (beaming * 0.5 + 0.5);
          const alpha = (0.28 * (1.0 - k * 0.3) * beamFactor) / (0.7 + rFactor * 0.9);

          let strokeColor = 'rgba(255, 120, 0, ';
          if (beaming > 0.4) {
            strokeColor = 'rgba(230, 245, 255, '; // Hot bright white-blue
          } else if (beaming > 0.0) {
            strokeColor = 'rgba(255, 235, 180, '; // Bright yellow-white
          } else if (beaming > -0.5) {
            strokeColor = 'rgba(255, 120, 0, ';  // Warm orange
          } else {
            strokeColor = 'rgba(230, 40, 10, ';   // Cooler crimson/red
          }

          const colorStr = strokeColor + alpha.toFixed(3) + ')';
          const lineWidth = baseWidth * (0.8 + 0.4 * beamFactor);

          const midFinalZ = (projFinalZ1 + projFinalZ2) / 2;

          if (midFinalZ > bhFinalZ) {
            // Background segment: Lens it!
            const lensed1 = applyLensing(projX1, projY1, k, bhX, bhY, bhNormalizedScale);
            const lensed2 = applyLensing(projX2, projY2, k, bhX, bhY, bhNormalizedScale);

            if (lensed1.visible && lensed2.visible) {
              ctx.strokeStyle = colorStr;
              ctx.lineWidth = lineWidth;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(lensed1.x, lensed1.y);
              ctx.lineTo(lensed2.x, lensed2.y);
              ctx.stroke();
            }
          } else {
            // Foreground segment: Queue it!
            fgDiskSegments.push({
              x1: projX1,
              y1: projY1,
              x2: projX2,
              y2: projY2,
              color: colorStr,
              lineWidth: lineWidth,
            });
          }
        }
      }

      // Event Horizon shadow (pure absolute dark void)
      ctx.beginPath();
      ctx.arc(bhX, bhY, currentHorizonRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#010103';
      ctx.fill();

      // Draw Foreground Accretion Disk segments (Layer 4.1)
      fgDiskSegments.forEach((seg) => {
        ctx.strokeStyle = seg.color;
        ctx.lineWidth = seg.lineWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      });

      // Mask screen fully at peak collapse to hide page scroll jump
      if (k > 0.96) {
        ctx.fillStyle = '#010103';
        ctx.fillRect(0, 0, width, height);
      }

      // ----------------------------------------------------
      // DRAW LAYER 4.5: Draw Foreground Queues (Source-over/Lighter)
      // ----------------------------------------------------
      // A. Draw foreground Nebulae
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < fgNebulaeQueue.length; i++) {
        const n = fgNebulaeQueue[i];
        const cloudGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.size);
        cloudGrad.addColorStop(0, n.color + n.alpha.toFixed(3) + ')');
        cloudGrad.addColorStop(0.5, n.color + (n.alpha * 0.33).toFixed(3) + ')');
        cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, 2 * Math.PI);
        ctx.fill();
      }

      // B. Draw foreground Galaxy particles
      for (let i = 0; i < fgGalaxyQueue.length; i++) {
        const g = fgGalaxyQueue[i];
        if (g.isSupergiant && g.size > 1.2 && g.alpha > 0.25) {
          drawGeminiLogoStar(ctx, g.x, g.y, g.size, g.alpha);
        } else if (g.size > 2.5 && g.alpha > 0.45) {
          drawStarFlare(ctx, g.x, g.y, g.size, g.color, g.alpha);
        } else {
          ctx.beginPath();
          ctx.arc(g.x, g.y, g.size, 0, 2 * Math.PI);
          ctx.fillStyle = g.color + g.alpha.toFixed(2) + ')';
          ctx.fill();
        }
      }

      // C. Draw foreground Accretion particles
      for (let i = 0; i < fgAccretionQueue.length; i++) {
        const a = fgAccretionQueue[i];
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size, 0, 2 * Math.PI);
        ctx.fillStyle = a.color + a.alpha.toFixed(2) + ')';
        ctx.fill();
      }

      // D. Draw foreground Dust particles (Source-over)
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < fgDustQueue.length; i++) {
        const d = fgDustQueue[i];
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, 2 * Math.PI);
        ctx.fillStyle = d.color + d.alpha.toFixed(2) + ')';
        ctx.fill();
      }

      // ----------------------------------------------------
      // DRAW LAYER 5: Stars, Dust, Meteors, Sparks & Lens Flare (Lighter)
      // ----------------------------------------------------
      ctx.globalCompositeOperation = 'lighter';

      // A. Draw traveling tunnel stars (with Warp Streaks & Scroll Parallax)
      for (let i = 0; i < fallingStars.length; i++) {
        const s = fallingStars[i];

        s.z -= starSpeed;

        if (s.z <= -fov + 100) {
          s.z = fov * 1.5;
          s.x = (Math.random() - 0.5) * width * 2.5;
          s.y = (Math.random() - 0.5) * height * 2.5;
        }

        // Pull stars into central singularity during wormhole transit
        const tempX = s.x * (1.0 - k * 0.98);
        
        const tempY = s.y * (1.0 - k * 0.98);
        
        const tempZ = s.z * (1.0 - k * 0.94);

        let rx = tempX * cosY - tempZ * sinY;
        let rz = tempX * sinY + tempZ * cosY;
        let ry = tempY * cosX - rz * sinX;
        let finalZ = tempY * sinX + rz * cosX;

        const scale = fov / (fov + finalZ + 250);
        if (finalZ + 250 < -fov) continue;

        const projX = rx * scale + width / 2;
        const projY = ry * scale + height / 2;

        if (projX < 0 || projX > width || projY < 0 || projY > height) continue;

        s.twinklePhase += s.twinkleSpeed;
        const alpha = (0.22 + 0.78 * (Math.sin(s.twinklePhase) * 0.5 + 0.5)) * (1.0 - k * 0.85);
        const size = s.size * scale * (1.0 - k * 0.85);
        if (size <= 0.2 || alpha <= 0.05) continue;

        // Apply lensing if the star is behind the black hole!
        let drawX = projX;
        let drawY = projY;

        if (finalZ > bhFinalZ) {
          const lensed = applyLensing(projX, projY, k, bhX, bhY, bhNormalizedScale);
          if (!lensed.visible) continue;
          drawX = lensed.x;
          drawY = lensed.y;
        }

        if (s.isSupergiant && size > 1.2 && alpha > 0.25) {
          drawGeminiLogoStar(ctx, drawX, drawY, size, alpha);
        } else if (size > 2.6 && alpha > 0.5) {
          drawStarFlare(ctx, drawX, drawY, size, s.color, alpha);
        } else {
          ctx.beginPath();
          ctx.arc(drawX, drawY, size, 0, 2 * Math.PI);
          ctx.fillStyle = s.color + alpha.toFixed(2) + ')';
          ctx.fill();
        }
      }

      // B. Draw Cosmic Dust (Vertical falling stardust with counter-acting scroll wind)
      for (let i = 0; i < cosmicDust.length; i++) {
        const d = cosmicDust[i];

        const oldY = d.y;
        // Scrolling counteracts gravity
        d.y += d.speedY - scrollVel * 0.38;
        d.x += Math.sin(d.twinklePhase + lerpScrollY * 0.003) * d.driftRange * 0.16;
        d.twinklePhase += d.twinkleSpeed;

        if (d.y > height || d.x < -10 || d.x > width + 10) {
          d.y = -15;
          d.x = Math.random() * width;
        } else if (d.y < -20) {
          d.y = height + 10;
          d.x = Math.random() * width;
        }

        // Fade out stardust during scroll
        const scrollFade = Math.max(0, 1.0 - scrollSpeed * 0.8);
        const alpha = (0.16 + 0.65 * (Math.sin(d.twinklePhase) * 0.5 + 0.5)) * (1.0 - k) * scrollFade;
        if (alpha <= 0.02) continue;

        // Pull stardust towards black hole during transit collapse
        const tempX = d.x * (1.0 - k) + bhX * k;
        const tempY = d.y * (1.0 - k) + bhY * k;
        const tempOldY = oldY * (1.0 - k) + bhY * k;

        ctx.beginPath();
        ctx.moveTo(tempX, tempOldY);
        ctx.lineTo(tempX, tempY);
        ctx.strokeStyle = d.color + alpha.toFixed(2) + ')';
        ctx.lineWidth = d.size;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // C. Update & Draw Shooting Stars (Diagonal meteors responding to transit collapse)
      if (shootingStars.length < 5 && Math.random() < 0.018 && transitState === 'idle') {
        const startX = Math.random() * width;
        const startY = Math.random() * height * 0.35;
        const speed = 12 + Math.random() * 10;
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2; 

        shootingStars.push({
          x: startX,
          y: startY,
          dx: -Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          length: 80 + Math.random() * 110,
          speed,
          size: 1.4 + Math.random() * 1.6,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: 20 + Math.random() * 25,
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.dx;
        s.y += s.dy;
        s.life++;

        // Spawn trailing sparks along the path
        if (Math.random() < 0.35) {
          const sparkAngle = Math.random() * Math.PI * 2;
          const sparkSpeed = 0.5 + Math.random() * 1.5;
          meteorSparks.push({
            x: s.x,
            y: s.y,
            dx: s.dx * 0.2 + Math.cos(sparkAngle) * sparkSpeed,
            dy: s.dy * 0.2 + Math.sin(sparkAngle) * sparkSpeed,
            color: s.color,
            size: Math.random() * 1.1 + 0.3,
            alpha: 0.9,
            life: 0,
            maxLife: 10 + Math.random() * 12,
          });
        }

        if (s.life >= s.maxLife || transitState === 'collapsing') {
          // Trigger explosion sparks on burnout
          if (transitState === 'idle') {
            for (let k = 0; k < 8; k++) {
              const burstAngle = Math.random() * Math.PI * 2;
              const burstSpeed = 1.2 + Math.random() * 2.8;
              meteorSparks.push({
                x: s.x,
                y: s.y,
                dx: s.dx * 0.35 + Math.cos(burstAngle) * burstSpeed,
                dy: s.dy * 0.35 + Math.sin(burstAngle) * burstSpeed,
                color: s.color,
                size: Math.random() * 1.3 + 0.4,
                alpha: 1.0,
                life: 0,
                maxLife: 16 + Math.random() * 16,
              });
            }
          }
          shootingStars.splice(i, 1);
          continue;
        }

        const alpha = Math.sin((s.life / s.maxLife) * Math.PI) * (1.0 - k);
        if (alpha <= 0.05) continue;

        // Pull coordinates during transit collapse
        const tempX = s.x * (1.0 - k) + bhX * k;
        const tempY = s.y * (1.0 - k) + bhY * k;

        const tailX = (s.x - s.dx * (s.length / s.speed)) * (1.0 - k) + bhX * k;
        const tailY = (s.y - s.dy * (s.length / s.speed)) * (1.0 - k) + bhY * k;

        const grad = ctx.createLinearGradient(tailX, tailY, tempX, tempY);
        grad.addColorStop(0, s.color + '0)');
        grad.addColorStop(0.75, s.color + (alpha * 0.45).toFixed(2) + ')');
        grad.addColorStop(1, s.color + alpha.toFixed(2) + ')');

        ctx.strokeStyle = grad;
        ctx.lineWidth = s.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(tempX, tempY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(tempX, tempY, s.size * 1.6, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha.toFixed(2) + ')';
        ctx.fill();
      }

      // D. Update & Draw Meteor Sparks (Sparkle explosion trails)
      for (let i = meteorSparks.length - 1; i >= 0; i--) {
        const sp = meteorSparks[i];
        sp.x += sp.dx;
        sp.y += sp.dy;
        sp.dx *= 0.96; 
        sp.dy *= 0.96;
        sp.life++;

        if (sp.life >= sp.maxLife) {
          meteorSparks.splice(i, 1);
          continue;
        }

        const alpha = sp.alpha * (1.0 - sp.life / sp.maxLife) * (1.0 - k);
        if (alpha <= 0.05) continue;

        // Pull coordinates during transit collapse
        const tempX = sp.x * (1.0 - k) + bhX * k;
        const tempY = sp.y * (1.0 - k) + bhY * k;

        ctx.beginPath();
        ctx.arc(tempX, tempY, sp.size, 0, 2 * Math.PI);
        ctx.fillStyle = sp.color + alpha.toFixed(2) + ')';
        ctx.fill();
      }

      // E. Draw Cinematic Camera Lens Flare (faded out during collapse)
      if (transitState === 'idle') {
        const fx = mouseX - bhX;
        const fy = mouseY - bhY;
        const flareElements = [
          { offset: -0.3, size: 45, color: 'rgba(0, 242, 254, 0.012)' },
          { offset: -0.15, size: 90, color: 'rgba(110, 99, 255, 0.008)' },
          { offset: 0.1, size: 18, color: 'rgba(255, 215, 0, 0.016)' },
          { offset: 0.25, size: 140, color: 'rgba(255, 0, 110, 0.006)' },
          { offset: 0.42, size: 35, color: 'rgba(0, 255, 198, 0.012)' },
          { offset: 0.68, size: 70, color: 'rgba(255, 75, 43, 0.008)' },
          { offset: 0.95, size: 180, color: 'rgba(0, 242, 254, 0.005)' },
        ];

        flareElements.forEach((el) => {
          const ex = bhX + fx * el.offset;
          const ey = bhY + fy * el.offset;

          const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, el.size);
          grad.addColorStop(0, el.color);
          grad.addColorStop(0.8, el.color.replace(/[\d.]+\)$/, '0.002)'));
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(ex, ey, el.size, 0, 2 * Math.PI);
          ctx.fill();
        });
      }

      ctx.globalCompositeOperation = 'source-over';
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('trigger-blackhole-transit', handleTransit);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 block pointer-events-none"
      style={{ background: '#020208' }}
    />
  );
}
