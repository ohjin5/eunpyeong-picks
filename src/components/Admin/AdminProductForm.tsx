import React, { useState } from 'react';
import { Product, ProductCategory, ProductStatus, AccessPolicy, PreviewType } from '../../types/store';
import { CATEGORY_MAP } from '../../utils/categoryHelper';
import { Save, ArrowLeft, Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';

interface AdminProductFormProps {
  initialProduct?: Product | null;
  onSave: (productData: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  initialProduct,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialProduct?.title || '');
  const [category, setCategory] = useState<ProductCategory>(initialProduct?.category || 'WEB');
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  
  const [creatorName, setCreatorName] = useState(initialProduct?.creatorName || '');
  const [creatorDepartment, setCreatorDepartment] = useState(initialProduct?.creatorDepartment || '');
  const [creatorEmail, setCreatorEmail] = useState(initialProduct?.creatorEmail || '');
  
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialProduct?.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
  );
  const [serviceUrl, setServiceUrl] = useState(initialProduct?.serviceUrl || '');
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status || 'PUBLISHED');
  const [featured, setFeatured] = useState<boolean>(initialProduct?.featured || false);

  // Features list
  const [features, setFeatures] = useState<string[]>(
    initialProduct?.features?.map(f => f.featureText) || ['']
  );

  // Previews
  const [previewImageUrl, setPreviewImageUrl] = useState(
    initialProduct?.previews?.find(p => p.type === 'IMAGE')?.url || ''
  );
  const [sampleInput, setSampleInput] = useState(
    initialProduct?.previews?.find(p => p.type === 'SAMPLE_INPUT')?.textContent || ''
  );
  const [sampleOutput, setSampleOutput] = useState(
    initialProduct?.previews?.find(p => p.type === 'SAMPLE_OUTPUT')?.textContent || ''
  );

  // Files
  const [fileName, setFileName] = useState(initialProduct?.files?.[0]?.fileName || '');
  const [fileType, setFileType] = useState(initialProduct?.files?.[0]?.fileType || 'pdf');
  const [accessPolicy, setAccessPolicy] = useState<AccessPolicy>(initialProduct?.files?.[0]?.accessPolicy || 'PUBLIC');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddFeature = () => setFeatures([...features, '']);
  const handleRemoveFeature = (idx: number) => setFeatures(features.filter((_, i) => i !== idx));
  const handleFeatureChange = (idx: number, val: string) => {
    const updated = [...features];
    updated[idx] = val;
    setFeatures(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !shortDescription || !creatorName || !creatorDepartment) {
      setErrorMsg('서비스명, 한줄 설명, 제작자명, 부서는 필수 입력 항목입니다.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const formattedFeatures = features
        .filter(f => f.trim().length > 0)
        .map((f, i) => ({
          id: `f-${Date.now()}-${i}`,
          productId: initialProduct?.id || '',
          featureText: f,
          sortOrder: i + 1
        }));

      const formattedPreviews = [];
      if (previewImageUrl) {
        formattedPreviews.push({
          id: `pv-img-${Date.now()}`,
          productId: initialProduct?.id || '',
          type: 'IMAGE' as PreviewType,
          url: previewImageUrl,
          caption: '화면 미리보기',
          sortOrder: 1
        });
      }
      if (sampleInput) {
        formattedPreviews.push({
          id: `pv-in-${Date.now()}`,
          productId: initialProduct?.id || '',
          type: 'SAMPLE_INPUT' as PreviewType,
          textContent: sampleInput,
          caption: '샘플 입력 데이터',
          sortOrder: 2
        });
      }
      if (sampleOutput) {
        formattedPreviews.push({
          id: `pv-out-${Date.now()}`,
          productId: initialProduct?.id || '',
          type: 'SAMPLE_OUTPUT' as PreviewType,
          textContent: sampleOutput,
          caption: '샘플 출력 결과',
          sortOrder: 3
        });
      }

      const formattedFiles = [];
      if (fileName) {
        formattedFiles.push({
          id: initialProduct?.files?.[0]?.id || `fl-${Date.now()}`,
          productId: initialProduct?.id || '',
          fileName: fileName,
          fileType: fileType,
          fileSize: '1.5 MB',
          accessPolicy: accessPolicy,
          downloadCount: initialProduct?.files?.[0]?.downloadCount || 0,
          sortOrder: 1
        });
      }

      await onSave({
        id: initialProduct?.id,
        title,
        category,
        shortDescription,
        description,
        creatorName,
        creatorDepartment,
        creatorEmail: creatorEmail || 'betacrew@stm.or.kr',
        thumbnailUrl,
        serviceUrl: serviceUrl || undefined,
        status,
        featured,
        features: formattedFeatures,
        previews: formattedPreviews,
        files: formattedFiles
      });

    } catch (err: any) {
      setErrorMsg(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
      
      {/* Form Top Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {initialProduct ? 'AI 산출물 정보 수정' : '신규 AI 산출물 등록'}
          </h1>
          <p className="text-xs text-slate-500">
            은평성모병원 Beta Crew 스토어에 등록할 서비스 및 산출물 정보를 입력합니다.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        
        {/* Section 1: Basic Info */}
        <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            1. 서비스 기본 정보
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                서비스/산출물명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 채용업무 자동화"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                카테고리 <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 font-medium"
              >
                {Object.entries(CATEGORY_MAP).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.label} ({cat.subLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              한줄 요약 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="스토어 카드에 표시될 한줄 특징 설명을 입력하세요."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              상세 설명 및 해결 과제
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="해당 도구가 병원 내 어떤 문제를 해결하며, 어떤 이점을 제공하는지 서술하세요."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Section 2: Creator Info */}
        <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            2. 제작자 정보
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                제작자 성명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="예: 권오진"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                소속 부서 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={creatorDepartment}
                onChange={(e) => setCreatorDepartment(e.target.value)}
                placeholder="예: 인사팀 · Beta Crew"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={creatorEmail}
                onChange={(e) => setCreatorEmail(e.target.value)}
                placeholder="예: user@stm.or.kr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Features */}
        <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              3. 주요 기능 항목
            </h3>
            <button
              type="button"
              onClick={handleAddFeature}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>기능 추가</span>
            </button>
          </div>

          <div className="space-y-2">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={feat}
                  onChange={(e) => handleFeatureChange(idx, e.target.value)}
                  placeholder={`주요 기능 #${idx + 1}`}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                />
                {features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Service URL & Files */}
        <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            4. 서비스 연결 및 첨부파일
          </h3>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              웹 서비스 URL (선택사항)
            </label>
            <input
              type="url"
              value={serviceUrl}
              onChange={(e) => setServiceUrl(e.target.value)}
              placeholder="예: https://recruit-auto.eunpyeong.hospital (입력 시 '서비스 이용하기' 버튼 생성)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                첨부 파일명
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="예: 업무자동화_가이드.pdf"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                파일 유형
              </label>
              <input
                type="text"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                placeholder="pdf, xlsx, docx, zip 등"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                다운로드 공개 정책
              </label>
              <select
                value={accessPolicy}
                onChange={(e) => setAccessPolicy(e.target.value as AccessPolicy)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none font-bold"
              >
                <option value="PUBLIC">공개 (바로 다운로드 가능)</option>
                <option value="REQUEST">승인 필요 (제작자에게 요청)</option>
                <option value="PRIVATE">비공개 (별도 문의)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 5: Previews */}
        <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            5. 미리보기 및 샘플 (Sample Input / Output)
          </h3>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              대표 썸네일 이미지 URL
            </label>
            <input
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                샘플 입력 (Sample Input)
              </label>
              <textarea
                rows={3}
                value={sampleInput}
                onChange={(e) => setSampleInput(e.target.value)}
                placeholder="실제 사용자가 입력한 예시 데이터"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs outline-none resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                샘플 출력 (Sample Output)
              </label>
              <textarea
                rows={3}
                value={sampleOutput}
                onChange={(e) => setSampleOutput(e.target.value)}
                placeholder="AI 또는 도구가 생성한 결과물 예시"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Publishing Status */}
        <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                게시 상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none font-bold"
              >
                <option value="PUBLISHED">게시 중 (PUBLISHED)</option>
                <option value="HIDDEN">비공개 (HIDDEN)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="featuredToggle"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <label htmlFor="featuredToggle" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                스토어 메인 추천 등록
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? '저장 중...' : '산출물 저장하기'}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
