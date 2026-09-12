import React, { useRef, useEffect, useState } from 'react';
import type { Player } from '../types/game';
import { Volume2, VolumeX, FastForward, Sparkles } from 'lucide-react';

interface LisbonTramModalProps {
  isOpen: boolean;
  player: Player | null;
  fromTile: number;
  toTile: number;
  tramName: string;
  onClose: () => void;
}

export const LisbonTramModal: React.FC<LisbonTramModalProps> = ({
  isOpen,
  player,
  fromTile,
  toTile,
  tramName,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-amber-950/80 to-stone-950 rounded-3xl p-4 sm:p-5 shadow-2xl border-4 border-amber-400 text-center transform animate-scale-up overflow-hidden flex flex-col items-center">
        {/* Decorative Glows */}
        <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-amber-500/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-yellow-400/20 blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 mb-2 shadow-lg animate-pulse border border-white/40">
          <span>🚃</span> DING-DING! LISBON TRAM DESCENT! <span>🇵🇹</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-md mb-0.5 flex items-center gap-2 justify-center">
          <span>🚃</span> {tramName} <span>🐾</span>
        </h2>

        {/* Cheer Subtitle */}
        <p className="text-xs sm:text-sm font-extrabold text-amber-100/90 mb-3 max-w-md leading-snug">
          Hold on tight, <span className="text-yellow-300 underline decoration-wavy">{player.name}</span>! Coasting down the scenic Lisbon hills with Moe! 🚃💨
        </p>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-amber-300/60 shadow-2xl bg-black mb-3">
          <video
            ref={videoRef}
            src="/videos/lisbon_tram.mp4"
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
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>

        {/* Bottom Actions: Route and Skip Button */}
        <div className="w-full flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-200/90">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Tile {fromTile} ➔ Tile {toTile} (-{Math.abs(toTile - fromTile)} Tiles! 🛝)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 active:scale-95 text-stone-950 font-black text-xs sm:text-sm rounded-xl border border-amber-200 transition shadow-md cursor-pointer"
          >
            <span>Skip</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
