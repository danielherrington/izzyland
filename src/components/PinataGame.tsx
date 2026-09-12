import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Player } from '../types/game';
import {
  playBatWhoosh,
  playWhack,
  playCrack,
  playPinataExplosion,
  playVictory,
} from '../utils/sound';
import { fireChocolateConfetti, fireVictoryConfetti } from '../utils/confetti';
import { Sparkles, Trophy, Award } from 'lucide-react';

interface PinataGameProps {
  initialPlayers: Player[];
  onFinishPinata: (rankedPlayers: Player[]) => void;
}

export const PinataGame: React.FC<PinataGameProps> = ({
  initialPlayers,
  onFinishPinata,
}) => {
  // Initialize players with swings based on berries + arrival order bonus (+6 swings for 1st arrival!)
  const [players, setPlayers] = useState<Player[]>(() => {
    return initialPlayers.map((p) => {
      // 1 berry = 1 swing, +6 bonus if arrived 1st at the castle, minimum 1 swing
      const arrivalBonus = p.arrivedAtCastleOrder === 1 ? 6 : 0;
      const totalSwings = Math.max(1, p.berries + arrivalBonus);
      return {
        ...p,
        pinataSwings: totalSwings,
        pinataCandy: 0,
      };
    });
  });

  // First to reach the castle always bats first!
  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(() => {
    const firstArriverIdx = initialPlayers.findIndex((p) => p.arrivedAtCastleOrder === 1);
    return firstArriverIdx !== -1 ? firstArriverIdx : 0;
  });

  const [pinataHp, setPinataHp] = useState<number>(100);
  const [isSwinging, setIsSwinging] = useState<boolean>(false);
  const [swingEffect, setSwingEffect] = useState<{
    text: string;
    points: number;
    candies: string[];
    isGolden?: boolean;
  } | null>(null);
  const [isBroken, setIsBroken] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Advance turn to the next player who has swings left
  const advanceToNextBatter = useCallback((currentPlayers: Player[], startIdx: number) => {
    let nextIdx = (startIdx + 1) % currentPlayers.length;
    let checked = 0;
    while (currentPlayers[nextIdx].pinataSwings <= 0 && checked < currentPlayers.length) {
      nextIdx = (nextIdx + 1) % currentPlayers.length;
      checked++;
    }

    if (checked >= currentPlayers.length || currentPlayers.every((p) => p.pinataSwings <= 0)) {
      // No more swings left for anyone!
      handleFinalCelebration(currentPlayers);
    } else {
      setActivePlayerIdx(nextIdx);
    }
  }, []);

  // Final celebration & ranking
  const handleFinalCelebration = (currentPlayers: Player[]) => {
    setIsGameOver(true);
    playPinataExplosion();
    playVictory();
    fireVictoryConfetti();

    // Sort players by pinata candy collected descending
    const sorted = [...currentPlayers].sort((a, b) => b.pinataCandy - a.pinataCandy);

    setTimeout(() => {
      onFinishPinata(sorted);
    }, 4500);
  };

  // Execute a swing
  const handleSwing = useCallback(() => {
    if (isSwinging || isGameOver) return;
    const currentActive = players[activePlayerIdx];
    if (!currentActive || currentActive.pinataSwings <= 0) return;

    setIsSwinging(true);
    playBatWhoosh();

    const isGoldenBat = currentActive.arrivedAtCastleOrder === 1;

    setTimeout(() => {
      // Hit lands!
      const isCritical = Math.random() > 0.65;
      const baseDamage = isCritical ? 28 : Math.floor(Math.random() * 12 + 14);
      // Golden Mega Bat deals 2x damage and generates 2x candy points!
      const damage = isGoldenBat ? baseDamage * 2 : baseDamage;
      const basePoints = isCritical ? 260 : Math.floor(Math.random() * 60 + 70);
      const points = isGoldenBat ? basePoints * 2 : basePoints;

      if (isCritical || isGoldenBat) {
        playCrack();
      } else {
        playWhack();
      }
      fireChocolateConfetti();
      if (isGoldenBat) {
        fireVictoryConfetti();
      }

      const newHp = Math.max(0, pinataHp - damage);
      setPinataHp(newHp);

      const candyIcons = ['🍫', '🍬', '🍭', '🍩', '✨'];
      const droppedCandies = [
        candyIcons[Math.floor(Math.random() * candyIcons.length)],
        candyIcons[Math.floor(Math.random() * candyIcons.length)],
        ...(isCritical || isGoldenBat ? ['🍫', '🍬', '🌟', '🍫'] : []),
      ];

      setSwingEffect({
        text: isGoldenBat
          ? (isCritical ? `🌟 GOLDEN CRITICAL SMASH! +${points} CANDY! 🌟` : `🌟 GOLDEN MEGA HIT! +${points} CANDY! 🌟`)
          : (isCritical ? `💥 CRITICAL SWEET CRACK! +${points} 💥` : `WHACK! +${points} CANDY!`),
        points,
        candies: droppedCandies,
        isGolden: isGoldenBat,
      });

      // Update player state
      const updatedPlayers = players.map((p, idx) => {
        if (idx === activePlayerIdx) {
          return {
            ...p,
            pinataSwings: p.pinataSwings - 1,
            pinataCandy: p.pinataCandy + points,
          };
        }
        return p;
      });
      setPlayers(updatedPlayers);

      // Check if pinata burst
      if (newHp === 0 && !isBroken) {
        setIsBroken(true);
        playPinataExplosion();
        fireVictoryConfetti();

        // Award giant finish bonus to active batter (500 for Golden Bat, 300 for regular)
        const burstBonus = isGoldenBat ? 500 : 300;
        updatedPlayers[activePlayerIdx].pinataCandy += burstBonus;
        setPlayers([...updatedPlayers]);

        setTimeout(() => {
          handleFinalCelebration(updatedPlayers);
        }, 2200);
      } else {
        // Reset swing animation and advance batter
        setTimeout(() => {
          setIsSwinging(false);
          setSwingEffect(null);
          advanceToNextBatter(updatedPlayers, activePlayerIdx);
        }, 1100);
      }
    }, 350);
  }, [isSwinging, isGameOver, players, activePlayerIdx, pinataHp, isBroken, advanceToNextBatter]);

  // Spacebar keyboard listener to swing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const active = players[activePlayerIdx];
        if (active && !active.isBot && !isSwinging && !isGameOver && active.pinataSwings > 0) {
          e.preventDefault();
          handleSwing();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [players, activePlayerIdx, isSwinging, isGameOver, handleSwing]);

  // AI Bot Swing Loop
  useEffect(() => {
    const active = players[activePlayerIdx];
    if (!active || !active.isBot || isSwinging || isGameOver || active.pinataSwings <= 0) {
      return;
    }

    botTimerRef.current = setTimeout(() => {
      handleSwing();
    }, 1300);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [players, activePlayerIdx, isSwinging, isGameOver, handleSwing]);

  const activePlayer = players[activePlayerIdx];

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-2 sm:px-4 py-3 sm:py-6 flex flex-col items-center">
      {/* Title & Banner */}
      <div className="text-center mb-3 sm:mb-6">
        <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-950 font-black px-4 sm:px-6 py-1 rounded-full text-[11px] sm:text-xs uppercase tracking-widest shadow-md mb-1.5 animate-bounce">
          <Trophy className="w-3.5 h-3.5" /> The Castle Finale <Trophy className="w-3.5 h-3.5" />
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 drop-shadow-sm">
          🪅 THE GRAND CANDY PIÑATA! 🪅
        </h1>
        <p className="text-gray-600 font-bold text-xs sm:text-sm md:text-base max-w-md mx-auto mt-0.5">
          Take swings using your collected <strong>Sparkle Berries 🍓</strong>! Crack open the piñata to win the candy championship!
        </p>
      </div>

      {/* Main Piñata Arena Box */}
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-white via-pink-50 to-purple-50 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border-4 border-pink-300 flex flex-col items-center overflow-hidden">
        {/* Suspended Rope & Piñata */}
        <div className="relative w-full flex flex-col items-center justify-center my-2 sm:my-4 h-48 sm:h-56 md:h-64">
          {/* Hanging Ribbon */}
          <div className="w-1.5 h-10 sm:h-16 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />

          {/* Swinging Piñata Body - Tappable on iPad! */}
          <div
            onClick={!isSwinging && !isGameOver && activePlayer && !activePlayer.isBot ? handleSwing : undefined}
            className={`relative transition-transform duration-300 select-none cursor-pointer active:scale-95 ${
              isSwinging ? 'scale-110 rotate-12' : 'animate-float'
            }`}
            style={{
              filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.18))',
            }}
            title={!isSwinging && !isGameOver && activePlayer && !activePlayer.isBot ? 'Tap to swing the bat!' : undefined}
          >
            {/* The Piñata Graphic (Unicorn Candy Piñata) */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-pink-400 via-purple-400 to-sky-400 p-2 border-4 border-white flex flex-col items-center justify-center text-5xl sm:text-6xl relative shadow-inner">
              {isBroken ? '💥' : '🦄'}

              {/* Piñata Frills & Fringe */}
              <div className="absolute -bottom-3 flex gap-1 text-xs">
                <span>🎀</span>
                <span>✨</span>
                <span>🎀</span>
              </div>
            </div>

            {/* Crack Overlays */}
            {pinataHp <= 70 && !isBroken && (
              <span className="absolute top-2 left-2 text-xl sm:text-2xl animate-pulse">⚡</span>
            )}
            {pinataHp <= 35 && !isBroken && (
              <span className="absolute bottom-4 right-2 text-2xl sm:text-3xl animate-pulse">⚡</span>
            )}
          </div>

          {/* Bat Animation */}
          {isSwinging && (
            <div
              className={`absolute right-1/4 top-1/2 -translate-y-1/2 transform -rotate-45 animate-bounce ${
                activePlayer?.arrivedAtCastleOrder === 1
                  ? 'text-7xl filter drop-shadow-[0_0_20px_rgba(234,179,8,1)]'
                  : 'text-6xl'
              }`}
            >
              {activePlayer?.arrivedAtCastleOrder === 1 ? '🌟🏏' : '🏏'}
            </div>
          )}

          {/* Floating Hit Float Text */}
          {swingEffect && (
            <div
              className={`absolute top-4 px-5 py-2.5 rounded-2xl border-3 shadow-xl font-black text-sm md:text-base animate-bounce flex items-center gap-2 ${
                swingEffect.isGolden
                  ? 'bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-amber-400 text-amber-950 shadow-amber-300/50 scale-110 ring-2 ring-yellow-400'
                  : 'bg-white/95 border-yellow-400 text-amber-900'
              }`}
            >
              <span>{swingEffect.text}</span>
              <span className="text-xl">{swingEffect.candies.join(' ')}</span>
            </div>
          )}
        </div>

        {/* Piñata Health Bar */}
        <div className="w-full max-w-md mb-6">
          <div className="flex justify-between text-xs font-black uppercase text-gray-600 mb-1.5">
            <span>Piñata Durability</span>
            <span className="text-pink-600 font-extrabold">{pinataHp}%</span>
          </div>
          <div className="w-full h-4 bg-pink-100 rounded-full overflow-hidden border-2 border-pink-300 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${pinataHp}%` }}
            />
          </div>
        </div>

        {/* Active Batter Spotlight */}
        {activePlayer && (
          <div
            className={`flex flex-col items-center p-4 rounded-2xl border-2 shadow-sm w-full max-w-md mb-6 transition-all ${
              activePlayer.arrivedAtCastleOrder === 1
                ? 'bg-gradient-to-b from-amber-50/95 via-yellow-50/95 to-white/95 border-amber-300 ring-2 ring-amber-300/60 shadow-amber-200/50'
                : 'bg-white/90 border-purple-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 border-white shadow-inner"
                style={{ backgroundColor: activePlayer.avatarColor + '33' }}
              >
                {activePlayer.avatar}
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 block uppercase">
                  Up To Bat:
                </span>
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-1.5">
                  {activePlayer.name} {activePlayer.isBot ? '(AI Bot)' : ''}
                  {activePlayer.arrivedAtCastleOrder === 1 && (
                    <span className="text-xs bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full border border-amber-500 shadow-sm">
                      1st to Castle! 👑
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {/* Golden Mega Bat Active Banner */}
            {activePlayer.arrivedAtCastleOrder === 1 && (
              <div className="mt-2.5 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-950 px-3 py-1 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm animate-pulse border border-yellow-500">
                <span>🌟</span> WIELDING THE GOLDEN MEGA BAT! 2X POWER & CANDY! <span>🌟</span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between w-full text-xs font-bold bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-200">
              <span className="text-pink-700">
                Swings Remaining: <strong>{activePlayer.pinataSwings}</strong>
              </span>
              <span className="text-amber-700">
                Candy Points: <strong>{activePlayer.pinataCandy}</strong> 🍬
              </span>
            </div>
          </div>
        )}

        {/* Swing Action Button */}
        {activePlayer && !activePlayer.isBot ? (
          <button
            type="button"
            onClick={handleSwing}
            disabled={isSwinging || activePlayer.pinataSwings <= 0 || isGameOver}
            className={`w-full max-w-md py-4 rounded-2xl font-black text-xl shadow-xl transition transform border-2 border-white/60 flex items-center justify-center gap-3 cursor-pointer ${
              isSwinging || activePlayer.pinataSwings <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : activePlayer.arrivedAtCastleOrder === 1
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-500 hover:via-yellow-500 hover:to-orange-600 text-amber-950 hover:scale-105 active:scale-95 shadow-amber-500/40 ring-2 ring-yellow-300'
                : 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 text-white hover:scale-105 active:scale-95 shadow-pink-500/30'
            }`}
          >
            <Sparkles className="w-6 h-6 fill-current" />
            <span>
              {isSwinging
                ? 'SWINGING...'
                : activePlayer.arrivedAtCastleOrder === 1
                ? 'SWING GOLDEN MEGA BAT! 🌟🏏'
                : 'SWING THE BAT! 🏏'}
            </span>
            {!isSwinging && (
              <kbd className="hidden sm:inline-block ml-1 px-2 py-0.5 text-xs font-black bg-white/30 rounded-lg border border-white/40 shadow-inner">
                Space ␣
              </kbd>
            )}
          </button>
        ) : activePlayer && activePlayer.isBot ? (
          <div className="w-full max-w-md py-3.5 bg-purple-100 border-2 border-purple-300 rounded-2xl text-purple-800 font-bold text-center text-base animate-pulse flex items-center justify-center gap-2">
            <span>🤖</span> {activePlayer.name} is taking a swing...
          </div>
        ) : null}
      </div>

      {/* Live Candy Leaderboard */}
      <div className="w-full max-w-2xl mt-6 bg-white/85 backdrop-blur-md rounded-3xl p-5 border-2 border-pink-200 shadow-md">
        <h4 className="text-xs font-black uppercase tracking-wider text-pink-700 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4" /> Live Candy Standings
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className={`p-3 rounded-2xl border-2 text-center transition relative ${
                idx === activePlayerIdx
                  ? 'bg-gradient-to-b from-pink-100 to-purple-100 border-pink-400 shadow-md scale-105'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {p.arrivedAtCastleOrder === 1 && (
                <span className="absolute -top-2 -right-1 text-xs bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full font-black border border-amber-300 shadow-sm" title="First to Castle! 1st Batter + Golden Bat">
                  👑 Golden Bat
                </span>
              )}
              <div className="text-2xl mb-1">{p.avatar}</div>
              <div className="text-xs font-extrabold text-gray-800 truncate">{p.name}</div>
              <div className="text-sm font-black text-amber-600 mt-0.5">
                {p.pinataCandy} 🍬
              </div>
              <div className="text-[10px] font-bold text-gray-500">
                {p.pinataSwings} swings left
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
