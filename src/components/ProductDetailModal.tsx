import React from 'react';
import { Product } from '../types/store';
import { getCategoryInfo } from '../utils/categoryHelper';
import {
  X,
  ExternalLink,
  Eye,
  CheckCircle2,
  Info,
  Layers,
  Send,
  UserCheck,
  BarChart2
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onRequestService: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onRequestService
}) => {
  if (!product) return null;

  const cat = getCategoryInfo(product.category);

  // Filter image/video previews only (Sample Input/Output are completely excluded)
  const galleryPreviews = (product.previews || []).filter(
    p => p.type === 'IMAGE' || p.type === 'VIDEO'
  );

  const handleUseService = () => {
    if (product.serviceUrl && product.serviceUrl.trim().length > 0) {
      window.open(product.serviceUrl, '_blank', 'noopener,noreferrer');
    } else {
      onRequestService(product);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-[#1c1c1e] w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              {cat.label}
            </span>
            <span>•</span>
            <span>{product.creatorDepartment}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          
          {/* Section 1, 2, 3, 4: Category, Product Name, Catch Phrase, Primary CTA */}
          <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {cat.label}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {product.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {product.shortDescription}
              </p>
            </div>

            {/* Single Primary CTA Button */}
            <div className="pt-2">
              <button
                onClick={handleUseService}
                className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <span>서비스 이용하기</span>
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Section 5: Big Thumbnail / Hero Preview */}
          {/* Section 5: Big Thumbnail / Hero Preview */}
          {product.thumbnailUrl && product.thumbnailUrl.trim().length > 0 && (
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 bg-slate-100 aspect-16/9 sm:aspect-21/9 relative shadow-xs">
              <img
                src={product.thumbnailUrl}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.parentElement?.remove();
                }}
              />
            </div>
          )}

          {/* Section 6: 서비스 소개 (Service Description) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400" />
              <span>서비스 소개</span>
            </h3>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line border border-slate-100 dark:border-slate-800/80">
              {product.description}
            </div>
          </div>

          {/* Section 7: 주요 기능 (Key Features) */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>주요 기능</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.features.map((feat) => (
                  <div
                    key={feat.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat.featureText}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 8: 화면 미리보기 Gallery (Images / Videos Only) */}
          {galleryPreviews.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>화면 미리보기</span>
              </h3>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                {galleryPreviews.map((pv) => (
                  <div
                    key={pv.id}
                    className="snap-start shrink-0 w-72 sm:w-96 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-xs"
                  >
                    <img
                      src={pv.url}
                      alt={pv.caption || '화면 미리보기'}
                      className="w-full h-48 object-cover"
                    />
                    {pv.caption && (
                      <div className="p-3 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 text-center font-medium">
                        {pv.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 9: 제작자 / 담당자 정보 */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <UserCheck className="w-4 h-4 text-slate-500" />
                <span>제작 및 담당: {product.creatorName} ({product.creatorDepartment})</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                이메일: {product.creatorEmail}
              </p>
            </div>

            <a
              href={`mailto:${product.creatorEmail}?subject=[Eunpyeong Picks] ${encodeURIComponent(product.title)} 문의`}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
            >
              담당자 문의
            </a>
          </div>

          {/* Section 10: 간단한 이용 현황 */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-3">
              <span>조회 {product.viewCount.toLocaleString()}회</span>
              {product.requestCount > 0 && (
                <>
                  <span>•</span>
                  <span>이용 요청 {product.requestCount.toLocaleString()}건</span>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
