import React from 'react';
import {
  Globe,
  Sparkles,
  FileSpreadsheet,
  Zap,
  MessageSquare,
  FileText,
  BarChart3,
  Layers,
  LucideIcon
} from 'lucide-react';
import { ProductCategory } from '../types/store';

export interface CategoryInfo {
  key: ProductCategory;
  label: string;
  subLabel: string;
  icon: LucideIcon;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  primaryActionLabel: string;
}

export const CATEGORY_MAP: Record<ProductCategory, CategoryInfo> = {
  WEB: {
    key: 'WEB',
    label: '웹 서비스',
    subLabel: '병원 업무용 Web App',
    icon: Globe,
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200/80 dark:border-slate-700',
    primaryActionLabel: '서비스 이용하기'
  },
  AGENT: {
    key: 'AGENT',
    label: 'AI Agent',
    subLabel: '질문과 업무를 대신 처리',
    icon: Sparkles,
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200/80 dark:border-slate-700',
    primaryActionLabel: 'Agent 실행하기'
  },
  EXCEL: {
    key: 'EXCEL',
    label: 'Excel 도구',
    subLabel: '다운로드해서 바로 활용',
    icon: FileSpreadsheet,
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200/80 dark:border-slate-700',
    primaryActionLabel: '다운로드하기'
  },
  AUTOMATION: {
    key: 'AUTOMATION',
    label: '업무 자동화',
    subLabel: '반복 업무를 더 빠르게',
    icon: Zap,
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200/80 dark:border-slate-700',
    primaryActionLabel: '자동화 실행하기'
  },
  PROMPT: {
    key: 'PROMPT',
    label: 'Prompt',
    subLabel: '검증된 AI 활용 템플릿',
    icon: MessageSquare,
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200/80 dark:border-slate-700',
    primaryActionLabel: '프롬프트 보기'
  },
  DOCUMENT: {
    key: 'DOCUMENT',
    label: '문서·보고서',
    subLabel: '양식 및 가이드 도구',
    icon: FileText,
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200/80 dark:border-slate-700',
    primaryActionLabel: '문서 확인하기'
  },
  DATA: {
    key: 'DATA',
    label: '데이터·분석',
    subLabel: '분석과 시각화를 간편하게',
    icon: BarChart3,
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200/80 dark:border-slate-700',
    primaryActionLabel: '데이터 분석도구'
  },
  OTHER: {
    key: 'OTHER',
    label: '기타 도구',
    subLabel: '기타 업무지원 서비스',
    icon: Layers,
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200/80 dark:border-slate-700',
    primaryActionLabel: '자세히 보기'
  }
};

export function getCategoryInfo(category: ProductCategory): CategoryInfo {
  return CATEGORY_MAP[category] || CATEGORY_MAP.OTHER;
}
