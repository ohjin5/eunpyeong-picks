import React from 'react';
import { Eye, Send, PlusCircle } from 'lucide-react';

interface HeroProps {
  onExploreClick?: () => void;
  onRegisterToolClick?: () => void;
  totalProducts?: number;
  totalViews?: number;
  totalRequests?: number;
}

export const Hero: React.FC<HeroProps> = ({
  onRegisterToolClick,
  totalViews = 0,
  totalRequests = 0
}) => {
  return (
    <section className="relative pt-8 pb-8 sm:pt-14 sm:pb-12 transition-colors overflow-hidden">
      
      {/* Subtle Ambient Blue-Green Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none -translate-y-12" />
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          
          <div className="max-w-3xl space-y-5">
            
            {/* Main Brand Wordmark Title (E and P emphasized) */}
            <h1 className="text-[44px] sm:text-[56px] lg:text-[70px] font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              <span className="text-blue-800 dark:text-blue-400 font-extrabold">E</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">unpyeong</span>{' '}
              <span className="text-teal-600 dark:text-teal-400 font-extrabold">P</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">icks</span>
            </h1>

            {/* Subtitle / Copy requested by user */}
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-semibold text-slate-700 dark:text-slate-200 tracking-tight leading-snug space-y-1">
              <p>업무를 더 쉽고,</p>
              <p className="text-slate-900 dark:text-white font-bold">조금 더 스마트하게.</p>
            </div>

            <p className="text-sm sm:text-base lg:text-lg text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-2xl">
              Beta Crew가 만든 AI와 업무 도구를 한곳에서 만나보세요.
            </p>

            {/* Secondary CTA: 내 도구 등록하기 */}
            {onRegisterToolClick && (
              <div className="pt-2">
                <button
                  onClick={onRegisterToolClick}
                  className="px-5 py-2.5 rounded-2xl bg-white dark:bg-[#1c1c1e] text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>내 도구 등록하기</span>
                </button>
              </div>
            )}
          </div>

          {/* Top Overall Stats Bar (Clean Apple-Style Stat Chips) */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0 pb-1">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1c1c1e] text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-xs font-semibold">
              <Eye className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>누적 조회 <strong className="text-slate-900 dark:text-white font-bold">{totalViews.toLocaleString()}</strong>회</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1c1c1e] text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-xs font-semibold">
              <Send className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>서비스 이용 신청 <strong className="text-slate-900 dark:text-white font-bold">{totalRequests.toLocaleString()}</strong>건</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
