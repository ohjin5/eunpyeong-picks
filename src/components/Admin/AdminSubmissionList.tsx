import React, { useState } from 'react';
import { UserSubmission, SubmissionStatus } from '../../types/store';
import { getCategoryInfo } from '../../utils/categoryHelper';
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  UserCheck,
  Mail,
  Building,
  Layers,
  X
} from 'lucide-react';

interface AdminSubmissionListProps {
  submissions: UserSubmission[];
  onUpdateStatus: (id: string, status: SubmissionStatus, adminComment?: string) => Promise<void>;
}

export const AdminSubmissionList: React.FC<AdminSubmissionListProps> = ({
  submissions,
  onUpdateStatus
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<UserSubmission | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (subId: string, status: SubmissionStatus) => {
    try {
      setIsProcessing(true);
      await onUpdateStatus(subId, status, adminComment);
      setSelectedSubmission(null);
      setAdminComment('');
    } catch (err) {
      console.error('Failed to update submission status:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          도구 등록 신청 검토 (USER SUBMISSIONS)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          교직원이 등록 신청한 AI 도구 및 업무 도구 검토 및 게시 승인 관리 페이지입니다.
        </p>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">신청 ID / 서비스명</th>
                <th className="py-3.5 px-4">카테고리</th>
                <th className="py-3.5 px-4">신청자 정보</th>
                <th className="py-3.5 px-4">신청 일시</th>
                <th className="py-3.5 px-4">상태 (STATUS)</th>
                <th className="py-3.5 px-4 text-right">상세 및 검토</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    접수된 도구 등록 신청 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const cat = getCategoryInfo(sub.category);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* ID & Title */}
                      <td className="py-3.5 px-4">
                        <div className="text-[10px] font-mono text-slate-400 font-semibold">
                          {sub.id}
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {sub.title}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {sub.shortDescription}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px]">
                          {cat.label}
                        </span>
                      </td>

                      {/* Submitter */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {sub.submitterName} ({sub.submitterDepartment})
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sub.submitterEmail}
                        </div>
                      </td>

                      {/* Submitted At */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(sub.submittedAt).toLocaleString('ko-KR')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          sub.status === 'REVIEW' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          sub.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {sub.status === 'REVIEW' && <Clock className="w-3 h-3" />}
                          {sub.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                          {sub.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                          <span>
                            {sub.status === 'REVIEW' ? '검토중 (REVIEW)' :
                             sub.status === 'APPROVED' ? '승인됨 (APPROVED)' :
                             '반려됨 (REJECTED)'}
                          </span>
                        </span>
                      </td>

                      {/* Detail View Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setAdminComment(sub.adminComment || '');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          상세보기 & 검토
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

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {selectedSubmission.id}
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60">
                  {getCategoryInfo(selectedSubmission.category).label}
                </span>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              
              {/* Service Title & Short Desc */}
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedSubmission.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  {selectedSubmission.shortDescription}
                </p>
              </div>

              {/* Submitter Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>신청자: {selectedSubmission.submitterName} ({selectedSubmission.submitterDepartment})</span>
                </div>
                <div className="text-slate-500 pl-6">
                  담당자 이메일: {selectedSubmission.submitterEmail}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                  상세 설명
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed border border-slate-200/60 dark:border-slate-800">
                  {selectedSubmission.description}
                </div>
              </div>

              {/* Features */}
              {selectedSubmission.features && selectedSubmission.features.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    주요 기능
                  </h4>
                  <ul className="space-y-1.5 pl-2">
                    {selectedSubmission.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Service URL */}
              {selectedSubmission.serviceUrl && (
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    서비스 URL
                  </h4>
                  <a
                    href={selectedSubmission.serviceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline font-semibold flex items-center gap-1"
                  >
                    <span>{selectedSubmission.serviceUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Thumbnail Preview */}
              {selectedSubmission.thumbnailUrl && (
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Thumbnail 미리보기
                  </h4>
                  <div className="w-full max-w-sm h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <img
                      src={selectedSubmission.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Previews Gallery */}
              {selectedSubmission.previews && selectedSubmission.previews.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    추가 화면 미리보기
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedSubmission.previews.map((pv, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <img src={pv.url} alt="Preview" className="w-full h-28 object-cover" />
                        {pv.caption && (
                          <div className="p-2 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800 text-center">
                            {pv.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Comment Input */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  관리자 검토 의견 (선택)
                </label>
                <input
                  type="text"
                  value={adminComment}
                  onChange={e => setAdminComment(e.target.value)}
                  placeholder="승인 또는 반려 사유 메모 입력"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-400 font-medium">
                승인 시 바로 Store에 공개 게시됩니다.
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction(selectedSubmission.id, 'REJECTED')}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  [반려]
                </button>

                <button
                  onClick={() => handleAction(selectedSubmission.id, 'APPROVED')}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  [승인 및 Store 게시]
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
