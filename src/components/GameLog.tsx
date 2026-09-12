import React, { useRef, useEffect } from 'react';
import type { GameLogEntry } from '../types/game';
import { ScrollText } from 'lucide-react';

interface GameLogProps {
  entries: GameLogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ entries }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="w-full bg-white/85 backdrop-blur-md rounded-2xl border-2 border-pink-200 shadow-sm p-2.5 sm:p-3 flex flex-col min-h-0 flex-1 overflow-hidden">
      <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-pink-700 mb-1.5 flex-shrink-0">
        <ScrollText className="w-4 h-4" /> Live Adventure Log
      </div>
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 text-xs text-gray-700 font-medium"
      >
        {entries.length === 0 ? (
          <p className="text-gray-400 italic">Game has started! Draw a card to begin.</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`p-1.5 rounded-lg border flex items-start gap-1.5 leading-relaxed ${
                entry.type === 'win'
                  ? 'bg-yellow-100/80 border-yellow-300 text-yellow-950 font-bold'
                  : entry.type === 'chocolate'
                  ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold'
                  : entry.type === 'freeze'
                  ? 'bg-sky-50 border-sky-200 text-sky-900 font-bold'
                  : entry.type === 'shortcut'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                  : entry.type === 'landmark'
                  ? 'bg-purple-50 border-purple-200 text-purple-900 font-bold'
                  : 'bg-white/60 border-gray-100 text-gray-700'
              }`}
            >
              <span className="flex-1">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
