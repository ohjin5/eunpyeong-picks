import React from 'react';

import {
  Product,
} from '../types/store';

import {
  getCategoryInfo,
} from '../utils/categoryHelper';

import {
  X,
  ExternalLink,
  Eye,
  CheckCircle2,
  Info,
  Layers,
  UserCheck,
} from 'lucide-react';


interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onRequestService: (product: Product) => void;
}


export const ProductDetailModal: React.FC<
  ProductDetailModalProps
> = ({
  product,
  onClose,
  onRequestService,
}) => {
  if (!product) {
    return null;
  }


  const cat =
    getCategoryInfo(
      product.category
    );


  // ----------------------------------------------------
  // 화면 미리보기
  // IMAGE / VIDEO 타입만 표시
  // ----------------------------------------------------

  const galleryPreviews =
    (product.previews || []).filter(
      (preview) =>
        preview.type === 'IMAGE' ||
        preview.type === 'VIDEO'
    );


  // ----------------------------------------------------
  // 서비스 이용
  // ----------------------------------------------------

  const handleUseService = () => {
    if (
      product.serviceUrl &&
      product.serviceUrl.trim().length > 0
    ) {
      window.open(
        product.serviceUrl,
        '_blank',
        'noopener,noreferrer'
      );

      return;
    }

    onRequestService(product);
  };


  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        p-3
        sm:p-6
        bg-slate-900/40
        backdrop-blur-xs
        overflow-y-auto
      "
      onClick={onClose}
    >
      <div
        className="
          relative
          bg-white
          w-full
          max-w-3xl
          rounded-3xl
          shadow-2xl
          border
          border-slate-100
          overflow-hidden
          my-auto
          max-h-[90vh]
          flex
          flex-col
        "
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            sticky
            top-0
            z-20
            px-6
            py-4
            bg-white/95
            backdrop-blur-md
            border-b
            border-slate-100
            flex
            items-center
            justify-between
            shrink-0
          "
        >

          {/* Left */}
          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              font-semibold
              text-slate-500
              min-w-0
            "
          >
            <span
              className="
                px-2.5
                py-1
                rounded-md
                bg-slate-100
                text-slate-700
                shrink-0
              "
            >
              {cat.label}
            </span>

            {product.creatorDepartment && (
              <>
                <span
                  className="
                    text-slate-300
                  "
                >
                  •
                </span>

                <span
                  className="
                    truncate
                  "
                >
                  {
                    product
                      .creatorDepartment
                  }
                </span>
              </>
            )}
          </div>


          {/* Right */}
          <div
            className="
              flex
              items-center
              gap-2
              shrink-0
            "
          >

            {/* 조회수 */}
            <div
              className="
                flex
                items-center
                gap-1.5
                px-3
                py-1.5
                rounded-full
                bg-slate-100
                text-slate-600
                text-xs
                font-semibold
              "
              title="조회수"
            >
              <Eye
                className="
                  w-3.5
                  h-3.5
                  text-slate-500
                "
              />

              <span>
                조회{' '}
                {
                  product
                    .viewCount
                    .toLocaleString()
                }
              </span>
            </div>


            {/* 닫기 */}
            <button
              type="button"
              onClick={onClose}
              className="
                p-1.5
                text-slate-400
                hover:text-slate-700
                hover:bg-slate-100
                rounded-full
                transition-colors
                cursor-pointer
              "
              aria-label="닫기"
            >
              <X
                className="
                  w-5
                  h-5
                "
              />
            </button>
          </div>
        </div>


        {/* ==================================================
            SCROLLABLE CONTENT
        ================================================== */}

        <div
          className="
            p-6
            sm:p-8
            overflow-y-auto
            space-y-8
            flex-1
          "
        >

          {/* ==================================================
              SECTION 1
              제목 / 설명 / 서비스 이용
          ================================================== */}

          <div
            className="
              space-y-4
              pb-6
              border-b
              border-slate-100
            "
          >
            <div
              className="
                space-y-2
              "
            >
              <span
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-blue-600
                "
              >
                {cat.label}
              </span>


              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  font-extrabold
                  text-slate-900
                  tracking-tight
                  leading-tight
                "
              >
                {product.title}
              </h1>


              <p
                className="
                  text-sm
                  sm:text-base
                  text-slate-600
                  leading-relaxed
                  font-normal
                "
              >
                {
                  product
                    .shortDescription
                }
              </p>
            </div>


            {/* 서비스 이용 */}
            <div
              className="
                pt-2
              "
            >
              <button
                type="button"
                onClick={
                  handleUseService
                }
                className="
                  w-full
                  sm:w-auto
                  px-7
                  py-3.5
                  bg-slate-900
                  hover:bg-slate-800
                  text-white
                  font-bold
                  text-sm
                  rounded-2xl
                  shadow-md
                  flex
                  items-center
                  justify-center
                  gap-2.5
                  transition-all
                  cursor-pointer
                "
              >
                <span>
                  서비스 이용하기
                </span>

                <ExternalLink
                  className="
                    w-4
                    h-4
                    stroke-[2.5]
                  "
                />
              </button>
            </div>
          </div>


          {/* ==================================================
              SECTION 2
              실제 등록 썸네일
              
              카테고리 기본 썸네일은 상세 화면에서
              표시하지 않음.
          ================================================== */}

          {
            product.thumbnailUrl &&
            product.thumbnailUrl
              .trim()
              .length > 0 &&
            (
              <div
                className="
                  rounded-2xl
                  sm:rounded-3xl
                  overflow-hidden
                  border
                  border-slate-200/80
                  bg-slate-100
                  aspect-16/9
                  sm:aspect-21/9
                  relative
                  shadow-xs
                "
              >
                <img
                  src={
                    product
                      .thumbnailUrl
                  }
                  alt={
                    product.title
                  }
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                  onError={(e) => {
                    /*
                     * DB에는 썸네일 경로가 있지만
                     * 실제 이미지가 존재하지 않거나
                     * URL이 만료된 경우
                     * 상세 화면에서는 영역 자체를 제거
                     */
                    e.currentTarget
                      .parentElement
                      ?.remove();
                  }}
                />
              </div>
            )
          }


          {/* ==================================================
              SECTION 3
              서비스 소개
          ================================================== */}

          <div
            className="
              space-y-3
            "
          >
            <h3
              className="
                text-xs
                font-bold
                text-slate-400
                uppercase
                tracking-wider
                flex
                items-center
                gap-1.5
              "
            >
              <Info
                className="
                  w-4
                  h-4
                  text-slate-400
                "
              />

              <span>
                서비스 소개
              </span>
            </h3>


            <div
              className="
                p-5
                rounded-2xl
                bg-slate-50
                text-xs
                sm:text-sm
                text-slate-700
                leading-relaxed
                whitespace-pre-line
                border
                border-slate-100
              "
            >
              {product.description}
            </div>
          </div>


          {/* ==================================================
              SECTION 4
              주요 기능
          ================================================== */}

          {
            product.features &&
            product.features.length > 0 &&
            (
              <div
                className="
                  space-y-3
                "
              >
                <h3
                  className="
                    text-xs
                    font-bold
                    text-slate-400
                    uppercase
                    tracking-wider
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <CheckCircle2
                    className="
                      w-4
                      h-4
                      text-slate-400
                    "
                  />

                  <span>
                    주요 기능
                  </span>
                </h3>


                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-3
                  "
                >
                  {
                    product
                      .features
                      .map(
                        (feature) => (
                          <div
                            key={
                              feature.id
                            }
                            className="
                              p-3.5
                              rounded-2xl
                              bg-white
                              border
                              border-slate-200/80
                              flex
                              items-start
                              gap-3
                              text-xs
                              sm:text-sm
                              text-slate-800
                              font-medium
                              shadow-2xs
                            "
                          >
                            <CheckCircle2
                              className="
                                w-4
                                h-4
                                text-emerald-500
                                shrink-0
                                mt-0.5
                              "
                            />

                            <span>
                              {
                                feature
                                  .featureText
                              }
                            </span>
                          </div>
                        )
                      )
                  }
                </div>
              </div>
            )
          }


          {/* ==================================================
              SECTION 5
              화면 미리보기
          ================================================== */}

          {
            galleryPreviews.length >
              0 &&
            (
              <div
                className="
                  space-y-3
                "
              >
                <h3
                  className="
                    text-xs
                    font-bold
                    text-slate-400
                    uppercase
                    tracking-wider
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <Layers
                    className="
                      w-4
                      h-4
                      text-slate-400
                    "
                  />

                  <span>
                    화면 미리보기
                  </span>
                </h3>


                <div
                  className="
                    flex
                    gap-4
                    overflow-x-auto
                    pb-2
                    scrollbar-none
                    snap-x
                  "
                >
                  {
                    galleryPreviews.map(
                      (preview) => (
                        <div
                          key={
                            preview.id
                          }
                          className="
                            snap-start
                            shrink-0
                            w-72
                            sm:w-96
                            rounded-2xl
                            overflow-hidden
                            border
                            border-slate-200/80
                            bg-slate-100
                            shadow-xs
                          "
                        >

                          {
                            preview.type ===
                            'IMAGE' ? (
                              <img
                                src={
                                  preview.url
                                }
                                alt={
                                  preview.caption ||
                                  '화면 미리보기'
                                }
                                className="
                                  w-full
                                  h-48
                                  object-cover
                                "
                              />
                            ) : (
                              <video
                                src={
                                  preview.url
                                }
                                controls
                                className="
                                  w-full
                                  h-48
                                  object-cover
                                  bg-black
                                "
                              />
                            )
                          }


                          {
                            preview.caption &&
                            (
                              <div
                                className="
                                  p-3
                                  text-xs
                                  text-slate-600
                                  bg-white
                                  border-t
                                  border-slate-100
                                  text-center
                                  font-medium
                                "
                              >
                                {
                                  preview
                                    .caption
                                }
                              </div>
                            )
                          }
                        </div>
                      )
                    )
                  }
                </div>
              </div>
            )
          }


          {/* ==================================================
              SECTION 6
              제작자 / 담당자
          ================================================== */}

          <div
            className="
              p-5
              rounded-2xl
              bg-slate-50
              border
              border-slate-200/80
              flex
              flex-col
              sm:flex-row
              items-start
              sm:items-center
              justify-between
              gap-4
            "
          >
            <div
              className="
                space-y-1
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-slate-900
                "
              >
                <UserCheck
                  className="
                    w-4
                    h-4
                    text-slate-500
                  "
                />

                <span>
                  제작 및 담당:{' '}
                  {
                    product
                      .creatorName
                  }

                  {
                    product
                      .creatorDepartment &&
                    (
                      <>
                        {' '}
                        (
                        {
                          product
                            .creatorDepartment
                        }
                        )
                      </>
                    )
                  }
                </span>
              </div>


              {
                product.creatorEmail &&
                (
                  <p
                    className="
                      text-xs
                      text-slate-500
                      pl-6
                    "
                  >
                    이메일:{' '}
                    {
                      product
                        .creatorEmail
                    }
                  </p>
                )
              }
            </div>


            {
              product.creatorEmail &&
              (
                <a
                  href={
                    `mailto:${
                      product.creatorEmail
                    }?subject=${
                      encodeURIComponent(
                        `[Eunpyeong Picks] ${product.title} 문의`
                      )
                    }`
                  }
                  className="
                    px-4
                    py-2
                    bg-white
                    text-slate-700
                    font-semibold
                    text-xs
                    rounded-xl
                    border
                    border-slate-200
                    hover:bg-slate-100
                    transition-colors
                    shrink-0
                  "
                >
                  담당자 문의
                </a>
              )
            }
          </div>


          {/* ==================================================
              SECTION 7
              이용 현황
              
              조회수는 Header 우측으로 이동했으므로
              여기서는 이용 요청만 표시
          ================================================== */}

          {
            product.requestCount >
              0 &&
            (
              <div
                className="
                  pt-4
                  border-t
                  border-slate-100
                  flex
                  items-center
                  text-xs
                  text-slate-400
                  font-medium
                "
              >
                <span>
                  이용 요청{' '}
                  {
                    product
                      .requestCount
                      .toLocaleString()
                  }
                  건
                </span>
              </div>
            )
          }

        </div>
      </div>
    </div>
  );
};