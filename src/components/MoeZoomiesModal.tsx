import React, { useRef, useEffect, useState } from 'react';
import type { Player, LandmarkId } from '../types/game';
import { Volume2, VolumeX, FastForward, Sparkles } from 'lucide-react';

interface MoeZoomiesModalProps {
  isOpen: boolean;
  landmarkId: LandmarkId | null;
  player: Player | null;
  onClose: () => void;
}

const MOE_VIDEOS: Record<
  string,
  {
    name: string;
    icon: string;
    video: string;
    cheer: string;
    border: string;
    glow: string;
    textColor: string;
  }
> = {
  miami: {
    name: 'Miami Boulevard',
    icon: '🌴',
    video: '/videos/miami.mp4',
    cheer: 'Cruising down sunny Ocean Drive with Moe! 🌴🐾',
    border: 'border-cyan-400',
    glow: 'bg-cyan-500/30',
    textColor: 'text-cyan-300',
  },
  buenos_aires: {
    name: 'Buenos Aires Tango Plaza',
    icon: '💃',
    video: '/videos/buenos_aires.mp4',
    cheer: 'Dancing the tango and eating alfajores with Moe! 💃🐾',
    border: 'border-sky-400',
    glow: 'bg-sky-500/30',
    textColor: 'text-sky-300',
  },
  paris: {
    name: 'Paris Eiffel Tower',
    icon: '🥐',
    video: '/videos/paris.mp4',
    cheer: 'Zooming by the Eiffel Tower with sweet croissants! 🥐🐾',
    border: 'border-pink-400',
    glow: 'bg-pink-500/30',
    textColor: 'text-pink-300',
  },
  ibiza: {
    name: 'Ibiza Beach Club',
    icon: '🎧',
    video: '/videos/ibiza.mp4',
    cheer: 'Dropping the candy party beats in Ibiza with Moe! 🎧🐾',
    border: 'border-orange-400',
    glow: 'bg-orange-500/30',
    textColor: 'text-orange-300',
  },
  transylvania: {
    name: 'Transylvania Spooky Castle',
    icon: '🧛',
    video: '/videos/transylvania.mp4',
    cheer: 'Zooming through the mysterious vampire castle with Moe! 🧛🐾',
    border: 'border-purple-400',
    glow: 'bg-purple-500/30',
    textColor: 'text-purple-300',
  },
  disney: {
    name: 'Disney Magic Kingdom',
    icon: '🏰',
    video: '/videos/disney.mp4',
    cheer: 'Magical castle fireworks & fairytale zoomies with Moe! 🏰🐾',
    border: 'border-blue-400',
    glow: 'bg-blue-500/30',
    textColor: 'text-blue-300',
  },
};

export const MoeZoomiesModal: React.FC<MoeZoomiesModalProps> = ({
  isOpen,
  landmarkId,
  player,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const hasStartedRef = useRef(false);

  const locInfo = landmarkId && MOE_VIDEOS[landmarkId] ? MOE_VIDEOS[landmarkId] : null;

  useEffect(() => {
    if (!isOpen || !locInfo) {
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

    // Safety timeout: automatically close after 12 seconds if video ends or stalls
    const timeout = setTimeout(() => {
      onCloseRef.current();
    }, 12000);

    return () => clearTimeout(timeout);
  }, [isOpen, locInfo]);

  if (!isOpen || !player || !locInfo) return null;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div
        className={`relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-purple-950 to-stone-950 rounded-3xl p-4 sm:p-5 shadow-2xl border-4 ${locInfo.border} text-center transform animate-scale-up overflow-hidden flex flex-col items-center`}
      >
        {/* Decorative Glows */}
        <div
          className={`absolute -top-16 -left-16 w-40 h-40 rounded-full ${locInfo.glow} blur-3xl pointer-events-none`}
        />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-white mb-2 shadow-lg animate-pulse border border-white/40">
          <span>🐶</span> MOE MOE ZOOMIES! <span>🐾</span>
        </div>

        {/* Title */}
        <h2 className={`text-2xl sm:text-3xl font-black ${locInfo.textColor} drop-shadow-md mb-0.5 flex items-center gap-2 justify-center`}>
          <span>{locInfo.icon}</span> {locInfo.name} <span>{locInfo.icon}</span>
        </h2>

        {/* Cheer Subtitle */}
        <p className="text-xs sm:text-sm font-extrabold text-amber-100/90 mb-3 max-w-md leading-snug">
          Hold on tight, <span className="text-yellow-300 underline decoration-wavy">{player.name}</span>! {locInfo.cheer}
        </p>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black mb-3">
          <video
            ref={videoRef}
            src={locInfo.video}
            playsInline
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
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>

        {/* Bottom Actions: Skip Button */}
        <div className="w-full flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-200/80">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Zooming straight to {locInfo.name}!</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl border border-white/30 transition shadow-md cursor-pointer"
          >
            <span>Skip</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
