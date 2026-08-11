import React from 'react';
import { Sparkles, RefreshCw, Search } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onResetSearch?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '등록된 AI 산출물이 없습니다.',
  description = '새로운 Beta Crew의 신규 서비스와 도구가 곧 업로드될 예정입니다.',
  onResetSearch
}) => {
  return (
    <div className="py-16 px-4 text-center bg-slate-50/50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700/80 my-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4 shadow-sm">
        <Sparkles className="w-8 h-8 animate-pulse" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h3>

      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {description}
      </p>

      {onResetSearch && (
        <button
          onClick={onResetSearch}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>검색 필터 초기화</span>
        </button>
      )}
    </div>
  );
};
