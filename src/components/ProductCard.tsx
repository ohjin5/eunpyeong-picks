import React from 'react';

import {
  Product,
} from '../types/store';

import {
  getCategoryInfo,
} from '../utils/categoryHelper';

import {
  getProductThumbnail,
} from '../utils/productThumbnail';


interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  variant?: 'standard' | 'compact';
}


export const ProductCard: React.FC<
  ProductCardProps
> = ({
  product,
  onClick,
  variant = 'standard',
}) => {
  const cat =
    getCategoryInfo(
      product.category
    );

  const CategoryIcon =
    cat.icon;


  const defaultThumbnail =
    getProductThumbnail(
      null,
      product.category
    );


  const thumbnail =
    getProductThumbnail(
      product.thumbnailUrl,
      product.category
    );


  // ----------------------------------------------------
  // VARIANT: COMPACT
  // ----------------------------------------------------

  if (
    variant === 'compact'
  ) {
    return (
      <div
        onClick={() =>
          onClick(product)
        }
        className="
          group
          bg-white
          rounded-2xl
          p-5
          shadow-[0_2px_12px_rgba(0,0,0,0.03)]
          hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]
          hover:-translate-y-0.5
          transition-all
          duration-200
          cursor-pointer
          flex
          items-center
          justify-between
          gap-4
          border-none
        "
      >
        <div
          className="
            flex
            items-center
            gap-3.5
            min-w-0
          "
        >
          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-slate-100
              text-slate-700
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <CategoryIcon
              className="
                w-5
                h-5
                stroke-[1.8]
              "
            />
          </div>

          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                text-[11px]
                font-semibold
                text-slate-400
                tracking-wider
                uppercase
                truncate
              "
            >
              {cat.label}
            </div>

            <h4
              className="
                text-sm
                font-bold
                text-slate-900
                group-hover:text-slate-700
                transition-colors
                truncate
              "
            >
              {product.title}
            </h4>
          </div>
        </div>


        {product.creatorDepartment && (
          <span
            className="
              text-[11px]
              font-medium
              text-slate-400
              shrink-0
            "
          >
            {
              product
                .creatorDepartment
            }
          </span>
        )}
      </div>
    );
  }


  // ----------------------------------------------------
  // VARIANT: STANDARD
  // ----------------------------------------------------

  return (
    <div
      onClick={() =>
        onClick(product)
      }
      className="
        group
        bg-white
        rounded-[22px]
        overflow-hidden
        p-5
        shadow-[0_2px_16px_rgba(0,0,0,0.03)]
        hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)]
        hover:-translate-y-1
        transition-all
        duration-300
        cursor-pointer
        flex
        flex-col
        justify-between
        border-none
      "
    >
      <div
        className="
          space-y-3
        "
      >

        {/* Top Thumbnail Frame */}

        <div
          className="
            relative
            h-44
            w-full
            rounded-xl
            overflow-hidden
            bg-slate-100
            border
            border-slate-100
          "
        >
          <img
            src={thumbnail}
            alt={product.title}
            className="
              w-full
              h-full
              object-cover
              group-hover:scale-104
              transition-transform
              duration-500
            "
            loading="lazy"

            onError={(e) => {
              const image =
                e.currentTarget;

              /*
               * 실제 썸네일 URL이 잘못됐거나
               * Signed URL이 만료된 경우에도
               * 카테고리 기본 이미지로 변경
               */

              if (
                image.src.endsWith(
                  defaultThumbnail
                )
              ) {
                return;
              }

              image.onerror =
                null;

              image.src =
                defaultThumbnail;
            }}
          />
        </div>


        {/* Content Body */}

        <div
          className="
            space-y-1
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              text-[11px]
              font-semibold
              text-slate-400
              uppercase
              tracking-wider
            "
          >
            <span>
              {cat.label}
            </span>

            {
              product
                .creatorDepartment &&
              (
                <span
                  className="
                    text-[10px]
                    font-normal
                    text-slate-400
                    lowercase
                    tracking-normal
                  "
                >
                  {
                    product
                      .creatorDepartment
                  }
                </span>
              )
            }
          </div>


          <h3
            className="
              text-base
              font-bold
              text-slate-900
              tracking-tight
              line-clamp-1
              group-hover:text-slate-700
              transition-colors
            "
          >
            {product.title}
          </h3>


          <p
            className="
              text-xs
              text-slate-500
              leading-relaxed
              line-clamp-2
            "
          >
            {
              product
                .shortDescription
            }
          </p>
        </div>
      </div>
    </div>
  );
};