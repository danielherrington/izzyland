import type { GameCard, TileColor, LandmarkId } from '../types/game';
import { TILE_COLORS } from './boardData';

export function createFreshDeck(): GameCard[] {
  const cards: GameCard[] = [];
  let idCounter = 1;

  // 1. Single Color Cards (3 of each color = 18 cards)
  TILE_COLORS.forEach((color) => {
    for (let i = 0; i < 3; i++) {
      cards.push({
        id: `card-single-${color}-${idCounter++}`,
        type: 'single',
        color,
        name: `${capitalize(color)} Sparkle`,
        subtitle: 'Hop to the next matching tile',
        icon: getColorEmoji(color),
        badgeBg: color,
      });
    }
  });

  // 2. Double Color Cards (2 of each color = 12 cards)
  TILE_COLORS.forEach((color) => {
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: `card-double-${color}-${idCounter++}`,
        type: 'double',
        color,
        name: `Double ${capitalize(color)}!`,
        subtitle: 'Leap forward 2 matching tiles!',
        icon: `${getColorEmoji(color)} ${getColorEmoji(color)}`,
        badgeBg: color,
      });
    }
  });

  // 3. Moe Moe Zoomies Landmark Destination Cards (6 locations: Miami, Buenos Aires, Paris, Ibiza, Transylvania, Disney)
  const landmarkCards: Array<{
    id: LandmarkId;
    name: string;
    subtitle: string;
    icon: string;
    badgeBg: string;
  }> = [
    {
      id: 'miami',
      name: '🐶 Moe Moe Zoomies: Miami! 🌴',
      subtitle: 'Zoom with Moe straight to Miami Boulevard! 🐾',
      icon: '🌴',
      badgeBg: 'cyan',
    },
    {
      id: 'buenos_aires',
      name: '🐶 Moe Moe Zoomies: Buenos Aires! 💃',
      subtitle: 'Zoom with Moe straight to Buenos Aires Plaza! 🐾',
      icon: '💃',
      badgeBg: 'sky',
    },
    {
      id: 'paris',
      name: '🐶 Moe Moe Zoomies: Paris! 🥐',
      subtitle: 'Zoom with Moe straight to the Eiffel Tower! 🐾',
      icon: '🥐',
      badgeBg: 'pink',
    },
    {
      id: 'ibiza',
      name: '🐶 Moe Moe Zoomies: Ibiza! 🎧',
      subtitle: 'Zoom with Moe straight to Ibiza Beach Club! 🐾',
      icon: '🎧',
      badgeBg: 'orange',
    },
    {
      id: 'transylvania',
      name: '🐶 Moe Moe Zoomies: Transylvania! 🧛',
      subtitle: 'Zoom with Moe straight to the Spooky Castle! 🐾',
      icon: '🧛',
      badgeBg: 'purple',
    },
    {
      id: 'disney',
      name: '🐶 Moe Moe Zoomies: Disney Kingdom! 🏰',
      subtitle: 'Zoom with Moe straight to the Magic Kingdom! 🐾',
      icon: '🏰',
      badgeBg: 'blue',
    },
  ];

  landmarkCards.forEach((lm) => {
    cards.push({
      id: `card-landmark-${lm.id}-${idCounter++}`,
      type: 'landmark',
      landmarkId: lm.id,
      name: lm.name,
      subtitle: lm.subtitle,
      icon: lm.icon,
      badgeBg: lm.badgeBg,
    });
  });

  // 4. Taylor Swift POWER-UP CARDS (2 cards in deck)
  // Taylor Swift: +4 tiles leap forward, +2 sparkle berries, shakes off any freeze
  for (let i = 0; i < 2; i++) {
    cards.push({
      id: `card-power-taylor-${idCounter++}`,
      type: 'power',
      powerType: 'taylor',
      name: '🎸 Taylor Swift Bejeweled Boost!',
      subtitle: '+4 Tiles Leap Forward + 2 Bonus Berries! ✨',
      icon: '🪩',
      badgeBg: 'pink',
    });
  }

  // 5. Back-to-Start Dinosaur Cards (2 cards in deck)
  // When drawn, plays the dinosaur video with roar sound and sends the player back to Start!
  for (let i = 0; i < 2; i++) {
    cards.push({
      id: `card-dinosaur-${idCounter++}`,
      type: 'dinosaur',
      name: '🦖 Back-to-Start Dinosaur!',
      subtitle: 'ROAR! Chased all the way back to Start! 🦖💨',
      icon: '🦖',
      badgeBg: 'red',
    });
  }

  return shuffleDeck(cards);
}

export function shuffleDeck(deck: GameCard[]): GameCard[] {
  const array = [...deck];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getColorEmoji(color: TileColor): string {
  switch (color) {
    case 'pink':
      return '💖';
    case 'purple':
      return '🔮';
    case 'blue':
      return '💎';
    case 'green':
      return '🍏';
    case 'yellow':
      return '⭐';
    case 'orange':
      return '🍊';
  }
}
