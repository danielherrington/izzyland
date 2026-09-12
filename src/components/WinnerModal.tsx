import React from 'react';
import type { Player } from '../types/game';
import { Sparkles, Trophy, RotateCcw, Award } from 'lucide-react';

interface WinnerModalProps {
  winner: Player;
  allPlayers: Player[];
  onPlayAgain: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  allPlayers,
  onPlayAgain,
}) => {
  // Sort by pinata candy descending
  const ranked = [...allPlayers].sort((a, b) => b.pinataCandy - a.pinataCandy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-gradient-to-b from-white via-pink-50 to-purple-50 rounded-3xl p-5 sm:p-8 shadow-2xl border-4 border-yellow-300 text-center transform animate-scale-up my-auto">
        {/* Crown & Avatar */}
        <div className="relative w-24 h-24 mx-auto mb-3">
          <div
            className="w-full h-full rounded-3xl flex items-center justify-center text-5xl shadow-2xl border-4 border-white"
            style={{ backgroundColor: winner.avatarColor + '44' }}
          >
            {winner.avatar}
          </div>
          <span className="absolute -top-3 -right-2 text-3xl animate-bounce">👑</span>
          <span className="absolute -bottom-2 -left-2 text-2xl animate-pulse">✨</span>
        </div>

        {/* Victory Header */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-yellow-400 text-yellow-950 shadow-md mb-2">
          <Trophy className="w-4 h-4" /> Grand Piñata Champion! <Trophy className="w-4 h-4" />
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 drop-shadow-sm mb-1">
          {winner.name} WINS!
        </h1>

        <p className="text-gray-600 font-bold text-sm md:text-base mb-5">
          Cracked open the giant Unicorn Piñata with <strong>{winner.pinataCandy} Candy Points</strong>! 🪅🍬
        </p>

        {/* Leaderboard Podium */}
        <div className="bg-white/90 rounded-2xl p-4 border-2 border-pink-200 shadow-sm mb-6 text-left">
          <h4 className="text-xs font-black uppercase tracking-wider text-pink-700 mb-2.5 flex items-center gap-1">
            <Award className="w-4 h-4" /> Final Candy Leaderboard
          </h4>
          <div className="space-y-2">
            {ranked.map((p, idx) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                  idx === 0
                    ? 'bg-yellow-100/90 border border-yellow-300 text-yellow-950 font-black'
                    : 'bg-gray-50 border border-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-sm font-black">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <span className="text-lg">{p.avatar}</span>
                  <span>{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-700">🍬 {p.pinataCandy} pts</span>
                  <span className="text-gray-400 font-normal">(🍫 {p.chocolates})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Play Again Button */}
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-2 border-white/50"
        >
          <RotateCcw className="w-5 h-5" /> Play Another Game! <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
