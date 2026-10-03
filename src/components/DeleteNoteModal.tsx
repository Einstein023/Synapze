import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Archive, X, Sprout, Leaf } from 'lucide-react';

export interface DeleteNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  noteTitle: string;
  noteSnippet?: string;
  noteTags?: string[];
  onArchiveInstead?: () => Promise<void> | void;
  isDraft?: boolean;
}

export const DeleteNoteModal: React.FC<DeleteNoteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  noteTitle,
  noteSnippet,
  noteTags = [],
  onArchiveInstead,
  isDraft = false
}) => {
  // Listen for Escape key to close, Enter key to confirm
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        // Prevent accidental form submissions
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Subtle warm backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#162e29]/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Container adhering strictly to the botanical Synapze design system */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="relative w-full max-w-md bg-[#faf9f6] rounded-[2rem] border border-[#203d36]/15 shadow-2xl p-6 sm:p-7 text-left overflow-hidden z-10 flex flex-col gap-5 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient subtle garden glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#fdda64]/15 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#cae9d5]/25 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

            {/* Header row with close button */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#eed052]/20 border border-[#eed052]/40 text-[#453712] flex items-center justify-center shadow-xs">
                  <Sprout className="w-6 h-6 text-[#203d36]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#203d36] tracking-tight leading-tight">
                    {isDraft ? 'Discard Draft?' : 'Compost Note?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c6e66] font-sans font-medium mt-0.5">
                    {isDraft 
                      ? 'Discard unsaved thoughts from your workspace.'
                      : 'Pruning helps your intellectual garden flourish.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#5c6e66] hover:text-[#203d36] hover:bg-[#203d36]/5 rounded-xl transition-colors cursor-pointer shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note Preview Card (cozy brand aesthetic) */}
            <div className="relative z-10 p-4 bg-white/90 border border-[#203d36]/10 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#eed052]" />
                <p className="font-serif font-bold text-sm sm:text-base text-[#203d36] truncate">
                  {noteTitle.trim() || 'Untitled Seedling'}
                </p>
              </div>

              {noteSnippet && (
                <p className="text-xs text-[#5c6e66] font-sans line-clamp-2 leading-relaxed">
                  "{noteSnippet}"
                </p>
              )}

              {noteTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {noteTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-[#faf8ee] border border-[#203d36]/10 text-[#203d36] font-mono text-[10px] rounded-md font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Explanatory notice */}
            <div className="relative z-10 flex items-start gap-2.5 text-xs text-[#5c6e66] font-sans leading-relaxed">
              <Leaf className="w-4 h-4 text-[#203d36]/70 shrink-0 mt-0.5" />
              <span>
                Permanently deleting this seedling removes its notes and companion growth data. You can also move it to your Vault archive to preserve it quietly.
              </span>
            </div>

            {/* Action buttons matching Synapze buttons & hover springs */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-[#203d36]/20 text-[#203d36] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center"
              >
                Keep in Garden
              </button>

              {onArchiveInstead && (
                <button
                  type="button"
                  onClick={async () => {
                    await onArchiveInstead();
                    onClose();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 bg-[#cae9d5]/60 hover:bg-[#cae9d5] border border-[#203d36]/15 text-[#203d36] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5 text-[#203d36]" />
                  <span>Vault Archive</span>
                </button>
              )}

              <button
                type="button"
                onClick={async () => {
                  await onConfirm();
                  onClose();
                }}
                className="w-full sm:flex-1 py-3 px-4 bg-[#b9382c] hover:bg-[#992c22] active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-[#b9382c]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
                <span>Delete Note</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
