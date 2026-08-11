import React from 'react';
import { X, Sparkles, ShieldCheck, FileSpreadsheet, Bot, Globe, Download, Lock } from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Eunpyeong Picks 활용 가이드
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          
          {/* Welcome Box */}
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 space-y-2">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>은평성모병원 Beta Crew - Eunpyeong Picks란?</span>
            </h4>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              Eunpyeong Picks는 원내 교직원이 직접 제작한 AI 서비스, Agent, 업무 자동화, Excel 도구, 검증된 프롬프트를 한곳에서 발견하고 공유하는 스토어 플랫폼입니다.
            </p>
          </div>

          {/* Key Tool Types */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              1. 주요 산출물 유형별 활용법
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-1">
                <div className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>웹 서비스 (Web App)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  웹 브라우저에서 바로 연결하여 실시간으로 사용할 수 있는 서비스입니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-1">
                <div className="font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  <span>AI Agent</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  연구 작성, 서식점검 등 복잡한 업무를 사람처럼 처리해주는 맞춤형 AI입니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-1">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel & 템플릿</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  다운로드하여 내 PC에서 바로 실행 가능한 실적/대시보드 파일입니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-1">
                <div className="font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Prompt 템플릿</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  회의록 정리, 문서 변환에 바로 사용하는 검증된 질문 양식입니다.
                </p>
              </div>
            </div>
          </div>

          {/* Access & Security Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              2. 자료 다운로드 및 승인 정책
            </h4>

            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <Download className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">[다운로드 (Public)]:</span> 즉시 공개된 자료로 버튼 클릭 시 원내 보안 서버를 거쳐 내 PC로 받아볼 수 있습니다.
                </div>
              </li>

              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">[자료 승인 요청 (Request)]:</span> 소스코드나 보안이 요구되는 자료는 간단한 사유 작성 후 제작자 승인을 받아 받으실 수 있습니다.
                </div>
              </li>
            </ul>
          </div>

          {/* Participation Guide */}
          <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-teal-900 dark:text-teal-200 text-xs">
                새로운 Beta Crew 산출물을 등록하고 싶으신가요?
              </div>
              <div className="text-[11px] text-teal-700 dark:text-teal-300">
                관리자 페이지(/admin)를 통해 새로운 AI 도구나 템플릿을 신규 등록할 수 있습니다.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
