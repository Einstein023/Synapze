import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';

interface ToastNotificationProps {
  title: string;
  body: string;
  onClose: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  title,
  body,
  onClose,
  duration = 6000
}) => {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const isExitingRef = useRef(false);

  // Manual close trigger with 400ms slide-out animation sequence
  const handleClose = () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 400); // Align with index.css 0.4s slide-out transition
  };

  useEffect(() => {
    let animationFrameId: number;
    const startTime = Date.now();

    const updateFrame = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(currentProgress);

      // Trigger exit animation slide-out 400ms before duration ends
      if (elapsed >= duration - 400 && !isExitingRef.current) {
        isExitingRef.current = true;
        setIsExiting(true);
      }

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(updateFrame);
      } else {
        onClose();
      }
    };

    animationFrameId = requestAnimationFrame(updateFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [duration, onClose]);

  // Always use emerald green for the progress bar as requested
  const getProgressBarColor = () => {
    return 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]';
  };

  return (
    <div 
      id="toast-notification-root" 
      className={`fixed bottom-6 left-6 md:left-[17.5rem] bg-slate-950/95 border border-slate-800/80 p-4 rounded-xl shadow-2xl text-slate-200 max-w-sm w-full z-50 flex items-start gap-3.5 select-none overflow-hidden backdrop-blur-md ${
        isExiting ? 'animate-slide-out' : 'animate-slide-in'
      }`}
    >
      {/* Top border progress bar indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800/50">
        <div 
          className={`h-full transition-all duration-100 ease-linear ${getProgressBarColor()}`} 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-2 bg-slate-900 border border-slate-800 text-emerald-400 rounded-lg shrink-0 mt-1">
        <Bell className="w-4 h-4 text-emerald-400 animate-pulse" />
      </div>
      <div className="space-y-0.5 min-w-0 mt-1 text-left">
        <h5 className="font-display font-semibold text-white tracking-tight text-sm">{title}</h5>
        <p className="text-slate-300 text-xs leading-normal font-medium">{body}</p>
      </div>
      <button 
        id="toast-close-btn"
        onClick={handleClose}
        className="absolute top-3.5 right-3 text-slate-400 hover:text-white cursor-pointer font-mono text-xs bg-transparent border-none outline-none transition-colors"
      >
        ✕
      </button>
    </div>
  );
};
