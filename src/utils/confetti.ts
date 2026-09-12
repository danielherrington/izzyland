import confetti from 'canvas-confetti';

export function fireVictoryConfetti(): void {
  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 70, zIndex: 9999 };

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.2 },
      colors: ['#ff70a6', '#a855f7', '#38bdf8', '#facc15', '#fb923c', '#ffffff'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.2 },
      colors: ['#ff70a6', '#a855f7', '#38bdf8', '#facc15', '#fb923c', '#ffffff'],
    });
  }, 250);
}

export function fireChocolateConfetti(originX = 0.5, originY = 0.5): void {
  confetti({
    particleCount: 25,
    spread: 60,
    origin: { x: originX, y: originY },
    colors: ['#78350f', '#b45309', '#fbbf24', '#f472b6'],
    zIndex: 9999,
  });
}

export function fireSparkleConfetti(originX = 0.5, originY = 0.5): void {
  confetti({
    particleCount: 30,
    spread: 70,
    origin: { x: originX, y: originY },
    colors: ['#ec4899', '#8b5cf6', '#06b6d4', '#fde047'],
    shapes: ['circle'],
    zIndex: 9999,
  });
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
