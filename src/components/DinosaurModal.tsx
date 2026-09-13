import React, { useRef, useEffect, useState } from 'react';
import type { Player } from '../types/game';
import { Volume2, VolumeX, FastForward } from 'lucide-react';

interface DinosaurModalProps {
  isOpen: boolean;
  player: Player | null;
  onClose: () => void;
}

export const DinosaurModal: React.FC<DinosaurModalProps> = ({
  isOpen,
  player,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      hasStartedRef.current = false;
      return;
    }

    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.volume = 1.0;
      video.muted = false;

      video.play().catch((err) => {
        console.warn('Unmuted autoplay prevented by browser policy, muting:', err);
        video.muted = true;
        setIsMuted(true);
        video.play().catch(console.error);
      });
    }

    // Safety timeout: automatically close after 6.5 seconds if video ends or stalls
    const timeout = setTimeout(() => {
      onCloseRef.current();
    }, 6500);

    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!isOpen || !player) return null;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-amber-950 to-stone-950 rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-red-500 text-center transform animate-scale-up overflow-hidden flex flex-col items-center">
        {/* Decorative Dinosaur Glows */}
        <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full bg-red-600/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-amber-500/30 blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider bg-red-600 text-white mb-2 shadow-lg animate-pulse border border-red-400">
          <span className="text-base">🦖</span> WATCH OUT! DINOSAUR ATTACK! <span className="text-base">🦖</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)] mb-1">
          ROAAAR! BACK TO START!
        </h2>

        {/* Victim Subtitle */}
        <p className="text-sm sm:text-base font-extrabold text-amber-100/90 mb-3">
          Oh no, <span className="text-yellow-400 underline decoration-wavy">{player.name}</span>! The dinosaur is chasing you all the way back to Start!
        </p>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-3 border-amber-400/80 shadow-2xl bg-black mb-4">
          <video
            ref={videoRef}
            src="/dinosaur.mp4"
            playsInline
            onEnded={onClose}
            className="w-full h-full object-cover"
          />

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm border border-white/30 transition cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          </button>
        </div>

        {/* Action Controls */}
        <div className="w-full flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-amber-200/80 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Returning to Start...
          </span>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer border border-amber-300 flex items-center gap-1.5"
          >
            <span>Skip</span>
            <FastForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
