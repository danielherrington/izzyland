import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface MusicPlayerProps {
  autoPlay?: boolean;
  isPausedByModal?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  autoPlay = false,
  isPausedByModal = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const wasPlayingBeforeModal = useRef<boolean>(false);
  const [volume, setVolume] = useState<number>(0.4);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  useEffect(() => {
    const audio = new Audio('/izzyland_song.mp3');
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Attempt autoplay on user first interaction
  useEffect(() => {
    if (autoPlay && !isPlaying && !hasInteracted && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch(() => {
            // Autoplay was blocked by browser policy until user clicks
          });
      }
    }
  }, [autoPlay, isPlaying, hasInteracted]);

  // Pause music temporarily when modal (e.g. Dinosaur video) requests it
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPausedByModal) {
      if (isPlaying) {
        wasPlayingBeforeModal.current = true;
        audioRef.current.pause();
      }
    } else {
      if (wasPlayingBeforeModal.current) {
        wasPlayingBeforeModal.current = false;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isPausedByModal, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    setHasInteracted(true);
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-3 py-1.5 rounded-2xl border-2 border-pink-300 shadow-sm">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`p-2 rounded-xl text-white font-bold transition transform active:scale-95 flex items-center justify-center cursor-pointer shadow-md ${
          isPlaying
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
            : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
        }`}
        title={isPlaying ? 'Pause Izzyland Song' : 'Play Izzyland Song'}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Song Info & Animated Equalizer */}
      <div className="flex flex-col min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-pink-600 animate-bounce" />
          <span className="text-[11px] font-black text-pink-800 truncate">
            Izzyland Song
          </span>
        </div>

        {/* Equalizer Waveform Bars */}
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-2.5 mt-0.5">
            <span className="w-1 bg-pink-500 rounded-full h-full animate-pulse" />
            <span className="w-1 bg-purple-500 rounded-full h-2/3 animate-bounce" />
            <span className="w-1 bg-yellow-400 rounded-full h-full animate-ping" />
            <span className="w-1 bg-sky-400 rounded-full h-1/2 animate-pulse" />
          </div>
        ) : (
          <span className="text-[9px] font-bold text-gray-400">Paused</span>
        )}
      </div>

      {/* Volume Slider & Mute Toggle */}
      <div className="hidden xl:flex items-center gap-1 pl-1 border-l border-pink-200">
        <button
          type="button"
          onClick={toggleMute}
          className="text-pink-600 hover:text-pink-800 transition cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            setIsMuted(false);
          }}
          className="w-12 h-1.5 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
          title="Music Volume"
        />
      </div>
    </div>
  );
};
