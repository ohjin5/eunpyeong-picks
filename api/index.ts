import app from '../src/server/app.js';


/**
 * Vercel에서 /api/* 요청을 하나의 Express app으로 전달한다.
 *
 * vercel.json:
 *   /api/:path* -> /api/index?path=:path*
 *
 * 예:
 *   /api/products
 *      ↓
 *   /api/index?path=products
 *      ↓
 *   Express req.url을 /api/products로 복원
 */
export default function handler(
  req: any,
  res: any
) {
  try {
    const requestUrl =
      new URL(
        req.url || '/api/index',
        'http://localhost'
      );

    let routePath =
      requestUrl.searchParams.get('path') ||
      '';

    requestUrl.searchParams.delete(
      'path'
    );

    try {
      routePath =
        decodeURIComponent(
          routePath
        );
    } catch {
      // 잘못 인코딩된 값이면 원본 문자열을 그대로 사용
    }

    routePath =
      routePath
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');

    const remainingQuery =
      requestUrl.searchParams.toString();

    req.url =
      `/api/${routePath}` +
      (
        remainingQuery
          ? `?${remainingQuery}`
          : ''
      );

    return app(
      req,
      res
    );
  } catch (error) {
    console.error(
      '[Vercel API Bridge] Error:',
      error
    );

    return res.status(500).json({
      success: false,
      error: 'VERCEL_API_BRIDGE_FAILED',
      message: 'API 요청 경로 처리 중 오류가 발생했습니다.',
    });
  }
}