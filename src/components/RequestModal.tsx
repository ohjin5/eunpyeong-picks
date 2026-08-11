import React, { useState } from 'react';
import { Product } from '../types/store';
import { X, Send, CheckCircle, AlertCircle, Building2, User, Mail, FileText, MessageSquare } from 'lucide-react';

interface RequestModalProps {
  product: Product | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  product,
  onClose,
  onSubmitSuccess
}) => {
  if (!product) return null;

  const [requesterName, setRequesterName] = useState('');
  const [requesterDepartment, setRequesterDepartment] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Inline field validation checks
    if (!requesterName.trim()) {
      setErrorMsg('이름을 입력해주세요.');
      return;
    }
    if (!requesterDepartment.trim()) {
      setErrorMsg('부서를 입력해주세요.');
      return;
    }
    if (!requesterEmail.trim()) {
      setErrorMsg('이메일을 입력해주세요.');
      return;
    }
    if (!purpose.trim()) {
      setErrorMsg('이용 목적을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productTitle: product.title,
          requestType: 'SERVICE_ACCESS',
          requesterName: requesterName.trim(),
          requesterDepartment: requesterDepartment.trim(),
          requesterEmail: requesterEmail.trim(),
          purpose: purpose.trim(),
          message: message.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '이용 신청에 실패했습니다.');
      }

      setIsSubmitted(true);
      setTimeout(() => {
        onSubmitSuccess();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || '서버 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#1c1c1e] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              서비스 이용 신청
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              현재 바로 이용할 수 있는 서비스 링크가 제공되지 않습니다. 아래 정보를 입력하면 해당 서비스 담당자에게 이용 요청을 전달합니다.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full shrink-0 ml-2 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                이용 신청이 접수되었습니다.
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                담당자에게 요청 내용이 전달됩니다.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
            
            {/* Auto Displayed Product & Creator Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="text-slate-400 font-medium">서비스명</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                  {product.title}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">담당자명: </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {product.creatorName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">담당부서: </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {product.creatorDepartment}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Requester Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                이름 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={requesterName}
                onChange={(e) => {
                  setRequesterName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="홍길동"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                부서 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={requesterDepartment}
                onChange={(e) => {
                  setRequesterDepartment(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="예: 간호부 5병동, 기획조정팀"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                이메일 <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={requesterEmail}
                onChange={(e) => {
                  setRequesterEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="user@stm.or.kr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                이용 목적 <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(e) => {
                  setPurpose(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="어떤 업무에 활용하실 계획인지 적어주세요."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white resize-none"
              />
            </div>

            {/* Additional Inquiry (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                추가 문의사항 <span className="text-slate-400 font-normal">(선택)</span>
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="궁금한 사항이 있으시면 적어주세요."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? '요청을 보내는 중...' : '이용 신청 보내기'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
