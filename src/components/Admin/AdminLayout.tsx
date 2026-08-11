import React from 'react';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  Inbox,
  FileCheck,
  ArrowLeft,
  Cross,
  LogOut
} from 'lucide-react';

export type AdminTab = 'dashboard' | 'products' | 'new_product' | 'requests' | 'submissions';

interface AdminLayoutProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  onLogout?: () => void;
  pendingRequestsCount: number;
  pendingSubmissionsCount?: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  setActiveTab,
  onExitAdmin,
  onLogout,
  pendingRequestsCount,
  pendingSubmissionsCount = 0,
  children
}) => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row transition-colors">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-4 shrink-0 flex flex-col justify-between border-r border-slate-800">
        <div className="space-y-6">
          
          {/* Admin Header Branding */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-sm tracking-tighter">
                <span className="text-sky-400 font-extrabold">E</span>
                <span className="text-teal-400 font-extrabold">P</span>
              </div>
              <div>
                <h2 className="font-bold text-sm text-white tracking-tight flex items-baseline gap-0.5">
                  <span className="text-blue-400 font-black">E</span>unpyeong{' '}
                  <span className="text-teal-400 font-black">P</span>icks
                </h2>
                <span className="text-[10px] font-semibold text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800">
                  관리자 시스템
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>대시보드</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'submissions'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4" />
                <span>등록 신청</span>
              </div>
              {pendingSubmissionsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white">
                  {pendingSubmissionsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>AI 서비스 관리</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('new_product')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'new_product'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4" />
                <span>신규 산출물 등록</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>자료 승인 요청</span>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Exit Admin & Logout Buttons */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900/60 text-rose-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          )}

          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>일반 Store로 이동</span>
          </button>
        </div>
      </aside>

      {/* Main Admin View Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>

    </div>
  );
};
