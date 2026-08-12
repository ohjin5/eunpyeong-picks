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


interface FeaturedProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}


export const FeaturedProductCard: React.FC<
  FeaturedProductCardProps
> = ({
  product,
  onClick,
}) => {
  const cat =
    getCategoryInfo(
      product.category
    );


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


  return (
    <div
      onClick={() =>
        onClick(product)
      }
      className="
        group
        relative
        bg-white
        w-[340px]
        sm:w-[390px]
        h-[460px]
        sm:h-[490px]
        rounded-[28px]
        p-7
        sm:p-8
        cursor-pointer
        shrink-0
        flex
        flex-col
        justify-between
        overflow-hidden
        shadow-[0_4px_24px_rgba(0,0,0,0.04)]
        hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]
        hover:-translate-y-1
        transition-all
        duration-300
        border-none
      "
    >
      {/* Top Info Area */}

      <div className="space-y-2 z-10">

        {/* Category Label & Department */}

        <div
          className="
            flex
            items-center
            justify-between
            text-[11px]
            font-semibold
            tracking-wider
            uppercase
            text-slate-400
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
                  lowercase
                  tracking-normal
                  text-slate-400
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


        {/* Product Title */}

        <h3
          className="
            text-2xl
            sm:text-[26px]
            font-bold
            text-slate-900
            tracking-tight
            leading-tight
            line-clamp-1
            group-hover:text-slate-700
            transition-colors
          "
        >
          {product.title}
        </h3>


        {/* Short Catch Phrase */}

        <p
          className="
            text-sm
            sm:text-base
            text-slate-500
            font-normal
            leading-relaxed
            line-clamp-2
            pt-0.5
          "
        >
          {
            product
              .shortDescription
          }
        </p>
      </div>


      {/* Bottom Visual */}

      <div
        className="
          relative
          w-full
          h-[230px]
          sm:h-[250px]
          mt-6
          rounded-2xl
          bg-slate-100/80
          overflow-hidden
          border
          border-slate-200/60
          shadow-xs
          flex
          flex-col
          transition-transform
          duration-300
          group-hover:scale-[1.015]
        "
      >

        {/* Browser Top Bar Controls */}

        <div
          className="
            h-7
            px-3
            bg-slate-200/60
            border-b
            border-slate-200/60
            flex
            items-center
            justify-between
            shrink-0
          "
        >
          <div
            className="
              flex
              items-center
              gap-1.5
            "
          >
            <div
              className="
                w-2.5
                h-2.5
                rounded-full
                bg-slate-300
              "
            />

            <div
              className="
                w-2.5
                h-2.5
                rounded-full
                bg-slate-300
              "
            />

            <div
              className="
                w-2.5
                h-2.5
                rounded-full
                bg-slate-300
              "
            />
          </div>

          <div
            className="
              w-28
              h-3
              rounded-full
              bg-slate-300/50
              mx-auto
            "
          />
        </div>


        {/* Browser Screen Visual */}

        <div
          className="
            flex-1
            relative
            overflow-hidden
            bg-white
          "
        >
          <img
            src={thumbnail}
            alt={product.title}
            className="
              w-full
              h-full
              object-cover
              object-top
              transition-transform
              duration-500
              group-hover:scale-105
            "
            loading="lazy"

            onError={(e) => {
              const image =
                e.currentTarget;

              /*
               * 실제 이미지가 깨졌거나
               * Signed URL이 만료된 경우에도
               * 카테고리 기본 이미지로 대체
               */

              image.onerror =
                null;

              image.src =
                defaultThumbnail;
            }}
          />
        </div>

      </div>
    </div>
  );
};