import React from 'react';
import { CATEGORY_MAP } from '../utils/categoryHelper';
import { ProductCategory } from '../types/store';
import { LayoutGrid } from 'lucide-react';

interface QuickCategoryProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categoryCounts?: Record<ProductCategory, number>;
}

// Restored Distinct & Intuitive Color Configuration for Category App Icons
const CATEGORY_ICON_STYLES: Record<string, { bg: string; text: string; activeBg: string }> = {
  ALL: {
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    text: 'text-slate-800 dark:text-slate-200',
    activeBg: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
  },
  WEB: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-600 dark:text-blue-400',
    activeBg: 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white shadow-sm'
  },
  AGENT: {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-600 dark:text-purple-400',
    activeBg: 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white shadow-sm'
  },
  EXCEL: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white shadow-sm'
  },
  AUTOMATION: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-600 dark:text-amber-400',
    activeBg: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-white shadow-sm'
  },
  PROMPT: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-600 dark:text-indigo-400',
    activeBg: 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white shadow-sm'
  },
  DOCUMENT: {
    bg: 'bg-sky-50 dark:bg-sky-950/60',
    text: 'text-sky-600 dark:text-sky-400',
    activeBg: 'bg-sky-600 text-white dark:bg-sky-500 dark:text-white shadow-sm'
  },
  DATA: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-600 dark:text-rose-400',
    activeBg: 'bg-rose-600 text-white dark:bg-rose-500 dark:text-white shadow-sm'
  },
  OTHER: {
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    text: 'text-slate-600 dark:text-slate-400',
    activeBg: 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-sm'
  }
};

export const QuickCategory: React.FC<QuickCategoryProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts
}) => {
  const categoriesList = Object.keys(CATEGORY_MAP) as ProductCategory[];

  return (
    <nav aria-label="App Icon Category Navigation" className="py-5 transition-colors border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Apple App Store Style App Icon Grid/Scroll */}
        <div className="flex items-start gap-4 sm:gap-6 lg:gap-8 overflow-x-auto scrollbar-none pb-2 pt-1 min-w-max">
          
          {/* ALL Category ("전체" App Icon) */}
          <button
            onClick={() => onSelectCategory('ALL')}
            className="group flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-[20px] flex items-center justify-center transition-all duration-200 ${
              selectedCategory === 'ALL'
                ? CATEGORY_ICON_STYLES.ALL.activeBg
                : `${CATEGORY_ICON_STYLES.ALL.bg} ${CATEGORY_ICON_STYLES.ALL.text} group-hover:scale-105`
            }`}>
              <LayoutGrid className="w-6 h-6 stroke-[2]" />
            </div>
            <span className={`text-xs tracking-tight transition-colors ${
              selectedCategory === 'ALL'
                ? 'font-bold text-slate-900 dark:text-white'
                : 'font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
            }`}>
              전체
            </span>
          </button>

          {/* Individual Categories */}
          {categoriesList.map((catKey) => {
            const cat = CATEGORY_MAP[catKey];
            const Icon = cat.icon;
            const isSelected = selectedCategory === catKey;
            const count = categoryCounts ? categoryCounts[catKey] : undefined;
            const style = CATEGORY_ICON_STYLES[catKey] || CATEGORY_ICON_STYLES.OTHER;

            return (
              <button
                key={catKey}
                onClick={() => onSelectCategory(catKey)}
                className="group flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-[20px] flex items-center justify-center transition-all duration-200 relative ${
                  isSelected
                    ? style.activeBg
                    : `${style.bg} ${style.text} group-hover:scale-105`
                }`}>
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                
                <div className="flex items-center gap-1">
                  <span className={`text-xs tracking-tight transition-colors ${
                    isSelected
                      ? 'font-bold text-slate-900 dark:text-white'
                      : 'font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}>
                    {cat.label}
                  </span>
                  {count !== undefined && count > 0 && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({count})
                    </span>
                  )}
                </div>
              </button>
            );
          })}

        </div>

      </div>
    </nav>
  );
};
