export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vr: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface BurstOptions {
  originX: number;
  originY: number;
  count: number;
  colors: string[];
  /** 'radial' scatters in all directions (paint splash); 'fountain' launches upward and falls (confetti). */
  pattern?: 'radial' | 'fountain';
  minSpeed?: number;
  maxSpeed?: number;
  minSize?: number;
  maxSize?: number;
  lifeMs?: number;
}

let nextId = 0;

/** Pure particle spawner — no timers, no state, just math. */
export function spawnBurst(options: BurstOptions): Particle[] {
  const {
    originX,
    originY,
    count,
    colors,
    pattern = 'radial',
    minSpeed = 80,
    maxSpeed = 220,
    minSize = 4,
    maxSize = 9,
    lifeMs = 700,
  } = options;

  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    let angle: number;
    let vy: number;
    if (pattern === 'fountain') {
      angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 0.9);
      vy = Math.sin(angle) * speed;
    } else {
      angle = Math.random() * Math.PI * 2;
      vy = Math.sin(angle) * speed;
    }
    particles.push({
      id: nextId++,
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy,
      size: minSize + Math.random() * (maxSize - minSize),
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: lifeMs,
      maxLife: lifeMs,
    });
  }
  return particles;
}

/** Pure physics step. Returns a new array with dead particles removed. */
export function updateParticles(particles: Particle[], deltaMs: number, gravity = 420): Particle[] {
  const dt = deltaMs / 1000;
  const next: Particle[] = [];
  for (const p of particles) {
    const life = p.life - deltaMs;
    if (life <= 0) {
      continue;
    }
    next.push({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vy: p.vy + gravity * dt,
      rotation: p.rotation + p.vr * dt,
      life,
    });
  }
  return next;
}

export function particleOpacity(p: Particle): number {
  return Math.max(0, Math.min(1, p.life / p.maxLife));
}
