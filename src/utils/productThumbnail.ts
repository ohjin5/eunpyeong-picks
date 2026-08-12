import {
  ProductCategory,
} from '../types/store';


export const CATEGORY_THUMBNAILS:
  Record<ProductCategory, string> = {

  WEB:
    '/thumbnails/web-service.png',

  AGENT:
    '/thumbnails/ai-agent.png',

  EXCEL:
    '/thumbnails/excel.png',

  AUTOMATION:
    '/thumbnails/automation.png',

  PROMPT:
    '/thumbnails/prompt.png',

  DOCUMENT:
    '/thumbnails/document.png',

  DATA:
    '/thumbnails/data-analysis.png',

  OTHER:
    '/thumbnails/default.png',
};


export function getProductThumbnail(
  thumbnailUrl:
    | string
    | undefined
    | null,

  category:
    | ProductCategory
    | string
    | undefined
    | null
): string {

  /*
   * 사용자가 등록한 썸네일이 있으면
   * 가장 우선적으로 사용
   */
  if (
    thumbnailUrl &&
    thumbnailUrl.trim().length > 0
  ) {
    return thumbnailUrl;
  }


  /*
   * 썸네일이 없는 경우
   * 카테고리별 기본 썸네일 사용
   */
  if (
    category &&
    category in CATEGORY_THUMBNAILS
  ) {
    return (
      CATEGORY_THUMBNAILS[
        category as ProductCategory
      ]
    );
  }


  /*
   * 알 수 없는 카테고리의 최종 fallback
   */
  return '/thumbnails/default.png';
}