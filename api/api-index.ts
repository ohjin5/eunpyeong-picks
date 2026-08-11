import app from '../server';

/**
 * Vite 프로젝트의 /api/* 요청을 하나의 Express app으로 전달하는 Vercel Function.
 *
 * vercel.json에서:
 *   /api/:path* -> /api/index?path=:path*
 * 로 rewrite한 뒤, 여기서 Express가 기대하는 원래 경로
 * (/api/products, /api/admin/login 등)로 req.url을 복원한다.
 */
export default function handler(
  req: any,
  res: any
) {
  const requestUrl =
    new URL(
      req.url || '/api/index',
      'http://localhost'
    );

  const path =
    requestUrl.searchParams.get(
      'path'
    ) || '';

  requestUrl.searchParams.delete(
    'path'
  );

  const remainingQuery =
    requestUrl.searchParams.toString();

  const normalizedPath =
    path
      .split('/')
      .filter(Boolean)
      .map(
        (part) =>
          encodeURIComponent(
            decodeURIComponent(part)
          )
      )
      .join('/');

  req.url =
    `/api/${normalizedPath}` +
    (
      remainingQuery
        ? `?${remainingQuery}`
        : ''
    );

  return app(
    req,
    res
  );
}
