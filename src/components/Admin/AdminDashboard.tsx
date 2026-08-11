import React from 'react';
import { StoreStats } from '../../types/store';
import { AdminTab } from './AdminLayout';
import { Layers, Eye, Download, Inbox, TrendingUp, Sparkles, ArrowUpRight, FileCheck } from 'lucide-react';
import { CATEGORY_MAP } from '../../utils/categoryHelper';

interface AdminDashboardProps {
  stats: StoreStats | null;
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  onNavigateTab
}) => {
  if (!stats) return <div className="p-8 text-center text-xs">통계 정보를 불러오는 중입니다...</div>;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            운영 대시보드
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            은평성모병원 Beta Crew AI 산출물 현황 및 사용 통계를 확인합니다.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('new_product')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>신규 산출물 등록</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Products */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">등록 AI 산출물</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalProducts} <span className="text-xs font-normal text-slate-500">개</span>
          </div>
        </div>

        {/* KPI 2: Views */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">누적 조회수</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalViews} <span className="text-xs font-normal text-slate-500">회</span>
          </div>
        </div>

        {/* KPI 3: Downloads */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">누적 활용/다운로드</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalDownloads} <span className="text-xs font-normal text-slate-500">건</span>
          </div>
        </div>

        {/* KPI 4: Requests */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">자료 승인 요청</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalRequests} <span className="text-xs font-normal text-slate-500">건</span>
          </div>
        </div>

      </div>

      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Viewed Products */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>인기 탐색 AI 서비스 Top 5</span>
            </h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              <span>전체보기</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.topViewed.map((prod, idx) => {
              const cat = CATEGORY_MAP[prod.category];
              return (
                <div
                  key={prod.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 font-black text-slate-400 text-center">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {prod.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {prod.creatorDepartment} • {prod.creatorName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {prod.viewCount}회
                    </span>
                    <span className="text-[10px] text-slate-400 block">조회</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Material Requests */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-amber-600" />
              <span>최근 접수된 자료 승인 요청</span>
            </h3>
            <button
              onClick={() => onNavigateTab('requests')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              <span>전체보기</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.recentRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">최근 요청 내역이 없습니다.</p>
            ) : (
              stats.recentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {req.productTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      요청자: {req.requesterName} ({req.requesterDepartment})
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                    req.status === 'REQUESTED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {req.status === 'REQUESTED' ? '승인 대기' :
                     req.status === 'COMPLETED' ? '전달 완료' : req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
