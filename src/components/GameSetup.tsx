import React, { useState } from 'react';
import type { Player } from '../types/game';
import { Sparkles, Play, Users, Bot, Heart } from 'lucide-react';
import { playHop, playCardFlip } from '../utils/sound';

export const AVATAR_OPTIONS = [
  { id: 'moe', emoji: '🐶', name: 'Moe the Wiener Dog', color: '#84cc16' },
  { id: 'unicorn', emoji: '🦄', name: 'Sparkle Unicorn', color: '#c084fc' },
  { id: 'taylor', emoji: '🪩', name: 'Swiftie Disco Ball', color: '#f43f5e' },
  { id: 'paris', emoji: '🥐', name: 'Paris Croissant', color: '#fb923c' },
  { id: 'miami', emoji: '🌴', name: 'Miami Rollerblade', color: '#06b6d4' },
  { id: 'heart', emoji: '💖', name: 'Bejeweled Sparkle', color: '#ec4899' },
  { id: 'car', emoji: '🚗', name: 'Red Cruiser Car', color: '#ef4444' },
];

interface GameSetupProps {
  onStartGame: (players: Player[]) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [playerConfigs, setPlayerConfigs] = useState<
    Array<{
      name: string;
      avatarIndex: number;
      isBot: boolean;
    }>
  >([
    { name: 'Izzy 💖', avatarIndex: 1, isBot: false },
    { name: 'Moe 🐶', avatarIndex: 0, isBot: true },
    { name: 'Swiftie 🪩', avatarIndex: 2, isBot: true },
    { name: 'Parisian 🥐', avatarIndex: 3, isBot: true },
  ]);

  const handleCountChange = (count: number) => {
    playHop();
    setPlayerCount(count);
  };

  const handleNameChange = (index: number, name: string) => {
    const updated = [...playerConfigs];
    updated[index].name = name;
    setPlayerConfigs(updated);
  };

  const handleBotToggle = (index: number) => {
    playCardFlip();
    const updated = [...playerConfigs];
    updated[index].isBot = !updated[index].isBot;
    setPlayerConfigs(updated);
  };

  const cycleAvatar = (index: number) => {
    playHop();
    const updated = [...playerConfigs];
    updated[index].avatarIndex = (updated[index].avatarIndex + 1) % AVATAR_OPTIONS.length;
    setPlayerConfigs(updated);
  };

  const handleStart = () => {
    playHop();
    const activePlayers: Player[] = playerConfigs.slice(0, playerCount).map((cfg, idx) => {
      const avatarObj = AVATAR_OPTIONS[cfg.avatarIndex];
      return {
        id: `player-${idx + 1}`,
        name: cfg.name.trim() || `Player ${idx + 1}`,
        avatar: avatarObj.emoji,
        avatarColor: avatarObj.color,
        tileIndex: 0,
        chocolates: 0,
        berries: 0,
        isBot: cfg.isBot,
        skipNextTurn: false,
        hasWon: false,
        arrivedAtCastleOrder: null,
        pinataSwings: 0,
        pinataCandy: 0,
      };
    });
    onStartGame(activePlayers);
  };

  return (
    <div className="relative z-10 max-w-2xl w-full mx-auto my-auto p-4 sm:p-6 bg-white/92 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-pink-300 flex flex-col gap-3.5 sm:gap-4 transition-all">
      {/* Header Section */}
      <div className="text-center flex flex-col items-center">
        <div className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-extrabold px-4 py-1 rounded-full text-[11px] sm:text-xs uppercase tracking-wider shadow-sm mb-1.5 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Candyland Adventure <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-sky-500 drop-shadow-sm leading-tight">
          ✨ IZZYLAND ✨
        </h1>

        <p className="text-gray-600 font-medium text-xs sm:text-sm max-w-lg mt-0.5">
          Race through <strong>Paris, Ibiza, Miami, Buenos Aires, Disney & Transylvania</strong>! Collect <strong>5 Chocolates 🍫</strong>, ride <strong>NYC Elevators 🛗</strong>, dodge <strong>Lisbon Trams 🚃</strong>, and smash the <strong>Candy Piñata 🪅</strong>!
        </p>

        {/* Compact Landmark Pills */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-2 text-[10px] sm:text-[11px] font-bold text-gray-600">
          <span className="bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded-full border border-cyan-200">🌴 Miami</span>
          <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">💃 Buenos Aires</span>
          <span className="bg-pink-50 text-pink-800 px-2 py-0.5 rounded-full border border-pink-200">🥐 Paris</span>
          <span className="bg-orange-50 text-orange-800 px-2 py-0.5 rounded-full border border-orange-200">🎧 Ibiza</span>
          <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">🧛 Transylvania</span>
          <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">🏰 Disney</span>
          <span className="bg-fuchsia-50 text-fuchsia-800 px-2 py-0.5 rounded-full border border-fuchsia-200">🪅 Piñata Finale</span>
        </div>
      </div>

      {/* Player Count Bar & Music Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-pink-50/80 px-3 py-2 rounded-2xl border-2 border-pink-200">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-purple-900">
          <Users className="w-4 h-4 text-purple-500" /> How many players?
        </div>
        <div className="inline-flex bg-white/80 p-1 rounded-xl border border-pink-200 gap-1.5">
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => handleCountChange(count)}
              className={`px-3.5 py-1 rounded-lg font-black text-xs sm:text-sm transition-all cursor-pointer ${
                playerCount === count
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm scale-105'
                  : 'text-gray-600 hover:bg-pink-100'
              }`}
            >
              {count} Players
            </button>
          ))}
        </div>
      </div>

      {/* Players List / Grid */}
      <div className={`grid gap-2.5 ${playerCount > 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {playerConfigs.slice(0, playerCount).map((cfg, idx) => {
          const avatar = AVATAR_OPTIONS[cfg.avatarIndex];
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2 sm:p-2.5 bg-gradient-to-r from-pink-50/80 to-purple-50/80 rounded-2xl border-2 border-pink-200/90 shadow-sm transition hover:border-pink-300"
            >
              {/* Avatar Button */}
              <button
                type="button"
                onClick={() => cycleAvatar(idx)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shadow-inner border-2 border-white hover:scale-105 transition active:scale-95 flex-shrink-0 cursor-pointer"
                style={{ backgroundColor: avatar.color + '33' }}
                title="Tap to change token avatar"
              >
                {avatar.emoji}
              </button>

              {/* Name Input */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 block truncate">
                  Player {idx + 1} ({avatar.name})
                </span>
                <input
                  type="text"
                  value={cfg.name}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                  className="w-full bg-white/95 px-2.5 py-1 rounded-lg font-bold text-gray-800 border border-purple-200 focus:border-purple-500 focus:outline-none text-xs sm:text-sm"
                  placeholder={`Player ${idx + 1}`}
                  maxLength={16}
                />
              </div>

              {/* Bot / Human Toggle */}
              <button
                type="button"
                onClick={() => handleBotToggle(idx)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all border cursor-pointer flex-shrink-0 ${
                  cfg.isBot
                    ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                }`}
                title="Toggle AI Bot / Human"
              >
                {cfg.isBot ? (
                  <>
                    <Bot className="w-3.5 h-3.5" /> Bot
                  </>
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 text-pink-600" /> Human
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Start Game Button */}
      <button
        type="button"
        onClick={handleStart}
        className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-black text-lg sm:text-xl rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2.5 border-2 border-white/60 cursor-pointer mt-1"
      >
        <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> Let's Play Izzyland! ✨
      </button>
    </div>
  );
};
