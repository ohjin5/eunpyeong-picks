import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ProductCategory,
} from '../types/store';

import {
  CATEGORY_MAP,
} from '../utils/categoryHelper';

import {
  X,
  Plus,
  Trash2,
  Send,
  Info,
  CheckCircle,
  AlertCircle,
  Globe,
  Image as ImageIcon,
  User,
  Mail,
  Building,
  Upload,
  RefreshCw,
} from 'lucide-react';


interface RegisterToolModalProps {
  onClose: () => void;
  onSubmitSuccess: () => void;
}


const MAX_THUMBNAIL_SIZE =
  3 * 1024 * 1024; // 3MB


const ALLOWED_THUMBNAIL_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
];


export const RegisterToolModal:
React.FC<RegisterToolModalProps> = ({
  onClose,
  onSubmitSuccess,
}) => {

  // ==========================================================
  // Form State
  // ==========================================================

  const [
    submitterName,
    setSubmitterName,
  ] = useState('');


  const [
    submitterDepartment,
    setSubmitterDepartment,
  ] = useState('');


  const [
    submitterEmail,
    setSubmitterEmail,
  ] = useState('');


  const [
    title,
    setTitle,
  ] = useState('');


  const [
    category,
    setCategory,
  ] = useState<ProductCategory>('WEB');


  const [
    shortDescription,
    setShortDescription,
  ] = useState('');


  const [
    description,
    setDescription,
  ] = useState('');


  const [
    features,
    setFeatures,
  ] = useState<string[]>(['']);


  const [
    serviceUrl,
    setServiceUrl,
  ] = useState('');


  // ==========================================================
  // Thumbnail State
  // ==========================================================

  /**
   * 사용자가 직접 선택한 실제 File
   */
  const [
    thumbnailFile,
    setThumbnailFile,
  ] = useState<File | null>(null);


  /**
   * Browser에서 즉시 보여주기 위한
   * 임시 Preview URL
   */
  const [
    thumbnailPreview,
    setThumbnailPreview,
  ] = useState<string | null>(null);


  const thumbnailInputRef =
    useRef<HTMLInputElement | null>(null);


  // ==========================================================
  // Preview Image URL State
  // ==========================================================

  const [
    previewUrls,
    setPreviewUrls,
  ] = useState<
    {
      url: string;
      caption: string;
    }[]
  >([
    {
      url: '',
      caption: '',
    },
  ]);


  // ==========================================================
  // Submit State
  // ==========================================================

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  const [
    errorMsg,
    setErrorMsg,
  ] = useState('');


  const [
    submitted,
    setSubmitted,
  ] = useState(false);


  // ==========================================================
  // Thumbnail Preview Cleanup
  // ==========================================================

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(
          thumbnailPreview
        );
      }
    };
  }, [thumbnailPreview]);


  // ==========================================================
  // Feature Handlers
  // ==========================================================

  const handleAddFeature = () => {
    setFeatures([
      ...features,
      '',
    ]);
  };


  const handleUpdateFeature = (
    index: number,
    value: string
  ) => {
    const updated =
      [...features];

    updated[index] =
      value;

    setFeatures(updated);
  };


  const handleRemoveFeature = (
    index: number
  ) => {
    if (
      features.length <= 1
    ) {
      return;
    }

    setFeatures(
      features.filter(
        (_, i) =>
          i !== index
      )
    );
  };


  // ==========================================================
  // Preview Image URL Handlers
  // ==========================================================

  const handleAddPreview = () => {
    setPreviewUrls([
      ...previewUrls,
      {
        url: '',
        caption: '',
      },
    ]);
  };


  const handleUpdatePreview = (
    index: number,
    field:
      | 'url'
      | 'caption',
    value: string
  ) => {
    const updated =
      [...previewUrls];

    updated[index][field] =
      value;

    setPreviewUrls(updated);
  };


  const handleRemovePreview = (
    index: number
  ) => {
    setPreviewUrls(
      previewUrls.filter(
        (_, i) =>
          i !== index
      )
    );
  };


  // ==========================================================
  // Thumbnail Handler
  // ==========================================================

  const handleThumbnailChange = (
    event:
      React.ChangeEvent<HTMLInputElement>
  ) => {

    setErrorMsg('');


    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    // --------------------------------------------------------
    // Type Validation
    // --------------------------------------------------------

    if (
      !ALLOWED_THUMBNAIL_TYPES
        .includes(file.type)
    ) {
      setErrorMsg(
        '썸네일은 PNG, JPG, JPEG, WEBP 이미지만 업로드할 수 있습니다.'
      );

      event.target.value =
        '';

      return;
    }


    // --------------------------------------------------------
    // Size Validation
    // --------------------------------------------------------

    if (
      file.size >
      MAX_THUMBNAIL_SIZE
    ) {
      setErrorMsg(
        '썸네일 이미지는 최대 3MB까지 업로드할 수 있습니다.'
      );

      event.target.value =
        '';

      return;
    }


    // --------------------------------------------------------
    // 기존 Object URL 제거
    // --------------------------------------------------------

    if (thumbnailPreview) {
      URL.revokeObjectURL(
        thumbnailPreview
      );
    }


    // --------------------------------------------------------
    // 새 Preview
    // --------------------------------------------------------

    const previewUrl =
      URL.createObjectURL(file);


    setThumbnailFile(file);

    setThumbnailPreview(
      previewUrl
    );
  };


  // ==========================================================
  // Thumbnail Delete
  // ==========================================================

  const handleRemoveThumbnail = () => {

    if (thumbnailPreview) {
      URL.revokeObjectURL(
        thumbnailPreview
      );
    }


    setThumbnailFile(null);

    setThumbnailPreview(null);


    if (
      thumbnailInputRef.current
    ) {
      thumbnailInputRef.current.value =
        '';
    }
  };


  // ==========================================================
  // File → Base64
  // ==========================================================

  const fileToBase64 = (
    file: File
  ): Promise<string> => {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        const reader =
          new FileReader();


        reader.onload = () => {
          resolve(
            reader.result as string
          );
        };


        reader.onerror = () => {
          reject(
            new Error(
              '이미지를 읽는 중 오류가 발생했습니다.'
            )
          );
        };


        reader.readAsDataURL(
          file
        );
      }
    );
  };


  // ==========================================================
  // Thumbnail Upload
  // ==========================================================

  const uploadThumbnail =
    async (): Promise<
      string | undefined
    > => {

      /**
       * 사용자가 썸네일을 선택하지 않은 경우
       * DB에는 NULL 상태로 둔다.
       */
      if (!thumbnailFile) {
        return undefined;
      }


      const fileData =
        await fileToBase64(
          thumbnailFile
        );


      const response =
        await fetch(
          '/api/upload',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                fileName:
                  thumbnailFile.name,

                fileType:
                  thumbnailFile.type,

                fileData,

                targetType:
                  'submission',

                /**
                 * 아직 Submission UUID가
                 * 생성되기 전이므로
                 * 서버가 임시 경로를 만든다.
                 */
                targetId:
                  null,
              }),
          }
        );


      const result =
        await response
          .json()
          .catch(
            () => ({})
          );


      if (!response.ok) {
        throw new Error(
          result.message ||
          '썸네일 업로드에 실패했습니다.'
        );
      }


      if (!result.path) {
        throw new Error(
          '썸네일 저장 경로를 확인할 수 없습니다.'
        );
      }


      /**
       * Signed URL이 아니라
       * Storage Path를 반환한다.
       */
      return result.path;
    };


  // ==========================================================
  // Submit Handler
  // ==========================================================

  const handleSubmit = async (
    event:
      React.FormEvent
  ) => {

    event.preventDefault();

    setErrorMsg('');


    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (
      !submitterName.trim()
    ) {
      setErrorMsg(
        '신청자 이름을 입력해주세요.'
      );

      return;
    }


    if (
      !submitterDepartment.trim()
    ) {
      setErrorMsg(
        '신청자 부서를 입력해주세요.'
      );

      return;
    }


    if (
      !submitterEmail.trim()
    ) {
      setErrorMsg(
        '담당자 이메일을 입력해주세요.'
      );

      return;
    }


    if (!title.trim()) {
      setErrorMsg(
        '서비스명을 입력해주세요.'
      );

      return;
    }


    if (
      !shortDescription.trim()
    ) {
      setErrorMsg(
        '한줄 소개를 입력해주세요.'
      );

      return;
    }


    if (
      !description.trim()
    ) {
      setErrorMsg(
        '상세 설명을 입력해주세요.'
      );

      return;
    }


    try {

      setIsSubmitting(true);


      // ------------------------------------------------------
      // Feature 정리
      // ------------------------------------------------------

      const cleanFeatures =
        features
          .map(
            (feature) =>
              feature.trim()
          )
          .filter(
            (feature) =>
              feature.length > 0
          );


      // ------------------------------------------------------
      // Preview URL 정리
      // ------------------------------------------------------

      const cleanPreviews =
        previewUrls
          .map(
            (preview) => ({
              url:
                preview.url.trim(),

              caption:
                preview.caption.trim(),
            })
          )
          .filter(
            (preview) =>
              preview.url.length >
              0
          );


      // ------------------------------------------------------
      // 1. Thumbnail Upload
      // ------------------------------------------------------

      const thumbnailPath =
        await uploadThumbnail();


      // ------------------------------------------------------
      // 2. Submission 생성
      // ------------------------------------------------------

      const response =
        await fetch(
          '/api/submissions',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                submitterName:
                  submitterName
                    .trim(),

                submitterDepartment:
                  submitterDepartment
                    .trim(),

                submitterEmail:
                  submitterEmail
                    .trim(),

                title:
                  title.trim(),

                category,

                shortDescription:
                  shortDescription
                    .trim(),

                description:
                  description
                    .trim(),

                features:
                  cleanFeatures,

                serviceUrl:
                  serviceUrl
                    .trim() ||
                  undefined,

                /**
                 * Storage Path
                 *
                 * 사용자가 이미지를 선택하지
                 * 않았다면 undefined
                 */
                thumbnailUrl:
                  thumbnailPath,

                previews:
                  cleanPreviews,
              }),
          }
        );


      const responseData =
        await response
          .json()
          .catch(
            () => ({})
          );


      if (!response.ok) {
        throw new Error(
          responseData.message ||
          '등록 신청에 실패했습니다.'
        );
      }


      // ------------------------------------------------------
      // Success
      // ------------------------------------------------------

      setSubmitted(true);


      setTimeout(
        () => {
          onSubmitSuccess();
        },
        1800
      );

    } catch (error: any) {

      console.error(
        'Tool submission error:',
        error
      );


      setErrorMsg(
        error.message ||
        '신청 중 오류가 발생했습니다.'
      );

    } finally {

      setIsSubmitting(false);

    }
  };


  // ==========================================================
  // Categories
  // ==========================================================

  const categories =
    Object.keys(
      CATEGORY_MAP
    ) as ProductCategory[];


  // ==========================================================
  // Render
  // ==========================================================

  return (

    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        p-3 sm:p-6
        bg-slate-900/40
        backdrop-blur-xs
        overflow-y-auto
      "
    >

      <div
        className="
          relative
          bg-white
          dark:bg-[#1c1c1e]
          w-full
          max-w-2xl
          rounded-3xl
          shadow-2xl
          border
          border-slate-100
          dark:border-slate-800
          overflow-hidden
          my-auto
          max-h-[92vh]
          flex flex-col
        "
      >

        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}

        <div
          className="
            sticky top-0 z-20
            px-6 py-4
            bg-white/95
            dark:bg-[#1c1c1e]/95
            backdrop-blur-md
            border-b
            border-slate-100
            dark:border-slate-800
            flex items-center
            justify-between
            shrink-0
          "
        >

          <div>

            <h2
              className="
                text-lg font-bold
                text-slate-900
                dark:text-white
              "
            >
              도구 등록 신청
            </h2>

            <p
              className="
                text-xs
                text-slate-500
                dark:text-slate-400
              "
            >
              직접 개발하거나 발굴한 AI·업무 도구를 Store에 등록 신청합니다.
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="
              p-1.5
              text-slate-400
              hover:text-slate-700
              dark:hover:text-slate-200
              hover:bg-slate-100
              dark:hover:bg-slate-800
              rounded-full
              transition-colors
              cursor-pointer
            "
          >
            <X className="w-5 h-5" />
          </button>

        </div>


        {/* ================================================= */}
        {/* Content */}
        {/* ================================================= */}

        <div
          className="
            p-6 sm:p-8
            overflow-y-auto
            flex-1
          "
        >

          {submitted ? (

            // =================================================
            // Success
            // =================================================

            <div
              className="
                py-12
                text-center
                space-y-4
              "
            >

              <div
                className="
                  w-14 h-14
                  bg-emerald-100
                  dark:bg-emerald-950/60
                  text-emerald-600
                  dark:text-emerald-400
                  rounded-full
                  flex items-center
                  justify-center
                  mx-auto
                "
              >
                <CheckCircle className="w-8 h-8" />
              </div>


              <h3
                className="
                  text-xl
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                도구 등록 신청이 완료되었습니다!
              </h3>


              <p
                className="
                  text-xs sm:text-sm
                  text-slate-500
                  dark:text-slate-400
                  max-w-md
                  mx-auto
                  leading-relaxed
                "
              >
                관리자 검토 및 승인 후 메인 Store에 게시됩니다.
                <br />
                감사합니다.
              </p>

            </div>

          ) : (

            // =================================================
            // Form
            // =================================================

            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >

              {/* =========================================== */}
              {/* Error */}
              {/* =========================================== */}

              {errorMsg && (

                <div
                  className="
                    p-3.5
                    rounded-2xl
                    bg-rose-50
                    dark:bg-rose-950/50
                    border
                    border-rose-200
                    dark:border-rose-800
                    text-rose-700
                    dark:text-rose-300
                    text-xs
                    font-semibold
                    flex
                    items-center
                    gap-2
                  "
                >

                  <AlertCircle
                    className="
                      w-4 h-4 shrink-0
                    "
                  />

                  <span>
                    {errorMsg}
                  </span>

                </div>

              )}


              {/* =========================================== */}
              {/* 신청자 */}
              {/* =========================================== */}

              <div className="space-y-4 pt-1">

                <div
                  className="
                    border-b
                    border-slate-100
                    dark:border-slate-800
                    pb-2
                  "
                >
                  <h3
                    className="
                      text-xs
                      font-bold
                      text-slate-400
                      uppercase
                      tracking-wider
                    "
                  >
                    신청자 / 담당자 정보
                  </h3>
                </div>


                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-4
                  "
                >

                  {/* 이름 */}

                  <div>

                    <label
                      className="
                        block text-xs
                        font-semibold
                        text-slate-700
                        dark:text-slate-300
                        mb-1
                      "
                    >
                      이름
                      <span className="text-rose-500">
                        {' '}*
                      </span>
                    </label>


                    <div className="relative">

                      <User
                        className="
                          w-4 h-4
                          text-slate-400
                          absolute
                          left-3 top-3
                        "
                      />

                      <input
                        type="text"
                        value={submitterName}
                        onChange={
                          (e) =>
                            setSubmitterName(
                              e.target.value
                            )
                        }
                        placeholder="예: 홍길동"
                        className="
                          w-full
                          pl-9 pr-3
                          py-2.5
                          bg-slate-50
                          dark:bg-slate-800/60
                          border
                          border-slate-200
                          dark:border-slate-700
                          rounded-xl
                          text-xs
                          text-slate-900
                          dark:text-white
                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                        "
                        required
                      />

                    </div>

                  </div>


                  {/* 부서 */}

                  <div>

                    <label
                      className="
                        block text-xs
                        font-semibold
                        text-slate-700
                        dark:text-slate-300
                        mb-1
                      "
                    >
                      부서
                      <span className="text-rose-500">
                        {' '}*
                      </span>
                    </label>


                    <div className="relative">

                      <Building
                        className="
                          w-4 h-4
                          text-slate-400
                          absolute
                          left-3 top-3
                        "
                      />

                      <input
                        type="text"
                        value={
                          submitterDepartment
                        }
                        onChange={
                          (e) =>
                            setSubmitterDepartment(
                              e.target.value
                            )
                        }
                        placeholder="예: 간호부, 원무팀"
                        className="
                          w-full
                          pl-9 pr-3
                          py-2.5
                          bg-slate-50
                          dark:bg-slate-800/60
                          border
                          border-slate-200
                          dark:border-slate-700
                          rounded-xl
                          text-xs
                          text-slate-900
                          dark:text-white
                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                        "
                        required
                      />

                    </div>

                  </div>

                </div>


                {/* 이메일 */}

                <div>

                  <label
                    className="
                      block text-xs
                      font-semibold
                      text-slate-700
                      dark:text-slate-300
                      mb-1
                    "
                  >
                    실제 사용하는 이메일
                    <span className="text-rose-500">
                      {' '}*
                    </span>
                  </label>


                  <div className="relative">

                    <Mail
                      className="
                        w-4 h-4
                        text-slate-400
                        absolute
                        left-3 top-3
                      "
                    />

                    <input
                      type="email"
                      value={submitterEmail}
                      onChange={
                        (e) =>
                          setSubmitterEmail(
                            e.target.value
                          )
                      }
                      placeholder="예: gildong.hong@stm.or.kr"
                      className="
                        w-full
                        pl-9 pr-3
                        py-2.5
                        bg-slate-50
                        dark:bg-slate-800/60
                        border
                        border-slate-200
                        dark:border-slate-700
                        rounded-xl
                        text-xs
                        text-slate-900
                        dark:text-white
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                      required
                    />

                  </div>


                  <div
                    className="
                      mt-2.5
                      p-3
                      rounded-xl
                      bg-blue-50/80
                      dark:bg-blue-950/40
                      border
                      border-blue-100
                      dark:border-blue-900/60
                      text-blue-900
                      dark:text-blue-300
                      text-[11px]
                      leading-relaxed
                      flex
                      items-start
                      gap-2
                    "
                  >

                    <Info
                      className="
                        w-4 h-4
                        text-blue-600
                        dark:text-blue-400
                        shrink-0
                        mt-0.5
                      "
                    />

                    <p>
                      이 이메일은 Store 화면에 직접 노출되지 않습니다.
                      서비스 이용 신청 및 관련 문의가 접수될 경우
                      담당자 연락용으로 사용됩니다.
                    </p>

                  </div>

                </div>

              </div>


              {/* =========================================== */}
              {/* 기본 정보 */}
              {/* =========================================== */}

              <div className="space-y-4">

                <div
                  className="
                    border-b
                    border-slate-100
                    dark:border-slate-800
                    pb-2
                  "
                >
                  <h3
                    className="
                      text-xs
                      font-bold
                      text-slate-400
                      uppercase
                      tracking-wider
                    "
                  >
                    도구 기본정보
                  </h3>
                </div>


                {/* 서비스명 */}

                <div>

                  <label
                    className="
                      block text-xs
                      font-semibold
                      text-slate-700
                      dark:text-slate-300
                      mb-1
                    "
                  >
                    서비스명
                    <span className="text-rose-500">
                      {' '}*
                    </span>
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={
                      (e) =>
                        setTitle(
                          e.target.value
                        )
                    }
                    placeholder="예: 채용업무 자동화"
                    className="
                      w-full
                      px-3.5 py-2.5
                      bg-slate-50
                      dark:bg-slate-800/60
                      border
                      border-slate-200
                      dark:border-slate-700
                      rounded-xl
                      text-xs
                      text-slate-900
                      dark:text-white
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                    required
                  />

                </div>


                {/* 카테고리 */}

                <div>

                  <label
                    className="
                      block text-xs
                      font-semibold
                      text-slate-700
                      dark:text-slate-300
                      mb-1
                    "
                  >
                    카테고리
                    <span className="text-rose-500">
                      {' '}*
                    </span>
                  </label>


                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="
                      w-full
                      px-3.5 py-2.5
                      bg-slate-50
                      dark:bg-slate-800/60
                      border
                      border-slate-200
                      dark:border-slate-700
                      rounded-xl
                      text-xs
                      font-semibold
                      text-slate-900
                      dark:text-white
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  >

                    {categories.map(
                      (categoryKey) => (

                        <option
                          key={categoryKey}
                          value={categoryKey}
                        >
                          {
                            CATEGORY_MAP[
                              categoryKey
                            ].label
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* 한줄 소개 */}

                <div>

                  <label
                    className="
                      block text-xs
                      font-semibold
                      text-slate-700
                      dark:text-slate-300
                      mb-1
                    "
                  >
                    한줄 소개
                    <span className="text-rose-500">
                      {' '}*
                    </span>
                  </label>

                  <input
                    type="text"
                    value={shortDescription}
                    onChange={
                      (e) =>
                        setShortDescription(
                          e.target.value
                        )
                    }
                    placeholder="예: 반복되는 채용업무를 한 번에."
                    className="
                      w-full
                      px-3.5 py-2.5
                      bg-slate-50
                      dark:bg-slate-800/60
                      border
                      border-slate-200
                      dark:border-slate-700
                      rounded-xl
                      text-xs
                      text-slate-900
                      dark:text-white
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                    required
                  />

                </div>


                {/* 설명 */}

                <div>

                  <label
                    className="
                      block text-xs
                      font-semibold
                      text-slate-700
                      dark:text-slate-300
                      mb-1
                    "
                  >
                    상세 설명
                    <span className="text-rose-500">
                      {' '}*
                    </span>
                  </label>

                  <textarea
                    value={description}
                    onChange={
                      (e) =>
                        setDescription(
                          e.target.value
                        )
                    }
                    rows={4}
                    placeholder="이 도구가 어떤 원내 업무를 지원하고 어떻게 활용할 수 있는지 작성해 주세요."
                    className="
                      w-full
                      px-3.5 py-2.5
                      bg-slate-50
                      dark:bg-slate-800/60
                      border
                      border-slate-200
                      dark:border-slate-700
                      rounded-xl
                      text-xs
                      text-slate-900
                      dark:text-white
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                      resize-none
                    "
                    required
                  />

                </div>

              </div>


              {/* =========================================== */}
              {/* 주요 기능 */}
              {/* =========================================== */}

              <div className="space-y-3">

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-slate-100
                    dark:border-slate-800
                    pb-2
                  "
                >

                  <h3
                    className="
                      text-xs
                      font-bold
                      text-slate-400
                      uppercase
                      tracking-wider
                    "
                  >
                    주요 기능
                  </h3>


                  <button
                    type="button"
                    onClick={
                      handleAddFeature
                    }
                    className="
                      text-xs
                      font-bold
                      text-blue-600
                      dark:text-blue-400
                      hover:underline
                      flex
                      items-center
                      gap-1
                      cursor-pointer
                    "
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>기능 추가</span>
                  </button>

                </div>


                <div className="space-y-2">

                  {features.map(
                    (
                      feature,
                      index
                    ) => (

                      <div
                        key={index}
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <input
                          type="text"
                          value={feature}
                          onChange={
                            (e) =>
                              handleUpdateFeature(
                                index,
                                e.target.value
                              )
                          }
                          placeholder={
                            `기능 ${index + 1} (예: 채용공고문 초안 자동 생성)`
                          }
                          className="
                            flex-1
                            px-3.5 py-2
                            bg-slate-50
                            dark:bg-slate-800/60
                            border
                            border-slate-200
                            dark:border-slate-700
                            rounded-xl
                            text-xs
                            text-slate-900
                            dark:text-white
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                          "
                        />


                        {features.length > 1 && (

                          <button
                            type="button"
                            onClick={
                              () =>
                                handleRemoveFeature(
                                  index
                                )
                            }
                            className="
                              p-2
                              text-slate-400
                              hover:text-rose-500
                              transition-colors
                              cursor-pointer
                            "
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        )}

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* =========================================== */}
              {/* 서비스 주소 */}
              {/* =========================================== */}

              <div className="space-y-3">

                <div
                  className="
                    border-b
                    border-slate-100
                    dark:border-slate-800
                    pb-2
                  "
                >
                  <h3
                    className="
                      text-xs
                      font-bold
                      text-slate-400
                      uppercase
                      tracking-wider
                    "
                  >
                    서비스 주소 (선택)
                  </h3>
                </div>


                <div>

                  <div className="relative">

                    <Globe
                      className="
                        w-4 h-4
                        text-slate-400
                        absolute
                        left-3 top-3
                      "
                    />

                    <input
                      type="url"
                      value={serviceUrl}
                      onChange={
                        (e) =>
                          setServiceUrl(
                            e.target.value
                          )
                      }
                      placeholder="https://..."
                      className="
                        w-full
                        pl-9 pr-3
                        py-2.5
                        bg-slate-50
                        dark:bg-slate-800/60
                        border
                        border-slate-200
                        dark:border-slate-700
                        rounded-xl
                        text-xs
                        text-slate-900
                        dark:text-white
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                    />

                  </div>


                  <p
                    className="
                      text-[11px]
                      text-slate-400
                      mt-1.5
                      pl-1
                    "
                  >
                    현재 바로 사용할 수 있는 서비스 주소가 있는 경우에만 입력해주세요.
                    (URL이 없어도 등록 가능)
                  </p>

                </div>

              </div>


              {/* =========================================== */}
              {/* 대표 이미지 */}
              {/* =========================================== */}

              <div className="space-y-4">

                <div
                  className="
                    border-b
                    border-slate-100
                    dark:border-slate-800
                    pb-2
                  "
                >
                  <h3
                    className="
                      text-xs
                      font-bold
                      text-slate-400
                      uppercase
                      tracking-wider
                    "
                  >
                    대표 이미지 및 화면 미리보기
                  </h3>
                </div>


                {/* ========================================= */}
                {/* Thumbnail */}
                {/* ========================================= */}

                <div className="space-y-3">

                  <div>

                    <label
                      className="
                        block
                        text-xs
                        font-semibold
                        text-slate-700
                        dark:text-slate-300
                      "
                    >
                      대표 썸네일
                      <span
                        className="
                          ml-1
                          text-slate-400
                          font-normal
                        "
                      >
                        (선택)
                      </span>
                    </label>

                    <p
                      className="
                        text-[11px]
                        text-slate-400
                        mt-1
                      "
                    >
                      원하는 이미지를 직접 등록할 수 있습니다.
                      등록하지 않으면 카테고리 기본 이미지가 사용됩니다.
                    </p>

                  </div>


                  {/* Hidden File Input */}

                  <input
                    ref={
                      thumbnailInputRef
                    }
                    type="file"
                    accept="
                      image/png,
                      image/jpeg,
                      image/webp
                    "
                    onChange={
                      handleThumbnailChange
                    }
                    className="hidden"
                  />


                  {thumbnailPreview ? (

                    // =======================================
                    // Selected Thumbnail Preview
                    // =======================================

                    <div className="space-y-3">

                      <div
                        className="
                          relative
                          aspect-[16/10]
                          overflow-hidden
                          rounded-2xl
                          border
                          border-slate-200
                          dark:border-slate-700
                          bg-slate-100
                          dark:bg-slate-800
                        "
                      >

                        <img
                          src={
                            thumbnailPreview
                          }
                          alt="선택한 썸네일 미리보기"
                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />


                        <div
                          className="
                            absolute
                            inset-x-0
                            bottom-0
                            p-3
                            bg-gradient-to-t
                            from-black/60
                            to-transparent
                          "
                        >
                          <p
                            className="
                              text-[11px]
                              text-white/90
                              font-medium
                              truncate
                            "
                          >
                            {
                              thumbnailFile
                                ?.name
                            }
                          </p>
                        </div>

                      </div>


                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >

                        <button
                          type="button"
                          onClick={
                            () =>
                              thumbnailInputRef
                                .current
                                ?.click()
                          }
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3.5
                            py-2
                            rounded-xl
                            bg-white
                            dark:bg-slate-800
                            border
                            border-slate-200
                            dark:border-slate-700
                            text-xs
                            font-semibold
                            text-slate-700
                            dark:text-slate-200
                            hover:bg-slate-50
                            dark:hover:bg-slate-700
                            transition-colors
                            cursor-pointer
                          "
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          이미지 변경
                        </button>


                        <button
                          type="button"
                          onClick={
                            handleRemoveThumbnail
                          }
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3.5
                            py-2
                            rounded-xl
                            text-xs
                            font-semibold
                            text-slate-500
                            hover:text-rose-600
                            hover:bg-rose-50
                            dark:hover:bg-rose-950/30
                            transition-colors
                            cursor-pointer
                          "
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          이미지 삭제
                        </button>

                      </div>

                    </div>

                  ) : (

                    // =======================================
                    // Upload Area
                    // =======================================

                    <button
                      type="button"
                      onClick={
                        () =>
                          thumbnailInputRef
                            .current
                            ?.click()
                      }
                      className="
                        group
                        w-full
                        aspect-[16/10]
                        max-h-[250px]
                        border-2
                        border-dashed
                        border-slate-200
                        dark:border-slate-700
                        rounded-2xl
                        bg-slate-50/70
                        dark:bg-slate-800/30
                        hover:bg-blue-50/50
                        dark:hover:bg-blue-950/20
                        hover:border-blue-300
                        dark:hover:border-blue-700
                        transition-all
                        cursor-pointer
                        flex
                        flex-col
                        items-center
                        justify-center
                        gap-3
                        px-6
                      "
                    >

                      <div
                        className="
                          w-12 h-12
                          rounded-2xl
                          bg-white
                          dark:bg-slate-800
                          border
                          border-slate-200
                          dark:border-slate-700
                          flex
                          items-center
                          justify-center
                          shadow-sm
                          group-hover:scale-105
                          transition-transform
                        "
                      >
                        <ImageIcon
                          className="
                            w-5 h-5
                            text-blue-600
                            dark:text-blue-400
                          "
                        />
                      </div>


                      <div className="text-center">

                        <p
                          className="
                            text-xs
                            font-bold
                            text-slate-700
                            dark:text-slate-200
                          "
                        >
                          원하는 썸네일 이미지 선택
                        </p>

                        <p
                          className="
                            text-[11px]
                            text-slate-400
                            mt-1
                          "
                        >
                          PNG · JPG · WEBP · 최대 3MB
                        </p>

                      </div>


                      <div
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          px-3
                          py-1.5
                          rounded-lg
                          bg-white
                          dark:bg-slate-800
                          border
                          border-slate-200
                          dark:border-slate-700
                          text-[11px]
                          font-semibold
                          text-slate-600
                          dark:text-slate-300
                        "
                      >
                        <Upload className="w-3.5 h-3.5" />
                        이미지 업로드
                      </div>

                    </button>

                  )}


                  <div
                    className="
                      flex
                      items-start
                      gap-2
                      px-1
                    "
                  >

                    <Info
                      className="
                        w-3.5 h-3.5
                        text-slate-400
                        shrink-0
                        mt-0.5
                      "
                    />

                    <p
                      className="
                        text-[10px]
                        leading-relaxed
                        text-slate-400
                      "
                    >
                      권장 비율은 16:10입니다.
                      다른 비율의 이미지도 등록할 수 있으며
                      Store 카드에서는 중앙을 기준으로 자동 조정됩니다.
                    </p>

                  </div>

                </div>


                {/* ========================================= */}
                {/* Preview Images */}
                {/* ========================================= */}

                <div
                  className="
                    space-y-2
                    pt-3
                    border-t
                    border-slate-100
                    dark:border-slate-800
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div>

                      <span
                        className="
                          text-xs
                          font-semibold
                          text-slate-700
                          dark:text-slate-300
                        "
                      >
                        화면 미리보기 이미지
                      </span>

                      <span
                        className="
                          ml-1
                          text-[10px]
                          text-slate-400
                        "
                      >
                        (선택)
                      </span>

                    </div>


                    <button
                      type="button"
                      onClick={
                        handleAddPreview
                      }
                      className="
                        text-xs
                        font-bold
                        text-blue-600
                        dark:text-blue-400
                        hover:underline
                        flex
                        items-center
                        gap-1
                        cursor-pointer
                      "
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>이미지 URL 추가</span>
                    </button>

                  </div>


                  {previewUrls.map(
                    (
                      preview,
                      index
                    ) => (

                      <div
                        key={index}
                        className="
                          p-3
                          rounded-xl
                          bg-slate-50
                          dark:bg-slate-800/40
                          border
                          border-slate-200/80
                          dark:border-slate-700/60
                          space-y-2
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <input
                            type="text"
                            value={
                              preview.url
                            }
                            onChange={
                              (e) =>
                                handleUpdatePreview(
                                  index,
                                  'url',
                                  e.target.value
                                )
                            }
                            placeholder="미리보기 이미지 URL (https://...)"
                            className="
                              flex-1
                              px-3 py-1.5
                              bg-white
                              dark:bg-slate-800
                              border
                              border-slate-200
                              dark:border-slate-700
                              rounded-lg
                              text-xs
                              text-slate-900
                              dark:text-white
                            "
                          />


                          <button
                            type="button"
                            onClick={
                              () =>
                                handleRemovePreview(
                                  index
                                )
                            }
                            className="
                              p-1.5
                              text-slate-400
                              hover:text-rose-500
                              cursor-pointer
                            "
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>


                        <input
                          type="text"
                          value={
                            preview.caption
                          }
                          onChange={
                            (e) =>
                              handleUpdatePreview(
                                index,
                                'caption',
                                e.target.value
                              )
                          }
                          placeholder="이미지 설명/캡션 (선택)"
                          className="
                            w-full
                            px-3 py-1.5
                            bg-white
                            dark:bg-slate-800
                            border
                            border-slate-200
                            dark:border-slate-700
                            rounded-lg
                            text-xs
                            text-slate-900
                            dark:text-white
                          "
                        />

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* =========================================== */}
              {/* Submit */}
              {/* =========================================== */}

              <div
                className="
                  pt-4
                  border-t
                  border-slate-100
                  dark:border-slate-800
                  flex
                  items-center
                  justify-end
                  gap-3
                "
              >

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="
                    px-5 py-2.5
                    rounded-xl
                    text-xs
                    font-bold
                    text-slate-600
                    dark:text-slate-300
                    hover:bg-slate-100
                    dark:hover:bg-slate-800
                    transition-colors
                    cursor-pointer
                    disabled:opacity-50
                  "
                >
                  취소
                </button>


                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    px-6 py-2.5
                    rounded-xl
                    bg-slate-900
                    dark:bg-white
                    text-white
                    dark:text-slate-900
                    font-bold
                    text-xs
                    shadow-md
                    hover:bg-slate-800
                    dark:hover:bg-slate-100
                    transition-all
                    flex
                    items-center
                    gap-2
                    cursor-pointer
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >

                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}


                  <span>
                    {isSubmitting
                      ? '등록 중...'
                      : '등록 신청하기'
                    }
                  </span>

                </button>

              </div>

            </form>

          )}

        </div>

      </div>

    </div>
  );
};