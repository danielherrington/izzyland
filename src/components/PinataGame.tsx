import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Player } from '../types/game';
import {
  playBatWhoosh,
  playWhack,
  playCrack,
  playSweetSpotChime,
  playPinataExplosion,
  playVictory,
} from '../utils/sound';
import { fireChocolateConfetti, fireVictoryConfetti } from '../utils/confetti';
import { Sparkles, Trophy, Award, Target } from 'lucide-react';
import { PinataVideoModal } from './PinataVideoModal';

interface PinataGameProps {
  initialPlayers: Player[];
  onFinishPinata: (rankedPlayers: Player[]) => void;
  onVideoPlayingChange?: (isPlaying: boolean) => void;
}

export const PinataGame: React.FC<PinataGameProps> = ({
  initialPlayers,
  onFinishPinata,
  onVideoPlayingChange,
}) => {
  // Initialize players
  const [players, setPlayers] = useState<Player[]>(() => {
    return initialPlayers.map((p) => ({
      ...p,
      pinataCandy: 0,
      pinataSwings: 0,
    }));
  });

  // Size Piñata HP so each player gets around 3 swings on average:
  // With Golden Mega Bat on 1st player (~44 avg dmg) and regular bat on others (~22 avg dmg),
  // each full round averages ~[44 + (N-1)*22] dmg. 3 rounds ≈ 3 * [44 + (N-1)*22].
  const [maxPinataHp] = useState<number>(() => {
    const n = Math.max(1, initialPlayers.length);
    const roundAvgDmg = 44 + (n - 1) * 22;
    return Math.max(180, Math.round(roundAvgDmg * 3));
  });

  // First to reach the castle always bats first!
  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(() => {
    const firstArriverIdx = initialPlayers.findIndex((p) => p.arrivedAtCastleOrder === 1);
    return firstArriverIdx !== -1 ? firstArriverIdx : 0;
  });

  const [pinataHp, setPinataHp] = useState<number>(() => {
    const n = Math.max(1, initialPlayers.length);
    const roundAvgDmg = 44 + (n - 1) * 22;
    return Math.max(180, Math.round(roundAvgDmg * 3));
  });

  const [isSwinging, setIsSwinging] = useState<boolean>(false);
  const [swingEffect, setSwingEffect] = useState<{
    text: string;
    points: number;
    candies: string[];
    isGolden?: boolean;
    rating?: 'critical' | 'great' | 'glance';
  } | null>(null);
  const [isBroken, setIsBroken] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Timing Meter States
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [frozenSliderPos, setFrozenSliderPos] = useState<number | null>(null);
  const [lastHitRating, setLastHitRating] = useState<'critical' | 'great' | 'glance' | null>(null);
  const sliderPosRef = useRef<number>(50);

  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Video State for Piñata Animations
  interface ActivePinataVideo {
    src: string;
    badge: string;
    badgeBg?: string;
    title: string;
    subtitle: string;
    onComplete?: () => void;
  }

  const [activeVideo, setActiveVideo] = useState<ActivePinataVideo | null>(null);
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(false);

  useEffect(() => {
    onVideoPlayingChange?.(!!activeVideo);
  }, [activeVideo, onVideoPlayingChange]);

  const activePlayer = players[activePlayerIdx];

  // Play starter video when minigame begins
  useEffect(() => {
    if (!hasSeenIntro) {
      const firstPlayer = players[activePlayerIdx];
      setActiveVideo({
        src: '/videos/pinata/starter.mp4',
        badge: '🪅 THE GRAND PIÑATA FINALE! 🪅',
        badgeBg: 'from-amber-400 via-pink-500 to-purple-600',
        title: 'Time to Crack the Piñata!',
        subtitle: `${firstPlayer?.name || 'Player'} steps up to bat first! Time your swings for candy! 🏏🍬`,
        onComplete: () => {
          setHasSeenIntro(true);
        },
      });
    }
  }, []);

  const handleCloseVideo = useCallback(() => {
    if (activeVideo) {
      const callback = activeVideo.onComplete;
      setActiveVideo(null);
      if (callback) {
        callback();
      }
    }
  }, [activeVideo]);

  const berryCount = activePlayer?.berries ?? 0;
  // Base 1100ms cycle duration for 0 berries; each berry adds +220ms (up to 3300ms maximum!)
  // More berries = significantly slower slider = much easier to hit the Sweet Spot!
  const cycleDurationMs = Math.min(3300, 1100 + Math.max(0, berryCount) * 220);
  const slowBonusPercent = Math.min(200, Math.round(((cycleDurationMs - 1100) / 1100) * 100));

  // RequestAnimationFrame oscillator for the timing meter
  useEffect(() => {
    if (isSwinging || isGameOver || isBroken || !!activeVideo) return;

    let animId: number;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) % cycleDurationMs;
      const progress = elapsed / cycleDurationMs;
      // Linear triangle wave: 0% -> 100% -> 0%
      const pos = progress < 0.5 ? progress * 200 : (1 - progress) * 200;
      sliderPosRef.current = pos;
      setSliderPos(pos);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSwinging, isGameOver, isBroken, activeVideo, cycleDurationMs]);

  // Advance turn round-robin to the next player
  const advanceToNextBatter = useCallback((currentPlayers: Player[], startIdx: number) => {
    const nextIdx = (startIdx + 1) % currentPlayers.length;
    setActivePlayerIdx(nextIdx);
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

  // Execute a timed swing
  const handleSwing = useCallback(
    (targetPos?: number) => {
      if (isSwinging || isGameOver || isBroken) return;
      const currentActive = players[activePlayerIdx];
      if (!currentActive) return;

      const hitPos = typeof targetPos === 'number' ? targetPos : sliderPosRef.current;
      setFrozenSliderPos(hitPos);
      setIsSwinging(true);
      playBatWhoosh();

      const isGoldenBat = currentActive.arrivedAtCastleOrder === 1;

      // Distance from center sweet spot (50%)
      const dist = Math.abs(hitPos - 50);
      let rating: 'critical' | 'great' | 'glance';
      let baseDamage: number;
      let basePoints: number;
      let ratingLabel: string;

      if (dist <= 8) {
        // 🎯 CRITICAL SWEET SPOT (42% - 58%)
        rating = 'critical';
        ratingLabel = '🎯 CRITICAL SWEET SPOT!';
        baseDamage = Math.floor(Math.random() * 8 + 32); // 32 - 40
        basePoints = Math.floor(Math.random() * 80 + 320); // 320 - 400
      } else if (dist <= 22) {
        // 💥 GREAT HIT (28% - 72%)
        rating = 'great';
        ratingLabel = '💥 GREAT HIT!';
        baseDamage = Math.floor(Math.random() * 8 + 18); // 18 - 26
        basePoints = Math.floor(Math.random() * 60 + 170); // 170 - 230
      } else {
        // 🏏 GLANCING TAP (outer edges)
        rating = 'glance';
        ratingLabel = '🏏 GLANCING TAP!';
        baseDamage = Math.floor(Math.random() * 6 + 8); // 8 - 14
        basePoints = Math.floor(Math.random() * 35 + 65); // 65 - 100
      }

      setLastHitRating(rating);

      // Golden Mega Bat deals 2x damage and generates 2x candy points!
      const damage = isGoldenBat ? baseDamage * 2 : baseDamage;
      const points = isGoldenBat ? basePoints * 2 : basePoints;

      setTimeout(() => {
        // Hit lands on the piñata!
        if (rating === 'critical') {
          playCrack();
          playSweetSpotChime();
          fireVictoryConfetti();
          fireChocolateConfetti();
        } else if (rating === 'great') {
          playWhack();
          fireChocolateConfetti();
          if (isGoldenBat) fireVictoryConfetti();
        } else {
          playWhack();
        }

        // Update player candy and swings taken
        const updatedPlayers = players.map((p, idx) => {
          if (idx === activePlayerIdx) {
            return {
              ...p,
              pinataSwings: (p.pinataSwings || 0) + 1,
              pinataCandy: p.pinataCandy + points,
            };
          }
          return p;
        });
        setPlayers(updatedPlayers);

        // Calculate new HP based purely on timing accuracy and damage dealt
        const newHp = Math.max(0, pinataHp - damage);
        setPinataHp(newHp);

        const candyIcons = ['🍫', '🍬', '🍭', '🍩', '✨'];
        const droppedCandies = [
          candyIcons[Math.floor(Math.random() * candyIcons.length)],
          candyIcons[Math.floor(Math.random() * candyIcons.length)],
          ...(rating === 'great' ? ['🍫', '🍬', '✨'] : []),
          ...(rating === 'critical' ? ['🍫', '🍬', '🍭', '🌟', '🍫', '🍩'] : []),
        ];

        setSwingEffect({
          text: isGoldenBat
            ? `🌟 GOLDEN ${ratingLabel.replace('!', '')} +${points} CANDY! 🌟`
            : `${ratingLabel} +${points} CANDY!`,
          points,
          candies: droppedCandies,
          isGolden: isGoldenBat,
          rating,
        });

        // Spontaneous burst when HP reaches 0!
        if (newHp === 0 && !isBroken) {
          setIsBroken(true);
          setPinataHp(0);
          playPinataExplosion();
          fireVictoryConfetti();

          // Award giant finish bonus to active batter who cracked it open!
          const burstBonus = isGoldenBat ? 500 : 300;
          updatedPlayers[activePlayerIdx].pinataCandy += burstBonus;
          setPlayers([...updatedPlayers]);

          setTimeout(() => {
            setActiveVideo({
              src: '/videos/pinata/burst.mp4',
              badge: '💥 PIÑATA BURST! FINALE! 💥',
              badgeBg: 'from-yellow-400 via-orange-500 to-red-600',
              title: `${currentActive.name} Cracked It Open!`,
              subtitle: `The Piñata exploded in a shower of ${burstBonus} bonus candy! 🎉🍬`,
              onComplete: () => {
                handleFinalCelebration(updatedPlayers);
              },
            });
          }, 450);
        } else {
          // Play reaction video based on hit rating
          const hitVideoConfig =
            rating === 'critical'
              ? {
                  src: '/videos/pinata/sweetspot.mp4',
                  badge: '🎯 CRITICAL SWEET SPOT! 🌟',
                  badgeBg: 'from-amber-400 via-yellow-300 to-amber-500 text-stone-950',
                  title: isGoldenBat ? '🌟 GOLDEN MEGA SWEET SPOT! 🌟' : 'Bullseye Sweet Spot!',
                  subtitle: `${currentActive.name} nailed the center for +${points} candy! 🍬💥`,
                }
              : rating === 'great'
              ? {
                  src: '/videos/pinata/great.mp4',
                  badge: '⭐ GREAT HIT! 💥',
                  badgeBg: 'from-sky-400 via-indigo-500 to-purple-600',
                  title: isGoldenBat ? '🌟 GOLDEN GREAT IMPACT! 🌟' : 'Solid Impact!',
                  subtitle: `${currentActive.name} whacked the Piñata for +${points} candy! 🍬`,
                }
              : {
                  src: '/videos/pinata/glance.mp4',
                  badge: '🏏 GLANCING TAP! ⭐',
                  badgeBg: 'from-pink-400 via-rose-500 to-purple-500',
                  title: isGoldenBat ? '🌟 GOLDEN TAP! 🌟' : 'Glancing Tap!',
                  subtitle: `${currentActive.name} clipped the Piñata for +${points} candy! 🍬`,
                };

          setTimeout(() => {
            setActiveVideo({
              ...hitVideoConfig,
              onComplete: () => {
                setIsSwinging(false);
                setFrozenSliderPos(null);
                setLastHitRating(null);
                setSwingEffect(null);
                advanceToNextBatter(updatedPlayers, activePlayerIdx);
              },
            });
          }, 400);
        }
      }, 350);
    },
    [isSwinging, isGameOver, isBroken, activeVideo, players, activePlayerIdx, pinataHp, advanceToNextBatter]
  );

  // Spacebar keyboard listener to swing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const active = players[activePlayerIdx];
        if (active && !active.isBot && !isSwinging && !isGameOver && !isBroken && !activeVideo) {
          e.preventDefault();
          handleSwing();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [players, activePlayerIdx, isSwinging, isGameOver, isBroken, activeVideo, handleSwing]);

  // AI Bot Swing Loop: Bot timing precision scales with berry count!
  useEffect(() => {
    const active = players[activePlayerIdx];
    if (!active || !active.isBot || isSwinging || isGameOver || isBroken || !!activeVideo) {
      return;
    }

    botTimerRef.current = setTimeout(() => {
      const berries = active.berries;
      // 0 berries: 35% sweet spot. 6+ berries: up to 85% sweet spot!
      const sweetSpotChance = Math.min(0.85, 0.35 + berries * 0.08);
      const roll = Math.random();
      let botTargetPos = 50;
      if (roll < sweetSpotChance) {
        // Sweet spot (45% - 55%)
        botTargetPos = 46 + Math.random() * 8;
      } else if (roll < sweetSpotChance + 0.38) {
        // Great hit (32% - 41% or 59% - 68%)
        botTargetPos = Math.random() < 0.5 ? 32 + Math.random() * 9 : 59 + Math.random() * 9;
      } else {
        // Glancing tap (12% - 25% or 75% - 88%)
        botTargetPos = Math.random() < 0.5 ? 12 + Math.random() * 13 : 75 + Math.random() * 13;
      }

      handleSwing(botTargetPos);
    }, 1400);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [players, activePlayerIdx, isSwinging, isGameOver, handleSwing]);

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
          Each player gets 3 timed swings! Use your <strong>Sparkle Berries 🍓</strong> for slow-mo precision to crack open the piñata and claim the candy championship!
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
            onClick={!isSwinging && !isGameOver && activePlayer && !activePlayer.isBot ? () => handleSwing() : undefined}
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

            {/* Crack Overlays based on Durability Percentage */}
            {(pinataHp / maxPinataHp) * 100 <= 70 && !isBroken && (
              <span className="absolute top-2 left-2 text-xl sm:text-2xl animate-pulse">⚡</span>
            )}
            {(pinataHp / maxPinataHp) * 100 <= 35 && !isBroken && (
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
        <div className="w-full max-w-md mb-4">
          <div className="flex justify-between text-xs font-black uppercase text-gray-600 mb-1.5">
            <span>Piñata Durability</span>
            <span className="text-pink-600 font-extrabold">{Math.round((pinataHp / maxPinataHp) * 100)}%</span>
          </div>
          <div className="w-full h-4 bg-pink-100 rounded-full overflow-hidden border-2 border-pink-300 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${Math.round((pinataHp / maxPinataHp) * 100)}%` }}
            />
          </div>
        </div>

        {/* Active Batter Spotlight */}
        {activePlayer && (
          <div
            className={`flex flex-col items-center p-3.5 sm:p-4 rounded-2xl border-2 shadow-sm w-full max-w-md mb-4 transition-all ${
              activePlayer.arrivedAtCastleOrder === 1
                ? 'bg-gradient-to-b from-amber-50/95 via-yellow-50/95 to-white/95 border-amber-300 ring-2 ring-amber-300/60 shadow-amber-200/50'
                : 'bg-white/90 border-purple-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl border-2 border-white shadow-inner flex-shrink-0"
                style={{ backgroundColor: activePlayer.avatarColor + '33' }}
              >
                {activePlayer.avatar}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 block uppercase">
                  Up To Bat:
                </span>
                <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-1.5 truncate">
                  {activePlayer.name} {activePlayer.isBot ? '(AI Bot)' : ''}
                  {activePlayer.arrivedAtCastleOrder === 1 && (
                    <span className="text-[10px] sm:text-xs bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full border border-amber-500 shadow-sm whitespace-nowrap">
                      1st to Castle! 👑
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {/* Golden Mega Bat Active Banner */}
            {activePlayer.arrivedAtCastleOrder === 1 && (
              <div className="mt-2 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-950 px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 shadow-sm animate-pulse border border-yellow-500 text-center">
                <span>🌟</span> WIELDING THE GOLDEN MEGA BAT! 2X POWER & CANDY! <span>🌟</span>
              </div>
            )}

            <div className="mt-2.5 flex items-center justify-between w-full text-xs font-bold bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-200">
              <span className="text-pink-700 flex items-center gap-1.5">
                <span>🏏</span> Up To Bat Now!
              </span>
              <span className="text-amber-700">
                Candy Points: <strong>{activePlayer.pinataCandy}</strong> 🍬
              </span>
            </div>
          </div>
        )}

        {/* 🎯 TIMING HIT METER - Precision slider scaled by Berry Count */}
        <div className="w-full max-w-md mb-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-2 border-pink-300 shadow-md">
          {/* Header & Berry Speed Callout */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-pink-600 animate-pulse" />
              <span className="text-xs sm:text-sm font-black text-gray-800 tracking-wide uppercase">
                Hit Timing Meter
              </span>
            </div>

            {/* Berry Precision Advantage Badge */}
            <div
              className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-sm ${
                berryCount > 0
                  ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-900 border-pink-300'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
              title={
                berryCount > 0
                  ? `Your ${berryCount} Sparkle Berries slow down this slider by ${slowBonusPercent}% for easier Sweet Spot hits!`
                  : 'Collect Sparkle Berries to slow down this slider!'
              }
            >
              <span>🍓</span>
              <span>{berryCount} Berries</span>
              <span>•</span>
              <span className={berryCount > 0 ? 'text-purple-700 font-extrabold' : 'text-gray-500'}>
                {berryCount > 0 ? `${slowBonusPercent}% Slower Slider!` : 'Normal Speed'}
              </span>
            </div>
          </div>

          {/* Interactive Timing Track */}
          <div
            onClick={!isSwinging && !isGameOver && activePlayer && !activePlayer.isBot ? () => handleSwing() : undefined}
            className="relative w-full h-10 sm:h-11 rounded-2xl overflow-hidden border-3 border-purple-400 shadow-inner bg-slate-900 cursor-pointer select-none group"
            title="Time your click when the cursor reaches the center 🎯 Sweet Spot!"
          >
            {/* Background Zone Demarcations */}
            <div className="absolute inset-0 flex h-full w-full pointer-events-none">
              {/* Glancing Left (0% - 28%) */}
              <div className="w-[28%] h-full bg-gradient-to-r from-slate-800 via-indigo-900 to-blue-800 flex items-center justify-start pl-2">
                <span className="text-[9px] sm:text-[10px] font-black text-blue-200/70 tracking-wider">TAP</span>
              </div>

              {/* Great Hit Left (28% - 42%) */}
              <div className="w-[14%] h-full bg-gradient-to-r from-amber-500/80 to-amber-400/90 border-x border-amber-300/40 flex items-center justify-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-950/80">GREAT</span>
              </div>

              {/* 🎯 CRITICAL SWEET SPOT (42% - 58%) */}
              <div className="w-[16%] h-full bg-gradient-to-r from-pink-500 via-yellow-300 to-pink-500 flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                <span className="relative z-10 text-[9px] sm:text-[10px] font-black text-pink-950 tracking-tighter drop-shadow-sm flex items-center gap-0.5 whitespace-nowrap">
                  🎯 SWEET SPOT
                </span>
              </div>

              {/* Great Hit Right (58% - 72%) */}
              <div className="w-[14%] h-full bg-gradient-to-r from-amber-400/90 to-amber-500/80 border-x border-amber-300/40 flex items-center justify-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-950/80">GREAT</span>
              </div>

              {/* Glancing Right (72% - 100%) */}
              <div className="w-[28%] h-full bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-800 flex items-center justify-end pr-2">
                <span className="text-[9px] sm:text-[10px] font-black text-blue-200/70 tracking-wider">TAP</span>
              </div>
            </div>

            {/* Center Bullseye Tick Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-white/90 z-10 shadow-sm pointer-events-none" />

            {/* Moving / Frozen Slider Cursor */}
            <div
              className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center justify-center z-20 transition-all pointer-events-none"
              style={{
                left: `${frozenSliderPos !== null ? frozenSliderPos : sliderPos}%`,
                transition: frozenSliderPos !== null ? 'none' : 'left 0.016s linear',
              }}
            >
              {/* Glow Cursor */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-base sm:text-lg shadow-2xl border-2 border-white transform transition-transform ${
                  frozenSliderPos !== null
                    ? lastHitRating === 'critical'
                      ? 'bg-yellow-400 scale-125 ring-4 ring-yellow-300/80 animate-bounce'
                      : lastHitRating === 'great'
                      ? 'bg-amber-400 scale-115 ring-2 ring-amber-300'
                      : 'bg-blue-400 scale-100 ring-1 ring-blue-300'
                    : 'bg-white/95 scale-105 shadow-yellow-300/50'
                }`}
              >
                {frozenSliderPos !== null ? (
                  lastHitRating === 'critical' ? '🎯' : lastHitRating === 'great' ? '💥' : '🏏'
                ) : (
                  '🏏'
                )}
              </div>
            </div>
          </div>

          {/* Zone Legend & Candy Value Callouts */}
          <div className="mt-2 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-gray-500">
            <div className="flex items-center gap-1 text-slate-600">
              <span>Glancing (60-100🍬)</span>
            </div>
            <div className="flex items-center gap-1 text-amber-700 font-extrabold">
              <span>Great (160-240🍬)</span>
            </div>
            <div className="flex items-center gap-1 text-pink-700 font-black">
              <span>🎯 Sweet Spot (300-400🍬)</span>
            </div>
          </div>

          {/* Active Hit Rating Feedback Banner on Impact */}
          {frozenSliderPos !== null && lastHitRating && (
            <div
              className={`mt-2 py-1 px-3 rounded-xl text-center text-xs font-black shadow-sm flex items-center justify-center gap-2 animate-scale-up ${
                lastHitRating === 'critical'
                  ? 'bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-300 text-yellow-950 border-2 border-yellow-500 ring-2 ring-yellow-400/50'
                  : lastHitRating === 'great'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300'
                  : 'bg-blue-50 text-blue-900 border border-blue-200'
              }`}
            >
              <span>
                {lastHitRating === 'critical'
                  ? '⭐⭐⭐ PERFECT TIMING! CRITICAL SWEET SPOT HIT! 🎯'
                  : lastHitRating === 'great'
                  ? '⭐⭐ GREAT TIMING! SOLID IMPACT! 💥'
                  : '⭐ GLANCING TAP! 🏏'}
              </span>
            </div>
          )}
        </div>

        {/* Swing Action Button */}
        {activePlayer && !activePlayer.isBot ? (
          <button
            type="button"
            onClick={() => handleSwing()}
            disabled={isSwinging || isGameOver || isBroken || !!activeVideo}
            className={`w-full max-w-md py-3.5 sm:py-4 rounded-2xl font-black text-lg sm:text-xl shadow-xl transition transform border-2 border-white/60 flex items-center justify-center gap-3 cursor-pointer ${
              isSwinging || isGameOver || isBroken || !!activeVideo
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : activePlayer.arrivedAtCastleOrder === 1
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-500 hover:via-yellow-500 hover:to-orange-600 text-amber-950 hover:scale-105 active:scale-95 shadow-amber-500/40 ring-2 ring-yellow-300'
                : 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 text-white hover:scale-105 active:scale-95 shadow-pink-500/30'
            }`}
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            <span>
              {isSwinging
                ? 'SWINGING...'
                : activePlayer.arrivedAtCastleOrder === 1
                ? 'TIMED SWING (GOLDEN BAT 🌟🏏)'
                : 'TIMED SWING (HIT 🎯)'}
            </span>
            {!isSwinging && (
              <kbd className="hidden sm:inline-block ml-1 px-2 py-0.5 text-xs font-black bg-white/30 rounded-lg border border-white/40 shadow-inner">
                Space ␣
              </kbd>
            )}
          </button>
        ) : activePlayer && activePlayer.isBot ? (
          <div className="w-full max-w-md py-3.5 bg-purple-100 border-2 border-purple-300 rounded-2xl text-purple-800 font-bold text-center text-base animate-pulse flex items-center justify-center gap-2">
            <span>🤖</span> {activePlayer.name} is lining up a timed swing...
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
              <div className="text-[10px] font-bold text-pink-600">
                🍓 {p.berries} Berries
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Piñata Video Modal (Starter, Glance, Great, Sweet Spot, Burst) */}
      <PinataVideoModal
        isOpen={!!activeVideo}
        videoSrc={activeVideo?.src || ''}
        badge={activeVideo?.badge || ''}
        badgeBg={activeVideo?.badgeBg}
        title={activeVideo?.title || ''}
        subtitle={activeVideo?.subtitle || ''}
        onClose={handleCloseVideo}
      />
    </div>
  );
};
