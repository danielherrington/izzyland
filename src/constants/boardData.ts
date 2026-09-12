import type { BoardTile, TileColor, LandmarkId, LandmarkMeta } from '../types/game';

export const TILE_COLORS: TileColor[] = [
  'pink',
  'purple',
  'blue',
  'green',
  'yellow',
  'orange',
];

export const TILE_COLOR_HEX: Record<TileColor, string> = {
  pink: '#ff66a3',    // Cotton candy pink
  purple: '#a855f7',  // Sparkle lavender
  blue: '#38bdf8',    // Miami ocean cyan
  green: '#4ade80',   // Meadow lime
  yellow: '#facc15',  // Sunshine sparkle gold
  orange: '#fb923c',  // Sunset peach
};

export const LANDMARKS: Record<LandmarkId, LandmarkMeta> = {
  miami: {
    id: 'miami',
    name: 'Miami Art Deco Boulevard',
    shortName: 'Miami',
    icon: '🌴',
    themeColor: '#06b6d4',
    tileIndex: 10,
    description: 'Neon pastel palm trees, rollerblades, ocean waves, and flamingo magic! You received a Miami Coconut Chocolate 🍫!',
    funFact: 'Izzy loves the warm Miami sunsets, retro neon lights, and rollerblading by the ocean!',
  },
  buenos_aires: {
    id: 'buenos_aires',
    name: 'Buenos Aires Tango Plaza',
    shortName: 'Buenos Aires',
    icon: '💃',
    themeColor: '#0284c7',
    tileIndex: 19,
    description: 'Tango dancers, colorful houses of La Boca, and sweet dulce de leche! You received an Argentine Alfajor Chocolate 🍫!',
    funFact: 'The birthplace of Tango, famous for colorful La Boca streets and delicious dulce de leche alfajores!',
  },
  paris: {
    id: 'paris',
    name: 'Paris Macaron Walk',
    shortName: 'Paris',
    icon: '🥐',
    themeColor: '#ec4899',
    tileIndex: 28,
    description: 'The sparkling Eiffel Tower at twilight and patisserie aromas! You received a French Chocolate Macaron 🍫!',
    funFact: 'Fresh warm croissants, café terraces, and twinkling Eiffel lights make Paris magical!',
  },
  ibiza: {
    id: 'ibiza',
    name: 'Ibiza Sunset Beach Club',
    shortName: 'Ibiza',
    icon: '🎧',
    themeColor: '#f97316',
    tileIndex: 37,
    description: 'Golden hour music beats and turquoise waves! You received an Ibiza Sunset Truffle 🍫!',
    funFact: 'The ultimate sunset dance celebration where glitter and beach beats collide!',
  },
  transylvania: {
    id: 'transylvania',
    name: 'Transylvania Spooky Castle',
    shortName: 'Transylvania',
    icon: '🧛',
    themeColor: '#9333ea',
    tileIndex: 46,
    description: 'A cute gothic vampire castle with friendly flutter bats! You received a Midnight Cocoa Crystal 🍫!',
    funFact: 'Even the spooky vampires here have a sweet tooth for chocolate and sugar crystals!',
  },
  disney: {
    id: 'disney',
    name: 'Disney Magic Kingdom',
    shortName: 'Disney',
    icon: '🏰',
    themeColor: '#3b82f6',
    tileIndex: 55,
    description: 'Fairytale castle spires, fireworks in the sky, and pixie dust! You received a Mickey Chocolate Bar 🍫!',
    funFact: 'The most magical place on earth, where dreams and sparkle wishes come true!',
  },
  finish: {
    id: 'finish',
    name: "Izzy's Sparkling Castle Gate",
    shortName: 'Victory Castle',
    icon: '👑',
    themeColor: '#eab308',
    tileIndex: 63,
    description: 'The gateway to the Grand Piñata Finale! Reach here to earn bonus chocolates and swing with the Golden Mega Bat!',
    funFact: 'Inside the castle awaits the legendary giant Unicorn Candy Piñata!',
  },
};

// 64 Tiles winding layout across 1200 x 960 SVG coordinate plane with spacious curves
function generateBoardTiles(): BoardTile[] {
  const tiles: BoardTile[] = [];
  const totalTiles = 64;

  // Generous chocolate placements: 22 chocolates across 64 tiles!
  const chocolates = new Set([
    3, 5, 9, 11, 14, 18, 21, 23, 27, 31, 34, 38, 41, 45, 48, 51, 53, 56, 58, 60, 62,
  ]);
  const berries = new Set([6, 12, 17, 24, 30, 39, 44, 50, 57]);

  const shortcuts: Record<number, { to: number; name: string; desc: string; type: 'elevator' | 'tram' | 'chute' }> = {
    // LADDERS: New York Sky Elevators (Going UP!)
    8: {
      to: 17,
      name: 'NYC Express Glass Elevator 🛗',
      desc: 'Step into the glass elevator with Moe and rocket up the skyscraper!',
      type: 'elevator',
    },
    25: {
      to: 35,
      name: 'Empire State Sky Lift 🛗',
      desc: 'Ding! The high-speed elevator shoots up to the observation deck with Moe!',
      type: 'elevator',
    },

    // CHUTES: Lisbon Tram Descents (Coasting DOWN!)
    33: {
      to: 22,
      name: 'Lisbon Tram 28 Descent 🚃',
      desc: 'Ding-ding! Hop on Lisbon Tram 28 with Moe and coast down the steep hills!',
      type: 'tram',
    },
    49: {
      to: 40,
      name: 'Lisbon Funicular Slide 🚃',
      desc: 'Wheee! Slide down the historic Lisbon tram tracks toward the ocean!',
      type: 'tram',
    },
  };

  // Helper coordinate interpolation across 6 spacious rows
  const getCoordinates = (i: number): { x: number; y: number; zone: BoardTile['zone'] } => {
    if (i <= 10) {
      // Row 0: Start -> Miami
      const t = i / 10;
      return {
        x: 120 + t * (1080 - 120),
        y: 780 - Math.sin(t * Math.PI) * 15,
        zone: i < 5 ? 'start' : 'miami',
      };
    } else if (i <= 19) {
      // Row 1: Miami -> Buenos Aires
      const t = (i - 10) / 9;
      return {
        x: 1080 - t * (1080 - 120),
        y: 670 - Math.sin(t * Math.PI) * 20,
        zone: 'buenos_aires',
      };
    } else if (i <= 28) {
      // Row 2: Buenos Aires -> Paris
      const t = (i - 19) / 9;
      return {
        x: 120 + t * (1080 - 120),
        y: 545 - Math.sin(t * Math.PI) * 20,
        zone: 'paris',
      };
    } else if (i <= 37) {
      // Row 3: Paris -> Ibiza
      const t = (i - 28) / 9;
      return {
        x: 1080 - t * (1080 - 120),
        y: 415 - Math.sin(t * Math.PI) * 20,
        zone: 'ibiza',
      };
    } else if (i <= 46) {
      // Row 4: Ibiza -> Transylvania
      const t = (i - 37) / 9;
      return {
        x: 120 + t * (1080 - 120),
        y: 285 - Math.sin(t * Math.PI) * 20,
        zone: 'transylvania',
      };
    } else if (i <= 55) {
      // Row 5: Transylvania -> Disney (Ends at Tile 55 on far left)
      const t = (i - 46) / 9;
      return {
        x: 1080 - t * (1080 - 130),
        y: 165 - Math.sin(t * Math.PI) * 15,
        zone: 'disney',
      };
    } else {
      // Row 6: Disney -> Castle Gate
      // Sweeps smoothly from Tile 55 (x: 130, y: 165) curving up to the Castle Gate at (x: 820, y: 65)
      const t = (i - 55) / 8;
      return {
        x: 130 + t * (820 - 130),
        y: 75 - Math.sin(t * Math.PI) * 15,
        zone: 'disney',
      };
    }
  };

  for (let i = 0; i < totalTiles; i++) {
    const color = TILE_COLORS[i % TILE_COLORS.length];
    const { x, y, zone } = getCoordinates(i);

    let landmark: BoardTile['landmark'] | undefined;
    if (i === LANDMARKS.miami.tileIndex) landmark = LANDMARKS.miami;
    else if (i === LANDMARKS.buenos_aires.tileIndex) landmark = LANDMARKS.buenos_aires;
    else if (i === LANDMARKS.paris.tileIndex) landmark = LANDMARKS.paris;
    else if (i === LANDMARKS.ibiza.tileIndex) landmark = LANDMARKS.ibiza;
    else if (i === LANDMARKS.transylvania.tileIndex) landmark = LANDMARKS.transylvania;
    else if (i === LANDMARKS.disney.tileIndex) landmark = LANDMARKS.disney;
    else if (i === LANDMARKS.finish.tileIndex) landmark = LANDMARKS.finish;

    let shortcut: BoardTile['shortcut'] | undefined;
    if (shortcuts[i]) {
      shortcut = {
        fromIndex: i,
        toIndex: shortcuts[i].to,
        name: shortcuts[i].name,
        description: shortcuts[i].desc,
        type: shortcuts[i].type,
      };
    }

    tiles.push({
      index: i,
      color,
      x: Math.round(x),
      y: Math.round(y),
      zone,
      landmark,
      hasChocolate: chocolates.has(i),
      hasBerry: berries.has(i),
      shortcut,
    });
  }

  return tiles;
}

export const BOARD_TILES = generateBoardTiles();
export const REQUIRED_CHOCOLATES = 5;
export const BERRY_FREEZE_COST = 2;
export const BERRY_TRADE_COST = 2; // Trade 2 berries for 1 chocolate
