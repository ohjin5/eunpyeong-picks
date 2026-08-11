import React from 'react';
import { MaterialRequest, RequestStatus } from '../../types/store';

interface AdminRequestListProps {
  requests: MaterialRequest[];
  onUpdateStatus: (id: string, status: RequestStatus) => void;
}

export const AdminRequestList: React.FC<AdminRequestListProps> = ({
  requests,
  onUpdateStatus
}) => {
  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          서비스 이용 신청 내역 (REQUESTS)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          원내 교직원이 제출한 서비스 이용 신청 및 자료 요청 내역입니다.
        </p>
      </div>

      {/* Requests List Table */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Request ID / 서비스명</th>
                <th className="py-3.5 px-4">신청자 정보</th>
                <th className="py-3.5 px-4">이용 목적 / 메시지</th>
                <th className="py-3.5 px-4">담당자 정보</th>
                <th className="py-3.5 px-4">신청 일시</th>
                <th className="py-3.5 px-4 text-right">상태 (STATUS)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    접수된 서비스 이용 신청 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Request ID & Product */}
                    <td className="py-3.5 px-4">
                      <div className="text-[10px] font-mono text-slate-400 font-semibold">
                        {req.id}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {req.productTitle}
                      </div>
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded">
                        {req.requestType || 'SERVICE_ACCESS'}
                      </span>
                    </td>

                    {/* Requester */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {req.requesterName} ({req.requesterDepartment})
                      </div>
                      <a
                        href={`mailto:${req.requesterEmail}`}
                        className="text-[11px] text-slate-500 underline hover:text-blue-600"
                      >
                        {req.requesterEmail}
                      </a>
                    </td>

                    {/* Purpose & Message */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                        {req.purpose}
                      </p>
                      {req.message && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          추가 문의: "{req.message}"
                        </p>
                      )}
                    </td>

                    {/* Creator */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      <div>{req.creatorName || '담당자'} ({req.creatorDepartment || '담당부서'})</div>
                      <div className="text-[11px] text-slate-400">{req.creatorEmail}</div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(req.requestedAt).toLocaleString('ko-KR')}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={req.status}
                        onChange={(e) => onUpdateStatus(req.id, e.target.value as RequestStatus)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                          req.status === 'REQUESTED' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          req.status === 'CONTACTED' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                          req.status === 'APPROVED' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                          req.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="REQUESTED">요청 접수 (REQUESTED)</option>
                        <option value="CONTACTED">연락 완료 (CONTACTED)</option>
                        <option value="APPROVED">승인 완료 (APPROVED)</option>
                        <option value="REJECTED">반려 (REJECTED)</option>
                        <option value="COMPLETED">처리 완료 (COMPLETED)</option>
                      </select>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};
