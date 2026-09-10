import React, { useState, useEffect } from 'react';
import { Award, Sparkles, X, Trophy, CheckCircle2 } from 'lucide-react';
import { StudentBadge } from '../utils/badgeSystem';

export const BadgeEarnedToast: React.FC = () => {
  const [currentBadge, setCurrentBadge] = useState<StudentBadge | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleBadgeUnlocked = (e: Event) => {
      const customEvent = e as CustomEvent<StudentBadge>;
      if (customEvent.detail) {
        setCurrentBadge(customEvent.detail);
        setIsVisible(true);

        // Auto hide after 7 seconds
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 7000);

        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('tajweed_badge_unlocked', handleBadgeUnlocked);
    return () => {
      window.removeEventListener('tajweed_badge_unlocked', handleBadgeUnlocked);
    };
  }, []);

  if (!isVisible || !currentBadge) return null;

  return (
    <div className="fixed top-6 right-6 z-50 max-w-md w-full animate-bounce-short font-tajawal dir-rtl no-print">
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-0.5 rounded-3xl shadow-2xl">
        <div className="bg-slate-950/95 backdrop-blur-md rounded-[22px] p-5 text-slate-100 border border-amber-400/40 relative overflow-hidden">
          
          {/* Sparkle background element */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>
          
          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute left-3 top-3 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            {/* Badge Icon Container with pulse animation */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-amber-300 shrink-0 animate-pulse">
              {currentBadge.icon}
            </div>

            <div className="space-y-1 pr-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold font-quran text-xs">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>🎉 مبارك! وسام إنجاز جديد</span>
              </div>

              <h4 className="text-base font-black font-quran text-amber-100 leading-snug">
                {currentBadge.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {currentBadge.description}
              </p>

              <div className="pt-2 flex items-center gap-2">
                <span className="text-[11px] bg-emerald-950/80 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-600/50 font-bold font-quran inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>تم توثيقه في سجل إنجازاتك</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
