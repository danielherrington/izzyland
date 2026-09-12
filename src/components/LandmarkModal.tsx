import React from 'react';
import type { LandmarkMeta } from '../types/game';
import { Sparkles, X } from 'lucide-react';

interface LandmarkModalProps {
  landmark: LandmarkMeta | null;
  playerName: string;
  onClose: () => void;
}

export const LandmarkModal: React.FC<LandmarkModalProps> = ({
  landmark,
  playerName,
  onClose,
}) => {
  if (!landmark) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-pink-300 text-center transform animate-scale-up">
        {/* Close Button - 44px Touch Target for iPad */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:scale-95 transition cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Floating Landmark Icon */}
        <div
          className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-6xl shadow-xl border-4 border-white mb-4 animate-bounce"
          style={{ backgroundColor: landmark.themeColor + '33' }}
        >
          {landmark.icon}
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-pink-100 text-pink-700 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Landmark Discovered!
        </div>

        {/* Landmark Title */}
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
          {landmark.name}
        </h2>

        {/* Player arrival announcement */}
        <p className="text-sm font-bold text-purple-600 mb-4">
          ✨ {playerName} has arrived here! ✨
        </p>

        {/* Description */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-2xl border border-pink-200 text-sm text-gray-700 mb-6 font-medium">
          <p className="mb-2">{landmark.description}</p>
          <p className="text-xs font-bold text-pink-800 italic">
            "{landmark.funFact}"
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold text-base rounded-2xl shadow-lg transition transform hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          Woohoo! Continue Race 💖
        </button>
      </div>
    </div>
  );
};
