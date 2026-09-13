import React, { useMemo } from 'react';
import type { BoardTile, Player } from '../types/game';
import { TILE_COLOR_HEX } from '../constants/boardData';

interface GameBoardProps {
  tiles: BoardTile[];
  players: Player[];
  activePlayerIndex: number;
  targetTileIndex: number | null;
  movingPlayerId: string | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  tiles,
  players,
  targetTileIndex,
}) => {
  const width = 1200;
  const height = 960;

  // Build the smooth SVG path connecting all tiles
  const trackPathD = useMemo(() => {
    if (tiles.length === 0) return '';
    let d = `M ${tiles[0].x} ${tiles[0].y}`;
    for (let i = 1; i < tiles.length; i++) {
      const prev = tiles[i - 1];
      const curr = tiles[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x} ${prev.y}, ${midX} ${midY}`;
    }
    const last = tiles[tiles.length - 1];
    d += ` L ${last.x} ${last.y}`;
    return d;
  }, [tiles]);

  // Player positions grouped by tile index to offset overlaps
  const playersByTile = useMemo(() => {
    const map = new Map<number, Player[]>();
    players.forEach((p) => {
      const list = map.get(p.tileIndex) || [];
      list.push(p);
      map.set(p.tileIndex, list);
    });
    return map;
  }, [players]);

  return (
    <div className="relative h-full max-h-full w-auto max-w-full aspect-[5/4] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 sm:border-4 border-pink-300 bg-gradient-to-b from-sky-100 via-pink-50 to-purple-100 select-none mx-auto flex items-center justify-center p-0.5 sm:p-1.5">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full block object-contain"
        style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.08))' }}
      >
        <defs>
          <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff70a6" />
            <stop offset="20%" stopColor="#fb923c" />
            <stop offset="40%" stopColor="#facc15" />
            <stop offset="60%" stopColor="#4ade80" />
            <stop offset="80%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          <linearGradient id="tramGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="elevatorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient id="chuteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="40%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>

          <linearGradient id="castleGateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          <filter id="tileGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.18" />
          </filter>

          <filter id="highlightGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#facc15" floodOpacity="0.85" />
          </filter>

          <filter id="labelShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* 1. Miami Art Deco Zone (Bottom-Right, Tile 10) */}
        <g opacity="0.92">
          <circle cx="1080" cy="780" r="115" fill="#cffafe" />
          <text x="1080" y="720" fontSize="52" textAnchor="middle">🌴</text>
          <text x="1145" y="770" fontSize="36" textAnchor="middle">🦩</text>
          <rect x="990" y="825" width="180" height="24" rx="12" fill="#ffffff" opacity="0.95" filter="url(#labelShadow)" />
          <text x="1080" y="842" fontSize="13" fontWeight="900" fill="#0891b2" textAnchor="middle" letterSpacing="0.5">
            MIAMI ART DECO
          </text>
        </g>

        {/* 2. Buenos Aires Tango Plaza (Row 1 Left, Tile 19) */}
        <g opacity="0.92">
          <circle cx="260" cy="670" r="120" fill="#e0f2fe" />
          <text x="225" y="625" fontSize="50" textAnchor="middle">💃</text>
          <text x="300" y="635" fontSize="34" textAnchor="middle">🪗</text>
          <rect x="155" y="715" width="210" height="24" rx="12" fill="#ffffff" opacity="0.95" filter="url(#labelShadow)" />
          <text x="260" y="732" fontSize="13" fontWeight="900" fill="#0284c7" textAnchor="middle" letterSpacing="0.5">
            BUENOS AIRES TANGO
          </text>
        </g>

        {/* 3. Paris Macaron Walk Zone (Row 2 Right, Tile 28) */}
        <g opacity="0.92">
          <circle cx="1040" cy="545" r="120" fill="#fce7f3" />
          <text x="1040" y="490" fontSize="52" textAnchor="middle">🗼</text>
          <text x="1105" y="540" fontSize="32" textAnchor="middle">🥐</text>
          <rect x="940" y="592" width="200" height="24" rx="12" fill="#ffffff" opacity="0.95" filter="url(#labelShadow)" />
          <text x="1040" y="609" fontSize="13" fontWeight="900" fill="#be185d" textAnchor="middle" letterSpacing="0.5">
            PARIS MACARON WALK
          </text>
        </g>

        {/* 4. Ibiza Sunset Beach Zone (Row 3 Left, Tile 37) */}
        <g opacity="0.92">
          <circle cx="200" cy="415" r="120" fill="#ffedd5" />
          <text x="200" y="365" fontSize="50" textAnchor="middle">🎧</text>
          <text x="140" y="400" fontSize="34" textAnchor="middle">🌅</text>
          <rect x="115" y="462" width="170" height="24" rx="12" fill="#ffffff" opacity="0.95" filter="url(#labelShadow)" />
          <text x="200" y="479" fontSize="13" fontWeight="900" fill="#c2410c" textAnchor="middle" letterSpacing="0.5">
            IBIZA SUNSET RAVE
          </text>
        </g>

        {/* 5. Transylvania Spooky Castle Zone (Row 4 Right, Tile 46) */}
        <g opacity="0.92">
          <circle cx="1020" cy="285" r="120" fill="#f3e8ff" />
          <text x="1020" y="235" fontSize="52" textAnchor="middle">🧛</text>
          <text x="1080" y="270" fontSize="32" textAnchor="middle">🦇</text>
          <rect x="920" y="335" width="200" height="24" rx="12" fill="#ffffff" opacity="0.95" filter="url(#labelShadow)" />
          <text x="1020" y="352" fontSize="13" fontWeight="900" fill="#7e22ce" textAnchor="middle" letterSpacing="0.5">
            TRANSYLVANIA CASTLE
          </text>
        </g>

        {/* 6. Disney Magic Kingdom Zone (Row 5 Left, Tile 55) - Positioned below track row 6 so it is fully uncovered! */}
        <g opacity="0.95">
          <circle cx="140" cy="180" r="105" fill="#dbeafe" />
          <text x="140" y="145" fontSize="52" textAnchor="middle">🏰</text>
          <text x="195" y="170" fontSize="30" textAnchor="middle">🎆</text>
          <rect x="50" y="215" width="180" height="24" rx="12" fill="#ffffff" opacity="0.95" filter="url(#labelShadow)" />
          <text x="140" y="232" fontSize="12" fontWeight="900" fill="#1d4ed8" textAnchor="middle" letterSpacing="0.5">
            DISNEY KINGDOM
          </text>
        </g>

        {/* 7. Grand Castle Piñata Finish Gate (Top Right at x: 820, y: 75) */}
        <g filter="url(#labelShadow)">
          {/* Grand Castle Turrets & Arch */}
          <rect x="700" y="12" width="240" height="110" rx="28" fill="url(#castleGateGrad)" stroke="#ca8a04" strokeWidth="4" />
          
          {/* Turret Details */}
          <polygon points="695,25 715,-5 735,25" fill="#ca8a04" />
          <polygon points="905,25 925,-5 945,25" fill="#ca8a04" />

          {/* Castle Header Banner */}
          <rect x="730" y="20" width="180" height="24" rx="12" fill="#ffffff" opacity="0.95" />
          <text x="820" y="37" fontSize="12.5" fontWeight="900" fill="#854d0e" textAnchor="middle" letterSpacing="0.5">
            👑 PIÑATA CASTLE GATE 🪅
          </text>

          {/* Archway Portal Background */}
          <path d="M 770 122 L 770 75 Q 820 45 870 75 L 870 122 Z" fill="#78350f" opacity="0.4" />

          {/* Castle Icons */}
          <text x="740" y="78" fontSize="28" textAnchor="middle">🏰</text>
          <text x="900" y="78" fontSize="28" textAnchor="middle">🪅</text>
        </g>

        {/* Winding Track Ribbon Background (White Border + Shadow) */}
        <path
          d={trackPathD}
          fill="none"
          stroke="#ffffff"
          strokeWidth="60"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#tileGlow)"
        />

        {/* LADDER 1: NYC Express Glass Elevator (Tile 8 -> Tile 17, Going UP) */}
        {(() => {
          const t8 = tiles[8];
          const t17 = tiles[17];
          if (!t8 || !t17) return null;
          const midX = (t8.x + t17.x) / 2;
          const midY = (t8.y + t17.y) / 2 + 50;
          return (
            <g key="ladder-elevator-1">
              {/* Elevator shaft bed */}
              <path
                d={`M ${t8.x} ${t8.y} Q ${midX} ${midY} ${t17.x} ${t17.y}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d={`M ${t8.x} ${t8.y} Q ${midX} ${midY} ${t17.x} ${t17.y}`}
                fill="none"
                stroke="url(#elevatorGrad)"
                strokeWidth="10"
                strokeDasharray="8,6"
                className="animate-pulse"
              />
              {/* Ladder Label Banner */}
              <rect x={midX - 105} y={midY + 8} width="210" height="24" rx="12" fill="#ffffff" stroke="#0284c7" strokeWidth="2" opacity="0.96" filter="url(#labelShadow)" />
              <text x={midX} y={midY + 25} fontSize="12" fontWeight="900" fill="#0369a1" textAnchor="middle">
                🛗 NYC Elevator (▲ To 17)
              </text>
            </g>
          );
        })()}

        {/* LADDER 2: Empire State Sky Lift (Tile 25 -> Tile 35, Going UP) */}
        {(() => {
          const t25 = tiles[25];
          const t35 = tiles[35];
          if (!t25 || !t35) return null;
          const midX = (t25.x + t35.x) / 2;
          const midY = (t25.y + t35.y) / 2 - 50;
          return (
            <g key="ladder-elevator-2">
              {/* Elevator shaft bed */}
              <path
                d={`M ${t25.x} ${t25.y} Q ${midX} ${midY} ${t35.x} ${t35.y}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d={`M ${t25.x} ${t25.y} Q ${midX} ${midY} ${t35.x} ${t35.y}`}
                fill="none"
                stroke="url(#elevatorGrad)"
                strokeWidth="10"
                strokeDasharray="8,6"
                className="animate-pulse"
              />
              {/* Ladder Label Banner */}
              <rect x={midX - 105} y={midY - 26} width="210" height="24" rx="12" fill="#ffffff" stroke="#0284c7" strokeWidth="2" opacity="0.96" filter="url(#labelShadow)" />
              <text x={midX} y={midY - 9} fontSize="12" fontWeight="900" fill="#0369a1" textAnchor="middle">
                🛗 NYC Sky Lift (▲ To 35)
              </text>
            </g>
          );
        })()}

        {/* CHUTE 1: Lisbon Tram 28 Descent (Tile 33 -> Tile 22, Sliding DOWN) */}
        {(() => {
          const t33 = tiles[33];
          const t22 = tiles[22];
          if (!t33 || !t22) return null;
          const midX = (t33.x + t22.x) / 2 + 55;
          const midY = (t33.y + t22.y) / 2 - 20;
          return (
            <g key="chute-tram-1">
              {/* Tram rail bed */}
              <path
                d={`M ${t33.x} ${t33.y} Q ${midX} ${midY} ${t22.x} ${t22.y}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* Tram track surface */}
              <path
                d={`M ${t33.x} ${t33.y} Q ${midX} ${midY} ${t22.x} ${t22.y}`}
                fill="none"
                stroke="url(#tramGrad)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d={`M ${t33.x} ${t33.y} Q ${midX} ${midY} ${t22.x} ${t22.y}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                opacity="0.8"
                strokeDasharray="8,6"
              />
              {/* Chute Label Banner */}
              <rect x={midX - 25} y={midY - 12} width="190" height="24" rx="12" fill="#ffffff" stroke="#eab308" strokeWidth="2" opacity="0.96" filter="url(#labelShadow)" />
              <text x={midX + 70} y={midY + 5} fontSize="12" fontWeight="900" fill="#b45309" textAnchor="middle">
                🚃 Lisbon Tram (▼ To 22)
              </text>
            </g>
          );
        })()}

        {/* CHUTE 2: Lisbon Funicular Slide (Tile 49 -> Tile 40, Sliding DOWN) */}
        {(() => {
          const t49 = tiles[49];
          const t40 = tiles[40];
          if (!t49 || !t40) return null;
          const midX = (t49.x + t40.x) / 2 + 55;
          const midY = (t49.y + t40.y) / 2 - 20;
          return (
            <g key="chute-tram-2">
              {/* Tram rail bed */}
              <path
                d={`M ${t49.x} ${t49.y} Q ${midX} ${midY} ${t40.x} ${t40.y}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* Tram track surface */}
              <path
                d={`M ${t49.x} ${t49.y} Q ${midX} ${midY} ${t40.x} ${t40.y}`}
                fill="none"
                stroke="url(#tramGrad)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d={`M ${t49.x} ${t49.y} Q ${midX} ${midY} ${t40.x} ${t40.y}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                opacity="0.8"
                strokeDasharray="8,6"
              />
              {/* Chute Label Banner */}
              <rect x={midX - 30} y={midY - 12} width="200" height="24" rx="12" fill="#ffffff" stroke="#eab308" strokeWidth="2" opacity="0.96" filter="url(#labelShadow)" />
              <text x={midX + 70} y={midY + 5} fontSize="12" fontWeight="900" fill="#b45309" textAnchor="middle">
                🚃 Lisbon Tram (▼ To 40)
              </text>
            </g>
          );
        })()}

        {/* Individual Tiles on the Track */}
        {tiles.map((tile) => {
          const isTarget = targetTileIndex === tile.index;
          const isStart = tile.index === 0;
          const isFinish = tile.index === tiles.length - 1;
          const tileHex = TILE_COLOR_HEX[tile.color];
          const isLandmark = Boolean(tile.landmark);
          const radius = isStart || isFinish || isLandmark ? 28 : 22;

          return (
            <g key={tile.index} className="transition-transform duration-200">
              {/* Target Highlight Glow */}
              {isTarget && (
                <circle
                  cx={tile.x}
                  cy={tile.y}
                  r={radius + 12}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="7"
                  filter="url(#highlightGlow)"
                  className="animate-ping"
                />
              )}

              {/* Tile Base Circle */}
              <circle
                cx={tile.x}
                cy={tile.y}
                r={radius}
                fill={tileHex}
                stroke="#ffffff"
                strokeWidth={isTarget ? 4.5 : 3}
                filter="url(#tileGlow)"
              />

              {/* Tile Glossy Highlight */}
              <circle
                cx={tile.x - 5}
                cy={tile.y - 5}
                r={radius * 0.6}
                fill="#ffffff"
                opacity="0.3"
              />

              {/* Landmark / Start / Finish Icons */}
              {isStart ? (
                <text x={tile.x} y={tile.y + 7} fontSize="20" textAnchor="middle">
                  🚀
                </text>
              ) : isFinish ? (
                <text x={tile.x} y={tile.y + 8} fontSize="22" textAnchor="middle">
                  🪅
                </text>
              ) : tile.landmark ? (
                <text x={tile.x} y={tile.y + 8} fontSize="20" textAnchor="middle">
                  {tile.landmark.icon}
                </text>
              ) : (
                <text
                  x={tile.x}
                  y={tile.y + 4.5}
                  fontSize="12"
                  fontWeight="900"
                  fill="#ffffff"
                  textAnchor="middle"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {tile.index}
                </text>
              )}

              {/* Collectible: Chocolate (🍫) */}
              {tile.hasChocolate && !isFinish && (
                <g transform={`translate(${tile.x + 15}, ${tile.y - 18})`}>
                  <circle cx="0" cy="0" r="13" fill="#78350f" stroke="#ffffff" strokeWidth="2.5" />
                  <text x="0" y="5" fontSize="15" textAnchor="middle">
                    🍫
                  </text>
                </g>
              )}

              {/* Collectible: Berry (🍓) */}
              {tile.hasBerry && !tile.hasChocolate && (
                <g transform={`translate(${tile.x - 16}, ${tile.y - 17})`}>
                  <circle cx="0" cy="0" r="12" fill="#f43f5e" stroke="#ffffff" strokeWidth="2.5" />
                  <text x="0" y="4.5" fontSize="14" textAnchor="middle">
                    🍓
                  </text>
                </g>
              )}

              {/* Shortcut Tile Badge: 🛗 for NYC Elevator Ladders (Up), 🚃 for Lisbon Tram Chutes (Down) */}
              {tile.shortcut && (
                <g transform={`translate(${tile.x - 17}, ${tile.y + 14})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r="12"
                    fill={tile.shortcut.toIndex > tile.shortcut.fromIndex ? '#e0f2fe' : '#fef08a'}
                    stroke={tile.shortcut.toIndex > tile.shortcut.fromIndex ? '#0284c7' : '#ca8a04'}
                    strokeWidth="2"
                  />
                  <text x="0" y="4.5" fontSize="12" textAnchor="middle">
                    {tile.shortcut.toIndex > tile.shortcut.fromIndex ? '🛗' : '🚃'}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Player Pawns */}
        {Array.from(playersByTile.entries()).map(([tileIdx, tilePlayers]) => {
          const tile = tiles[tileIdx] || tiles[0];
          const count = tilePlayers.length;

          return tilePlayers.map((player, pIdx) => {
            let offsetX = 0;
            let offsetY = 0;
            if (count > 1) {
              const angle = (pIdx / count) * 2 * Math.PI;
              const radius = 26;
              offsetX = Math.cos(angle) * radius;
              offsetY = Math.sin(angle) * radius;
            }

            const posX = tile.x + offsetX;
            const posY = tile.y + offsetY - 18;

            return (
              <g
                key={player.id}
                className="transition-all duration-300 transform"
                style={{
                  filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.35))',
                }}
              >
                {/* Pawn Halo */}
                <circle
                  cx={posX}
                  cy={posY}
                  r="24"
                  fill={player.avatarColor}
                  stroke="#ffffff"
                  strokeWidth="4"
                />

                {/* Pawn Emoji / Icon */}
                <text
                  x={posX}
                  y={posY + 8}
                  fontSize="24"
                  textAnchor="middle"
                  className="select-none pointer-events-none"
                >
                  {player.avatar}
                </text>

                {/* Name Banner tag below pawn */}
                <rect
                  x={posX - 32}
                  y={posY + 19}
                  width="64"
                  height="16"
                  rx="8"
                  fill="#ffffff"
                  stroke={player.avatarColor}
                  strokeWidth="2"
                  opacity="0.98"
                />
                <text
                  x={posX}
                  y={posY + 31}
                  fontSize="9.5"
                  fontWeight="900"
                  fill="#111827"
                  textAnchor="middle"
                >
                  {player.name.slice(0, 8)}
                </text>
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
};
