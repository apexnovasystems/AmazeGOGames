import React, {memo, useEffect, useRef, useState} from 'react';
import {StyleSheet, useWindowDimensions} from 'react-native';
import {Canvas, Group, Rect} from '@shopify/react-native-skia';
import {Particle, spawnBurst, updateParticles, particleOpacity} from '../../engine/ParticleEngine';

export interface ConfettiOverlayProps {
  /** Flip to a new truthy value (e.g. increment a counter) to fire a fresh burst. */
  trigger: number;
  colors: string[];
}

/**
 * Full-screen, non-interactive confetti burst used for level-complete
 * celebrations. Pure JS-state + rAF loop — simple and plenty smooth for
 * a ~1.5s burst of a few dozen pieces.
 */
export const ConfettiOverlay = memo(function ConfettiOverlay({trigger, colors}: ConfettiOverlayProps) {
  const {width, height} = useWindowDimensions();
  const [particles, setParticles] = useState<Particle[]>([]);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (trigger <= 0) {
      return;
    }
    setParticles(
      spawnBurst({
        originX: width / 2,
        originY: height * 0.25,
        count: 60,
        colors,
        pattern: 'fountain',
        minSpeed: 220,
        maxSpeed: 480,
        minSize: 5,
        maxSize: 11,
        lifeMs: 1500,
      }),
    );
    lastTimeRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  useEffect(() => {
    if (particles.length === 0) {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      return;
    }

    const tick = () => {
      const now = Date.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      setParticles(prev => updateParticles(prev, delta));
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [particles.length]);

  if (particles.length === 0) {
    return null;
  }

  return (
    <Canvas style={[StyleSheet.absoluteFill, styles.canvas]} pointerEvents="none">
      {particles.map(p => (
        <Group key={p.id} transform={[{translateX: p.x}, {translateY: p.y}, {rotate: (p.rotation * Math.PI) / 180}]}>
          <Rect
            x={-p.size / 2}
            y={-p.size / 2}
            width={p.size}
            height={p.size * 0.6}
            color={p.color}
            opacity={particleOpacity(p)}
          />
        </Group>
      ))}
    </Canvas>
  );
});

const styles = StyleSheet.create({
  canvas: {
    zIndex: 50,
  },
});
