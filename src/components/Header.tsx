import React from 'react';
import { Search, BookOpen, Shield } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenGuide: () => void;
  onSelectCategory: (cat: string) => void;
  currentCategory: string;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenGuide,
  onSelectCategory,
  isAdmin,
  onToggleAdmin
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-6">
        
        {/* Top Left: Hospital Official Logo (/brand/logo.png) */}
        <div 
          onClick={() => onSelectCategory('ALL')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          title="가톨릭대학교 은평성모병원 - Eunpyeong Picks 홈으로"
        >
          <img
            src="/brand/logo.png"
            alt="가톨릭대학교 은평성모병원"
            className="h-8 sm:h-10 max-w-[180px] sm:max-w-[240px] w-auto object-contain transition-transform group-hover:scale-[1.02] dark:bg-white/95 dark:px-2.5 dark:py-1 dark:rounded-lg"
          />
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Eunpyeong Picks 업무 도구, AI, 프롬프트 검색..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100/90 dark:bg-slate-800/90 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-teal-500/30 rounded-xl outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all border-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                지우기
              </button>
            )}
          </div>
        </div>

        {/* Top Right: Guide & Admin Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>활용 가이드</span>
          </button>

          {/* Admin Toggle */}
          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              isAdmin
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAdmin ? '스토어 보기' : '관리자'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 md:hidden bg-slate-50 dark:bg-slate-900">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Eunpyeong Picks 업무 도구, AI 검색..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg outline-none text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>
    </header>
  );
};
