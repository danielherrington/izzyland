import React from 'react';
import { X, Crown, HelpCircle } from 'lucide-react';
import { REQUIRED_CHOCOLATES, BERRY_FREEZE_COST } from '../constants/boardData';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-white via-pink-50 to-purple-50 rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-pink-300 transform animate-scale-up">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:scale-95 transition cursor-pointer"
          title="Close instructions"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 text-white mb-2 shadow-md">
            <HelpCircle className="w-3.5 h-3.5" /> Official Rulebook
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500">
            ✨ How to Play Izzyland ✨
          </h2>
          <p className="text-xs sm:text-sm font-bold text-gray-600 mt-1">
            Race along the sparkling trail, unlock the Castle Gate, and claim the Candy Piñata Championship!
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-4 text-xs sm:text-sm text-gray-800">
          {/* Section 1: The Goal & Chocolates */}
          <div className="bg-white/90 rounded-2xl p-4 border-2 border-amber-300 shadow-sm">
            <h3 className="text-sm sm:text-base font-black text-amber-900 flex items-center gap-2 mb-2">
              <span className="text-xl">🍫</span> 1. Collecting Chocolates & The Castle Gate
            </h3>
            <p className="font-medium text-gray-700 leading-relaxed mb-2">
              You must collect <strong>{REQUIRED_CHOCOLATES} Chocolate Candies 🍫</strong> to unlock the <strong>Castle Gate</strong> (Tile 63) and trigger the Piñata Finale!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <span className="font-black text-amber-900 block mb-0.5">🍫 On the Trail:</span>
                22 chocolates are scattered across the tiles. Step on them to pick them up!
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <span className="font-black text-amber-900 block mb-0.5">⭐ Landmark Rewards:</span>
                Every landmark stop gifts you +1 specialty chocolate & +1 berry!
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <span className="font-black text-amber-900 block mb-0.5">👑 Castle Royal Welcome:</span>
                Reach the gate with &lt;5 chocolates? The guards grant +2 Royal Chocolates!
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <span className="font-black text-amber-900 block mb-0.5">🍬 Trade Berries:</span>
                Trade 2 Sparkle Berries (🍓🍓) for 1 Chocolate (🍫) anytime on your turn!
              </div>
            </div>
          </div>

          {/* Section 2: Sparkle Berries & Freeze Attacks */}
          <div className="bg-white/90 rounded-2xl p-4 border-2 border-pink-300 shadow-sm">
            <h3 className="text-sm sm:text-base font-black text-pink-900 flex items-center gap-2 mb-2">
              <span className="text-xl">🍓</span> 2. Sparkle Berries & Opponent Freezes
            </h3>
            <p className="font-medium text-gray-700 leading-relaxed mb-2">
              Sparkle Berries give you power! You can spend them during the race or save them for the Finale:
            </p>
            <ul className="space-y-1.5 text-xs font-semibold list-disc list-inside text-gray-700">
              <li>
                <strong>Cast Freeze Attack (Costs {BERRY_FREEZE_COST} 🍓):</strong> Freeze an opponent so they skip their next turn!
              </li>
              <li>
                <strong>Piñata Swings:</strong> Every berry you hold when entering the Castle becomes a swing at the Piñata!
              </li>
            </ul>
          </div>

          {/* Section 3: Chutes & Ladders (NYC Elevators & Lisbon Trams) */}
          <div className="bg-white/90 rounded-2xl p-4 border-2 border-sky-300 shadow-sm">
            <h3 className="text-sm sm:text-base font-black text-sky-900 flex items-center gap-2 mb-2">
              <span className="text-xl">🛗</span> 3. NYC Elevators (Ladders) & Lisbon Trams (Chutes)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-200">
                <div className="flex items-center gap-1.5 font-black text-sky-900 mb-1">
                  <span className="text-base">🛗</span> NYC Sky Elevators (Rocket UP!)
                </div>
                <p className="text-gray-700 font-medium">
                  Land on <strong>Tile 8</strong> or <strong>Tile 25</strong> to watch Moe's high-speed glass elevator video and rocket up 9–10 tiles!
                </p>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                  <span className="text-base">🚃</span> Lisbon Trams (Coast DOWN!)
                </div>
                <p className="text-gray-700 font-medium">
                  Watch your step! Landing on <strong>Tile 33</strong> or <strong>Tile 49</strong> plays Moe's Lisbon Tram video and coasts you down the steep hills to a lower row!
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Power-Ups */}
          <div className="bg-white/90 rounded-2xl p-4 border-2 border-purple-300 shadow-sm">
            <h3 className="text-sm sm:text-base font-black text-purple-900 flex items-center gap-2 mb-2">
              <span className="text-xl">⚡</span> 4. Legendary Power-Up Cards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                <div className="flex items-center gap-1.5 font-black text-purple-900 mb-1">
                  <span className="text-base">🪩</span> Taylor Swift Bejeweled Boost
                </div>
                <p className="text-gray-700 font-medium">
                  Leap ahead <strong>+4 tiles</strong>, receive <strong>+2 bonus berries</strong>, and shake off any freeze!
                </p>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                  <span className="text-base">🐶</span> Moe Moe Zoomies Destination Cards!
                </div>
                <p className="text-gray-700 font-medium">
                  Draw a Moe Moe Zoomies card to watch Moe's real-life adventure video and zoom straight to <strong>Miami, Buenos Aires, Paris, Ibiza, Transylvania, or Disney Kingdom</strong>!
                </p>
              </div>
              <div className="bg-red-50 p-2.5 rounded-xl border border-red-200 sm:col-span-2">
                <div className="flex items-center gap-1.5 font-black text-red-900 mb-1">
                  <span className="text-base">🦖</span> Back-to-Start Dinosaur!
                </div>
                <p className="text-gray-700 font-medium">
                  Watch out! When this card is drawn, the roaring dinosaur jumps out in video and chases you all the way back to <strong>Start (Tile 0)</strong>!
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: The Grand Piñata Finale */}
          <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-2xl p-4 border-2 border-yellow-400 shadow-sm">
            <h3 className="text-sm sm:text-base font-black text-yellow-950 flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-600" /> 4. The Grand Piñata Finale
            </h3>
            <p className="font-medium text-gray-800 leading-relaxed mb-2">
              Once the Castle Gate is unlocked, all players enter the Grand Piñata showdown!
            </p>
            <ul className="space-y-1.5 text-xs font-semibold list-disc list-inside text-gray-800">
              <li>
                <strong>1st to Castle Advantage:</strong> Swings first, receives <strong>+6 Bonus Swings</strong>, and wields the <strong>🌟 Golden Mega Bat 🌟</strong> (2x damage and 2x candy points)!
              </li>
              <li>
                <strong>Whack to Win:</strong> Every swing sprays delicious candy points. Whoever collects the most candy wins the championship!
              </li>
            </ul>
          </div>
        </div>

        {/* Got It Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-xl transition transform hover:scale-[1.01] active:scale-95 cursor-pointer border-2 border-white/50"
          >
            Ready to Play! ✨
          </button>
        </div>
      </div>
    </div>
  );
};
