import React from 'react';
import type { GameCard, Player } from '../types/game';
import { Sparkles, Layers } from 'lucide-react';
import { TILE_COLOR_HEX } from '../constants/boardData';

interface CardDeckProps {
  currentCard: GameCard | null;
  activePlayer: Player;
  deckCount: number;
  isDrawing: boolean;
  onDrawCard: () => void;
  isBotTurn: boolean;
}

export const CardDeck: React.FC<CardDeckProps> = ({
  currentCard,
  activePlayer,
  deckCount,
  isDrawing,
  onDrawCard,
  isBotTurn,
}) => {
  const lastCardRef = React.useRef<GameCard | null>(null);
  if (currentCard) {
    lastCardRef.current = currentCard;
  }
  const cardToDisplay = currentCard || lastCardRef.current;

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-2.5 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-pink-300 shadow-md w-full max-w-[240px] sm:max-w-[250px] flex-shrink-0">
      <div className="flex items-center justify-between w-full mb-1.5 px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Card Deck
        </span>
        <span className="text-[10px] font-bold bg-pink-100 text-pink-800 px-2 py-0.2 rounded-full border border-pink-200">
          {deckCount} cards
        </span>
      </div>

      {/* 3D Flipping Card Container - Tappable on iPad / Touch */}
      <div
        onClick={!isDrawing && !isBotTurn ? onDrawCard : undefined}
        className={`relative w-32 h-42 sm:w-34 sm:h-46 [perspective:1000px] mb-2 select-none transition-transform ${
          !isDrawing && !isBotTurn ? 'cursor-pointer active:scale-95 hover:scale-[1.02]' : ''
        }`}
        title={!isDrawing && !isBotTurn ? 'Tap to draw card!' : undefined}
      >
        <div
          className={`w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
            currentCard ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Card Back (Deck face) */}
          <div className="absolute inset-0 w-full h-full rounded-2xl p-3 [backface-visibility:hidden] shadow-xl border-4 border-white bg-gradient-to-br from-pink-400 via-purple-400 to-sky-400 flex flex-col items-center justify-center text-white cursor-pointer select-none">
            <div className="w-full h-full rounded-xl border-2 border-dashed border-white/60 flex flex-col items-center justify-center p-3 text-center bg-white/10">
              <span className="text-3xl sm:text-4xl mb-2 animate-bounce">🍬</span>
              <span className="text-lg sm:text-xl font-black tracking-wider drop-shadow-md">IZZYLAND</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-pink-100 uppercase tracking-widest mt-1">
                Tap Deck to Draw ✨
              </span>
              <div className="flex gap-1 mt-3">
                <span className="w-2 h-2 rounded-full bg-pink-300 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-yellow-300" />
                <span className="w-2 h-2 rounded-full bg-sky-300" />
              </div>
            </div>
          </div>

          {/* Card Front (Revealed card) */}
          {cardToDisplay && (
            <div className="absolute inset-0 w-full h-full rounded-2xl p-3 [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-xl border-4 border-white bg-white flex flex-col items-center justify-between text-gray-800 select-none">
              <div className="w-full text-center">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 block">
                  {cardToDisplay.type === 'dinosaur'
                    ? '🦖 WATCH OUT! 🦖'
                    : cardToDisplay.type === 'power'
                    ? '🪩 SPECIAL POWER! 🪩'
                    : cardToDisplay.type === 'landmark'
                    ? '🐶 MOE MOE ZOOMIES! 🐾'
                    : cardToDisplay.type === 'double'
                    ? '⚡ Double Leap! ⚡'
                    : '✨ Single Step ✨'}
                </span>
                <h3 className="text-base font-black text-gray-900 leading-tight mt-0.5">
                  {cardToDisplay.name}
                </h3>
              </div>

              {/* Card Main Graphic */}
              <div className="flex items-center justify-center my-auto">
                {cardToDisplay.type === 'dinosaur' ? (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 to-amber-100 border-2 border-red-400 flex items-center justify-center text-5xl shadow-inner animate-bounce">
                    🦖
                  </div>
                ) : cardToDisplay.type === 'power' ? (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 border-2 border-pink-300 flex items-center justify-center text-5xl shadow-inner animate-pulse">
                    {cardToDisplay.icon}
                  </div>
                ) : cardToDisplay.type === 'landmark' ? (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-50 to-pink-100 border-2 border-amber-300 flex flex-col items-center justify-center shadow-inner animate-bounce">
                    <span className="text-3xl">🐶</span>
                    <span className="text-xl -mt-1">{cardToDisplay.icon}</span>
                  </div>
                ) : cardToDisplay.type === 'double' && cardToDisplay.color ? (
                  <div className="flex gap-3">
                    <div
                      className="w-12 h-16 rounded-xl border-3 border-white shadow-md transform -rotate-6 animate-pulse"
                      style={{
                        backgroundColor: TILE_COLOR_HEX[cardToDisplay.color],
                        boxShadow: `0 4px 12px ${TILE_COLOR_HEX[cardToDisplay.color]}88`,
                      }}
                    />
                    <div
                      className="w-12 h-16 rounded-xl border-3 border-white shadow-md transform rotate-6 animate-pulse"
                      style={{
                        backgroundColor: TILE_COLOR_HEX[cardToDisplay.color],
                        boxShadow: `0 4px 12px ${TILE_COLOR_HEX[cardToDisplay.color]}88`,
                      }}
                    />
                  </div>
                ) : cardToDisplay.color ? (
                  <div
                    className="w-16 h-20 rounded-xl border-4 border-white shadow-lg animate-pulse"
                    style={{
                      backgroundColor: TILE_COLOR_HEX[cardToDisplay.color],
                      boxShadow: `0 6px 16px ${TILE_COLOR_HEX[cardToDisplay.color]}88`,
                    }}
                  />
                ) : null}
              </div>

              {/* Subtitle / movement note */}
              <div className="w-full text-center bg-gray-50 rounded-xl py-1.5 px-2 border border-gray-200">
                <p className="text-xs font-bold text-gray-600">
                  {cardToDisplay.subtitle}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Draw Action Button */}
      {isBotTurn ? (
        <div className="w-full py-3 bg-purple-100 border-2 border-purple-300 rounded-2xl text-purple-800 font-bold text-sm text-center flex items-center justify-center gap-2 animate-pulse">
          <span className="text-lg">🤖</span> {activePlayer.name} is drawing...
        </div>
      ) : (
        <button
          type="button"
          onClick={onDrawCard}
          disabled={isDrawing}
          className={`w-full py-3 px-4 rounded-2xl font-black text-base shadow-lg transition-all transform flex items-center justify-center gap-2 border-2 border-white/60 cursor-pointer ${
            isDrawing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white hover:scale-105 active:scale-95 shadow-pink-500/30'
          }`}
        >
          <Sparkles className="w-5 h-5 fill-current" />
          <span>{isDrawing ? 'Moving...' : 'Draw Card!'}</span>
          {!isDrawing && (
            <kbd className="hidden sm:inline-block ml-1 px-2 py-0.5 text-xs font-black bg-white/25 rounded-lg border border-white/40 shadow-inner">
              Space ␣
            </kbd>
          )}
        </button>
      )}
    </div>
  );
};
