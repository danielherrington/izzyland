import React from 'react';
import type { PowerType } from '../types/game';
import { Sparkles, X } from 'lucide-react';

interface PowerUpModalProps {
  powerType: PowerType | null;
  playerName: string;
  onClose: () => void;
}

export const PowerUpModal: React.FC<PowerUpModalProps> = ({
  powerType,
  playerName,
  onClose,
}) => {
  if (!powerType) return null;

  const isTaylor = powerType === 'taylor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-pink-400 text-center transform animate-scale-up overflow-hidden">
        {/* Decorative background glow */}
        <div
          className="absolute -top-16 -left-16 w-36 h-36 rounded-full opacity-40 blur-2xl pointer-events-none"
          style={{ backgroundColor: isTaylor ? '#ec4899' : '#84cc16' }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full opacity-40 blur-2xl pointer-events-none"
          style={{ backgroundColor: isTaylor ? '#a855f7' : '#eab308' }}
        />

        {/* Close Button - 44px Touch Target for iPad */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:scale-95 transition cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Power Icon Avatar */}
        <div
          className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-6xl shadow-2xl border-4 border-white mb-4 animate-bounce"
          style={{ backgroundColor: isTaylor ? '#fce7f3' : '#ecfccb' }}
        >
          {isTaylor ? '🪩' : '🐶'}
        </div>

        {/* Category Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 text-white mb-2 shadow-md">
          <Sparkles className="w-3.5 h-3.5" /> Special Power-Up Activated!
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
          {isTaylor ? 'Taylor Swift Bejeweled Boost!' : "Moe's Wiener Dog Zoomies!"}
        </h2>

        {/* Player Name */}
        <p className="text-sm font-extrabold text-pink-600 mb-4">
          ✨ {playerName} unleashed this legendary power! ✨
        </p>

        {/* Perks Box */}
        <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 p-4 rounded-2xl border-2 border-pink-200 text-left mb-6 space-y-2 text-sm font-semibold text-gray-800">
          {isTaylor ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <span>
                  <strong>+4 Tiles Leap:</strong> Soar ahead to the next stage!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🍓</span>
                <span>
                  <strong>+2 Sparkle Berries:</strong> Friendship bracelet bonus!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span>
                  <strong>Shake It Off:</strong> Removes any frozen turn effect!
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xl">🍫</span>
                <span>
                  <strong>+1 Chocolate Found:</strong> Moe sniffed out a sweet treat!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🐾</span>
                <span>
                  <strong>+3 Tiles Dash:</strong> Moe's little dachshund legs are zoomin'!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">❤️</span>
                <span>
                  <strong>Puppy Energy:</strong> Tail wagging speed boost!
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700 text-white font-extrabold text-base rounded-2xl shadow-xl transition transform hover:scale-[1.02] active:scale-95 cursor-pointer border-2 border-white/50"
        >
          Let's Go! ✨
        </button>
      </div>
    </div>
  );
};
