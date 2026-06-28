import { useEffect, useRef, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Vec2 {
  x: number;
  y: number;
}

interface SnakeSegment extends Vec2 {
  angle: number;
}

interface SnakeConfig {
  color: string;
  glowColor: string;
  headSize: number;
  bodyWidth: number;
  segmentCount: number;
  segmentSpacing: number;
  speed: number;
  orbitOffset: number; // phase offset for orbiting (0 to 1)
  eyeColor: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
  edible?: boolean;
}

interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SNAKE_CONFIGS: SnakeConfig[] = [
  {
    color: '#6C63FF',
    glowColor: 'rgba(108, 99, 255, 0.65)',
    headSize: 7.5,
    bodyWidth: 4.8,
    segmentCount: 42,
    segmentSpacing: 4.8,
    speed: 0.022,
    orbitOffset: 0,
    eyeColor: '#00E5FF',
  },
  {
    color: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.65)',
    headSize: 6.5,
    bodyWidth: 4.0,
    segmentCount: 36,
    segmentSpacing: 4.2,
    speed: 0.025,
    orbitOffset: 0.333,
    eyeColor: '#FF6B9D',
  },
  {
    color: '#FF6B9D',
    glowColor: 'rgba(255, 107, 157, 0.6)',
    headSize: 5.5,
    bodyWidth: 3.4,
    segmentCount: 30,
    segmentSpacing: 3.8,
    speed: 0.028,
    orbitOffset: 0.666,
    eyeColor: '#6C63FF',
  },
];

const BORDER_DETECTION_PADDING = 8;
const TRANSITION_SPEED = 0.035; // Slower, high-inertia transition for realistic glide

// ─── Utility Functions ───────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

function dist(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Given a rectangle, compute a point on its perimeter at parameter t (0..1).
 * t goes clockwise starting from top-left corner.
 */
function pointOnRectPerimeter(rect: TargetRect, t: number, padding: number): Vec2 {
  // Normalize t to [0,1)
  t = ((t % 1) + 1) % 1;

  const x = rect.x - padding;
  const y = rect.y - padding;
  const w = rect.width + padding * 2;
  const h = rect.height + padding * 2;
  const perimeter = 2 * (w + h);

  const d = t * perimeter;

  if (d < w) {
    // Top edge: left to right
    return { x: x + d, y };
  } else if (d < w + h) {
    // Right edge: top to bottom
    return { x: x + w, y: y + (d - w) };
  } else if (d < 2 * w + h) {
    // Bottom edge: right to left
    return { x: x + w - (d - w - h), y: y + h };
  } else {
    // Left edge: bottom to top
    return { x, y: y + h - (d - 2 * w - h) };
  }
}

function tangentOnRectPerimeter(rect: TargetRect, t: number, padding: number): number {
  t = ((t % 1) + 1) % 1;
  const w = rect.width + padding * 2;
  const h = rect.height + padding * 2;
  const perimeter = 2 * (w + h);
  const d = t * perimeter;

  if (d < w) return 0;                     // Top: moving right
  if (d < w + h) return Math.PI / 2;       // Right: moving down
  if (d < 2 * w + h) return Math.PI;       // Bottom: moving left
  return -Math.PI / 2;                     // Left: moving up
}

/**
 * Detect if cursor is over a bordered element (buttons, cards, sections with borders).
 */
function findBorderedElement(mouseX: number, mouseY: number): TargetRect | null {
  if (typeof document === 'undefined' || !document.elementsFromPoint) return null;
  const elements = document.elementsFromPoint(mouseX, mouseY) || [];

  for (const el of elements) {
    if (
      !el ||
      el.tagName === 'CANVAS' ||
      el.id === 'alien-snakes-canvas' ||
      el.tagName === 'HTML' ||
      el.tagName === 'BODY'
    ) {
      continue;
    }

    // Resolve to the closest interactive parent button or anchor link if hovered over inner span/text
    const interactiveEl = el.closest('button') || el.closest('a') || el.closest('[role="button"]');
    const targetEl = interactiveEl ? interactiveEl : el;

    const rect = targetEl.getBoundingClientRect();

    // Strict element size limit (max 420px)
    if (rect.width > 420 || rect.height > 420) continue;
    // Skip tiny elements that might just be icons or empty divs
    if (rect.width < 12 || rect.height < 12) continue;

    const style = window.getComputedStyle(targetEl);
    if (!style) continue;

    const isButtonOrLink =
      targetEl.tagName === 'BUTTON' ||
      targetEl.tagName === 'A' ||
      targetEl.getAttribute('role') === 'button' ||
      style.cursor === 'pointer' ||
      targetEl.classList.contains('cursor-pointer');

    const hasBorder =
      (style.borderWidth !== '0px' && style.borderStyle !== 'none' && style.borderColor !== 'rgba(0, 0, 0, 0)') ||
      style.outlineStyle !== 'none' ||
      (style.boxShadow || '').includes('inset') ||
      targetEl.classList.contains('glass-panel') ||
      targetEl.classList.contains('glass-panel-hover') ||
      targetEl.classList.contains('border-glow');

    // Only target elements that are interactive (buttons, links) or have visual borders
    if (isButtonOrLink || hasBorder) {
      return {
        x: rect.x + window.scrollX,
        y: rect.y + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    }
  }

  return null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AlienSnakes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<Vec2>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const scrollRef = useRef<Vec2>({ x: 0, y: 0 });
  const snakesRef = useRef<SnakeSegment[][]>([]);
  const targetRectRef = useRef<TargetRect | null>(null);
  const orbitTRef = useRef<number[]>([0, 0.333, 0.666]);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const isInitialized = useRef(false);
  const sparksRef = useRef<Spark[]>([]);
  const energyPulseRef = useRef<number>(0);
  const growthRef = useRef<number[]>([0, 0, 0]);

  // Initialize snakes
  const initSnakes = useCallback(() => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    snakesRef.current = SNAKE_CONFIGS.map((config) => {
      const segments: SnakeSegment[] = [];
      for (let i = 0; i < config.segmentCount; i++) {
        segments.push({
          x: cx + Math.random() * 50 - 25,
          y: cy + Math.random() * 50 - 25,
          angle: Math.random() * Math.PI * 2,
        });
      }
      return segments;
    });

    orbitTRef.current = SNAKE_CONFIGS.map((c) => c.orbitOffset);
    isInitialized.current = true;
  }, []);

  // Draw a single snake on the canvas
  const drawSnake = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      segments: SnakeSegment[],
      config: SnakeConfig,
      time: number,
      snakeIdx: number,
      sizeScale: number
    ) => {
      if (segments.length < 2) return;

      const dpr = window.devicePixelRatio || 1;

      // Body thickness profile: narrow neck, thick core body, tapering tail
      const getProfile = (x: number) => {
        if (x < 0.12) {
          return lerp(1.05, 0.82, x / 0.12);
        } else if (x < 0.4) {
          return lerp(0.82, 1.22, (x - 0.12) / 0.28);
        } else {
          return lerp(1.22, 0.12, (x - 0.4) / 0.6);
        }
      };

      // Compute wavy coordinates for body to make it slither like a real snake
      const getWavyCoords = (i: number) => {
        const seg = segments[i];
        if (i === 0) return { x: seg.x, y: seg.y, angle: seg.angle };

        const isOrbiting = !!targetRectRef.current;
        const baseAmp = isOrbiting ? 1.8 : 4.5;
        // Scale body waving offset by sizeScale as well so larger snakes have wider waves
        const wave = Math.sin(time * 16 - i * 0.4 + snakeIdx * 2.1) * baseAmp * (1 - i / segments.length) * sizeScale;

        const perpAngle = seg.angle + Math.PI / 2;
        return {
          x: seg.x + Math.cos(perpAngle) * wave,
          y: seg.y + Math.sin(perpAngle) * wave,
          angle: seg.angle,
        };
      };

      const wavySegments = segments.map((_, idx) => getWavyCoords(idx));

      // 1. Glow backdrop line (intensifies when energy pulse is active)
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'lighter';
      const pulseMultiplier = 1.0 + energyPulseRef.current * 1.5;

      for (let i = wavySegments.length - 1; i >= 1; i--) {
        const ratio = 1 - i / wavySegments.length;
        const xVal = i / wavySegments.length;
        const width = config.bodyWidth * getProfile(xVal) * 2.8 * dpr * sizeScale;
        const alpha = ratio * 0.18 * pulseMultiplier;

        ctx.beginPath();
        ctx.moveTo(wavySegments[i].x * dpr, wavySegments[i].y * dpr);
        ctx.lineTo(wavySegments[i - 1].x * dpr, wavySegments[i - 1].y * dpr);
        ctx.strokeStyle = config.glowColor.replace(/[\d.]+\)$/, `${alpha})`);
        ctx.lineWidth = width;
        ctx.stroke();
      }
      ctx.restore();

      // 2. Overlapping Glossy Sci-Fi Scales
      for (let i = wavySegments.length - 1; i >= 1; i--) {
        const xVal = i / wavySegments.length;
        const pulse = 1 + Math.sin(time * 5 + i * 0.4) * 0.08;
        const width = config.bodyWidth * getProfile(xVal) * pulse * dpr * sizeScale;
        const seg = wavySegments[i];

        ctx.save();
        ctx.translate(seg.x * dpr, seg.y * dpr);
        ctx.rotate(seg.angle);

        // Draw overlapping scale plate
        ctx.beginPath();
        ctx.ellipse(0, 0, width * 0.72, width * 1.15, 0, 0, Math.PI * 2);
        
        ctx.fillStyle = config.color;
        ctx.fill();

        // Dark outline for physical scale separation
        ctx.strokeStyle = 'rgba(5, 8, 22, 0.7)';
        ctx.lineWidth = 1.2 * dpr;
        ctx.stroke();

        // Glossy core highlight
        ctx.beginPath();
        ctx.ellipse(width * 0.1, 0, width * 0.35, width * 0.6, 0, 0, Math.PI * 2);
        if (energyPulseRef.current > 0.05) {
          ctx.fillStyle = `rgba(255, 255, 255, ${energyPulseRef.current * 0.95})`;
        } else {
          ctx.fillStyle = config.eyeColor + '40';
        }
        ctx.fill();

        ctx.restore();
      }

      // Draw head
      const head = wavySegments[0];
      const headSize = config.headSize * dpr * sizeScale;

      // Head glow
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const headGlow = ctx.createRadialGradient(
        head.x * dpr, head.y * dpr, 0,
        head.x * dpr, head.y * dpr, headSize * 3.5
      );
      headGlow.addColorStop(0, config.glowColor.replace(/[\d.]+\)$/, '0.45)'));
      headGlow.addColorStop(1, config.glowColor.replace(/[\d.]+\)$/, '0)'));
      ctx.fillStyle = headGlow;
      ctx.fillRect(
        (head.x - headSize * 3.5) * dpr,
        (head.y - headSize * 3.5) * dpr,
        headSize * 7,
        headSize * 7
      );
      ctx.restore();

      // Alien head shape (elongated forward oval)
      ctx.save();
      ctx.translate(head.x * dpr, head.y * dpr);
      ctx.rotate(head.angle);

      // Head body
      ctx.beginPath();
      ctx.ellipse(headSize * 0.2, 0, headSize * 1.3, headSize * 0.95, 0, 0, Math.PI * 2);
      ctx.fillStyle = config.color;
      ctx.fill();

      // Outline matching body segments
      ctx.strokeStyle = 'rgba(5, 8, 22, 0.7)';
      ctx.lineWidth = 1.3 * dpr;
      ctx.stroke();

      // Head glossy highlight
      ctx.beginPath();
      ctx.ellipse(headSize * 0.4, 0, headSize * 0.45, headSize * 0.45, 0, 0, Math.PI * 2);
      if (energyPulseRef.current > 0.05) {
        ctx.fillStyle = `rgba(255, 255, 255, ${energyPulseRef.current * 0.95})`;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      }
      ctx.fill();

      // Side-by-side eyes facing forward (+X)
      const eyeX = headSize * 0.5;
      const eyeY = headSize * 0.38;
      const eyeSizeX = headSize * 0.35;
      const eyeSizeY = headSize * 0.22;

      // Organic blinking pattern: quick blink every few seconds
      const blinkCycle = time % 4;
      const isBlinking = blinkCycle > 3.8;
      const blink = isBlinking ? lerp(1, 0.1, Math.sin((blinkCycle - 3.8) * Math.PI * 10)) : 1.0;

      // Left eye
      ctx.beginPath();
      ctx.ellipse(eyeX, -eyeY, eyeSizeX, eyeSizeY * blink, 0, 0, Math.PI * 2);
      ctx.fillStyle = config.eyeColor;
      ctx.fill();

      // Right eye
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, eyeSizeX, eyeSizeY * blink, 0, 0, Math.PI * 2);
      ctx.fillStyle = config.eyeColor;
      ctx.fill();

      // Pupils (looking slightly forward/target)
      const pupilSize = eyeSizeY * 0.45 * blink;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(eyeX + eyeSizeX * 0.25, -eyeY, pupilSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeX + eyeSizeX * 0.25, eyeY, pupilSize, 0, Math.PI * 2);
      ctx.fill();

      // Tiny antennae curving forward/outward
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 1.6 * dpr;
      ctx.lineCap = 'round';

      // Left antenna
      ctx.beginPath();
      ctx.moveTo(headSize * 0.1, -headSize * 0.4);
      ctx.bezierCurveTo(
        -headSize * 0.2, -headSize * 0.8,
        headSize * 0.2, -headSize * 1.2 + Math.sin(time * 6 + snakeIdx) * 2 * dpr,
        headSize * 0.6 + Math.sin(time * 5 + snakeIdx) * 3 * dpr, -headSize * 1.3
      );
      ctx.stroke();

      // Left antenna tip
      ctx.beginPath();
      ctx.arc(
        headSize * 0.6 + Math.sin(time * 5 + snakeIdx) * 3 * dpr,
        -headSize * 1.3,
        2.2 * dpr,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = config.eyeColor;
      ctx.fill();

      // Right antenna
      ctx.beginPath();
      ctx.moveTo(headSize * 0.1, headSize * 0.4);
      ctx.bezierCurveTo(
        -headSize * 0.2, headSize * 0.8,
        headSize * 0.2, headSize * 1.2 + Math.cos(time * 6 + snakeIdx) * 2 * dpr,
        headSize * 0.6 + Math.cos(time * 5 + snakeIdx) * 3 * dpr, headSize * 1.3
      );
      ctx.stroke();

      // Right antenna tip
      ctx.beginPath();
      ctx.arc(
        headSize * 0.6 + Math.cos(time * 5 + snakeIdx) * 3 * dpr,
        headSize * 1.3,
        2.2 * dpr,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = config.eyeColor;
      ctx.fill();

      ctx.restore();

      // Tail sparkle effect
      const tail = wavySegments[wavySegments.length - 1];
      const sparkleAlpha = (Math.sin(time * 6) * 0.5 + 0.5) * 0.5;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const tailGlow = ctx.createRadialGradient(
        tail.x * dpr, tail.y * dpr, 0,
        tail.x * dpr, tail.y * dpr, 8 * dpr
      );
      tailGlow.addColorStop(0, config.glowColor.replace(/[\d.]+\)$/, `${sparkleAlpha})`));
      tailGlow.addColorStop(1, config.glowColor.replace(/[\d.]+\)$/, '0)'));
      ctx.fillStyle = tailGlow;
      ctx.beginPath();
      ctx.arc(tail.x * dpr, tail.y * dpr, 8 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    []
  );

  // Main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isInitialized.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    timeRef.current += 0.016;
    const time = timeRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    scrollRef.current = { x: scrollX, y: scrollY };

    const mouseWorld: Vec2 = {
      x: mouseRef.current.x,
      y: mouseRef.current.y,
    };

    // Detect bordered element under cursor
    const borderedEl = findBorderedElement(mouseRef.current.x, mouseRef.current.y);

    if (borderedEl) {
      // Convert to viewport-relative coords for drawing
      targetRectRef.current = {
        x: borderedEl.x - scrollX,
        y: borderedEl.y - scrollY,
        width: borderedEl.width,
        height: borderedEl.height,
      };
    } else {
      targetRectRef.current = null;
    }

    // Update and draw each snake
    SNAKE_CONFIGS.forEach((config, snakeIdx) => {
      const segments = snakesRef.current[snakeIdx];
      if (!segments || segments.length === 0) return;

      const head = segments[0];
      let targetX: number;
      let targetY: number;
      let targetAngle: number;
      let sizeScale = 1.0;

      // Decay growth factor (constantly shrinking back to minimum size if not eating)
      growthRef.current[snakeIdx] = Math.max(0, growthRef.current[snakeIdx] - 0.0018);
      const growthFactor = 1.0 + growthRef.current[snakeIdx];
      const currentScale = sizeScale * growthFactor;

      // Eating mechanics: check if head is close to any active edible spark and consume it
      const headSizeVal = config.headSize * dpr * currentScale;
      const sparks = sparksRef.current;
      for (let sIdx = sparks.length - 1; sIdx >= 0; sIdx--) {
        const spark = sparks[sIdx];
        if (!spark.edible) continue;
        const distanceToSpark = dist(head, spark);
        if (distanceToSpark < headSizeVal / dpr + spark.size + 8) {
          // Eat spark!
          sparks.splice(sIdx, 1);
          growthRef.current[snakeIdx] = Math.min(0.9, growthRef.current[snakeIdx] + 0.18);
          energyPulseRef.current = Math.min(1.0, energyPulseRef.current + 0.12);

          // Emit a splash of aesthetic eating particles (NOT edible)
          const eatSparks: Spark[] = [];
          for (let j = 0; j < 5; j++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            eatSparks.push({
              x: spark.x,
              y: spark.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: '#ffffff',
              alpha: 1.0,
              size: 0.8 + Math.random() * 1.0,
              life: 0,
              maxLife: 12 + Math.floor(Math.random() * 8),
              edible: false, // Explicitly false to prevent chain reaction loops
            });
          }
          sparksRef.current.push(...eatSparks);
        }
      }

      if (targetRectRef.current) {
        // BORDER ORBITING MODE
        const rect = targetRectRef.current;
        const padding = BORDER_DETECTION_PADDING + snakeIdx * 12;
        const perimeter = 2 * (rect.width + rect.height + padding * 4);
        const orbitSpeed = (config.speed * 50) / perimeter;

        const avgDim = (rect.width + rect.height) / 2;
        sizeScale = Math.min(1.65, Math.max(0.9, 0.8 + avgDim / 350));

        orbitTRef.current[snakeIdx] += orbitSpeed;
        if (orbitTRef.current[snakeIdx] > 1) orbitTRef.current[snakeIdx] -= 1;

        const pt = pointOnRectPerimeter(rect, orbitTRef.current[snakeIdx], padding);
        const tan = tangentOnRectPerimeter(rect, orbitTRef.current[snakeIdx], padding);

        targetX = pt.x;
        targetY = pt.y;
        targetAngle = tan;

        head.x = lerp(head.x, targetX, TRANSITION_SPEED * 2);
        head.y = lerp(head.y, targetY, TRANSITION_SPEED * 2);
        head.angle = lerpAngle(head.angle, targetAngle, TRANSITION_SPEED * 3);
      } else {
        // CURSOR FOLLOWING MODE / SPARK HUNTING MODE
        let closestSpark: Spark | null = null;
        let minD = 180; // 180px spark detection range

        sparksRef.current.forEach((spark) => {
          if (!spark.edible) return; // Only chase edible particles
          const d = dist(head, spark);
          if (d < minD) {
            minD = d;
            closestSpark = spark;
          }
        });

        const isHunting = closestSpark !== null;

        if (isHunting && closestSpark) {
          // Spark chasing target
          targetX = (closestSpark as Spark).x;
          targetY = (closestSpark as Spark).y;
        } else {
          // Standard cursor follow orbit
          const wanderX = Math.sin(time * 1.6 + snakeIdx * 2.5) * (25 + snakeIdx * 12);
          const wanderY = Math.cos(time * 1.2 + snakeIdx * 3.8) * (25 + snakeIdx * 12);

          const baseRadius = 50 + snakeIdx * 45;
          const breath = Math.sin(time * 1.4 + snakeIdx * 0.9) * 18;
          const radius = baseRadius + breath;

          const angleOffset = (snakeIdx / SNAKE_CONFIGS.length) * Math.PI * 2;
          const speedMult = 1.0 + Math.sin(time * 1.8 + snakeIdx * 1.2) * 0.2;
          const orbitSpeedVal = config.speed * 2.0 * speedMult;
          const angle = time * orbitSpeedVal + angleOffset + Math.cos(time * 1.2 + snakeIdx) * 0.45;

          targetX = mouseWorld.x + wanderX + Math.cos(angle) * radius;
          targetY = mouseWorld.y + wanderY + Math.sin(angle) * radius;
        }

        const dx = targetX - head.x;
        const dy = targetY - head.y;
        targetAngle = Math.atan2(dy, dx);

        const distance = dist(head, { x: targetX, y: targetY });
        // Sprints faster when pouncing/hunting a spark
        const followSpeed = Math.min(config.speed * (isHunting ? 2.2 : 1.3), distance * (isHunting ? 0.06 : 0.035));

        head.x += dx * followSpeed;
        head.y += dy * followSpeed;
        head.angle = lerpAngle(head.angle, targetAngle, isHunting ? 0.22 : 0.16);
      }

      // Update body segments - each follows the one in front (dynamically stretching body spacing)
      for (let i = 1; i < segments.length; i++) {
        const prev = segments[i - 1];
        const curr = segments[i];
        const dx = prev.x - curr.x;
        const dy = prev.y - curr.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const targetDist = config.segmentSpacing * currentScale;

        if (d > targetDist) {
          const ratio = targetDist / d;
          curr.x = prev.x - dx * ratio;
          curr.y = prev.y - dy * ratio;
        }

        curr.angle = Math.atan2(dy, dx);
      }

      drawSnake(ctx, segments, config, time, snakeIdx, currentScale);
    });

    // Decay click energy charge
    energyPulseRef.current = lerp(energyPulseRef.current, 0, 0.04);

    // Particle trails (small floating particles around snakes)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    SNAKE_CONFIGS.forEach((config, snakeIdx) => {
      const segments = snakesRef.current[snakeIdx];
      if (!segments) return;

      for (let i = 0; i < segments.length; i += 4) {
        const seg = segments[i];
        const particleAlpha = (1 - i / segments.length) * 0.25 * (Math.sin(time * 5 + i + snakeIdx) * 0.5 + 0.5);
        const particleX = seg.x + Math.sin(time * 3 + i) * 8;
        const particleY = seg.y + Math.cos(time * 3 + i) * 8;
        const particleSize = (1 - i / segments.length) * 1.5 + 0.5;

        ctx.beginPath();
        ctx.arc(particleX * dpr, particleY * dpr, particleSize * dpr, 0, Math.PI * 2);
        ctx.fillStyle = config.glowColor.replace(/[\d.]+\)$/, `${particleAlpha})`);
        ctx.fill();
      }

      // Spawning trailing sparks from tails dynamically (accelerates when charged)
      if (Math.random() < 0.12 + energyPulseRef.current * 0.35) {
        const tail = segments[segments.length - 1];
        const angle = tail.angle + Math.PI + (Math.random() - 0.5) * 0.8;
        const speed = 0.5 + Math.random() * 1.5;
        
        sparksRef.current.push({
          x: tail.x,
          y: tail.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: config.color,
          alpha: 1.0,
          size: 1.2 + Math.random() * 1.5,
          life: 0,
          maxLife: 25 + Math.floor(Math.random() * 20),
        });
      }
    });
    ctx.restore();

    // Update and draw active sparks array (gravity/glow physics)
    const sparks = sparksRef.current;
    if (sparks.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += 1;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.045; // Subtle gravity pull down
        s.vx *= 0.975;  // Velocity friction decay
        s.vy *= 0.975;

        const ageRatio = s.life / s.maxLife;
        s.alpha = 1 - ageRatio;

        if (s.life >= s.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        // Draw soft outer glow
        ctx.beginPath();
        ctx.arc(s.x * dpr, s.y * dpr, s.size * 2.2 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = s.color + Math.round(s.alpha * 70).toString(16).padStart(2, '0');
        ctx.fill();

        // Draw solid glowing particle core
        ctx.beginPath();
        ctx.arc(s.x * dpr, s.y * dpr, s.size * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.fill();
      }
      ctx.restore();
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [drawSnake]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up canvas size
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resize();
    window.addEventListener('resize', resize);

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Click handler to trigger bursts of gravity energy sparks
    const handleMouseClick = (e: MouseEvent) => {
      energyPulseRef.current = 1.0;
      const cx = e.clientX;
      const cy = e.clientY;
      const newSparks: Spark[] = [];

      // Spawn concentric explosive sparks around click
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.8 + Math.random() * 5.0;
        const randomConfig = SNAKE_CONFIGS[Math.floor(Math.random() * SNAKE_CONFIGS.length)];

        newSparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: randomConfig.color,
          alpha: 1.0,
          size: 1.2 + Math.random() * 2.5,
          life: 0,
          maxLife: 30 + Math.floor(Math.random() * 25),
          edible: true,
        });
      }

      sparksRef.current.push(...newSparks);
    };
    window.addEventListener('click', handleMouseClick);

    // Initialize and start animation
    initSnakes();
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initSnakes, animate]);

  return (
    <canvas
      ref={canvasRef}
      id="alien-snakes-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
}
