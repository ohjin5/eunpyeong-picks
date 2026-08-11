import 'dotenv/config';

import crypto from 'crypto';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { StorageService } from './src/server/storage';
import { ProductService } from './src/lib/services/productService';
import { checkHospitalIpMiddleware } from './src/server/ipMiddleware';


// ============================================================
// 기본 설정
// ============================================================

const ADMIN_SESSION_COOKIE = 'admin_session';
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12시간


// ============================================================
// 관리자 Session Helper
// ============================================================

function getAdminSessionSecret(): string | null {
  /**
   * ADMIN_SESSION_SECRET가 있으면 그것을 우선 사용하고,
   * 개발 편의를 위해 없으면 ADMIN_PASSWORD를 사용한다.
   *
   * 운영환경에서는 별도의 ADMIN_SESSION_SECRET 사용 권장.
   */
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    null
  );
}


function createAdminSessionToken(): string {
  const secret = getAdminSessionSecret();

  if (!secret) {
    throw new Error(
      'ADMIN_SESSION_SECRET 또는 ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.'
    );
  }

  const expiresAt =
    Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;

  const nonce = crypto
    .randomBytes(16)
    .toString('hex');

  const payload = `${expiresAt}.${nonce}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return `${payload}.${signature}`;
}


function verifyAdminSessionToken(
  token: string | undefined
): boolean {
  if (!token) {
    return false;
  }

  const secret = getAdminSessionSecret();

  if (!secret) {
    return false;
  }

  const parts = token.split('.');

  if (parts.length !== 3) {
    return false;
  }

  const [expiresAtRaw, nonce, signature] = parts;

  const expiresAt = Number(expiresAtRaw);

  if (
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now()
  ) {
    return false;
  }

  const payload = `${expiresAtRaw}.${nonce}`;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    const actualBuffer = Buffer.from(
      signature,
      'hex'
    );

    const expectedBuffer = Buffer.from(
      expectedSignature,
      'hex'
    );

    if (
      actualBuffer.length !== expectedBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      actualBuffer,
      expectedBuffer
    );
  } catch {
    return false;
  }
}


// ============================================================
// Cookie Helper
// ============================================================

function getCookie(
  req: Request,
  name: string
): string | undefined {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(';');

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie
      .trim()
      .split('=');

    if (key === name) {
      return decodeURIComponent(
        valueParts.join('=')
      );
    }
  }

  return undefined;
}


function setAdminSessionCookie(
  res: Response,
  token: string
) {
  const secure =
    process.env.NODE_ENV === 'production'
      ? '; Secure'
      : '';

  res.setHeader(
    'Set-Cookie',
    [
      `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(
        token
      )}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${ADMIN_SESSION_MAX_AGE_SECONDS}`,
      secure,
    ]
      .filter(Boolean)
      .join('; ')
  );
}


function clearAdminSessionCookie(
  res: Response
) {
  const secure =
    process.env.NODE_ENV === 'production'
      ? '; Secure'
      : '';

  res.setHeader(
    'Set-Cookie',
    [
      `${ADMIN_SESSION_COOKIE}=`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=0',
      secure,
    ]
      .filter(Boolean)
      .join('; ')
  );
}


// ============================================================
// 관리자 인증 Middleware
// ============================================================

function isAdminAuthenticated(
  req: Request
): boolean {
  const token = getCookie(
    req,
    ADMIN_SESSION_COOKIE
  );

  return verifyAdminSessionToken(token);
}


function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      error: 'ADMIN_AUTH_REQUIRED',
      message: '관리자 인증이 필요합니다.',
    });
  }

  next();
}


// ============================================================
// Server
// ============================================================

const app = express();

const PORT =
  Number(process.env.PORT) || 3000;


  // ----------------------------------------------------------
  // Body Parser
  // ----------------------------------------------------------

  // Base64 이미지 업로드를 고려하여 10MB
  app.use(
    express.json({
      limit: '10mb',
    })
  );


  // ----------------------------------------------------------
  // Hospital IP Restriction
  // ----------------------------------------------------------

  app.use(checkHospitalIpMiddleware);


  // ==========================================================
  // HEALTH CHECK
  // ==========================================================

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Eunpyeong Picks API',
      timestamp: new Date().toISOString(),

      mockMode:
        process.env.USE_MOCK_DATA !==
        'false',
    });
  });


  // ==========================================================
  // PUBLIC PRODUCT API
  // ==========================================================

  /**
   * Product 목록
   *
   * 일반 사용자에게는 PUBLISHED Product만 반환한다.
   * creator_email 등 민감한 연락처는
   * ProductService에서 제외되어야 한다.
   */
  app.get(
    '/api/products',
    async (req, res) => {
      try {
        const q =
          typeof req.query.q === 'string'
            ? req.query.q
            : undefined;

        const category =
          typeof req.query.category ===
          'string'
            ? req.query.category
            : undefined;

        const sort =
          typeof req.query.sort === 'string'
            ? req.query.sort
            : undefined;

        const featuredOnly =
          req.query.featured === 'true';

        /**
         * 중요:
         * 일반 사용자가 query parameter로
         * hidden product를 볼 수 없도록
         * 항상 false 고정
         */
        const products =
          await ProductService.getProducts({
            q,
            category,
            sort,
            featuredOnly,
            includeHidden: false,
          });

        return res.json(products);
      } catch (error: any) {
        console.error(
          'Error fetching products:',
          error
        );

        return res.status(500).json({
          error: 'PRODUCT_FETCH_FAILED',
          message:
            '도구 목록을 불러오지 못했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // PUBLIC STORE STATISTICS
  // ==========================================================

  app.get(
    '/api/stats',
    async (req, res) => {
      try {
        const stats =
          await ProductService.getStats();

        return res.json(stats);
      } catch (error: any) {
        console.error(
          'Stats fetch error:',
          error
        );

        return res.status(500).json({
          error: 'STATS_FETCH_FAILED',
          message:
            '통계 정보를 불러오지 못했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // PRODUCT DETAIL
  // ==========================================================

  app.get(
    '/api/products/:id',
    async (req, res) => {
      try {
        const product =
          await ProductService.getProductById(
            req.params.id
          );

        if (!product) {
          return res.status(404).json({
            error: 'PRODUCT_NOT_FOUND',
            message:
              '도구 정보를 찾을 수 없습니다.',
          });
        }

        return res.json(product);
      } catch (error: any) {
        console.error(
          'Product detail error:',
          error
        );

        return res.status(500).json({
          error: 'PRODUCT_FETCH_FAILED',
          message:
            '도구 정보를 불러오지 못했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // VIEW COUNT
  // ==========================================================

  app.post(
    '/api/products/:id/view',
    async (req, res) => {
      try {
        const newViews =
          await ProductService.incrementProductView(
            req.params.id
          );

        return res.json({
          success: true,
          viewCount: newViews,
        });
      } catch (error: any) {
        console.error(
          'View count error:',
          error
        );

        return res.status(500).json({
          error: 'VIEW_COUNT_FAILED',
          message:
            '조회수를 기록하지 못했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // ADMIN AUTHENTICATION
  // ==========================================================

  app.post(
    '/api/admin/login',
    (req, res) => {
      try {
        const { password } = req.body;

        const expectedPassword =
          process.env.ADMIN_PASSWORD;

        /**
         * 코드 내부에 관리자 비밀번호
         * fallback을 두지 않는다.
         */
        if (!expectedPassword) {
          console.error(
            'ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.'
          );

          return res.status(500).json({
            success: false,
            error:
              'ADMIN_CONFIG_ERROR',
            message:
              '관리자 인증 설정이 완료되지 않았습니다.',
          });
        }

        if (
          !password ||
          password !== expectedPassword
        ) {
          return res.status(401).json({
            success: false,
            error:
              'INVALID_PASSWORD',
            message:
              '비밀번호가 올바르지 않습니다.',
          });
        }

        const token =
          createAdminSessionToken();

        setAdminSessionCookie(
          res,
          token
        );

        return res.json({
          success: true,
          message:
            '관리자 인증에 성공했습니다.',
        });
      } catch (error: any) {
        console.error(
          'Admin login error:',
          error
        );

        return res.status(500).json({
          success: false,
          error: 'LOGIN_FAILED',
          message:
            '관리자 인증 중 오류가 발생했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // ADMIN SESSION VERIFY
  // ==========================================================

  app.get(
    '/api/admin/verify',
    (req, res) => {
      return res.json({
        authenticated:
          isAdminAuthenticated(req),
      });
    }
  );


  // ==========================================================
  // ADMIN LOGOUT
  // ==========================================================

  app.post(
    '/api/admin/logout',
    (req, res) => {
      clearAdminSessionCookie(res);

      return res.json({
        success: true,
        message:
          '로그아웃 되었습니다.',
      });
    }
  );


  // ==========================================================
  // SERVICE REQUEST
  // ==========================================================

  /**
   * 서비스 이용 신청
   *
   * SERVICE_URL이 없는 Product에서 사용
   *
   * creator_email은 Browser가 결정하지 않고
   * ProductService가 productId를 기준으로
   * DB에서 다시 조회해야 한다.
   */
  app.post(
    [
      '/api/service-requests',
      '/api/requests',
    ],
    async (req, res) => {
      try {
        const {
          productId,
          product_id,

          requesterName,
          requester_name,

          requesterDepartment,
          requester_department,

          requesterEmail,
          requester_email,

          purpose,

          notes,
          message,

          fileId,
          productTitle,
        } = req.body;

        const targetProductId =
          productId || product_id;

        const name =
          requesterName ||
          requester_name;

        const department =
          requesterDepartment ||
          requester_department;

        const email =
          requesterEmail ||
          requester_email;

        const reqPurpose = purpose;

        const reqNotes =
          notes || message || '';

        if (
          !targetProductId ||
          !name ||
          !department ||
          !email ||
          !reqPurpose
        ) {
          return res.status(400).json({
            error:
              'MISSING_FIELDS',
            message:
              '필수 이용 신청 정보가 누락되었습니다.',
          });
        }

        /**
         * recipientEmail을 request body에서
         * 받지 않는다.
         *
         * ProductService에서 반드시
         * targetProductId 기반으로 Product를
         * 다시 조회하여 creator_email을 결정해야 한다.
         */
        const request =
          await ProductService.createServiceRequest(
            {
              productId:
                targetProductId,

              requesterName: name,

              requesterDepartment:
                department,

              requesterEmail: email,

              purpose: reqPurpose,

              notes: reqNotes,

              // 기존 ProductService type 호환용
              fileId,
              productTitle,
            }
          );

        return res.status(201).json({
          success: true,
          request,
        });
      } catch (error: any) {
        console.error(
          'Service request error:',
          error
        );

        return res.status(500).json({
          error:
            'SERVICE_REQUEST_FAILED',
          message:
            '서비스 이용 신청을 저장하지 못했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // USER TOOL SUBMISSION
  // ==========================================================

  app.post(
    '/api/submissions',
    async (req, res) => {
      try {
        const {
          submitterName,
          submitter_name,

          submitterDepartment,
          submitter_department,

          submitterEmail,
          submitter_email,

          title,
          category,

          shortDescription,
          short_description,

          description,
          features,

          serviceUrl,
          service_url,

          thumbnailUrl,
          thumbnail_url,

          previews,
        } = req.body;

        const name =
          submitterName ||
          submitter_name;

        const department =
          submitterDepartment ||
          submitter_department;

        const email =
          submitterEmail ||
          submitter_email;

        const shortDesc =
          shortDescription ||
          short_description;

        const finalServiceUrl =
          serviceUrl ||
          service_url ||
          null;

        const finalThumbnail =
          thumbnailUrl ||
          thumbnail_url ||
          null;

        if (
          !name ||
          !department ||
          !email ||
          !title ||
          !category ||
          !shortDesc ||
          !description
        ) {
          return res.status(400).json({
            error:
              'MISSING_FIELDS',
            message:
              '필수 등록 정보가 누락되었습니다.',
          });
        }

        const submission =
          await ProductService.createSubmission(
            {
              submitterName: name,

              submitterDepartment:
                department,

              submitterEmail: email,

              title,

              category,

              shortDescription:
                shortDesc,

              description,

              features,

              serviceUrl:
                finalServiceUrl,

              thumbnailUrl:
                finalThumbnail,

              previews,
            }
          );

        return res.status(201).json({
          success: true,
          submission,
        });
      } catch (error: any) {
        console.error(
          'Submission error:',
          error
        );

        return res.status(500).json({
          error:
            'SUBMISSION_FAILED',
          message:
            '도구 등록 신청을 저장하지 못했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // IMAGE UPLOAD
  // ==========================================================

  /**
   * 사용자 등록신청 이미지는 Public API를 통해 업로드 가능.
   *
   * Product 직접 업로드는 관리자만 허용.
   */
  app.post(
    '/api/upload',
    async (req, res) => {
      try {
        const {
          fileName,
          fileType,
          fileData,
          targetType,
          targetId,
          uploadIndex,
        } = req.body;

        if (
          !fileName ||
          !fileData
        ) {
          return res.status(400).json({
            error:
              'MISSING_FILE_DATA',
            message:
              '파일명 및 파일 데이터가 필요합니다.',
          });
        }

        if (
          targetType !==
            'submission' &&
          targetType !== 'product'
        ) {
          return res.status(400).json({
            error:
              'INVALID_TARGET_TYPE',
            message:
              '올바른 업로드 대상이 아닙니다.',
          });
        }

        /**
         * Product 이미지 직접 업로드는
         * 관리자만 가능.
         */
        if (
          targetType === 'product' &&
          !isAdminAuthenticated(req)
        ) {
          return res.status(401).json({
            error:
              'ADMIN_AUTH_REQUIRED',
            message:
              '관리자 인증이 필요합니다.',
          });
        }

        const extMatch =
          fileName.match(
            /\.(png|jpg|jpeg|webp)$/i
          );

        if (!extMatch) {
          return res.status(400).json({
            error:
              'INVALID_FILE_TYPE',
            message:
              'PNG, JPG, JPEG, WEBP 파일만 업로드할 수 있습니다.',
          });
        }

        const allowedMimeTypes = [
          'image/png',
          'image/jpeg',
          'image/webp',
        ];

        if (
          fileType &&
          !allowedMimeTypes.includes(
            fileType
          )
        ) {
          return res.status(400).json({
            error:
              'INVALID_MIME_TYPE',
            message:
              '지원되지 않는 이미지 형식입니다.',
          });
        }

        const base64Content =
          fileData.includes(',')
            ? fileData.split(',')[1]
            : fileData;

        let buffer: Buffer;

        try {
          buffer = Buffer.from(
            base64Content,
            'base64'
          );
        } catch {
          return res.status(400).json({
            error:
              'INVALID_IMAGE_DATA',
            message:
              '이미지 데이터 형식이 올바르지 않습니다.',
          });
        }

        const MAX_SIZE_BYTES =
          5 * 1024 * 1024;

        if (
          buffer.length >
          MAX_SIZE_BYTES
        ) {
          return res.status(400).json({
            error:
              'FILE_TOO_LARGE',
            message:
              '이미지 크기는 최대 5MB까지 업로드할 수 있습니다.',
          });
        }

        const ext =
          extMatch[1].toLowerCase();

        const folder =
          targetType === 'product'
            ? 'products'
            : 'submissions';

        const entityId =
          targetId ||
          `temp-${Date.now()}-${crypto
            .randomBytes(4)
            .toString('hex')}`;

        /**
         * uploadIndex가 0인 경우도 Preview가 될 수 있으므로
         * falsy 검사(!uploadIndex)를 사용하지 않는다.
         */
        const isThumbnail =
          uploadIndex === undefined ||
          uploadIndex === null;

        const storagePath =
          isThumbnail
            ? `${folder}/${entityId}/thumbnail.${ext}`
            : `${folder}/${entityId}/preview-${String(
                uploadIndex
              ).padStart(
                2,
                '0'
              )}.${ext}`;

        const uploadResult =
          await ProductService.uploadThumbnail(
            buffer,
            fileName,
            storagePath
          );

        return res.status(200).json({
          success: true,

          path:
            uploadResult.path,

          /**
           * Private Bucket이면 publicUrl이
           * 실제 접근 URL로 동작하지 않을 수 있으므로
           * path를 기준값으로 사용한다.
           */
          publicUrl:
            uploadResult.publicUrl ||
            null,

          message:
            '이미지 업로드 성공',
        });
      } catch (error: any) {
        console.error(
          'Upload API error:',
          error
        );

        return res.status(500).json({
          error: 'UPLOAD_FAILED',
          message:
            '이미지 업로드 중 오류가 발생했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // ADMIN - SERVICE REQUEST LIST
  // ==========================================================

  app.get(
    [
      '/api/admin/service-requests',
      '/api/requests',
    ],
    requireAdmin,
    async (req, res) => {
      try {
        const requests =
          await StorageService.getRequests();

        return res.json(requests);
      } catch (error: any) {
        console.error(
          'Admin request fetch error:',
          error
        );

        return res.status(500).json({
          error:
            'REQUEST_FETCH_FAILED',
          message:
            '이용 신청 목록을 불러오지 못했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // ADMIN - SERVICE REQUEST STATUS
  // ==========================================================

  app.patch(
    [
      '/api/admin/service-requests/:id',
      '/api/requests/:id',
    ],
    requireAdmin,
    async (req, res) => {
      try {
        const { status } = req.body;

        const allowedStatuses = [
          'REQUESTED',
          'CONTACTED',
          'APPROVED',
          'REJECTED',
          'COMPLETED',
        ];

        if (
          !allowedStatuses.includes(
            status
          )
        ) {
          return res.status(400).json({
            error:
              'INVALID_STATUS',
            message:
              '올바르지 않은 상태값입니다.',
          });
        }

        const updated =
          await StorageService.updateRequestStatus(
            req.params.id,
            status
          );

        if (!updated) {
          return res.status(404).json({
            error:
              'REQUEST_NOT_FOUND',
            message:
              '이용 신청을 찾을 수 없습니다.',
          });
        }

        return res.json(updated);
      } catch (error: any) {
        console.error(
          'Request update error:',
          error
        );

        return res.status(500).json({
          error:
            'REQUEST_UPDATE_FAILED',
          message:
            '이용 신청 상태를 변경하지 못했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // ADMIN - SUBMISSION LIST
  // ==========================================================

  /**
   * 기존 공개 GET /api/submissions는
   * 개인정보 보호를 위해 관리자 인증 필요.
   *
   * 프론트 호환성을 위해 alias는 유지하지만
   * 인증 없이는 접근 불가능.
   */
  app.get(
    [
      '/api/admin/submissions',
      '/api/submissions',
    ],
    requireAdmin,
    async (req, res) => {
      try {
        const submissions =
          await StorageService.getSubmissions();

        return res.json(
          submissions
        );
      } catch (error: any) {
        console.error(
          'Submission list error:',
          error
        );

        return res.status(500).json({
          error:
            'SUBMISSION_FETCH_FAILED',
          message:
            '등록 신청 목록을 불러오지 못했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // ADMIN - APPROVE SUBMISSION
  // ==========================================================

  app.post(
    '/api/admin/submissions/:id/approve',
    requireAdmin,
    async (req, res) => {
      try {
        const {
          adminComment,
        } = req.body;

        const approved =
          await ProductService.approveSubmission(
            req.params.id,
            adminComment
          );

        if (!approved) {
          return res.status(404).json({
            error:
              'SUBMISSION_NOT_FOUND',
            message:
              '등록 신청을 찾을 수 없습니다.',
          });
        }

        return res.json({
          success: true,
          submission: approved,
        });
      } catch (error: any) {
        console.error(
          'Submission approve error:',
          error
        );

        return res.status(500).json({
          error:
            'SUBMISSION_APPROVE_FAILED',
          message:
            '등록 신청 승인 처리에 실패했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // ADMIN - REJECT SUBMISSION
  // ==========================================================

  app.post(
    '/api/admin/submissions/:id/reject',
    requireAdmin,
    async (req, res) => {
      try {
        const {
          adminComment,
        } = req.body;

        const rejected =
          await ProductService.rejectSubmission(
            req.params.id,
            adminComment
          );

        if (!rejected) {
          return res.status(404).json({
            error:
              'SUBMISSION_NOT_FOUND',
            message:
              '등록 신청을 찾을 수 없습니다.',
          });
        }

        return res.json({
          success: true,
          submission: rejected,
        });
      } catch (error: any) {
        console.error(
          'Submission reject error:',
          error
        );

        return res.status(500).json({
          error:
            'SUBMISSION_REJECT_FAILED',
          message:
            '등록 신청 반려 처리에 실패했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // ADMIN - LEGACY SUBMISSION STATUS API
  // ==========================================================

  /**
   * 기존 프론트에서 사용 중일 가능성이 있어
   * 일단 유지하되 관리자 인증을 강제한다.
   *
   * 프론트 전환 완료 후 삭제 가능.
   */
  app.patch(
    '/api/submissions/:id',
    requireAdmin,
    async (req, res) => {
      try {
        const {
          status,
          adminComment,
        } = req.body;

        if (
          status === 'APPROVED'
        ) {
          const approved =
            await ProductService.approveSubmission(
              req.params.id,
              adminComment
            );

          return res.json({
            success: true,
            submission:
              approved,
          });
        }

        if (
          status === 'REJECTED'
        ) {
          const rejected =
            await ProductService.rejectSubmission(
              req.params.id,
              adminComment
            );

          return res.json({
            success: true,
            submission:
              rejected,
          });
        }

        return res.status(400).json({
          error:
            'INVALID_STATUS',
          message:
            'APPROVED 또는 REJECTED 상태만 사용할 수 있습니다.',
        });
      } catch (error: any) {
        console.error(
          'Legacy submission update error:',
          error
        );

        return res.status(500).json({
          error:
            'SUBMISSION_UPDATE_FAILED',
          message:
            '등록 신청 상태 변경에 실패했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // ADMIN - CREATE PRODUCT
  // ==========================================================

  app.post(
    [
      '/api/admin/products',
      '/api/products',
    ],
    requireAdmin,
    async (req, res) => {
      try {
        const created =
          await StorageService.createProduct(
            req.body
          );

        return res
          .status(201)
          .json(created);
      } catch (error: any) {
        console.error(
          'Product create error:',
          error
        );

        return res.status(500).json({
          error:
            'PRODUCT_CREATE_FAILED',
          message:
            '도구를 생성하지 못했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // ADMIN - UPDATE PRODUCT
  // ==========================================================

  app.put(
    [
      '/api/admin/products/:id',
      '/api/products/:id',
    ],
    requireAdmin,
    async (req, res) => {
      try {
        const updated =
          await StorageService.updateProduct(
            req.params.id,
            req.body
          );

        if (!updated) {
          return res.status(404).json({
            error:
              'PRODUCT_NOT_FOUND',
            message:
              '도구를 찾을 수 없습니다.',
          });
        }

        return res.json(updated);
      } catch (error: any) {
        console.error(
          'Product update error:',
          error
        );

        return res.status(500).json({
          error:
            'PRODUCT_UPDATE_FAILED',
          message:
            '도구를 수정하지 못했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // ADMIN - DELETE PRODUCT
  // ==========================================================

  app.delete(
    [
      '/api/admin/products/:id',
      '/api/products/:id',
    ],
    requireAdmin,
    async (req, res) => {
      try {
        const success =
          await StorageService.deleteProduct(
            req.params.id
          );

        if (!success) {
          return res.status(404).json({
            error:
              'PRODUCT_NOT_FOUND',
            message:
              '도구를 찾을 수 없습니다.',
          });
        }

        return res.json({
          success: true,
        });
      } catch (error: any) {
        console.error(
          'Product delete error:',
          error
        );

        return res.status(500).json({
          error:
            'PRODUCT_DELETE_FAILED',
          message:
            '도구를 삭제하지 못했습니다.',
        });
      }
    }
  );


  // ==========================================================
  // ADMIN PRODUCT LIST
  // ==========================================================

  app.get(
    '/api/admin/products',
    requireAdmin,
    async (req, res) => {
      try {
        const q =
          typeof req.query.q === 'string'
            ? req.query.q
            : undefined;

        const category =
          typeof req.query.category ===
          'string'
            ? req.query.category
            : undefined;

        const sort =
          typeof req.query.sort ===
          'string'
            ? req.query.sort
            : undefined;

        const products =
          await ProductService.getProducts(
            {
              q,
              category,
              sort,
              featuredOnly: false,
              includeHidden: true,
            }
          );

        return res.json(products);
      } catch (error: any) {
        console.error(
          'Admin product fetch error:',
          error
        );

        return res.status(500).json({
          error:
            'PRODUCT_FETCH_FAILED',
          message:
            '관리자용 도구 목록을 불러오지 못했습니다.',
        });
      }
    }
  );


// ==========================================================
// LOCAL VITE / STATIC SERVER
// ==========================================================

/**
 * Vercel에서는 이 파일의 Express app을 import해서 Function으로 사용한다.
 * 따라서 Vercel 환경에서는 app.listen()이나 Vite middleware를 실행하지 않는다.
 *
 * 로컬에서는 기존처럼:
 *   npm.cmd run dev
 * 로 실행하면 Vite middleware + Express API가 한 포트에서 동작한다.
 */
async function startLocalServer() {
  if (
    process.env.NODE_ENV !==
    'production'
  ) {
    const vite =
      await createViteServer({
        server: {
          middlewareMode: true,
        },

        appType: 'spa',
      });

    app.use(
      vite.middlewares
    );
  } else {
    const distPath =
      path.join(
        process.cwd(),
        'dist'
      );

    app.get(
      [
        '/server.cjs',
        '/server.cjs.map',
      ],
      (_req, res) => {
        return res.sendStatus(404);
      }
    );

    app.use(
      express.static(
        distPath
      )
    );

    app.get(
      '*',
      (_req, res) => {
        res.sendFile(
          path.join(
            distPath,
            'index.html'
          )
        );
      }
    );
  }

  app.listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log(
        `[Eunpyeong Picks] Server listening on http://localhost:${PORT}`
      );

      console.log(
        `[Eunpyeong Picks] Mock mode: ${
          process.env.USE_MOCK_DATA === 'true'
        }`
      );
    }
  );
}


// ============================================================
// LOCAL BOOTSTRAP
// ============================================================

if (!process.env.VERCEL) {
  startLocalServer().catch(
    (error) => {
      console.error(
        'Server startup failed:',
        error
      );

      process.exit(1);
    }
  );
}


// ============================================================
// VERCEL / SERVER EXPORT
// ============================================================

export default app;