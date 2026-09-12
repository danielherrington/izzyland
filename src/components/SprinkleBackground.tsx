import React, { useMemo } from 'react';

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  color: string;
  rotation: number;
  duration: number;
  delay: number;
  shape: 'sprinkle' | 'star' | 'circle';
}

export const SprinkleBackground: React.FC = () => {
  const particles = useMemo(() => {
    const colors = ['#ff70a6', '#a855f7', '#38bdf8', '#4ade80', '#facc15', '#fb923c', '#ffffff'];
    const items: Particle[] = [];

    for (let i = 0; i < 45; i++) {
      const shapeRand = Math.random();
      const shape: Particle['shape'] = shapeRand > 0.6 ? 'sprinkle' : shapeRand > 0.3 ? 'star' : 'circle';
      items.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: shape === 'sprinkle' ? Math.random() * 6 + 6 : Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 5,
        shape,
      });
    }
    return items;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => {
        if (p.shape === 'sprinkle') {
          return (
            <div
              key={p.id}
              className="absolute opacity-60 animate-float"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size * 2}px`,
                height: `${p.size * 0.7}px`,
                backgroundColor: p.color,
                borderRadius: '999px',
                transform: `rotate(${p.rotation}deg)`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                boxShadow: `0 0 6px ${p.color}`,
              }}
            />
          );
        }

        if (p.shape === 'star') {
          return (
            <div
              key={p.id}
              className="absolute text-sm opacity-50 animate-twinkle"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                fontSize: `${p.size + 4}px`,
                color: p.color,
                animationDuration: `${p.duration / 2}s`,
                animationDelay: `${p.delay}s`,
              }}
            >
              ✨
            </div>
          );
        }

        return (
          <div
            key={p.id}
            className="absolute rounded-full opacity-40 animate-pulse"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              animationDuration: `${p.duration / 3}s`,
              animationDelay: `${p.delay}s`,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        );
      })}
    </div>
  );
};
