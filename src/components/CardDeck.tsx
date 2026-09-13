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
    <div className="flex flex-col items-center justify-between p-1.5 sm:p-2.5 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-pink-300 shadow-md w-full max-w-none lg:max-w-[250px] flex-shrink-0">
      <div className="flex items-center justify-between w-full mb-1 sm:mb-1.5 px-0.5 sm:px-1">
        <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-pink-700 flex items-center gap-1">
          <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Card Deck
        </span>
        <span className="text-[9px] sm:text-[10px] font-bold bg-pink-100 text-pink-800 px-1.5 sm:px-2 py-0.2 rounded-full border border-pink-200">
          {deckCount} cards
        </span>
      </div>

      {/* 3D Flipping Card Container - Tappable on iPad / Touch */}
      <div
        onClick={!isDrawing && !isBotTurn ? onDrawCard : undefined}
        className={`relative w-20 h-28 sm:w-26 sm:h-36 lg:w-32 lg:h-42 [perspective:1000px] mb-1 sm:mb-2 select-none transition-transform ${
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
          <div className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl p-1.5 sm:p-3 [backface-visibility:hidden] shadow-lg sm:shadow-xl border-2 sm:border-4 border-white bg-gradient-to-br from-pink-400 via-purple-400 to-sky-400 flex flex-col items-center justify-center text-white cursor-pointer select-none">
            <div className="w-full h-full rounded-lg sm:rounded-xl border border-dashed sm:border-2 border-white/60 flex flex-col items-center justify-center p-1 sm:p-3 text-center bg-white/10">
              <span className="text-xl sm:text-2xl lg:text-3xl mb-0.5 sm:mb-1 animate-bounce">🍬</span>
              <span className="text-[11px] sm:text-sm lg:text-lg font-black tracking-wider drop-shadow-md">IZZYLAND</span>
              <span className="text-[7px] sm:text-[9px] lg:text-[10px] font-bold text-pink-100 uppercase tracking-widest mt-0.5">
                Tap Deck ✨
              </span>
              <div className="flex gap-1 mt-1 sm:mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
              </div>
            </div>
          </div>

          {/* Card Front (Revealed card) */}
          {cardToDisplay && (
            <div className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-lg sm:shadow-xl border-2 sm:border-4 border-white bg-white flex flex-col items-center justify-between text-gray-800 select-none">
              <div className="w-full text-center">
                <span className="text-[7px] sm:text-[9px] lg:text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block truncate">
                  {cardToDisplay.type === 'dinosaur'
                    ? '🦖 WATCH OUT!'
                    : cardToDisplay.type === 'power'
                    ? '🪩 SPECIAL POWER!'
                    : cardToDisplay.type === 'landmark'
                    ? '🐾 MOE ZOOMIES!'
                    : cardToDisplay.type === 'double'
                    ? '⚡ Double Leap!'
                    : '✨ Single Step ✨'}
                </span>
                <h3 className="text-[10px] sm:text-xs lg:text-sm font-black text-gray-900 leading-tight mt-0.2 truncate">
                  {cardToDisplay.name}
                </h3>
              </div>

              {/* Card Main Graphic */}
              <div className="flex items-center justify-center my-auto">
                {cardToDisplay.type === 'dinosaur' ? (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-18 lg:h-18 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-100 to-amber-100 border-2 border-red-400 flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl shadow-inner animate-bounce">
                    🦖
                  </div>
                ) : cardToDisplay.type === 'power' ? (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-18 lg:h-18 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 border-2 border-pink-300 flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl shadow-inner animate-pulse">
                    {cardToDisplay.icon}
                  </div>
                ) : cardToDisplay.type === 'landmark' ? (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-18 lg:h-18 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-50 to-pink-100 border-2 border-amber-300 flex flex-col items-center justify-center shadow-inner animate-bounce">
                    <span className="text-xl sm:text-2xl">🐶</span>
                    <span className="text-xs sm:text-sm -mt-0.5">{cardToDisplay.icon}</span>
                  </div>
                ) : cardToDisplay.type === 'double' && cardToDisplay.color ? (
                  <div className="flex gap-1.5 sm:gap-2">
                    <div
                      className="w-6 h-8 sm:w-8 sm:h-11 lg:w-10 lg:h-14 rounded-lg sm:rounded-xl border-2 border-white shadow-md transform -rotate-6 animate-pulse"
                      style={{
                        backgroundColor: TILE_COLOR_HEX[cardToDisplay.color],
                        boxShadow: `0 3px 8px ${TILE_COLOR_HEX[cardToDisplay.color]}88`,
                      }}
                    />
                    <div
                      className="w-6 h-8 sm:w-8 sm:h-11 lg:w-10 lg:h-14 rounded-lg sm:rounded-xl border-2 border-white shadow-md transform rotate-6 animate-pulse"
                      style={{
                        backgroundColor: TILE_COLOR_HEX[cardToDisplay.color],
                        boxShadow: `0 3px 8px ${TILE_COLOR_HEX[cardToDisplay.color]}88`,
                      }}
                    />
                  </div>
                ) : cardToDisplay.color ? (
                  <div
                    className="w-8 h-10 sm:w-11 sm:h-14 lg:w-14 lg:h-18 rounded-lg sm:rounded-xl border-2 sm:border-3 border-white shadow-md animate-pulse"
                    style={{
                      backgroundColor: TILE_COLOR_HEX[cardToDisplay.color],
                      boxShadow: `0 4px 12px ${TILE_COLOR_HEX[cardToDisplay.color]}88`,
                    }}
                  />
                ) : null}
              </div>

              {/* Subtitle / movement note */}
              <div className="w-full text-center bg-gray-50 rounded-lg sm:rounded-xl py-0.5 sm:py-1 px-1 border border-gray-200">
                <p className="text-[8px] sm:text-[10px] lg:text-xs font-bold text-gray-600 truncate">
                  {cardToDisplay.subtitle}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Draw Action Button */}
      {isBotTurn ? (
        <div className="w-full py-1.5 sm:py-2.5 lg:py-3 bg-purple-100 border-2 border-purple-300 rounded-xl sm:rounded-2xl text-purple-800 font-bold text-[10px] sm:text-xs lg:text-sm text-center flex items-center justify-center gap-1.5 animate-pulse">
          <span className="text-sm sm:text-base">🤖</span> {activePlayer.name} drawing...
        </div>
      ) : (
        <button
          type="button"
          onClick={onDrawCard}
          disabled={isDrawing}
          className={`w-full py-1.5 sm:py-2.5 lg:py-3 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm lg:text-base shadow-lg transition-all transform flex items-center justify-center gap-1.5 border-2 border-white/60 cursor-pointer ${
            isDrawing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white hover:scale-105 active:scale-95 shadow-pink-500/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 fill-current" />
          <span>{isDrawing ? 'Moving...' : 'Draw Card!'}</span>
          {!isDrawing && (
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 text-[9px] sm:text-xs font-black bg-white/25 rounded-md border border-white/40 shadow-inner">
              Space ␣
            </kbd>
          )}
        </button>
      )}
    </div>
  );
};
