import React, { useState, useEffect } from 'react';
import { Dumbbell } from 'lucide-react';
import { motion } from 'motion/react';

const MOTIVATIONAL_MESSAGES = [
  'Discipline beats motivation.',
  'Track the work. Trust the process.',
  'Small progress. Every single day.',
  'Build the body. Build the mindset.',
  'Preparing your workout...',
  'Building your nutrition plan...',
  'Analyzing your progress...',
  'Stay consistent. Results follow.'
];

export const LoadingScreen: React.FC<{ message?: string }> = ({ message }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (message) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [message]);

  const currentText = message || MOTIVATIONAL_MESSAGES[index];

  return (
    <div id="fittrack-loading-screen" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center">
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl"
      >
        <Dumbbell className="h-10 w-10 text-red-600" />
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
        </span>
      </motion.div>

      <div className="max-w-md">
        <h2 className="text-2xl font-bold tracking-widest text-white uppercase font-athletic flex items-center justify-center gap-2">
          FIT<span className="text-red-600">TRACK</span>
        </h2>
        
        <motion.div
          key={currentText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="mt-4"
        >
          <p className="text-lg font-semibold text-zinc-300 italic tracking-wide">
            "{currentText}"
          </p>
        </motion.div>
      </div>

      <div className="mt-8 w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-1/2 h-full bg-red-600 rounded-full"
        />
      </div>
    </div>
  );
};
