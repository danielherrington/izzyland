import React from 'react';
import type { Player } from '../types/game';
import { REQUIRED_CHOCOLATES, BERRY_FREEZE_COST } from '../constants/boardData';
import { Volume2, VolumeX, RotateCcw, Snowflake } from 'lucide-react';
import { playFreeze } from '../utils/sound';

interface PlayerPanelProps {
  players: Player[];
  activePlayerIndex: number;
  soundOn: boolean;
  onToggleSound: () => void;
  onResetGame: () => void;
  onCastFreeze: (targetPlayerId: string) => void;
  canCastFreeze: boolean;
  onTradeBerries?: () => void;
  canTradeBerries?: boolean;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  players,
  activePlayerIndex,
  soundOn,
  onToggleSound,
  onResetGame,
  onCastFreeze,
  canCastFreeze,
  onTradeBerries,
  canTradeBerries,
}) => {

  const handleFreezeTarget = (targetId: string) => {
    playFreeze();
    onCastFreeze(targetId);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Header & Settings */}
      <div className="flex items-center justify-between bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-pink-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏰</span>
          <span className="font-extrabold text-gray-800 text-sm">Izzyland Race</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 transition border border-pink-200 cursor-pointer"
            title={soundOn ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>
          <button
            type="button"
            onClick={onResetGame}
            className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition border border-purple-200 cursor-pointer"
            title="Start New Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Players List - Grid on tablet portrait (sm), single column on desktop/sidebar (lg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
        {players.map((player, idx) => {
          const isActive = idx === activePlayerIndex;
          const hasEnoughChocolates = player.chocolates >= REQUIRED_CHOCOLATES;

          return (
            <div
              key={player.id}
              className={`p-3 rounded-2xl border-3 transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-pink-100/95 via-purple-50/95 to-sky-100/95 border-pink-400 shadow-lg scale-[1.02] ring-2 ring-pink-300/60'
                  : 'bg-white/80 backdrop-blur-sm border-gray-200/80 shadow-sm opacity-90'
              } ${player.skipNextTurn ? 'border-sky-300 bg-sky-50/80' : ''}`}
            >
              {/* Frozen Badge */}
              {player.skipNextTurn && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-sky-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  <Snowflake className="w-3 h-3" /> FROZEN (SKIPS TURN)
                </div>
              )}

              {/* Active Indicator */}
              {isActive && !player.skipNextTurn && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                  TURN NOW ✨
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border-2 border-white flex-shrink-0"
                  style={{ backgroundColor: player.avatarColor + '33' }}
                >
                  {player.avatar}
                </div>

                {/* Player Name & Tile */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-gray-900 text-sm truncate">
                      {player.name}
                    </h4>
                    {player.isBot && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded border border-purple-200">
                        BOT
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-bold text-gray-500">
                    Tile {player.tileIndex} / 63
                  </div>
                </div>
              </div>

              {/* Inventory: Chocolates & Berries */}
              <div className="mt-2.5 pt-2 border-t border-pink-100/80 flex items-center justify-between text-xs">
                {/* Chocolates Box */}
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
                    Chocolates ({player.chocolates}/{REQUIRED_CHOCOLATES}):
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: REQUIRED_CHOCOLATES }).map((_, cIdx) => (
                      <span
                        key={cIdx}
                        className={`inline-block text-sm transition-transform ${
                          cIdx < player.chocolates ? 'scale-110 drop-shadow-sm' : 'opacity-30 grayscale'
                        }`}
                        title={cIdx < player.chocolates ? 'Collected Chocolate!' : 'Needed for Castle gate'}
                      >
                        🍫
                      </span>
                    ))}
                    {hasEnoughChocolates && (
                      <span className="text-[10px] font-black text-emerald-600 ml-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        UNLOCKED! 🔑
                      </span>
                    )}
                  </div>
                </div>

                {/* Berries Balance */}
                <div className="text-right">
                  <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wider block mb-0.5">
                    Sparkle Berries:
                  </span>
                  <div className="flex items-center justify-end gap-1 font-extrabold text-pink-600">
                    <span>🍓 x{player.berries}</span>
                  </div>
                </div>
              </div>

              {/* Actions for Active Human Player: Freeze Attack & Trade Berries */}
              {isActive && !player.isBot && (canCastFreeze || (canTradeBerries && player.chocolates < REQUIRED_CHOCOLATES)) && (
                <div className="mt-2.5 pt-2 border-t border-purple-200 flex flex-col gap-2">
                  {/* Freeze Opponent */}
                  {canCastFreeze && (
                    <div>
                      <span className="text-[11px] font-black text-purple-800 flex items-center gap-1 mb-1.5">
                        <Snowflake className="w-3.5 h-3.5 text-sky-500" /> Cast Sparkle Freeze (Costs {BERRY_FREEZE_COST} 🍓):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {players
                          .filter((p) => p.id !== player.id && !p.skipNextTurn)
                          .map((target) => (
                            <button
                              key={target.id}
                              type="button"
                              onClick={() => handleFreezeTarget(target.id)}
                              className="px-2.5 py-1 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition active:scale-95 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{target.avatar}</span> Freeze {target.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Trade Berries for Chocolate */}
                  {canTradeBerries && player.chocolates < REQUIRED_CHOCOLATES && onTradeBerries && (
                    <div>
                      <button
                        type="button"
                        onClick={onTradeBerries}
                        className="w-full py-1.5 px-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-500 hover:via-yellow-500 hover:to-orange-500 text-amber-950 font-black text-xs rounded-xl shadow-sm hover:shadow transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-amber-300"
                      >
                        <span>🍬</span> Trade 2 Berries (🍓🍓) for 1 Chocolate (🍫)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
