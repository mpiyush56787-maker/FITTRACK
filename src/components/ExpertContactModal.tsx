import React from 'react';
import { MessageCircle, ShieldCheck, X, Dumbbell, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpertContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpertContactModal: React.FC<ExpertContactModalProps> = ({ isOpen, onClose }) => {
  const WHATSAPP_NUMBER = '917206125905';
  const DISPLAY_NUMBER = '+91 7206125905';
  const WHATSAPP_MESSAGE = encodeURIComponent(
    'Hi Coach! I am using FITTRACK and would love expert guidance on my workout and nutrition journey.'
  );
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="expert-contact-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-[#1a1b20] p-6 shadow-2xl text-white"
        >
          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-red-500 font-athletic">
                Direct Expert Access • 100% Free
              </span>
            </div>
            <button
              id="close-expert-modal-btn"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#252630] hover:text-white transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/70 border border-red-800/60 text-red-500">
              <MessageCircle className="h-9 w-9" />
            </div>

            <h3 className="mt-4 text-2xl font-bold font-athletic text-white uppercase">
              TALK TO AN EXPERT
            </h3>
            
            <p className="mt-2 text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
              Need help with your fitness journey? Connect with our dedicated certified fitness expert for custom guidance.
            </p>
          </div>

          {/* Expert consultation highlights */}
          <div className="mt-6 space-y-2.5 rounded-xl bg-[#22232a] p-4 border border-zinc-750 text-xs text-zinc-300">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-red-500 shrink-0" />
              <span>Personalized Indian diet tweaks & vegetarian protein advice</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Dumbbell className="h-4 w-4 text-red-500 shrink-0" />
              <span>Workout split critique & exercise form video reviews</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Award className="h-4 w-4 text-red-500 shrink-0" />
              <span>Plateau busting, progressive overload cues & recovery support</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <a
              id="whatsapp-chat-now-btn"
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full rounded-xl bg-emerald-600 py-3.5 px-5 font-bold font-athletic text-xs uppercase text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
            >
              <MessageCircle className="h-5 w-5 fill-current" />
              <span>CHAT ON WHATSAPP ({DISPLAY_NUMBER})</span>
            </a>

            <button
              id="maybe-later-btn"
              onClick={onClose}
              className="w-full rounded-xl bg-[#252630] border border-zinc-700 py-2.5 text-xs font-bold font-athletic uppercase text-zinc-300 hover:bg-[#2e303c] hover:text-white transition cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>

          <p className="mt-4 text-center text-[11px] text-zinc-500">
            Official support line: {DISPLAY_NUMBER} • Always included free for FITTRACK athletes
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
