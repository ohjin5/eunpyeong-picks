import {
  getSupabaseServerClient,
  isSupabaseConfigured,
} from '../supabase/server.js';

import {
  StorageService,
} from '../../server/storage.js';

import {
  Product,
  ProductCategory,
  UserSubmission,
  MaterialRequest,
} from '../../types/store.js';


// ============================================================
// Types
// ============================================================

export interface GetProductsParams {
  q?: string;
  category?: string;
  sort?: string;

  featuredOnly?: boolean;
  includeHidden?: boolean;
}


export interface CreateSubmissionInput {
  submitterName: string;
  submitterDepartment: string;
  submitterEmail: string;

  title: string;
  category: ProductCategory;

  shortDescription: string;
  description: string;

  features?: string[];

  serviceUrl?: string | null;
  thumbnailUrl?: string | null;

  previews?: Array<{
    url: string;
    caption?: string;
  }>;
}


export interface CreateServiceRequestInput {
  productId: string;

  requesterName: string;
  requesterDepartment: string;
  requesterEmail: string;

  purpose: string;
  notes?: string;

  /**
   * 기존 Frontend / server.ts와의 호환성을 위해
   * 일단 남겨둔다.
   *
   * 신규 DB에서는 fileId를 사용하지 않는다.
   */
  fileId?: string;

  /**
   * Browser가 보내는 Product Title을 신뢰하지 않고
   * 실제 DB Product title을 우선 사용한다.
   */
  productTitle?: string;
}


export interface UploadFileResult {
  path: string;

  /**
   * Private Bucket을 사용하는 경우
   * 영구 Public URL 대신 Signed URL을 반환할 수 있다.
   */
  publicUrl?: string;

  error?: string;
}


// ============================================================
// Internal DB Row Types
// ============================================================

interface ProductFeatureRow {
  id: string;
  product_id: string;
  feature_text: string;
  sort_order: number;
}


interface ProductPreviewRow {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text?: string | null;
  sort_order: number;
}


interface ProductRow {
  id: string;

  title: string;
  category: ProductCategory;

  short_description?: string | null;
  description?: string | null;

  creator_name: string;
  creator_department?: string | null;
  creator_email?: string | null;

  service_url?: string | null;

  thumbnail_path?: string | null;

  status: string;

  featured: boolean;

  view_count: number;
  request_count: number;

  created_at: string;
  updated_at: string;

  product_features?: ProductFeatureRow[];
  product_previews?: ProductPreviewRow[];
}


// ============================================================
// Product Service
// ============================================================

export class ProductService {

  // ==========================================================
  // Common Helpers
  // ==========================================================

  /**
   * USE_MOCK_DATA=true 일 때만 Mock Storage를 사용한다.
   *
   * Supabase 오류가 났다고 자동으로 Mock으로 전환하지 않는다.
   */
  private static useMockData(): boolean {
    return process.env.USE_MOCK_DATA === 'true';
  }


  /**
   * 실제 운영모드인데 Supabase 환경변수가 없는 경우
   * Mock으로 넘어가지 않고 오류를 발생시킨다.
   */
  private static getSupabaseOrThrow() {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase 설정이 없습니다. ' +
        'SUPABASE_URL과 SUPABASE_SECRET_KEY를 확인해주세요.'
      );
    }

    const supabase =
      getSupabaseServerClient();

    if (!supabase) {
      throw new Error(
        'Supabase Server Client를 생성하지 못했습니다.'
      );
    }

    return supabase;
  }


  /**
   * Supabase Storage Path를 Signed URL로 변환한다.
   *
   * product-assets Bucket을 Private으로 사용하기 위한 처리.
   */
  private static async createSignedImageUrl(
    storagePath?: string | null,
    expiresInSeconds = 3600
  ): Promise<string | undefined> {

    if (!storagePath) {
      return undefined;
    }

    /**
     * 이미 http 주소인 경우
     * 이전 Mock / Legacy URL과 호환.
     */
    if (
      storagePath.startsWith('http://') ||
      storagePath.startsWith('https://')
    ) {
      return storagePath;
    }

    if (this.useMockData()) {
      return storagePath;
    }

    const supabase =
      this.getSupabaseOrThrow();

    const bucketName =
      process.env.SUPABASE_STORAGE_BUCKET ||
      'product-assets';

    const {
      data,
      error,
    } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(
        storagePath,
        expiresInSeconds
      );

    if (error) {
      console.error(
        '[ProductService] Signed URL 생성 실패:',
        error
      );

      return undefined;
    }

    return data?.signedUrl;
  }


  /**
   * DB Product Row → Frontend Product
   *
   * creatorEmail은 public API에서 기본적으로 제외한다.
   */
  private static async mapProductRow(
    row: ProductRow,
    includeCreatorEmail = false
  ): Promise<Product> {

    const thumbnailUrl =
      await this.createSignedImageUrl(
        row.thumbnail_path
      );

    const previewRows =
      [...(row.product_previews || [])]
        .sort(
          (a, b) =>
            (a.sort_order || 0) -
            (b.sort_order || 0)
        );

    const previews = await Promise.all(
      previewRows.map(
        async (preview) => ({
          id: preview.id,

          productId: row.id,

          type: 'IMAGE',

          url:
            (
              await this.createSignedImageUrl(
                preview.storage_path
              )
            ) || '',

          textContent: undefined,

          caption:
            preview.alt_text || '',

          sortOrder:
            preview.sort_order || 0,
        })
      )
    );

    const featureRows =
      [...(row.product_features || [])]
        .sort(
          (a, b) =>
            (a.sort_order || 0) -
            (b.sort_order || 0)
        );

    const product: any = {
      id: row.id,

      title: row.title,

      category: row.category,

      shortDescription:
        row.short_description || '',

      description:
        row.description || '',

      creatorName:
        row.creator_name,

      creatorDepartment:
        row.creator_department || '',

      thumbnailUrl,

      serviceUrl:
        row.service_url || undefined,

      status: row.status,

      viewCount:
        row.view_count || 0,

      /**
       * 기존 Product Type이나 UI가 아직
       * downloadCount를 요구할 가능성이 있어서
       * DB에서는 사용하지 않되 항상 0으로 반환한다.
       *
       * UI에서 다운로드 기능 제거가 끝나면
       * store.ts Type에서도 삭제 가능.
       */
      downloadCount: 0,

      requestCount:
        row.request_count || 0,

      featured:
        row.featured || false,

      createdAt:
        row.created_at,

      updatedAt:
        row.updated_at,

      features:
        featureRows.map(
          (feature) => ({
            id: feature.id,

            productId:
              feature.product_id,

            featureText:
              feature.feature_text,

            sortOrder:
              feature.sort_order || 0,
          })
        ),

      previews,
    };

    if (
      includeCreatorEmail &&
      row.creator_email
    ) {
      product.creatorEmail =
        row.creator_email;
    }

    return product as Product;
  }


  // ==========================================================
  // 1. Product 목록
  // ==========================================================

  static async getProducts(
    params?: GetProductsParams
  ): Promise<Product[]> {

    if (this.useMockData()) {
      const mockProducts =
        await StorageService.getProducts(
          params
        );

      /**
       * Mock에서도 creatorEmail은
       * 일반 Product 목록에서 제거.
       */
      return mockProducts.map(
        (product: any) => {
          const {
            creatorEmail,
            ...safeProduct
          } = product;

          return safeProduct as Product;
        }
      );
    }

    const supabase =
      this.getSupabaseOrThrow();

    let query = supabase
      .from('products')
      .select(`
        *,
        product_features (
          id,
          product_id,
          feature_text,
          sort_order
        ),
        product_previews (
          id,
          product_id,
          storage_path,
          alt_text,
          sort_order
        )
      `);


    /**
     * 일반 사용자 API에서는
     * includeHidden=false로 호출해야 한다.
     */
    if (!params?.includeHidden) {
      query = query.eq(
        'status',
        'PUBLISHED'
      );
    }


    if (params?.featuredOnly) {
      query = query.eq(
        'featured',
        true
      );
    }


    if (
      params?.category &&
      params.category !== 'ALL'
    ) {
      query = query.eq(
        'category',
        params.category
      );
    }


    if (params?.q?.trim()) {
      const searchText =
        params.q
          .trim()
          .replace(/[%(),]/g, ' ');

      query = query.or(
        [
          `title.ilike.%${searchText}%`,
          `short_description.ilike.%${searchText}%`,
          `description.ilike.%${searchText}%`,
          `creator_name.ilike.%${searchText}%`,
        ].join(',')
      );
    }


    const sort =
      params?.sort || 'latest';


    if (sort === 'views') {
      query = query.order(
        'view_count',
        {
          ascending: false,
        }
      );
    } else if (
      sort === 'requests'
    ) {
      query = query.order(
        'request_count',
        {
          ascending: false,
        }
      );
    } else if (
      sort === 'title'
    ) {
      query = query.order(
        'title',
        {
          ascending: true,
        }
      );
    } else {
      query = query.order(
        'created_at',
        {
          ascending: false,
        }
      );
    }


    const {
      data,
      error,
    } = await query;


    if (error) {
      console.error(
        '[ProductService] Product 목록 조회 실패:',
        error
      );

      throw error;
    }


    const rows =
      (data || []) as ProductRow[];


    return Promise.all(
      rows.map(
        (row) =>
          this.mapProductRow(
            row,
            false
          )
      )
    );
  }


  // ==========================================================
  // 2. Product 상세
  // ==========================================================

  static async getProductById(
    id: string
  ): Promise<Product | null> {

    if (this.useMockData()) {
      const product =
        await StorageService.getProductById(
          id
        );

      if (!product) {
        return null;
      }

      const {
        creatorEmail,
        ...safeProduct
      } = product as any;

      return safeProduct as Product;
    }


    const supabase =
      this.getSupabaseOrThrow();


    const {
      data,
      error,
    } = await supabase
      .from('products')
      .select(`
        *,
        product_features (
          id,
          product_id,
          feature_text,
          sort_order
        ),
        product_previews (
          id,
          product_id,
          storage_path,
          alt_text,
          sort_order
        )
      `)
      .eq('id', id)
      .eq(
        'status',
        'PUBLISHED'
      )
      .maybeSingle();


    if (error) {
      console.error(
        '[ProductService] Product 상세 조회 실패:',
        error
      );

      throw error;
    }


    if (!data) {
      return null;
    }


    return this.mapProductRow(
      data as ProductRow,
      false
    );
  }


  // ==========================================================
  // 3. Internal Product 상세
  // creator_email 포함
  // ==========================================================

  static async getProductInternalById(
    id: string
  ): Promise<Product | null> {

    if (this.useMockData()) {
      return StorageService.getProductById(
        id
      );
    }


    const supabase =
      this.getSupabaseOrThrow();


    const {
      data,
      error,
    } = await supabase
      .from('products')
      .select(`
        *,
        product_features (
          id,
          product_id,
          feature_text,
          sort_order
        ),
        product_previews (
          id,
          product_id,
          storage_path,
          alt_text,
          sort_order
        )
      `)
      .eq('id', id)
      .maybeSingle();


    if (error) {
      console.error(
        '[ProductService] Internal Product 조회 실패:',
        error
      );

      throw error;
    }


    if (!data) {
      return null;
    }


    return this.mapProductRow(
      data as ProductRow,
      true
    );
  }


  // ==========================================================
  // Mock Submission Mapper
  // ==========================================================

  private static mapSubmissionInput(
    input: CreateSubmissionInput
  ) {
    return {
      ...input,

      previews:
        (input.previews || []).map(
          (preview, index) => ({
            id:
              `mock-preview-${Date.now()}-${index}`,

            url:
              preview.url,

            caption:
              preview.caption ||
              '화면 미리보기',
          })
        ),
    };
  }


  // ==========================================================
  // 4. 도구 등록 신청
  // ==========================================================

  static async createSubmission(
    input: CreateSubmissionInput
  ): Promise<UserSubmission> {

    if (this.useMockData()) {
      return StorageService
        .createSubmission(
          this.mapSubmissionInput(
            input
          )
        );
    }


    const supabase =
      this.getSupabaseOrThrow();


    /**
     * ID는 직접 만들지 않는다.
     *
     * submissions.id는
     * gen_random_uuid()로 Supabase가 생성.
     */
    const {
      data: submissionData,
      error: submissionError,
    } = await supabase
      .from('submissions')
      .insert({
        submitter_name:
          input.submitterName,

        submitter_department:
          input.submitterDepartment,

        submitter_email:
          input.submitterEmail,

        title:
          input.title,

        category:
          input.category,

        short_description:
          input.shortDescription,

        description:
          input.description,

        service_url:
          input.serviceUrl || null,

        thumbnail_path:
          input.thumbnailUrl || null,

        status:
          'REVIEW',
      })
      .select()
      .single();


    if (submissionError) {
      console.error(
        '[ProductService] 등록 신청 생성 실패:',
        submissionError
      );

      throw submissionError;
    }


    const submissionId =
      submissionData.id;


    // --------------------------------------------------------
    // 주요 기능 저장
    // --------------------------------------------------------

    if (
      input.features &&
      input.features.length > 0
    ) {
      const featureRows =
        input.features
          .map(
            (
              feature,
              index
            ) => ({
              submission_id:
                submissionId,

              feature_text:
                feature.trim(),

              sort_order:
                index + 1,
            })
          )
          .filter(
            (row) =>
              row.feature_text
                .length > 0
          );


      if (featureRows.length > 0) {
        const {
          error:
            featureError,
        } = await supabase
          .from(
            'submission_features'
          )
          .insert(
            featureRows
          );


        if (featureError) {
          console.error(
            '[ProductService] 신청 기능 저장 실패:',
            featureError
          );

          /**
           * 부모 Submission까지 삭제하여
           * 불완전 데이터가 남지 않도록 처리.
           */
          await supabase
            .from('submissions')
            .delete()
            .eq(
              'id',
              submissionId
            );

          throw featureError;
        }
      }
    }


    // --------------------------------------------------------
    // Preview 저장
    // --------------------------------------------------------

    if (
      input.previews &&
      input.previews.length > 0
    ) {
      const previewRows =
        input.previews
          .filter(
            (preview) =>
              Boolean(
                preview.url
              )
          )
          .map(
            (
              preview,
              index
            ) => ({
              submission_id:
                submissionId,

              storage_path:
                preview.url,

              sort_order:
                index + 1,
            })
          );


      if (
        previewRows.length > 0
      ) {
        const {
          error:
            previewError,
        } = await supabase
          .from(
            'submission_previews'
          )
          .insert(
            previewRows
          );


        if (previewError) {
          console.error(
            '[ProductService] 신청 Preview 저장 실패:',
            previewError
          );

          await supabase
            .from('submissions')
            .delete()
            .eq(
              'id',
              submissionId
            );

          throw previewError;
        }
      }
    }


    return {
      id:
        submissionId,

      submitterName:
        input.submitterName,

      submitterDepartment:
        input.submitterDepartment,

      submitterEmail:
        input.submitterEmail,

      title:
        input.title,

      category:
        input.category,

      shortDescription:
        input.shortDescription,

      description:
        input.description,

      features:
        input.features || [],

      serviceUrl:
        input.serviceUrl || undefined,

      thumbnailUrl:
        input.thumbnailUrl || undefined,

      status:
        'REVIEW',

      submittedAt:
        submissionData.submitted_at,
    } as UserSubmission;
  }


  // ==========================================================
  // 5. 등록 신청 승인
  // ==========================================================

  static async approveSubmission(
    id: string,
    adminComment?: string
  ): Promise<UserSubmission | null> {

    if (this.useMockData()) {
      return StorageService
        .updateSubmissionStatus(
          id,
          'APPROVED',
          adminComment
        );
    }


    const supabase =
      this.getSupabaseOrThrow();


    // --------------------------------------------------------
    // Submission 조회
    // --------------------------------------------------------

    const {
      data: submission,
      error: submissionError,
    } = await supabase
      .from('submissions')
      .select(`
        *,
        submission_features (
          id,
          feature_text,
          sort_order
        ),
        submission_previews (
          id,
          storage_path,
          sort_order
        )
      `)
      .eq('id', id)
      .maybeSingle();


    if (submissionError) {
      console.error(
        '[ProductService] 승인 대상 조회 실패:',
        submissionError
      );

      throw submissionError;
    }


    if (!submission) {
      return null;
    }


    if (
      submission.status ===
      'APPROVED'
    ) {
      throw new Error(
        '이미 승인된 등록 신청입니다.'
      );
    }


    // --------------------------------------------------------
    // Product 생성
    // --------------------------------------------------------

    const {
      data: productData,
      error: productError,
    } = await supabase
      .from('products')
      .insert({
        title:
          submission.title,

        category:
          submission.category,

        short_description:
          submission.short_description,

        description:
          submission.description,

        creator_name:
          submission.submitter_name,

        creator_department:
          submission.submitter_department,

        creator_email:
          submission.submitter_email,

        service_url:
          submission.service_url ||
          null,

        thumbnail_path:
          submission.thumbnail_path ||
          null,

        status:
          'PUBLISHED',

        featured:
          false,

        view_count:
          0,

        request_count:
          0,
      })
      .select()
      .single();


    if (productError) {
      console.error(
        '[ProductService] Product 생성 실패:',
        productError
      );

      throw productError;
    }


    const productId =
      productData.id;


    try {

      // ------------------------------------------------------
      // Features 이동
      // ------------------------------------------------------

      if (
        submission
          .submission_features
          ?.length > 0
      ) {
        const productFeatures =
          submission
            .submission_features
            .map(
              (feature: any) => ({
                product_id:
                  productId,

                feature_text:
                  feature.feature_text,

                sort_order:
                  feature.sort_order,
              })
            );


        const {
          error:
            featureError,
        } = await supabase
          .from(
            'product_features'
          )
          .insert(
            productFeatures
          );


        if (featureError) {
          throw featureError;
        }
      }


      // ------------------------------------------------------
      // Preview 이동
      // ------------------------------------------------------

      if (
        submission
          .submission_previews
          ?.length > 0
      ) {
        const productPreviews =
          submission
            .submission_previews
            .map(
              (preview: any) => ({
                product_id:
                  productId,

                storage_path:
                  preview.storage_path,

                alt_text:
                  `${submission.title} 화면 미리보기`,

                sort_order:
                  preview.sort_order,
              })
            );


        const {
          error:
            previewError,
        } = await supabase
          .from(
            'product_previews'
          )
          .insert(
            productPreviews
          );


        if (previewError) {
          throw previewError;
        }
      }


      // ------------------------------------------------------
      // Submission 승인 완료 처리
      // ------------------------------------------------------

      const reviewedAt =
        new Date().toISOString();


      const {
        error:
          updateError,
      } = await supabase
        .from('submissions')
        .update({
          status:
            'APPROVED',

          admin_comment:
            adminComment ||
            null,

          reviewed_at:
            reviewedAt,
        })
        .eq(
          'id',
          id
        );


      if (updateError) {
        throw updateError;
      }


      return {
        id:
          submission.id,

        submitterName:
          submission
            .submitter_name,

        submitterDepartment:
          submission
            .submitter_department,

        submitterEmail:
          submission
            .submitter_email,

        title:
          submission.title,

        category:
          submission.category,

        shortDescription:
          submission
            .short_description,

        description:
          submission.description,

        features:
          (
            submission
              .submission_features ||
            []
          ).map(
            (feature: any) =>
              feature.feature_text
          ),

        serviceUrl:
          submission.service_url ||
          undefined,

        thumbnailUrl:
          submission.thumbnail_path ||
          undefined,

        status:
          'APPROVED',

        adminComment,

        submittedAt:
          submission.submitted_at,

        reviewedAt,
      } as UserSubmission;

    } catch (error) {

      /**
       * 승인 과정 중 오류 발생 시
       * 방금 만든 Product를 삭제.
       *
       * FK ON DELETE CASCADE로
       * product_features /
       * product_previews도 함께 삭제됨.
       */
      await supabase
        .from('products')
        .delete()
        .eq(
          'id',
          productId
        );


      console.error(
        '[ProductService] 승인 처리 실패 및 Product Rollback:',
        error
      );

      throw error;
    }
  }


  // ==========================================================
  // 6. 등록 신청 반려
  // ==========================================================

  static async rejectSubmission(
    id: string,
    adminComment?: string
  ): Promise<UserSubmission | null> {

    if (this.useMockData()) {
      return StorageService
        .updateSubmissionStatus(
          id,
          'REJECTED',
          adminComment
        );
    }


    const supabase =
      this.getSupabaseOrThrow();


    const reviewedAt =
      new Date().toISOString();


    const {
      data,
      error,
    } = await supabase
      .from('submissions')
      .update({
        status:
          'REJECTED',

        admin_comment:
          adminComment ||
          null,

        reviewed_at:
          reviewedAt,
      })
      .eq('id', id)
      .select()
      .maybeSingle();


    if (error) {
      console.error(
        '[ProductService] 등록 신청 반려 실패:',
        error
      );

      throw error;
    }


    if (!data) {
      return null;
    }


    return {
      id:
        data.id,

      submitterName:
        data.submitter_name,

      submitterDepartment:
        data.submitter_department,

      submitterEmail:
        data.submitter_email,

      title:
        data.title,

      category:
        data.category,

      shortDescription:
        data.short_description,

      description:
        data.description,

      serviceUrl:
        data.service_url ||
        undefined,

      thumbnailUrl:
        data.thumbnail_path ||
        undefined,

      status:
        'REJECTED',

      adminComment:
        data.admin_comment ||
        undefined,

      submittedAt:
        data.submitted_at,

      reviewedAt:
        data.reviewed_at,
    } as UserSubmission;
  }


  // ==========================================================
  // 7. 서비스 이용 신청
  // ==========================================================

  static async createServiceRequest(
    input: CreateServiceRequestInput
  ): Promise<MaterialRequest> {

    /**
     * Browser에서 recipient_email을 받지 않는다.
     *
     * Product를 서버가 다시 조회.
     */
    const product =
      await this.getProductInternalById(
        input.productId
      );


    if (!product) {
      throw new Error(
        'PRODUCT_NOT_FOUND'
      );
    }


    const internalProduct =
      product as any;


    if (
      !internalProduct.creatorEmail
    ) {
      throw new Error(
        'CREATOR_EMAIL_NOT_FOUND'
      );
    }


    const creatorName =
      product.creatorName;

    const creatorDepartment =
      product.creatorDepartment ||
      '';

    const creatorEmail =
      internalProduct.creatorEmail;


    // --------------------------------------------------------
    // Mock Mode
    // --------------------------------------------------------

    if (this.useMockData()) {
      return StorageService
        .createRequest({
          productId:
            input.productId,

          productTitle:
            product.title,

          requestType:
            'SERVICE_ACCESS',

          requesterName:
            input.requesterName,

          requesterDepartment:
            input.requesterDepartment,

          requesterEmail:
            input.requesterEmail,

          purpose:
            input.purpose,

          message:
            input.notes || '',

          creatorName,

          creatorDepartment,

          creatorEmail,
        } as any);
    }


    const supabase =
      this.getSupabaseOrThrow();


    // --------------------------------------------------------
    // 이용 신청 저장
    // --------------------------------------------------------

    const {
      data,
      error,
    } = await supabase
      .from('service_requests')
      .insert({
        product_id:
          input.productId,

        product_title:
          product.title,

        requester_name:
          input.requesterName,

        requester_department:
          input.requesterDepartment,

        requester_email:
          input.requesterEmail,

        purpose:
          input.purpose,

        message:
          input.notes || '',

        recipient_name:
          creatorName,

        recipient_department:
          creatorDepartment,

        recipient_email:
          creatorEmail,

        status:
          'REQUESTED',
      })
      .select()
      .single();


    if (error) {
      console.error(
        '[ProductService] 서비스 이용 신청 저장 실패:',
        error
      );

      throw error;
    }


    // --------------------------------------------------------
    // Product request_count 증가
    // --------------------------------------------------------

    try {
      const {
        error: rpcError,
      } = await supabase.rpc(
        'increment_product_request_count',
        {
          prod_id:
            input.productId,
        }
      );


      if (rpcError) {
        throw rpcError;
      }

    } catch (rpcError) {

      /**
       * RPC가 아직 생성되지 않은 개발환경을 위한
       * 임시 fallback.
       *
       * 운영에서는 RPC 사용 권장.
       */
      console.warn(
        '[ProductService] request_count RPC 실패. 수동 증가를 시도합니다.',
        rpcError
      );


      const {
        data: current,
        error: currentError,
      } = await supabase
        .from('products')
        .select(
          'request_count'
        )
        .eq(
          'id',
          input.productId
        )
        .single();


      if (!currentError) {
        await supabase
          .from('products')
          .update({
            request_count:
              (
                current
                  ?.request_count ||
                0
              ) + 1,
          })
          .eq(
            'id',
            input.productId
          );
      }
    }


    return {
      id:
        data.id,

      productId:
        data.product_id,

      productTitle:
        data.product_title,

      requestType:
        'SERVICE_ACCESS',

      requesterName:
        data.requester_name,

      requesterDepartment:
        data.requester_department,

      requesterEmail:
        data.requester_email,

      purpose:
        data.purpose,

      message:
        data.message || '',

      creatorName:
        data.recipient_name || '',

      creatorDepartment:
        data.recipient_department ||
        '',

      creatorEmail:
        data.recipient_email,

      status:
        data.status,

      requestedAt:
        data.created_at,
    } as MaterialRequest;
  }


  // ==========================================================
  // 8. 조회수 증가
  // ==========================================================

  static async incrementProductView(
    id: string
  ): Promise<number> {

    if (this.useMockData()) {
      return StorageService
        .incrementViewCount(id);
    }


    const supabase =
      this.getSupabaseOrThrow();


    // --------------------------------------------------------
    // Atomic RPC
    // --------------------------------------------------------

    const {
      data: rpcData,
      error: rpcError,
    } = await supabase.rpc(
      'increment_product_view',
      {
        prod_id: id,
      }
    );


    if (
      !rpcError &&
      typeof rpcData === 'number'
    ) {
      return rpcData;
    }


    /**
     * RPC 생성 전 개발환경 fallback.
     *
     * 동시 요청이 많은 운영 환경에서는
     * 아래 방식보다 RPC가 안전하다.
     */
    console.warn(
      '[ProductService] increment_product_view RPC 실패. 수동 증가 사용.',
      rpcError
    );


    const {
      data: product,
      error: selectError,
    } = await supabase
      .from('products')
      .select(
        'view_count'
      )
      .eq('id', id)
      .single();


    if (selectError) {
      throw selectError;
    }


    const nextViewCount =
      (
        product
          ?.view_count ||
        0
      ) + 1;


    const {
      error: updateError,
    } = await supabase
      .from('products')
      .update({
        view_count:
          nextViewCount,
      })
      .eq('id', id);


    if (updateError) {
      throw updateError;
    }


    return nextViewCount;
  }


  // ==========================================================
  // 9. Storage 이미지 Upload
  // ==========================================================

  static async uploadThumbnail(
    fileBuffer:
      Buffer |
      Uint8Array,

    fileName: string,

    storagePath: string
  ): Promise<UploadFileResult> {

    if (this.useMockData()) {
      return {
        path:
          storagePath,

        publicUrl:
          storagePath,
      };
    }


    const supabase =
      this.getSupabaseOrThrow();


    const bucketName =
      process.env
        .SUPABASE_STORAGE_BUCKET ||
      'product-assets';


    const lowerFileName =
      fileName.toLowerCase();


    let contentType =
      'image/jpeg';


    if (
      lowerFileName.endsWith(
        '.png'
      )
    ) {
      contentType =
        'image/png';
    }

    if (
      lowerFileName.endsWith(
        '.webp'
      )
    ) {
      contentType =
        'image/webp';
    }


    const {
      data,
      error,
    } = await supabase.storage
      .from(bucketName)
      .upload(
        storagePath,
        fileBuffer,
        {
          upsert: true,

          contentType,

          cacheControl:
            '3600',
        }
      );


    if (error) {
      console.error(
        '[ProductService] Storage Upload 실패:',
        error
      );

      throw error;
    }


    /**
     * Bucket이 Private이므로
     * getPublicUrl()을 사용하지 않는다.
     *
     * 화면 표시용으로 Signed URL 생성.
     */
    const {
      data: signedUrlData,
      error: signedUrlError,
    } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(
        data.path,
        3600
      );


    if (signedUrlError) {
      console.warn(
        '[ProductService] Upload 성공, Signed URL 생성 실패:',
        signedUrlError
      );
    }


    return {
      /**
       * DB에 저장해야 할 값
       */
      path:
        data.path,

      /**
       * 즉시 Preview용.
       * DB에는 이 Signed URL을 저장하지 않는 것이 좋다.
       */
      publicUrl:
        signedUrlData
          ?.signedUrl,
    };
  }


  // ==========================================================
  // 10. Preview 여러 장 Upload
  // ==========================================================

  static async uploadPreviewImages(
    files: Array<{
      buffer:
        Buffer |
        Uint8Array;

      fileName:
        string;
    }>,

    basePath: string
  ): Promise<
    UploadFileResult[]
  > {

    const results:
      UploadFileResult[] = [];


    for (
      let index = 0;
      index < files.length;
      index++
    ) {
      const file =
        files[index];


      const extension =
        file.fileName
          .split('.')
          .pop()
          ?.toLowerCase() ||
        'webp';


      const storagePath =
        `${basePath}/preview-${String(
          index + 1
        ).padStart(
          2,
          '0'
        )}.${extension}`;


      const result =
        await this.uploadThumbnail(
          file.buffer,
          file.fileName,
          storagePath
        );


      results.push(
        result
      );
    }


    return results;
  }


  // ==========================================================
  // 11. Store Stats
  // ==========================================================

  static async getStats():
    Promise<
      import(
        '../../types/store'
      ).StoreStats
    > {

    if (this.useMockData()) {
      return StorageService
        .getStats();
    }


    const supabase =
      this.getSupabaseOrThrow();


    // --------------------------------------------------------
    // Published Products
    // --------------------------------------------------------

    const {
      data: productsData,
      error: productsError,
    } = await supabase
      .from('products')
      .select(`
        id,
        title,
        category,
        view_count,
        request_count,
        status
      `)
      .eq(
        'status',
        'PUBLISHED'
      );


    if (productsError) {
      throw productsError;
    }


    const products =
      productsData || [];


    const totalProducts =
      products.length;


    const totalViews =
      products.reduce(
        (
          sum,
          product
        ) =>
          sum +
          (
            product
              .view_count ||
            0
          ),
        0
      );


    // --------------------------------------------------------
    // Service Request Total
    // --------------------------------------------------------

    const {
      count:
        totalRequestsCount,
      error:
        requestCountError,
    } = await supabase
      .from(
        'service_requests'
      )
      .select(
        'id',
        {
          count: 'exact',
          head: true,
        }
      );


    if (
      requestCountError
    ) {
      throw requestCountError;
    }


    const totalRequests =
      totalRequestsCount ||
      0;


    // --------------------------------------------------------
    // Category Count
    // --------------------------------------------------------

    const categoryCounts:
      Record<
        ProductCategory,
        number
      > = {
        WEB: 0,
        AGENT: 0,
        EXCEL: 0,
        AUTOMATION: 0,
        PROMPT: 0,
        DOCUMENT: 0,
        DATA: 0,
        OTHER: 0,
      };


    products.forEach(
      (product) => {
        const category =
          product.category as
          ProductCategory;


        if (
          categoryCounts[
            category
          ] !== undefined
        ) {
          categoryCounts[
            category
          ] += 1;
        }
      }
    );


    // --------------------------------------------------------
    // 인기 Product
    // --------------------------------------------------------

    const topViewed =
      (
        await this
          .getProducts({
            sort: 'views',
          })
      ).slice(
        0,
        5
      );


    // --------------------------------------------------------
    // 최근 Service Requests
    // --------------------------------------------------------

    const {
      data: requestData,
      error:
        requestError,
    } = await supabase
      .from(
        'service_requests'
      )
      .select(`
        id,
        product_id,
        product_title,

        requester_name,
        requester_department,
        requester_email,

        purpose,
        message,

        recipient_name,
        recipient_department,
        recipient_email,

        status,
        created_at
      `)
      .order(
        'created_at',
        {
          ascending: false,
        }
      )
      .limit(5);


    if (requestError) {
      throw requestError;
    }


    const recentRequests:
      MaterialRequest[] =
      (
        requestData ||
        []
      ).map(
        (request: any) => ({
          id:
            request.id,

          productId:
            request.product_id,

          productTitle:
            request.product_title ||
            '서비스',

          requestType:
            'SERVICE_ACCESS',

          requesterName:
            request.requester_name,

          requesterDepartment:
            request
              .requester_department,

          requesterEmail:
            request
              .requester_email,

          purpose:
            request.purpose,

          message:
            request.message ||
            '',

          creatorName:
            request
              .recipient_name ||
            '',

          creatorDepartment:
            request
              .recipient_department ||
            '',

          creatorEmail:
            request
              .recipient_email ||
            '',

          status:
            request.status ||
            'REQUESTED',

          requestedAt:
            request.created_at,
        })
      );


    /**
     * 기존 StoreStats Type / Frontend가
     * 아직 다운로드 필드를 요구할 수 있어
     * compatibility 목적으로 0/[]를 반환한다.
     *
     * UI와 store.ts에서 다운로드 기능을 제거한 이후
     * 이 두 필드도 삭제 가능.
     */
    return {
      totalProducts,

      totalViews,

      totalDownloads: 0,

      totalRequests,

      categoryCounts,

      topViewed,

      topDownloaded: [],

      recentRequests,
    } as import(
      '../../types/store'
    ).StoreStats;
  }
}