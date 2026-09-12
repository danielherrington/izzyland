import React, { useRef, useEffect, useState } from 'react';
import type { Player } from '../types/game';
import { Volume2, VolumeX, FastForward, Sparkles } from 'lucide-react';

interface NyElevatorModalProps {
  isOpen: boolean;
  player: Player | null;
  fromTile: number;
  toTile: number;
  elevatorName: string;
  onClose: () => void;
}

export const NyElevatorModal: React.FC<NyElevatorModalProps> = ({
  isOpen,
  player,
  fromTile,
  toTile,
  elevatorName,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [_hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasPlayed(false);
      return;
    }

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.volume = 1.0;
      video.muted = false;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setHasPlayed(true);
          })
          .catch((err) => {
            console.warn('Unmuted autoplay prevented by browser policy, muting:', err);
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setHasPlayed(true)).catch(console.error);
          });
      }
    }

    // Safety timeout: automatically close after 12 seconds if video ends or stalls
    const timeout = setTimeout(() => {
      onClose();
    }, 12000);

    return () => clearTimeout(timeout);
  }, [isOpen, onClose]);

  if (!isOpen || !player) return null;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const tilesGained = toTile - fromTile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-sky-950/85 to-stone-950 rounded-3xl p-4 sm:p-5 shadow-2xl border-4 border-sky-400 text-center transform animate-scale-up overflow-hidden flex flex-col items-center">
        {/* Decorative Glows */}
        <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-sky-500/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white mb-2 shadow-lg animate-pulse border border-white/40">
          <span>🛗</span> DING! NYC SKY ELEVATOR! <span>🏙️</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-sky-300 drop-shadow-md mb-0.5 flex items-center gap-2 justify-center">
          <span>🛗</span> {elevatorName} <span>🐾</span>
        </h2>

        {/* Cheer Subtitle */}
        <p className="text-xs sm:text-sm font-extrabold text-sky-100/90 mb-3 max-w-md leading-snug">
          Going UP! <span className="text-yellow-300 underline decoration-wavy">{player.name}</span> is riding the express glass elevator with Moe! 🛗🚀
        </p>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-sky-300/60 shadow-2xl bg-black mb-3">
          <video
            ref={videoRef}
            src="/videos/ny_elevator.mp4"
            playsInline
            autoPlay
            onEnded={onClose}
            className="w-full h-full object-cover"
          />

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition border border-white/20 active:scale-95 cursor-pointer z-10"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-sky-400" />
            )}
          </button>
        </div>

        {/* Bottom Actions: Route and Skip Button */}
        <div className="w-full flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-black text-sky-200/90">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Tile {fromTile} ➔ Tile {toTile} (+{tilesGained} Tiles! 🚀)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl border border-sky-300 transition shadow-md cursor-pointer"
          >
            <span>Skip</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
