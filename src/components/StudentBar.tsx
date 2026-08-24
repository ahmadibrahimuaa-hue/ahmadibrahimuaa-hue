import React, { useState, useEffect } from 'react';
import { User, Edit3, Check, Award, BookOpen, Trophy, School, ShieldCheck } from 'lucide-react';
import { getStudentProfile, saveStudentProfile, subscribeStudentProfile } from '../utils/studentStorage';
import { getStudentProgress, subscribeStudentProgress, calculateProgressPercentage } from '../utils/studentProgressStorage';
import { StudentProfile } from '../types';

interface StudentBarProps {
  onOpenProgressModal?: () => void;
  onOpenRegistrationModal?: () => void;
}

export const StudentBar: React.FC<StudentBarProps> = ({ 
  onOpenProgressModal,
  onOpenRegistrationModal,
}) => {
  const [profile, setProfile] = useState<StudentProfile | null>(() => getStudentProfile());
  const [progressPct, setProgressPct] = useState<number>(0);

  useEffect(() => {
    const handleProfile = (prof: StudentProfile | null) => {
      setProfile(prof);
    };

    handleProfile(getStudentProfile());
    const unsubProfile = subscribeStudentProfile(handleProfile);

    const updateProg = () => {
      setProgressPct(calculateProgressPercentage(getStudentProgress()));
    };
    updateProg();

    const unsubscribeProg = subscribeStudentProgress(updateProg);

    const handleProgressReset = () => {
      setProfile(null);
      setProgressPct(0);
    };
    window.addEventListener('tajweed_progress_reset', handleProgressReset);

    return () => {
      unsubProfile();
      unsubscribeProg();
      window.removeEventListener('tajweed_progress_reset', handleProgressReset);
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-700/50 rounded-2xl p-4 mb-6 shadow-md font-tajawal no-print">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Student & Trainer Info */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold font-quran text-lg shadow-md shrink-0 border border-amber-300">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-quran">
                حساب الدارس القرآني
              </span>
              
              {profile?.trainerName ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-200 bg-emerald-800/60 px-2.5 py-0.5 rounded-full border border-emerald-600/50 font-quran">
                  <School className="w-3 h-3 text-amber-400" />
                  <span>المعلم المشرف: {profile.trainerName}</span>
                  {profile.referralCode && (
                    <span className="text-amber-300 font-mono text-[10px]">({profile.referralCode})</span>
                  )}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700 font-quran">
                  دراسة عامة
                </span>
              )}
            </div>
            
            {profile?.name ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">أهلاً بك:</span>
                <span className="text-sm sm:text-base font-bold font-quran text-amber-200">{profile.name}</span>
                {onOpenRegistrationModal && (
                  <button
                    onClick={onOpenRegistrationModal}
                    className="text-amber-300 hover:text-amber-100 p-1 rounded-lg hover:bg-emerald-800/50 transition-all text-xs flex items-center gap-1 cursor-pointer"
                    title="تعديل بيانات الطالب أو ربط كود المعلم"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل الحساب / الكود</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300 font-bold">لم يتم تسجيل اسم الطالب بعد</span>
                {onOpenRegistrationModal && (
                  <button
                    onClick={onOpenRegistrationModal}
                    className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-lg text-xs font-bold font-quran hover:bg-amber-300"
                  >
                    تسجيل الآن
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Progress gauge & Quick Modal trigger */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {onOpenProgressModal && (
            <button
              onClick={onOpenProgressModal}
              className="bg-slate-950/80 hover:bg-slate-900 border border-emerald-700/60 rounded-xl px-4 py-2 text-right transition-all flex items-center gap-3 group cursor-pointer shadow-inner"
              title="انقر لفتح شاشة تفاصيل الإنجاز والتقدم الدراسي"
            >
              <div>
                <div className="flex items-center justify-between gap-3 text-[11px] font-bold font-quran">
                  <span className="text-emerald-200">نسبة التقدم بالحقيبة:</span>
                  <span className="text-amber-400 font-mono">{progressPct}%</span>
                </div>
                <div className="w-32 bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>
              </div>
              <Trophy className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
