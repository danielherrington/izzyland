export type TileColor = 'pink' | 'purple' | 'blue' | 'green' | 'yellow' | 'orange';

export type LandmarkId =
  | 'miami'
  | 'buenos_aires'
  | 'paris'
  | 'ibiza'
  | 'transylvania'
  | 'disney'
  | 'finish';

export interface Shortcut {
  fromIndex: number;
  toIndex: number;
  name: string;
  description: string;
  type?: 'elevator' | 'tram' | 'chute';
}

export interface LandmarkMeta {
  id: LandmarkId;
  name: string;
  shortName: string;
  icon: string;
  themeColor: string;
  tileIndex: number;
  description: string;
  funFact: string;
}

export interface BoardTile {
  index: number;
  color: TileColor;
  landmark?: LandmarkMeta;
  hasChocolate?: boolean;
  hasBerry?: boolean;
  shortcut?: Shortcut;
  x: number;
  y: number;
  zone: 'start' | 'miami' | 'buenos_aires' | 'paris' | 'ibiza' | 'transylvania' | 'disney';
}

export type CardType = 'single' | 'double' | 'landmark' | 'power' | 'dinosaur';
export type PowerType = 'taylor' | 'moe';

export interface GameCard {
  id: string;
  type: CardType;
  color?: TileColor;
  landmarkId?: LandmarkId;
  powerType?: PowerType;
  name: string;
  subtitle: string;
  icon: string;
  badgeBg: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  tileIndex: number;
  chocolates: number;
  berries: number;
  isBot: boolean;
  skipNextTurn: boolean;
  hasWon: boolean;
  arrivedAtCastleOrder: number | null; // 1 for first to arrive, 2 for second, etc.
  pinataSwings: number;
  pinataCandy: number;
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  playerId: string;
  playerName: string;
  message: string;
  type: 'move' | 'chocolate' | 'berry' | 'freeze' | 'shortcut' | 'landmark' | 'power' | 'win' | 'dinosaur';
}
