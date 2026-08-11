import { Product, MaterialRequest, UserSubmission } from '../src/types/store';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    title: '채용업무 자동화',
    category: 'WEB',
    shortDescription: '채용일정 입력부터 사내메신저 안내문과 채용공고문 생성까지 원스톱 지원',
    description: '인사팀의 직종별 채용 과정에서 반복되는 공고문 작성, 면접 일정 조율, 사내 메신저 공지 메시지 생성을 AI가 몇 초 만에 완료해 줍니다. 병원 표준 양식을 자동 준수하여 업무 시간을 80% 이상 단축할 수 있습니다.',
    creatorName: '권오진',
    creatorDepartment: '인사팀 · Beta Crew',
    creatorEmail: 'oj.kwon@stm.or.kr',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    serviceUrl: 'https://recruit-auto.eunpyeong.hospital',
    status: 'PUBLISHED',
    viewCount: 428,
    downloadCount: 85,
    requestCount: 14,
    featured: true,
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-08-01T11:20:00Z',
    features: [
      { id: 'f-101', productId: 'prod-001', featureText: '직종/직급 선택 시 병원 맞춤형 채용공고 초안 자동 생성', sortOrder: 1 },
      { id: 'f-102', productId: 'prod-001', featureText: '면접 일정 입력 시 사내 메신저/이메일 안내 문구 자동 조합', sortOrder: 2 },
      { id: 'f-103', productId: 'prod-001', featureText: '채용 진행 상황 한눈에 확인 가능한 대시보드 제공', sortOrder: 3 },
      { id: 'f-104', productId: 'prod-001', featureText: '지원자 체크리스트 템플릿 자동 내보내기', sortOrder: 4 }
    ],
    previews: [
      {
        id: 'pv-101',
        productId: 'prod-001',
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
        caption: '채용 공고문 및 안내문 자동 작성 화면',
        sortOrder: 1
      },
      {
        id: 'pv-102',
        productId: 'prod-001',
        type: 'SAMPLE_INPUT',
        textContent: '부서: 기능검사팀\n직종: 임상병리직 (계약직)\n면접일시: 2026년 8월 11일 14:00\n면접장소: 본관 3층 회의실',
        caption: '사용자 입력 예시',
        sortOrder: 2
      },
      {
        id: 'pv-103',
        productId: 'prod-001',
        type: 'SAMPLE_OUTPUT',
        textContent: '[사내메신저 안내문 자동 생성 결과]\n안녕하세요. 기능검사팀 임상병리직 채용 관련 안내드립니다.\n서류 전형 합격자를 대상으로 다음과 같이 면접을 실시하오니 참석 대상 위원께서는 확인 부탁드립니다.\n- 일시: 2026년 8월 11일(화) 14:00\n- 장소: 본관 3층 대회의실\n- 비고: 면접위원 평가표는 당일 현장 배부 예정입니다.',
        caption: 'AI 생성 결과 예시',
        sortOrder: 3
      }
    ],
    files: [
      {
        id: 'fl-101',
        productId: 'prod-001',
        fileName: '채용업무_자동화_사용매뉴얼_v1.2.pdf',
        fileType: 'pdf',
        fileSize: '3.4 MB',
        accessPolicy: 'PUBLIC',
        downloadCount: 62,
        sortOrder: 1
      },
      {
        id: 'fl-102',
        productId: 'prod-001',
        fileName: '채용공고문_표준템플릿_모음.xlsx',
        fileType: 'xlsx',
        fileSize: '1.2 MB',
        accessPolicy: 'PUBLIC',
        downloadCount: 23,
        sortOrder: 2
      },
      {
        id: 'fl-103',
        productId: 'prod-001',
        fileName: '채용자동화_소스코드_및_배포가이드.zip',
        fileType: 'zip',
        fileSize: '12.8 MB',
        accessPolicy: 'REQUEST',
        downloadCount: 5,
        sortOrder: 3
      }
    ]
  },
  {
    id: 'prod-002',
    title: '연구 작성 지원 Agent',
    category: 'AGENT',
    shortDescription: '임상 연구 결과 분석, 선행연구 탐색, 서론(Introduction) 초안 작성을 돕는 AI 파트너',
    description: '원내 연구원 및 의료진의 논문 및 연구 보고서 작성을 보조하는 AI Agent입니다. PubMed 및 사내 논문 데이터베이스 검색과 연동되어 선행 연구 요약, 연구 목적 정의, 서론 초안 구조화를 신속하게 수행합니다.',
    creatorName: '김민지',
    creatorDepartment: '의학연구소 · Beta Crew',
    creatorEmail: 'mj.kim@stm.or.kr',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    serviceUrl: 'https://research-agent.eunpyeong.hospital',
    status: 'PUBLISHED',
    viewCount: 612,
    downloadCount: 140,
    requestCount: 28,
    featured: true,
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-08-05T14:30:00Z',
    features: [
      { id: 'f-201', productId: 'prod-002', featureText: '최신 임상 데이터 키워드 검색 및 선행연구 3줄 요약', sortOrder: 1 },
      { id: 'f-202', productId: 'prod-002', featureText: '국문/영문 연구 초록(Abstract) 표준 양식 생성', sortOrder: 2 },
      { id: 'f-203', productId: 'prod-002', featureText: '연구 방법론(Methods) 및 서론 논리 구조 가이드', sortOrder: 3 },
      { id: 'f-204', productId: 'prod-002', featureText: '학술지 윤리 규정 체크리스트 동시 구동', sortOrder: 4 }
    ],
    previews: [
      {
        id: 'pv-201',
        productId: 'prod-002',
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
        caption: '연구 보조 Agent 인터페이스',
        sortOrder: 1
      },
      {
        id: 'pv-202',
        productId: 'prod-002',
        type: 'SAMPLE_INPUT',
        textContent: '주제: 심혈관 질환 환자 대상 고강도 운동치료의 효과\n연구 대상: 50대 이상 고혈압 환자 120명\n원하는 결과: Introduction 단락 초안 구성',
        caption: '연구 키워드 및 범위 입력',
        sortOrder: 2
      },
      {
        id: 'pv-203',
        productId: 'prod-002',
        type: 'SAMPLE_OUTPUT',
        textContent: '[생성된 서론(Introduction) 구조 및 초안]\n1. 배경: 중장년층 고혈압 환자군에서 운동치료의 중요성이 지속 제기되어 왔으나...\n2. 문제제기: 기존 저강도 운동과 달리 고강도 간헐적 운동(HIIT)의 안전성 및 순응도 연구는 아직 제한적임.\n3. 연구목적: 본 연구는 50대 이상 고혈압 환자 120명을 대상으로 12주간 고강도 운동치료 적용 시 심혈관계 지표 개선 효과를 분석하고자 한다.',
        caption: 'AI 연구 분석 결과',
        sortOrder: 3
      }
    ],
    files: [
      {
        id: 'fl-201',
        productId: 'prod-002',
        fileName: '연구작성_Agent_활용가이드.pdf',
        fileType: 'pdf',
        fileSize: '2.1 MB',
        accessPolicy: 'PUBLIC',
        downloadCount: 110,
        sortOrder: 1
      },
      {
        id: 'fl-202',
        productId: 'prod-002',
        fileName: '의학논문_프롬프트_프레임워크.docx',
        fileType: 'docx',
        fileSize: '450 KB',
        accessPolicy: 'PUBLIC',
        downloadCount: 30,
        sortOrder: 2
      }
    ]
  },
  {
    id: 'prod-003',
    title: '투고 서식 지원 Agent',
    category: 'AGENT',
    shortDescription: '국내외 주요 학술지 투고 규정 자동 검점 및 참고문헌(EndNote/APA/Vancouver) 정밀 교정',
    description: '논문 투고 전 대표적인 학술지(KCI, SCI, SCIE급) 규격에 맞추어 폰트, 여백, 표/그림 레이아웃, 참고문헌 인용 스타일(APA, Vancouver 등)을 점검해 드립니다.',
    creatorName: '박현우',
    creatorDepartment: '학술정보팀 · Beta Crew',
    creatorEmail: 'hw.park@stm.or.kr',
    thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
    status: 'PUBLISHED',
    viewCount: 389,
    downloadCount: 94,
    requestCount: 12,
    featured: false,
    createdAt: '2026-07-02T13:10:00Z',
    updatedAt: '2026-07-28T16:00:00Z',
    features: [
      { id: 'f-301', productId: 'prod-003', featureText: '목표 학술지 선택 시 투고가이드 자동 비교 분석', sortOrder: 1 },
      { id: 'f-302', productId: 'prod-003', featureText: '참고문헌(Reference) 오탈자 및 스타일 자동 정렬', sortOrder: 2 },
      { id: 'f-303', productId: 'prod-003', featureText: 'Word 파일 스타일 누락/오류 리포트 출력', sortOrder: 3 }
    ],
    previews: [
      {
        id: 'pv-301',
        productId: 'prod-003',
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
        caption: '투고 서식 분석 및 오류 검출 대시보드',
        sortOrder: 1
      }
    ],
    files: [
      {
        id: 'fl-301',
        productId: 'prod-003',
        fileName: '학술지별_투고규정_체크리스트_2026.xlsx',
        fileType: 'xlsx',
        fileSize: '1.8 MB',
        accessPolicy: 'PUBLIC',
        downloadCount: 78,
        sortOrder: 1
      },
      {
        id: 'fl-302',
        productId: 'prod-003',
        fileName: '서식점검_Agent_설치파일.zip',
        fileType: 'zip',
        fileSize: '8.5 MB',
        accessPolicy: 'REQUEST',
        downloadCount: 16,
        sortOrder: 2
      }
    ]
  },
  {
    id: 'prod-004',
    title: '현장업무 관리 웹앱',
    category: 'WEB',
    shortDescription: '원내 시설 점검, 수리 이력, 유휴 비품 관리를 모바일 웹에서 실시간으로 처리',
    description: '원내 현장 점검 직원 및 시설 관리팀을 위한 모바일 친화적인 Web App입니다. QR 코드로 비품 및 장비를 식별하고, 점검 결과 사진 업로드, 수리 요청 및 이력을 현장에서 즉시 등록할 수 있습니다.',
    creatorName: '이승준',
    creatorDepartment: '시설관리팀 · Beta Crew',
    creatorEmail: 'sj.lee@stm.or.kr',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    serviceUrl: 'https://facility-manage.eunpyeong.hospital',
    status: 'PUBLISHED',
    viewCount: 520,
    downloadCount: 45,
    requestCount: 19,
    featured: true,
    createdAt: '2026-06-10T11:00:00Z',
    updatedAt: '2026-08-03T09:15:00Z',
    features: [
      { id: 'f-401', productId: 'prod-004', featureText: '모바일 카메라 기반 QR 코드 장비 인식', sortOrder: 1 },
      { id: 'f-402', productId: 'prod-004', featureText: '현장 수리 요청 접수 및 처리 진행률 실시간 알림', sortOrder: 2 },
      { id: 'f-403', productId: 'prod-004', featureText: '유휴 비품 상태 및 부서 간 이관 신청 기능', sortOrder: 3 },
      { id: 'f-404', productId: 'prod-004', featureText: '월간 원내 시설 안전점검 보고서 자동 집계', sortOrder: 4 }
    ],
    previews: [
      {
        id: 'pv-401',
        productId: 'prod-004',
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        caption: '현장업무 관리 모바일 및 데스크톱 화면',
        sortOrder: 1
      }
    ],
    files: [
      {
        id: 'fl-401',
        productId: 'prod-004',
        fileName: '현장점검_모바일앱_사용안내서.pdf',
        fileType: 'pdf',
        fileSize: '4.2 MB',
        accessPolicy: 'PUBLIC',
        downloadCount: 45,
        sortOrder: 1
      }
    ]
  },
  {
    id: 'prod-005',
    title: '업무 현황 Excel Dashboard',
    category: 'EXCEL',
    shortDescription: '매크로와 매끄러운 수식으로 부서별 실적 및 잔여 업무를 자동 시각화하는 Excel Template',
    description: '별도 시스템 도입 없이 엑셀 데이터 입력만으로 예쁜 그래프와 진행 현황을 자동 계산해 주는 대시보드 템플릿입니다. 주간 보고서나 부서 실적 정리 시 엑셀 작업을 10분 내로 끝낼 수 있습니다.',
    creatorName: '정다은',
    creatorDepartment: '기획조정팀 · Beta Crew',
    creatorEmail: 'de.jung@stm.or.kr',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    status: 'PUBLISHED',
    viewCount: 740,
    downloadCount: 310,
    requestCount: 8,
    featured: true,
    createdAt: '2026-05-18T08:30:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
    features: [
      { id: 'f-501', productId: 'prod-005', featureText: '원클릭 데이터 업데이트 및 피벗 차트 자동 연동', sortOrder: 1 },
      { id: 'f-502', productId: 'prod-005', featureText: '목표 달성률 KPI 게이지 및 트렌드 시각화', sortOrder: 2 },
      { id: 'f-503', productId: 'prod-005', featureText: '인쇄/PDF 출력에 최적화된 레이아웃 설계', sortOrder: 3 }
    ],
    previews: [
      {
        id: 'pv-501',
        productId: 'prod-005',
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        caption: '엑셀 대시보드 시각화 화면',
        sortOrder: 1
      }
    ],
    files: [
      {
        id: 'fl-501',
        productId: 'prod-005',
        fileName: '은평성모_업무현황_대시보드_v2.0.xlsm',
        fileType: 'xlsm',
        fileSize: '2.8 MB',
        accessPolicy: 'PUBLIC',
        downloadCount: 310,
        sortOrder: 1
      }
    ]
  },
  {
    id: 'prod-006',
    title: '회의록 정리 Prompt 템플릿',
    category: 'PROMPT',
    shortDescription: '두서없는 회의 음성/녹취/메모를 정갈한 보고서 규격으로 변환하는 프롬프트 모음',
    description: 'ChatGPT, Gemini, Claude 등 원내 AI 도구에서 활용할 수 있는 회의록 가공 프롬프트입니다. 회의 주제, 결정 사항, 담당자별 액션 아이템, 차기 회의 일정을 깔끔하게 분리하여 정돈해 줍니다.',
    creatorName: '최서연',
    creatorDepartment: '간호부 · Beta Crew',
    creatorEmail: 'sy.choi@stm.or.kr',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    status: 'PUBLISHED',
    viewCount: 890,
    downloadCount: 420,
    requestCount: 5,
    featured: true,
    createdAt: '2026-05-10T15:20:00Z',
    updatedAt: '2026-08-02T13:00:00Z',
    features: [
      { id: 'f-601', productId: 'prod-006', featureText: '회의록 핵심 요약(Executive Summary) 추출', sortOrder: 1 },
      { id: 'f-602', productId: 'prod-006', featureText: '담당자별 Action Item 및 기한 자동 구별', sortOrder: 2 },
      { id: 'f-603', productId: 'prod-006', featureText: '사내 보고서 제출용 Markdown/표 양식 출력', sortOrder: 3 }
    ],
    previews: [
      {
        id: 'pv-601',
        productId: 'prod-006',
        type: 'SAMPLE_INPUT',
        textContent: '[회의 메모 스크립트]\n8월 5일 간호부 팀장 회의.\n참석자: 최서연, 김지은, 박민아.\n안건: 병동 환자 안내문 개정 건.\n이야기나눈 내용:\n- 5병동 안내문 문구가 너무 어려움. 최서연 간호사가 8월 12일까지 AI 도구로 쉽게 변경해보기로함.\n- 김지은 간호사는 8월 15일까지 각 병동 전달 예정.\n- 다음 회의는 8월 20일 오전 10시.',
        caption: '날것의 회의 메모 입력 예시',
        sortOrder: 1
      },
      {
        id: 'pv-602',
        productId: 'prod-006',
        type: 'SAMPLE_OUTPUT',
        textContent: '[AI 회의록 정리 결과]\n■ 회의명: 간호부 팀장 회의 (병동 환자 안내문 개정)\n■ 일시/참석자: 2026.08.05 / 최서연, 김지은, 박민아\n\n1. 주요 결정사항\n - 5병동 안내문 난이도 완화를 위한 AI 가공 추진\n\n2. 담당자별 Action Item\n - 최서연: AI 기반 안내문 개정안 작성 (~08/12)\n - 김지은: 개정 안내문 병동 전달 및 적용 (~08/15)\n\n3. 차기 일정\n - 일시: 2026년 8월 20일(목) 10:00',
        caption: '프롬프트 실행 결과',
        sortOrder: 2
      }
    ],
    files: [
      {
        id: 'fl-601',
        productId: 'prod-006',
        fileName: '은평성모_회의록정리_프롬프트가이드.pdf',
        fileType: 'pdf',
        fileSize: '880 KB',
        accessPolicy: 'PUBLIC',
        downloadCount: 420,
        sortOrder: 1
      }
    ]
  },
  {
    id: 'prod-007',
    title: '환자 맞춤형 안내문 자동생성기',
    category: 'AUTOMATION',
    shortDescription: '진료과별 시술/검사 안내문을 환자 눈높이에 맞춰 쉬운 언어로 변환 및 생성',
    description: '복잡한 의료 용어가 담긴 시술 및 진료 안내문을 환자와 보호자가 한눈에 이해하기 쉽도록 초등학생 수준의 평이한 문장과 주의사항 체크리스트로 자동 구성해 주는 서비스입니다.',
    creatorName: '강태양',
    creatorDepartment: '홍보팀 · Beta Crew',
    creatorEmail: 'ty.kang@stm.or.kr',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    serviceUrl: 'https://patient-guide.eunpyeong.hospital',
    status: 'PUBLISHED',
    viewCount: 310,
    downloadCount: 52,
    requestCount: 9,
    featured: false,
    createdAt: '2026-07-22T11:40:00Z',
    updatedAt: '2026-08-04T17:10:00Z',
    features: [
      { id: 'f-701', productId: 'prod-007', featureText: '의학 전문용어 쉬운 풀이 변환 엔진 탑재', sortOrder: 1 },
      { id: 'f-702', productId: 'prod-007', featureText: '시술 전/후 주의사항 타임라인 자동 작성', sortOrder: 2 },
      { id: 'f-703', productId: 'prod-007', featureText: '원내 프린터용 A4 규격 레이아웃 즉시 출력', sortOrder: 3 }
    ],
    previews: [
      {
        id: 'pv-701',
        productId: 'prod-007',
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
        caption: '환자 안내문 편집기',
        sortOrder: 1
      }
    ],
    files: [
      {
        id: 'fl-701',
        productId: 'prod-007',
        fileName: '쉬운_환자안내문_샘플_10종.zip',
        fileType: 'zip',
        fileSize: '5.6 MB',
        accessPolicy: 'PUBLIC',
        downloadCount: 52,
        sortOrder: 1
      }
    ]
  },
  {
    id: 'prod-008',
    title: '임상 데이터 통계 요약 보고서',
    category: 'DATA',
    shortDescription: '원내 질환 통계 및 부서 지표 데이터를 자동으로 분석하고 차트로 시각화',
    description: '엑셀 및 CSV 형태의 환자 수, 재원일수, 질환 분포 데이터를 업로드하면 통계학적 주요 수치와 함께 한눈에 들어오는 인터랙티브 차트 및 PPT 보고서용 이미지로 가공합니다.',
    creatorName: '윤지훈',
    creatorDepartment: '의료정보팀 · Beta Crew',
    creatorEmail: 'jh.yoon@stm.or.kr',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    status: 'PUBLISHED',
    viewCount: 275,
    downloadCount: 68,
    requestCount: 15,
    featured: false,
    createdAt: '2026-07-29T14:00:00Z',
    updatedAt: '2026-08-06T09:20:00Z',
    features: [
      { id: 'f-801', productId: 'prod-008', featureText: '데이터 업로드 시 이상치(Outlier) 자동 감지', sortOrder: 1 },
      { id: 'f-802', productId: 'prod-008', featureText: '월별/분기별 추이 비교 다이어그램 생성', sortOrder: 2 },
      { id: 'f-803', productId: 'prod-008', featureText: '보고서용 슬라이드 고화질 이미지 내보내기', sortOrder: 3 }
    ],
    previews: [
      {
        id: 'pv-801',
        productId: 'prod-008',
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        caption: '임상 통계 분석 대시보드',
        sortOrder: 1
      }
    ],
    files: [
      {
        id: 'fl-801',
        productId: 'prod-008',
        fileName: '통계분석_자동화_스크립트_v1.0.py',
        fileType: 'py',
        fileSize: '120 KB',
        accessPolicy: 'REQUEST',
        downloadCount: 18,
        sortOrder: 1
      },
      {
        id: 'fl-802',
        productId: 'prod-008',
        fileName: '샘플_임상데이터_양식.xlsx',
        fileType: 'xlsx',
        fileSize: '1.5 MB',
        accessPolicy: 'PUBLIC',
        downloadCount: 50,
        sortOrder: 2
      }
    ]
  }
];

export const INITIAL_REQUESTS: MaterialRequest[] = [
  {
    id: 'req-001',
    productId: 'prod-001',
    fileId: 'fl-103',
    productTitle: '채용업무 자동화',
    fileName: '채용자동화_소스코드_및_배포가이드.zip',
    requesterName: '원동현',
    requesterDepartment: '전산정보팀',
    requesterEmail: 'dh.won@stm.or.kr',
    purpose: '원내 인사시스템 자체 서버 세팅 검토 및 테스트 목적으로 소스코드 확인 요청드립니다.',
    status: 'COMPLETED',
    requestedAt: '2026-08-02T10:15:00Z'
  },
  {
    id: 'req-002',
    productId: 'prod-002',
    fileId: 'fl-201',
    productTitle: '연구 작성 지원 Agent',
    fileName: '연구작성_Agent_활용가이드.pdf',
    requesterName: '최은지',
    requesterDepartment: '간호부 7병동',
    requesterEmail: 'ej.choi@stm.or.kr',
    purpose: '간호연구 학술 발표 준비 과정에서 AI Agent 활용 및 참고문헌 프롬프트 응용 방안을 모색하고자 합니다.',
    status: 'REQUESTED',
    requestedAt: '2026-08-08T16:30:00Z'
  },
  {
    id: 'req-003',
    productId: 'prod-003',
    fileId: 'fl-302',
    productTitle: '투고 서식 지원 Agent',
    fileName: '서식점검_Agent_설치파일.zip',
    requesterName: '김상우',
    requesterDepartment: '진료협력센터',
    requesterEmail: 'sw.kim@stm.or.kr',
    purpose: '학술지 투고 준비 중인 증례 보고서 점검용 설치 파일 요청',
    status: 'CONTACTED',
    requestedAt: '2026-08-09T09:10:00Z'
  }
];

export const INITIAL_SUBMISSIONS: UserSubmission[] = [
  {
    id: 'SUB-20260810-001',
    submitterName: '박현우',
    submitterDepartment: '원무팀',
    submitterEmail: 'hw.park@stm.or.kr',
    title: '제증명 발급 서식 자동 가이드',
    category: 'WEB',
    shortDescription: '원무과 제증명 발급 시 필요서류 및 수수료 자동 안내 AI 챗봇',
    description: '환자 및 내원객이 원무팀 창구 방문 전 제증명 서류 발급 조건과 신분증, 위임장 제출 여부를 챗봇 형태로 사전 확인할 수 있는 가이드 도구입니다.',
    features: [
      '발급 유형별(진단서, 수술확인서, 의무기록사본) 필요서류 자동 검색',
      '직계존비속/대리인 발급 시 제출 위임장 양식 자동 다운로드',
      '창구 안내 대기시간 단축 효과'
    ],
    serviceUrl: 'https://cert-guide.eunpyeong.hospital',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    previews: [
      {
        id: 'spv-001',
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
        caption: '서식 가이드 메인 화면'
      }
    ],
    status: 'REVIEW',
    submittedAt: '2026-08-10T14:20:00Z'
  }
];

