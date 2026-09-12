import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Player, GameCard, GameLogEntry, LandmarkMeta, PowerType, LandmarkId } from './types/game';
import {
  BOARD_TILES,
  REQUIRED_CHOCOLATES,
  BERRY_FREEZE_COST,
  LANDMARKS,
} from './constants/boardData';
import { createFreshDeck } from './constants/cards';
import { SprinkleBackground } from './components/SprinkleBackground';
import { GameSetup } from './components/GameSetup';
import { GameBoard } from './components/GameBoard';
import { CardDeck } from './components/CardDeck';
import { LandmarkModal } from './components/LandmarkModal';
import { PowerUpModal } from './components/PowerUpModal';
import { DinosaurModal } from './components/DinosaurModal';
import { MoeZoomiesModal } from './components/MoeZoomiesModal';
import { LisbonTramModal } from './components/LisbonTramModal';
import { NyElevatorModal } from './components/NyElevatorModal';
import { PinataGame } from './components/PinataGame';
import { WinnerModal } from './components/WinnerModal';
import { InstructionsModal } from './components/InstructionsModal';
import { GameLog } from './components/GameLog';
import { MusicPlayer } from './components/MusicPlayer';
import {
  playCardFlip,
  playHop,
  playChocolate,
  playBerry,
  playShortcut,
  playFreeze,
  playPowerUp,
  playVictory,
  playSlideToStart,
  setSoundEnabled,
} from './utils/sound';
import {
  fireVictoryConfetti,
  fireChocolateConfetti,
  fireSparkleConfetti,
} from './utils/confetti';
import { Sparkles, BookOpen, Snowflake, RotateCcw, Volume2, VolumeX } from 'lucide-react';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'pinata' | 'won'>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [deck, setDeck] = useState<GameCard[]>([]);
  const [currentCard, setCurrentCard] = useState<GameCard | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [targetTileIndex, setTargetTileIndex] = useState<number | null>(null);
  const [movingPlayerId, setMovingPlayerId] = useState<string | null>(null);
  const [landmarkEvent, setLandmarkEvent] = useState<{ landmark: LandmarkMeta; player: Player } | null>(null);
  const [powerEvent, setPowerEvent] = useState<{ powerType: PowerType; player: Player } | null>(null);
  const [dinosaurEvent, setDinosaurEvent] = useState<{ player: Player } | null>(null);
  const [moeZoomiesEvent, setMoeZoomiesEvent] = useState<{ landmarkId: LandmarkId; player: Player; targetIndex: number } | null>(null);
  const [lisbonTramEvent, setLisbonTramEvent] = useState<{
    player: Player;
    fromIndex: number;
    toIndex: number;
    tramName: string;
    updatedPlayers: Player[];
  } | null>(null);
  const [elevatorEvent, setElevatorEvent] = useState<{
    player: Player;
    fromIndex: number;
    toIndex: number;
    elevatorName: string;
    updatedPlayers: Player[];
  } | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showFreezePicker, setShowFreezePicker] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const botActionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addLog = useCallback((message: string, type: GameLogEntry['type']) => {
    const currentActive = players[activePlayerIndex];
    setLogs((prev) => [
      ...prev.slice(-40),
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        playerId: currentActive?.id || '',
        playerName: currentActive?.name || 'System',
        message,
        type,
      },
    ]);
  }, [players, activePlayerIndex]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Start new game
  const handleStartGame = (initialPlayers: Player[]) => {
    setPlayers(initialPlayers);
    setActivePlayerIndex(0);
    setDeck(createFreshDeck());
    setCurrentCard(null);
    setWinner(null);
    setTargetTileIndex(null);
    setPowerEvent(null);
    setLandmarkEvent(null);
    setLogs([]);
    setGameState('playing');
    addLog(`✨ Welcome to Izzyland! Collect 5 Chocolates to unlock the Piñata Castle!`, 'move');
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // Turn advance helper
  const nextTurn = useCallback((updatedPlayers: Player[], nextIndex: number) => {
    const nextPlayer = updatedPlayers[nextIndex];
    setIsDrawing(false);
    setTargetTileIndex(null);
    setMovingPlayerId(null);
    setCurrentCard(null);

    // Check if the next player is frozen (skip next turn)
    if (nextPlayer.skipNextTurn) {
      playFreeze();
      const thawedPlayers = updatedPlayers.map((p, idx) =>
        idx === nextIndex ? { ...p, skipNextTurn: false } : p
      );
      setPlayers(thawedPlayers);
      addLog(`❄️ ${nextPlayer.name} is Sparkle-Frozen and skipped their turn!`, 'freeze');
      showNotification(`❄️ ${nextPlayer.name} was frozen and skipped their turn!`);

      // Recursively advance to the subsequent player after a short pause
      setTimeout(() => {
        nextTurn(thawedPlayers, (nextIndex + 1) % thawedPlayers.length);
      }, 1200);
      return;
    }

    setActivePlayerIndex(nextIndex);
  }, [addLog]);

  // Cast Sparkle Freeze power
  const handleCastFreeze = (targetPlayerId: string) => {
    const active = players[activePlayerIndex];
    if (active.berries < BERRY_FREEZE_COST) return;

    playFreeze();
    const updated = players.map((p) => {
      if (p.id === active.id) {
        return { ...p, berries: p.berries - BERRY_FREEZE_COST };
      }
      if (p.id === targetPlayerId) {
        return { ...p, skipNextTurn: true };
      }
      return p;
    });

    const target = players.find((p) => p.id === targetPlayerId);
    setPlayers(updated);
    addLog(`❄️ ${active.name} used 2 Berries to Sparkle-Freeze ${target?.name}!`, 'freeze');
    showNotification(`❄️ ${target?.name} will skip their next turn!`);
  };

// Helper to estimate forward tile leap for rubber-banding
function estimateCardMove(card: GameCard, currentIndex: number): number {
  if (card.type === 'dinosaur') {
    return -currentIndex;
  }
  if (card.type === 'power') {
    if (card.powerType === 'taylor') return 4;
    if (card.powerType === 'moe') return 3;
  }
  if (card.type === 'landmark' && card.landmarkId) {
    const lmIndex = LANDMARKS[card.landmarkId].tileIndex;
    return lmIndex - currentIndex;
  }
  if (card.type === 'double' && card.color) {
    let count = 0;
    for (let i = currentIndex + 1; i < BOARD_TILES.length; i++) {
      if (BOARD_TILES[i].color === card.color) {
        count++;
        if (count === 2) return i - currentIndex;
      }
    }
    return BOARD_TILES.length - 1 - currentIndex;
  }
  if (card.color) {
    for (let i = currentIndex + 1; i < BOARD_TILES.length; i++) {
      if (BOARD_TILES[i].color === card.color) {
        return i - currentIndex;
      }
    }
    return BOARD_TILES.length - 1 - currentIndex;
  }
  return 1;
}

  // Card Draw & Movement Execution
  const handleDrawCard = useCallback(() => {
    if (isDrawing || gameState !== 'playing') return;
    setIsDrawing(true);
    playCardFlip();

    let currentDeck = [...deck];
    if (currentDeck.length === 0) {
      currentDeck = createFreshDeck();
      addLog('🔀 Shuffling the sweet card deck!', 'move');
    }

    const activePlayer = players[activePlayerIndex];
    const currentIndex = activePlayer.tileIndex;

    // Rubber-banding / Catch-up: Keep the race close and exciting!
    const otherPlayers = players.filter((_, idx) => idx !== activePlayerIndex);
    const maxOtherTile =
      otherPlayers.length > 0
        ? Math.max(...otherPlayers.map((p) => p.tileIndex))
        : currentIndex;
    const leadAhead = currentIndex - maxOtherTile; // > 0 if this player is leading
    const lagBehind = maxOtherTile - currentIndex; // > 0 if this player is behind

    let chosenCardIndex = 0;
    const sampleSize = Math.min(8, currentDeck.length);

    if (leadAhead >= 7) {
      // Leader is way ahead: pick a moderate single advance card so they don't break away
      let smallestMove = Infinity;
      for (let i = 0; i < sampleSize; i++) {
        // If leader is way ahead (>= 10 tiles) and well down the board, dinosaur is an exciting equalizer!
        if (currentDeck[i].type === 'dinosaur') {
          if (leadAhead >= 10 && currentIndex >= 15 && Math.random() < 0.35) {
            chosenCardIndex = i;
            break;
          }
          continue;
        }
        const move = estimateCardMove(currentDeck[i], currentIndex);
        if (move > 0 && move < smallestMove) {
          smallestMove = move;
          chosenCardIndex = i;
        }
      }
    } else if (lagBehind >= 7) {
      // Trailing player is way behind: give them an exciting catch-up boost (never give them dinosaur)!
      let bestBoost = -Infinity;
      for (let i = 0; i < sampleSize; i++) {
        const card = currentDeck[i];
        if (card.type === 'dinosaur') continue;
        const move = estimateCardMove(card, currentIndex);
        const boostScore =
          move + (card.type === 'power' ? 5 : 0) + (card.type === 'double' ? 4 : 0);
        if (boostScore > bestBoost && move > 0) {
          bestBoost = boostScore;
          chosenCardIndex = i;
        }
      }
    }

    // Don't deal dinosaur if the player is still right at the start (< 3 tiles)
    if (currentIndex < 3 && currentDeck[chosenCardIndex]?.type === 'dinosaur') {
      const nonDinoIdx = currentDeck.findIndex((c) => c.type !== 'dinosaur');
      if (nonDinoIdx !== -1) {
        chosenCardIndex = nonDinoIdx;
      }
    }

    const drawn = currentDeck.splice(chosenCardIndex, 1)[0];
    setDeck(currentDeck);
    setCurrentCard(drawn);

    // 0. Back-to-Start Dinosaur Card!
    if (drawn.type === 'dinosaur') {
      addLog(`🦖 WATCH OUT! ${activePlayer.name} drew the Back-to-Start Dinosaur!`, 'dinosaur');
      showNotification(`🦖 ROAR! Back-to-Start Dinosaur!`);

      // 900ms reveal delay so the 3D card flip completes and players see the card
      setTimeout(() => {
        setDinosaurEvent({ player: activePlayer });
      }, 900);
      return;
    }

    let targetIndex = currentIndex;

    // 1. Power-Up Card (Taylor Swift)
    if (drawn.type === 'power' && drawn.powerType === 'taylor') {
      playPowerUp();
      fireSparkleConfetti();
      targetIndex = Math.min(BOARD_TILES.length - 1, currentIndex + 4);
      activePlayer.berries += 2;
      activePlayer.skipNextTurn = false;
      setPowerEvent({ powerType: 'taylor', player: activePlayer });
      addLog(`🪩 ${activePlayer.name} drew Taylor Swift Bejeweled Boost! +4 Leap & +2 Berries!`, 'power');
      showNotification(`🪩 Taylor Swift Bejeweled Boost!`);
    }
    // 2. Moe Moe Zoomies Landmark Destination Card!
    else if (drawn.type === 'landmark' && drawn.landmarkId) {
      targetIndex = LANDMARKS[drawn.landmarkId].tileIndex;
      addLog(`🐶 ${activePlayer.name} drew ${drawn.name}! Watching Moe's Zoomies adventure! 🎬`, 'landmark');
      showNotification(`🐶 ${drawn.name}! 🎬`);

      // 900ms reveal delay so the 3D card flip completes and players see the Moe card
      setTimeout(() => {
        setMoeZoomiesEvent({
          landmarkId: drawn.landmarkId!,
          player: activePlayer,
          targetIndex,
        });
      }, 900);
      return;
    }
    // 3. Double Color Card
    else if (drawn.type === 'double' && drawn.color) {
      let count = 0;
      for (let i = currentIndex + 1; i < BOARD_TILES.length; i++) {
        if (BOARD_TILES[i].color === drawn.color) {
          count++;
          if (count === 2) {
            targetIndex = i;
            break;
          }
        }
      }
      if (count < 2) {
        targetIndex = BOARD_TILES.length - 1;
      }
      addLog(`⚡ ${activePlayer.name} drew Double ${drawn.color}! Leaping forward!`, 'move');
    }
    // 4. Single Color Card
    else if (drawn.color) {
      for (let i = currentIndex + 1; i < BOARD_TILES.length; i++) {
        if (BOARD_TILES[i].color === drawn.color) {
          targetIndex = i;
          break;
        }
      }
      if (targetIndex === currentIndex) {
        targetIndex = BOARD_TILES.length - 1;
      }
      addLog(`✨ ${activePlayer.name} drew ${drawn.name}! Hopping to tile ${targetIndex}!`, 'move');
    }

    setTargetTileIndex(targetIndex);
    setMovingPlayerId(activePlayer.id);

    // Hop-by-hop animation to destination
    const path: number[] = [];
    if (targetIndex > currentIndex) {
      for (let i = currentIndex + 1; i <= targetIndex; i++) {
        path.push(i);
      }
    } else if (targetIndex < currentIndex) {
      path.push(targetIndex);
    }

    // Reveal delay: Give 900ms for players to enjoy the 3D card flip reveal and target tile highlight
    setTimeout(() => {
      let step = 0;
      const interval = setInterval(() => {
        if (step < path.length) {
          const nextPos = path[step];
          playHop();
          setPlayers((prev) =>
            prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, tileIndex: nextPos } : p))
          );
          step++;
        } else {
          clearInterval(interval);
          handleTileLanding(targetIndex);
        }
      }, 115);
    }, 900);
  }, [isDrawing, gameState, deck, players, activePlayerIndex, addLog]);

  // Spacebar keyboard listener to draw cards during gameplay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field (e.g. setup names)
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        const active = players[activePlayerIndex];
        if (
          gameState === 'playing' &&
          !isDrawing &&
          !landmarkEvent &&
          !powerEvent &&
          !dinosaurEvent &&
          !moeZoomiesEvent &&
          !lisbonTramEvent &&
          !elevatorEvent &&
          active &&
          !active.isBot
        ) {
          e.preventDefault();
          handleDrawCard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isDrawing, landmarkEvent, powerEvent, dinosaurEvent, moeZoomiesEvent, lisbonTramEvent, elevatorEvent, players, activePlayerIndex, handleDrawCard]);

  // Handle actions upon landing on a tile
  const handleTileLanding = (landedIndex: number) => {
    const landedTile = BOARD_TILES[landedIndex];
    let updatedPlayers = [...players];
    let active = { ...updatedPlayers[activePlayerIndex], tileIndex: landedIndex };

    // 1. Collectibles: Chocolate
    if (landedTile.hasChocolate) {
      playChocolate();
      fireChocolateConfetti();
      active.chocolates += 1;
      addLog(`🍫 ${active.name} grabbed a delicious Chocolate Candy! (${active.chocolates}/${REQUIRED_CHOCOLATES})`, 'chocolate');
      showNotification(`🍫 ${active.name} found a Chocolate Candy!`);
    }

    // 2. Collectibles: Berry
    if (landedTile.hasBerry) {
      playBerry();
      fireSparkleConfetti();
      active.berries += 1;
      addLog(`🍓 ${active.name} harvested a Sparkle Berry! (Balance: ${active.berries})`, 'berry');
      showNotification(`🍓 ${active.name} found a Sparkle Berry!`);
    }

    // 3. Shortcuts check (NYC Elevators UP or Lisbon Trams DOWN)
    if (landedTile.shortcut) {
      const sc = landedTile.shortcut;
      if (sc.type === 'elevator') {
        // Trigger NYC Elevator video modal!
        setElevatorEvent({
          player: active,
          fromIndex: landedIndex,
          toIndex: sc.toIndex,
          elevatorName: sc.name,
          updatedPlayers,
        });
        return;
      } else if (sc.type === 'tram') {
        // Trigger Lisbon Tram video modal (chute descent)!
        setLisbonTramEvent({
          player: active,
          fromIndex: landedIndex,
          toIndex: sc.toIndex,
          tramName: sc.name,
          updatedPlayers,
        });
        return;
      } else {
        setTimeout(() => {
          playSlideToStart();
          active.tileIndex = sc.toIndex;
          updatedPlayers[activePlayerIndex] = active;
          setPlayers([...updatedPlayers]);
          addLog(`🛝 Wheee! ${active.name} slid down: ${sc.name} to Tile ${sc.toIndex + 1}!`, 'shortcut');
          showNotification(`🛝 ${sc.name}! Slid down to Tile ${sc.toIndex + 1}!`);
          checkVictoryOrNext(active, updatedPlayers);
        }, 700);
        return;
      }
    }

    // 4. Landmark Discovery popup (except finish)
    if (landedTile.landmark && landedTile.landmark.id !== 'finish') {
      // Award specialty chocolate and sparkle berry from the landmark destination!
      active.chocolates += 1;
      active.berries += 1;
      playChocolate();
      fireChocolateConfetti();
      addLog(`⭐ ${active.name} arrived at ${landedTile.landmark.name}! Earned a specialty chocolate 🍫 & berry 🍓! (${active.chocolates}/${REQUIRED_CHOCOLATES})`, 'landmark');
      showNotification(`⭐ ${landedTile.landmark.name}! Earned a chocolate 🍫 & berry 🍓!`);

      setLandmarkEvent({
        landmark: landedTile.landmark,
        player: active,
      });

      // If bot, automatically close modal after 3.2s and continue turn
      if (active.isBot) {
        setTimeout(() => {
          setLandmarkEvent(null);
          checkVictoryOrNext(active, updatedPlayers);
        }, 3200);
      }
      return;
    }

    checkVictoryOrNext(active, updatedPlayers);
  };

  // Close dinosaur modal and send player back to start (Tile 0)
  const handleCloseDinosaur = () => {
    if (dinosaurEvent) {
      const victim = dinosaurEvent.player;
      setDinosaurEvent(null);
      setIsDrawing(false);
      setTargetTileIndex(null);
      setMovingPlayerId(null);
      playSlideToStart();

      const updatedPlayers = players.map((p, idx) =>
        idx === activePlayerIndex ? { ...p, tileIndex: 0 } : p
      );
      setPlayers(updatedPlayers);

      addLog(`🦖 Oh no! The Back-to-Start Dinosaur chased ${victim.name} all the way back to Start!`, 'dinosaur');
      showNotification(`🦖 ${victim.name} returned to Start!`);

      // Advance turn after slide back to start
      setTimeout(() => {
        const nextIdx = (activePlayerIndex + 1) % updatedPlayers.length;
        nextTurn(updatedPlayers, nextIdx);
      }, 1200);
    }
  };

  // Close Moe Zoomies video modal and execute hop animation to landmark destination
  const handleCloseMoeZoomies = () => {
    if (moeZoomiesEvent) {
      const { targetIndex } = moeZoomiesEvent;
      const activePlayer = players[activePlayerIndex];
      const currentIndex = activePlayer.tileIndex;
      setMoeZoomiesEvent(null);

      setTargetTileIndex(targetIndex);
      setMovingPlayerId(activePlayer.id);

      // Hop-by-hop animation to destination
      const path: number[] = [];
      if (targetIndex > currentIndex) {
        for (let i = currentIndex + 1; i <= targetIndex; i++) {
          path.push(i);
        }
      } else if (targetIndex < currentIndex) {
        path.push(targetIndex);
      }

      let step = 0;
      const interval = setInterval(() => {
        if (step < path.length) {
          const nextPos = path[step];
          playHop();
          setPlayers((prev) =>
            prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, tileIndex: nextPos } : p))
          );
          step++;
        } else {
          clearInterval(interval);
          handleTileLanding(targetIndex);
        }
      }, 100);
    }
  };

  // Close NYC Elevator video modal and rocket pawn up to destination (Ladder)
  const handleCloseElevator = () => {
    if (elevatorEvent) {
      const { player, toIndex, elevatorName, updatedPlayers } = elevatorEvent;
      setElevatorEvent(null);
      playShortcut();
      fireSparkleConfetti();

      player.tileIndex = toIndex;
      const finalPlayers = updatedPlayers.map((p, idx) =>
        idx === activePlayerIndex ? { ...p, tileIndex: toIndex } : p
      );
      setPlayers(finalPlayers);

      addLog(`🛗 Ding! ${player.name} rocketed up the NYC Glass Elevator: ${elevatorName} to Tile ${toIndex + 1}!`, 'shortcut');
      showNotification(`🛗 ${elevatorName}! Rocketed up to Tile ${toIndex + 1}!`);

      checkVictoryOrNext(player, finalPlayers);
    }
  };

  // Close Lisbon Tram video modal and coast pawn down the tramway (Chute)
  const handleCloseLisbonTram = () => {
    if (lisbonTramEvent) {
      const { player, toIndex, tramName, updatedPlayers } = lisbonTramEvent;
      setLisbonTramEvent(null);
      playSlideToStart();

      player.tileIndex = toIndex;
      const finalPlayers = updatedPlayers.map((p, idx) =>
        idx === activePlayerIndex ? { ...p, tileIndex: toIndex } : p
      );
      setPlayers(finalPlayers);

      addLog(`🚃 Ding-ding! ${player.name} coasted down the Lisbon Tram: ${tramName} to Tile ${toIndex + 1}!`, 'shortcut');
      showNotification(`🚃 ${tramName}! Slid down to Tile ${toIndex + 1}!`);

      checkVictoryOrNext(player, finalPlayers);
    }
  };

  // Close landmark modal and continue game
  const handleCloseLandmark = () => {
    if (landmarkEvent) {
      const landedPlayer = landmarkEvent.player;
      setLandmarkEvent(null);
      checkVictoryOrNext(landedPlayer, players);
    }
  };

  // Check victory condition or advance turn
  const checkVictoryOrNext = (active: Player, updatedPlayers: Player[]) => {
    // Reached Castle Gate (Tile 63)?
    if (active.tileIndex >= BOARD_TILES.length - 1) {
      if (active.chocolates >= REQUIRED_CHOCOLATES) {
        // First to reach the castle with 5 chocolates triggers the Piñata Finale!
        active.arrivedAtCastleOrder = 1;
        active.hasWon = true;
        updatedPlayers[activePlayerIndex] = active;
        setPlayers(updatedPlayers);
        playVictory();
        fireVictoryConfetti();
        addLog(`👑 ${active.name} entered Izzy's Castle with all chocolates! IT'S PIÑATA TIME!`, 'win');
        showNotification(`🪅 ${active.name} opened the Castle Gate! PIÑATA FINALE!`);

        setTimeout(() => {
          setGameState('pinata');
        }, 1800);
        return;
      } else {
        // Award Royal Welcome Chocolates! Castle guards give +2 chocolates
        active.chocolates += 2;
        playChocolate();
        fireChocolateConfetti();

        if (active.chocolates >= REQUIRED_CHOCOLATES) {
          // Reached 5+ chocolates with royal gift! Open the gate!
          active.arrivedAtCastleOrder = 1;
          active.hasWon = true;
          updatedPlayers[activePlayerIndex] = active;
          setPlayers(updatedPlayers);
          playVictory();
          fireVictoryConfetti();
          addLog(`👑 Castle Guards gifted ${active.name} +2 Royal Chocolates (${active.chocolates}/${REQUIRED_CHOCOLATES})! The Castle Gate swings open!`, 'win');
          showNotification(`👑 Castle Welcome: +2 Chocolates! Gate UNLOCKED!`);

          setTimeout(() => {
            setGameState('pinata');
          }, 1800);
          return;
        } else {
          // Still need more chocolates: Loop back to tile 54 (which has chocolates at 56, 58, 60, 62)
          showNotification(`👑 Castle Guards gifted +2 Chocolates! Loop around to get the rest!`);
          addLog(`👑 Castle Welcome: ${active.name} received +2 Royal Chocolates (${active.chocolates}/${REQUIRED_CHOCOLATES})! Looping for the final treats!`, 'chocolate');
          active.tileIndex = 54;
          updatedPlayers[activePlayerIndex] = active;
          setPlayers([...updatedPlayers]);
        }
      }
    } else {
      updatedPlayers[activePlayerIndex] = active;
      setPlayers(updatedPlayers);
    }

    // Advance turn after brief pause
    setTimeout(() => {
      const nextIdx = (activePlayerIndex + 1) % updatedPlayers.length;
      nextTurn(updatedPlayers, nextIdx);
    }, 1200);
  };

  // Piñata Finale Completed
  const handleFinishPinata = (rankedPlayers: Player[]) => {
    setPlayers(rankedPlayers);
    setWinner(rankedPlayers[0]);
    setGameState('won');
  };

  // Trade 2 Berries for 1 Chocolate Candy
  const handleTradeBerriesForChocolate = () => {
    const active = players[activePlayerIndex];
    if (!active || active.berries < 2 || active.isBot || gameState !== 'playing' || isDrawing) return;

    playChocolate();
    fireChocolateConfetti();
    const updatedPlayers = players.map((p, idx) => {
      if (idx === activePlayerIndex) {
        return {
          ...p,
          berries: p.berries - 2,
          chocolates: p.chocolates + 1,
        };
      }
      return p;
    });
    setPlayers(updatedPlayers);
    addLog(`🍬 ${active.name} traded 2 Sparkle Berries 🍓 for 1 Sweet Chocolate 🍫! (${active.chocolates + 1}/${REQUIRED_CHOCOLATES})`, 'chocolate');
    showNotification(`🍬 Traded 2 🍓 for 1 🍫! (${active.chocolates + 1}/${REQUIRED_CHOCOLATES})`);
  };

  // AI Bot Turn Automated Execution
  useEffect(() => {
    if (gameState !== 'playing') return;
    const active = players[activePlayerIndex];
    if (!active || !active.isBot || isDrawing || landmarkEvent || powerEvent || dinosaurEvent || moeZoomiesEvent || lisbonTramEvent || elevatorEvent) return;

    botActionTimerRef.current = setTimeout(() => {
      // Bot decision: if bot has >= 2 berries, 60% chance to freeze the leading opponent
      if (active.berries >= BERRY_FREEZE_COST) {
        const potentialTargets = players.filter((p) => p.id !== active.id && !p.skipNextTurn);
        if (potentialTargets.length > 0 && Math.random() < 0.6) {
          potentialTargets.sort((a, b) => b.tileIndex - a.tileIndex);
          handleCastFreeze(potentialTargets[0].id);
        }
      }

      handleDrawCard();
    }, 1400);

    return () => {
      if (botActionTimerRef.current) {
        clearTimeout(botActionTimerRef.current);
      }
    };
  }, [gameState, activePlayerIndex, players, isDrawing, landmarkEvent, powerEvent, dinosaurEvent, moeZoomiesEvent, lisbonTramEvent, elevatorEvent, handleDrawCard]);

  const activePlayer = players[activePlayerIndex] || null;

  const canCastFreeze = Boolean(
    activePlayer &&
    !activePlayer.isBot &&
    activePlayer.berries >= BERRY_FREEZE_COST &&
    players.some((p) => p.id !== activePlayer.id && !p.skipNextTurn)
  );

  const canTradeBerries = Boolean(
    activePlayer &&
    !activePlayer.isBot &&
    activePlayer.berries >= 2 &&
    activePlayer.chocolates < REQUIRED_CHOCOLATES
  );

  return (
    <div className="relative h-full max-h-full w-full flex flex-col items-center justify-between p-1 sm:p-1.5 overflow-hidden select-none overscroll-none">
      <SprinkleBackground />

      {/* Floating Global Banner Notification */}
      {notification && (
        <div className="fixed top-3 z-50 bg-white/95 backdrop-blur-md px-5 py-1.5 rounded-full border-2 border-pink-400 shadow-2xl text-xs sm:text-sm font-black text-pink-700 animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          {notification}
        </div>
      )}

      {/* State 1: Game Setup Screen */}
      {gameState === 'setup' && (
        <div className="relative z-10 w-full h-full flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-touch flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4">
          <GameSetup onStartGame={handleStartGame} />
        </div>
      )}

      {/* State 2: Main Board Game */}
      {gameState === 'playing' && (
        <div className="relative z-10 w-full max-w-[1720px] mx-auto h-full max-h-full flex flex-col gap-1 sm:gap-1.5 overflow-hidden">
          {/* Top Header Bar - Single Non-Wrapping Row */}
          <header className="flex-shrink-0 flex flex-nowrap items-center justify-between gap-1.5 sm:gap-2.5 bg-white/85 backdrop-blur-md px-2.5 sm:px-3.5 py-1 rounded-2xl border-2 border-pink-200 shadow-sm overflow-hidden">
            {/* Logo */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-lg sm:text-xl">✨</span>
              <div>
                <h1 className="text-sm sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 leading-tight">
                  IZZYLAND
                </h1>
                <p className="hidden 2xl:block text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                  Paris • Ibiza • Miami • Buenos Aires • Disney • Transylvania
                </p>
              </div>
            </div>

            {/* Active Turn Banner & Live Player Inventory (Current Player Only) */}
            {activePlayer && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-pink-100/90 via-purple-50/90 to-sky-100/90 border-2 border-pink-300 px-2 sm:px-3 py-1 rounded-xl shadow-inner flex-shrink-0">
                {/* Active Player Info */}
                <div className="flex items-center gap-1.5 pr-1.5 sm:pr-2 border-r border-pink-200">
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-base sm:text-lg shadow-inner border border-white flex-shrink-0"
                    style={{ backgroundColor: activePlayer.avatarColor + '33' }}
                  >
                    {activePlayer.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm font-black text-gray-900 truncate max-w-[70px] sm:max-w-[110px]">
                        {activePlayer.name}
                      </span>
                      {activePlayer.isBot ? (
                        <span className="text-[8px] sm:text-[9px] bg-purple-200 text-purple-800 font-extrabold px-1 py-0.2 rounded">
                          BOT
                        </span>
                      ) : (
                        <span className="text-[8px] sm:text-[9px] bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black px-1.5 py-0.2 rounded-full shadow-sm animate-pulse">
                          TURN ✨
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-gray-500">
                      <span>Tile {activePlayer.tileIndex}/63</span>
                      {activePlayer.skipNextTurn && (
                        <span className="text-[8px] text-sky-700 font-black bg-sky-100 px-1 rounded">
                          ❄️ FROZEN
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chocolates Collection Progress (Compact) */}
                <div className="flex items-center gap-1 px-1 sm:px-1.5 border-r border-pink-200">
                  <span className="text-sm sm:text-base">🍫</span>
                  <span className="text-xs sm:text-sm font-black text-amber-900">
                    {activePlayer.chocolates}/{REQUIRED_CHOCOLATES}
                  </span>
                  {activePlayer.chocolates >= REQUIRED_CHOCOLATES && (
                    <span className="text-[8px] sm:text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300 animate-pulse whitespace-nowrap">
                      KEY 🔑
                    </span>
                  )}
                </div>

                {/* Sparkle Berries */}
                <div className="flex items-center gap-0.5 text-xs sm:text-sm font-black text-pink-700">
                  <span className="text-sm sm:text-base">🍓</span>
                  <span>x{activePlayer.berries}</span>
                </div>

                {/* Quick Actions (Freeze & Trade) for Active Human Player */}
                {!activePlayer.isBot && (canCastFreeze || canTradeBerries) && (
                  <div className="flex items-center gap-1 pl-1.5 border-l border-pink-200">
                    {canTradeBerries && (
                      <button
                        type="button"
                        onClick={handleTradeBerriesForChocolate}
                        className="px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-[9px] sm:text-[11px] rounded-lg shadow-sm hover:shadow transition active:scale-95 flex items-center gap-0.5 cursor-pointer border border-amber-300"
                        title="Trade 2 Berries for 1 Chocolate"
                      >
                        <span>🍬 2🍓➔1🍫</span>
                      </button>
                    )}

                    {canCastFreeze && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowFreezePicker((prev) => !prev)}
                          className="px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white font-black text-[9px] sm:text-[11px] rounded-lg shadow-sm hover:shadow transition active:scale-95 flex items-center gap-0.5 cursor-pointer"
                          title="Freeze an Opponent"
                        >
                          <Snowflake className="w-3 h-3 text-sky-200" />
                          <span>Freeze ❄️</span>
                        </button>
                        {showFreezePicker && (
                          <div className="absolute right-0 top-full mt-2 flex flex-col gap-1 bg-white p-2 rounded-2xl shadow-2xl border-2 border-sky-300 z-50 min-w-[160px] animate-scale-up">
                            <span className="text-[10px] font-black text-sky-800 uppercase tracking-wider px-1">
                              Freeze Opponent (-2🍓):
                            </span>
                            {players
                              .filter((p) => p.id !== activePlayer.id && !p.skipNextTurn)
                              .map((target) => (
                                <button
                                  key={target.id}
                                  type="button"
                                  onClick={() => {
                                    handleCastFreeze(target.id);
                                    setShowFreezePicker(false);
                                  }}
                                  className="px-2 py-1.5 hover:bg-sky-50 text-gray-800 font-extrabold text-xs rounded-xl transition flex items-center gap-2 text-left cursor-pointer border border-transparent hover:border-sky-200"
                                >
                                  <span className="text-base">{target.avatar}</span>
                                  <span className="truncate">{target.name}</span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Right Header: Music Player & Game Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Single Official Music Player at the top */}
              <MusicPlayer autoPlay={true} isPausedByModal={!!dinosaurEvent || !!moeZoomiesEvent || !!lisbonTramEvent || !!elevatorEvent} />

              {/* Sound Effects Toggle */}
              <button
                type="button"
                onClick={handleToggleSound}
                className="p-1.5 sm:p-2 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 transition border border-pink-200 cursor-pointer"
                title={soundOn ? 'Mute Sound Effects' : 'Enable Sound Effects'}
              >
                {soundOn ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />}
              </button>

              {/* Instructions / Rules Modal Button */}
              <button
                type="button"
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition border shadow-sm cursor-pointer bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 text-amber-900 border-amber-300 active:scale-95"
                title="View Game Rules & Instructions"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Rules 📖</span>
                <span className="sm:hidden">📖</span>
              </button>

              {/* Start New Game Button */}
              <button
                type="button"
                onClick={() => setGameState('setup')}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition border shadow-sm cursor-pointer bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-900 border-purple-300 active:scale-95"
                title="Start New Game"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-700" />
                <span className="hidden sm:inline">New Game</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </header>

          {/* Main Play Area - Spacious Board-First Design */}
          <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row gap-1.5 sm:gap-2 items-center lg:items-stretch justify-center overflow-hidden">
            {/* Primary Focus: Large Game Board */}
            <div className="flex-1 min-h-0 min-w-0 h-full max-h-full w-full flex items-center justify-center overflow-hidden order-1">
              <GameBoard
                tiles={BOARD_TILES}
                players={players}
                activePlayerIndex={activePlayerIndex}
                targetTileIndex={targetTileIndex}
                movingPlayerId={movingPlayerId}
              />
            </div>

            {/* Side Console on Desktop & iPad: Card Deck + Live Game Log */}
            <div className="w-full lg:w-60 xl:w-72 flex-shrink-0 h-auto lg:h-full max-h-full flex flex-row lg:flex-col gap-2 overflow-hidden order-2 justify-center items-center lg:items-stretch">
              {/* Card Deck Area */}
              <div className="w-auto lg:w-full flex-shrink-0 flex flex-col items-center">
                {activePlayer && (
                  <CardDeck
                    currentCard={currentCard}
                    activePlayer={activePlayer}
                    deckCount={deck.length}
                    isDrawing={isDrawing}
                    onDrawCard={handleDrawCard}
                    isBotTurn={activePlayer.isBot}
                  />
                )}
              </div>

              {/* Live Game Log */}
              <div className="flex-1 min-h-0 min-w-0 w-full flex-col overflow-hidden hidden md:flex">
                <GameLog entries={logs} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State 3: Grand Piñata Finale Minigame */}
      {gameState === 'pinata' && (
        <div className="relative z-10 w-full h-full flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-touch flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4">
          <PinataGame
            initialPlayers={players}
            onFinishPinata={handleFinishPinata}
          />
        </div>
      )}

      {/* State 4: Victory / Winner Screen Modal */}
      {gameState === 'won' && winner && (
        <WinnerModal
          winner={winner}
          allPlayers={players}
          onPlayAgain={() => {
            setGameState('setup');
          }}
        />
      )}

      {/* State 5: Instructions Modal Popup */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* Landmark Modal Popup */}
      <LandmarkModal
        landmark={landmarkEvent?.landmark || null}
        playerName={landmarkEvent?.player.name || ''}
        onClose={handleCloseLandmark}
      />

      {/* Power-Up Modal Popup */}
      <PowerUpModal
        powerType={powerEvent?.powerType || null}
        playerName={powerEvent?.player.name || ''}
        onClose={() => setPowerEvent(null)}
      />

      {/* Dinosaur Back-to-Start Video Modal */}
      <DinosaurModal
        isOpen={!!dinosaurEvent}
        player={dinosaurEvent?.player || null}
        onClose={handleCloseDinosaur}
      />

      {/* Moe Moe Zoomies Video Modal */}
      <MoeZoomiesModal
        isOpen={!!moeZoomiesEvent}
        landmarkId={moeZoomiesEvent?.landmarkId || null}
        player={moeZoomiesEvent?.player || null}
        onClose={handleCloseMoeZoomies}
      />

      {/* Lisbon Tram Video Modal */}
      <LisbonTramModal
        isOpen={!!lisbonTramEvent}
        player={lisbonTramEvent?.player || null}
        fromTile={(lisbonTramEvent?.fromIndex ?? 0) + 1}
        toTile={(lisbonTramEvent?.toIndex ?? 0) + 1}
        tramName={lisbonTramEvent?.tramName || 'Lisbon Tram'}
        onClose={handleCloseLisbonTram}
      />

      {/* NYC Elevator Video Modal */}
      <NyElevatorModal
        isOpen={!!elevatorEvent}
        player={elevatorEvent?.player || null}
        fromTile={(elevatorEvent?.fromIndex ?? 0) + 1}
        toTile={(elevatorEvent?.toIndex ?? 0) + 1}
        elevatorName={elevatorEvent?.elevatorName || 'NYC Glass Elevator'}
        onClose={handleCloseElevator}
      />
    </div>
  );
};

export default App;
