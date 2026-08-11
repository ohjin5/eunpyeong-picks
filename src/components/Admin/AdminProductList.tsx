import React, { useState } from 'react';
import { Product } from '../../types/store';
import { getCategoryInfo } from '../../utils/categoryHelper';
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Sparkles,
  ExternalLink,
  Download,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AdminProductListProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onToggleStatus: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
  onNewProduct: () => void;
}

export const AdminProductList: React.FC<AdminProductListProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
  onToggleStatus,
  onToggleFeatured,
  onNewProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.creatorDepartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            AI 서비스 및 산출물 목록
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            등록된 모든 산출물의 게시 상태, 추천 여부, 메타데이터를 관리합니다.
          </p>
        </div>

        <button
          onClick={onNewProduct}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>신규 서비스 등록</span>
        </button>
      </div>

      {/* Filter Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="서비스명, 제작자, 부서로 검색..."
          className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600">
            초기화
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">서비스 / 카테고리</th>
                <th className="py-3.5 px-4">제작자 / 부서</th>
                <th className="py-3.5 px-4">게시 상태</th>
                <th className="py-3.5 px-4">추천</th>
                <th className="py-3.5 px-4 text-center">조회 / 다운 / 요청</th>
                <th className="py-3.5 px-4 text-right">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    검색 결과에 해당하는 AI 산출물이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const cat = getCategoryInfo(product.category);
                  const isPublished = product.status === 'PUBLISHED';

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Title & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.thumbnailUrl}
                            alt={product.title}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                              {product.title}
                            </div>
                            <span className={`inline-block px-2 py-0.2 rounded text-[10px] font-bold ${cat.badgeBg} ${cat.badgeText} mt-0.5`}>
                              {cat.label}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Creator */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {product.creatorName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {product.creatorDepartment}
                        </div>
                      </td>

                      {/* Status Toggle Button */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onToggleStatus(product)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {isPublished ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>게시 중</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>비공개</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onToggleFeatured(product)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            product.featured
                              ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 border-amber-300'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                          title="추천 설정 토글"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Stats */}
                      <td className="py-3.5 px-4 text-center text-[11px] text-slate-500">
                        <div>조회 {product.viewCount} / 다운 {product.downloadCount} / 요청 {product.requestCount}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1 shrink-0">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`'${product.title}' 항목을 virkelig 삭제하시겠습니까?`)) {
                              onDeleteProduct(product.id);
                            }
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};
