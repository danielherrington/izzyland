import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, FastForward } from 'lucide-react';

interface PinataVideoModalProps {
  isOpen: boolean;
  videoSrc: string;
  badge: string;
  badgeBg?: string;
  title: string;
  subtitle: string;
  onClose: () => void;
}

export const PinataVideoModal: React.FC<PinataVideoModalProps> = ({
  isOpen,
  videoSrc,
  badge,
  badgeBg = 'from-amber-400 via-pink-500 to-purple-600',
  title,
  subtitle,
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
        console.warn('Piñata video unmuted autoplay prevented, muting:', err);
        video.muted = true;
        setIsMuted(true);
        video.play().catch(console.error);
      });
    }

    // Safety timeout: automatically close after 5 seconds if video ends or stalls
    const timeout = setTimeout(() => {
      onCloseRef.current();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isOpen, videoSrc]);

  if (!isOpen) return null;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-purple-950 to-stone-950 rounded-3xl p-4 sm:p-5 shadow-2xl border-4 border-pink-400 text-center transform animate-scale-up overflow-hidden flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glows */}
        <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-pink-500/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-yellow-400/20 blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r ${badgeBg} text-white mb-2 shadow-lg animate-pulse border border-white/40`}
        >
          {badge}
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-md mb-0.5">
          {title}
        </h2>

        {/* Cheer Subtitle */}
        <p className="text-xs sm:text-sm font-extrabold text-pink-100/90 mb-3 max-w-md leading-snug">
          {subtitle}
        </p>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-pink-300/60 shadow-2xl bg-black mb-3">
          <video
            ref={videoRef}
            src={videoSrc}
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
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>

        {/* Bottom Actions: Skip Button */}
        <div className="w-full flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black uppercase tracking-wider transition active:scale-95 border border-white/30 cursor-pointer"
          >
            <span>Skip</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
