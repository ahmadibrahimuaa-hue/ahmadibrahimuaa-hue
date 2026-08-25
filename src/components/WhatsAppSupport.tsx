import React from 'react';
import { MessageCircle, ExternalLink, Headphones } from 'lucide-react';

export const WHATSAPP_URL = 'https://wa.me/Ahmedebrahim88?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%AD%D8%AA%D8%A7%D8%AC%20%D8%AF%D8%B9%D9%85%D8%A7%D9%8B%20%D9%81%D9%86%D9%8A%D8%A7%D9%8B%20%D8%AE%D8%A7%D8%B5%D8%A7%D9%8B%20%D8%A8%D9%85%D9%86%D8%B5%D8%A9%20%D8%AF%D8%B1%D9%88%D8%B3%20%D8%A7%D9%84%D8%AA%D8%AC%D9%88%D9%8A%D8%AF';

interface WhatsAppSupportProps {
  variant?: 'badge' | 'card' | 'compact' | 'button' | 'modal-footer';
  className?: string;
  customText?: string;
}

export const WhatsAppSupport: React.FC<WhatsAppSupportProps> = ({
  variant = 'badge',
  className = '',
  customText,
}) => {
  if (variant === 'button') {
    return (
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-quran text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 border border-emerald-400/40 cursor-pointer ${className}`}
        title="تواصل مع الدعم الفني عبر واتساب"
      >
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
          <MessageCircle className="w-3.5 h-3.5 text-white fill-white" />
        </div>
        <span>{customText || 'تواصل معنا للدعم'}</span>
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold transition-colors ${className}`}
      >
        <MessageCircle className="w-4 h-4 fill-emerald-500 text-emerald-500" />
        <span>{customText || 'الدعم الفني عبر واتساب'}</span>
      </a>
    );
  }

  if (variant === 'modal-footer') {
    return (
      <div className={`mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50 ${className}`}>
        <div className="flex items-center gap-2 text-right w-full sm:w-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-quran">
              هل تحتاج مساعدة أو واجهت مشكلة في الدخول؟
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              فريق الدعم الفني جاهز لمساعدتك عبر تطبيق واتساب
            </div>
          </div>
        </div>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black font-quran text-xs px-4 py-2 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 border border-emerald-400/40 shrink-0 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white text-white" />
          <span>تواصل معنا للدعم</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 border-2 border-emerald-500/40 shadow-xl relative overflow-hidden ${className}`}>
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 text-center md:text-right">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 text-emerald-200 border border-emerald-600 px-3 py-1 rounded-full text-xs font-bold font-quran shadow-sm">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300" />
              <span>خدمة الدعم الفني والتواصل المباشر</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black font-quran text-amber-100">
              تواصل معنا للدعم والمساعدة الفنية والأكاديمية
            </h3>
            <p className="text-xs text-emerald-200/90 max-w-xl leading-relaxed">
              للاستفسارات، تفعيل تراخيص المعلمين، استفسارات الشهادات أو حل المشكلات التقنية، تواصل مباشرة مع الإدارة عبر واتساب.
            </p>
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-quran text-sm px-6 py-3 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 border-2 border-emerald-300 shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-slate-950 text-slate-950" />
            <span>تواصل عبر واتساب</span>
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>
        </div>
      </div>
    );
  }

  // Default 'badge'
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${className}`}
      title="تواصل مع الدعم الفني عبر واتساب"
    >
      <MessageCircle className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
      <span>{customText || 'تواصل معنا للدعم'}</span>
    </a>
  );
};

export const FloatingWhatsAppSupport: React.FC = () => {
  return (
    <div className="fixed bottom-5 left-5 z-40 no-print flex flex-col items-start gap-2 animate-bounce-subtle">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-emerald-300/80 cursor-pointer"
        aria-label="تواصل معنا للدعم الفني عبر واتساب"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-white text-white" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
          </span>
        </div>
        <span className="text-xs font-black font-quran leading-tight">تواصل معنا للدعم</span>
      </a>
    </div>
  );
};
