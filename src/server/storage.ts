import {
  getSupabaseServerClient,
  isSupabaseConfigured,
} from '../lib/supabase/server.js';

import {
  Product,
  MaterialRequest,
  StoreStats,
  ProductCategory,
  RequestStatus,
  UserSubmission,
  SubmissionStatus,
} from '../types/store.js';


// ============================================================
// Mock Stores
// ============================================================

let productsStore: Product[] = [];

let requestsStore: MaterialRequest[] = [];

let submissionsStore: UserSubmission[] = [];


// ============================================================
// Storage Service
// ============================================================

export class StorageService {

  // ==========================================================
  // Common Helpers
  // ==========================================================

  private static useMockData(): boolean {
    return (
      process.env.USE_MOCK_DATA === 'true'
    );
  }


  private static getSupabaseOrThrow() {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase가 설정되지 않았습니다. ' +
        'SUPABASE_URL 및 SUPABASE_SECRET_KEY를 확인해주세요.'
      );
    }

    const supabase =
      getSupabaseServerClient();

    if (!supabase) {
      throw new Error(
        'Supabase Server Client를 생성할 수 없습니다.'
      );
    }

    return supabase;
  }


  private static async createSignedImageUrl(
    storagePath?: string | null,
    expiresInSeconds = 3600
  ): Promise<string | undefined> {

    if (!storagePath) {
      return undefined;
    }

    // 이미 완성된 외부 URL이면 그대로 사용
    if (
      storagePath.startsWith('http://') ||
      storagePath.startsWith('https://')
    ) {
      return storagePath;
    }

    /**
     * Storage 내부 경로는 반드시 Signed URL로 변환해야
     * Private Bucket 이미지를 브라우저에서 표시할 수 있다.
     *
     * 단, USE_MOCK_DATA=true이면 getSupabaseServerClient()가 null을
     * 반환하도록 구성되어 있으므로 실제 Storage 이미지를 표시하려면
     * .env에서 USE_MOCK_DATA=false로 실행해야 한다.
     */
    const supabase =
      getSupabaseServerClient();

    if (!supabase) {
      console.warn(
        '[StorageService] Supabase client가 없어 Signed URL을 생성할 수 없습니다. ' +
        '실제 Supabase를 사용할 경우 USE_MOCK_DATA=false 및 환경변수를 확인하세요.'
      );

      return undefined;
    }

    const bucket =
      process.env.SUPABASE_STORAGE_BUCKET ||
      'product-assets';

    const {
      data,
      error,
    } = await supabase.storage
      .from(bucket)
      .createSignedUrl(
        storagePath,
        expiresInSeconds
      );

    if (error) {
      console.error(
        '[StorageService] Signed URL 생성 실패:',
        error
      );

      return undefined;
    }

    return data?.signedUrl;
  }


  // ==========================================================
  // Product Row Mapping
  // ==========================================================

  private static async mapProduct(
    row: any,
    includeCreatorEmail = false
  ): Promise<Product> {

    const thumbnailUrl =
      await this.createSignedImageUrl(
        row.thumbnail_path
      );

    const rawFeatures =
      Array.isArray(row.product_features)
        ? row.product_features
        : [];

    const rawPreviews =
      Array.isArray(row.product_previews)
        ? row.product_previews
        : [];


    const features =
      [...rawFeatures]
        .sort(
          (a, b) =>
            (a.sort_order || 0) -
            (b.sort_order || 0)
        )
        .map(
          (feature: any) => ({
            id: feature.id,

            productId:
              row.id,

            featureText:
              feature.feature_text,

            sortOrder:
              feature.sort_order || 0,
          })
        );


    const previews =
      await Promise.all(
        [...rawPreviews]
          .sort(
            (a, b) =>
              (a.sort_order || 0) -
              (b.sort_order || 0)
          )
          .map(
            async (preview: any) => ({
              id:
                preview.id,

              productId:
                row.id,

              type:
                'IMAGE',

              url:
                (
                  await this.createSignedImageUrl(
                    preview.storage_path
                  )
                ) || '',

              caption:
                preview.alt_text || '',

              sortOrder:
                preview.sort_order || 0,
            })
          )
      );


    const product: any = {
      id:
        row.id,

      title:
        row.title,

      category:
        row.category,

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

      status:
        row.status,

      viewCount:
        row.view_count || 0,

      /**
       * 기존 TypeScript 타입 호환용.
       * DB에는 다운로드 개념이 없다.
       */
      downloadCount: 0,

      requestCount:
        row.request_count || 0,

      featured:
        Boolean(row.featured),

      createdAt:
        row.created_at,

      updatedAt:
        row.updated_at,

      features,

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
  // 1. Products
  // ==========================================================

  static async getProducts(
    params?: {
      q?: string;
      category?: string;
      sort?: string;
      featuredOnly?: boolean;
      includeHidden?: boolean;
    }
  ): Promise<Product[]> {

    // --------------------------------------------------------
    // Mock
    // --------------------------------------------------------

    if (this.useMockData()) {
      let result =
        [...productsStore];


      if (!params?.includeHidden) {
        result = result.filter(
          (product) =>
            product.status ===
            'PUBLISHED'
        );
      }


      if (params?.featuredOnly) {
        result = result.filter(
          (product) =>
            product.featured
        );
      }


      if (
        params?.category &&
        params.category !== 'ALL'
      ) {
        result = result.filter(
          (product) =>
            product.category ===
            params.category
        );
      }


      if (params?.q?.trim()) {
        const term =
          params.q
            .trim()
            .toLowerCase();

        result = result.filter(
          (product) =>
            product.title
              .toLowerCase()
              .includes(term) ||

            product.shortDescription
              .toLowerCase()
              .includes(term) ||

            product.description
              .toLowerCase()
              .includes(term) ||

            product.creatorName
              .toLowerCase()
              .includes(term) ||

            product.creatorDepartment
              .toLowerCase()
              .includes(term)
        );
      }


      const sort =
        params?.sort || 'latest';


      if (sort === 'views') {
        result.sort(
          (a, b) =>
            b.viewCount -
            a.viewCount
        );
      } else if (
        sort === 'requests'
      ) {
        result.sort(
          (a, b) =>
            b.requestCount -
            a.requestCount
        );
      } else if (
        sort === 'title'
      ) {
        result.sort(
          (a, b) =>
            a.title.localeCompare(
              b.title,
              'ko'
            )
        );
      } else {
        result.sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );
      }


      return result;
    }


    // --------------------------------------------------------
    // Supabase
    // --------------------------------------------------------

    const supabase =
      this.getSupabaseOrThrow();


    let query =
      supabase
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
      const term =
        params.q
          .trim()
          .replace(
            /[%(),]/g,
            ' '
          );

      query = query.or(
        [
          `title.ilike.%${term}%`,
          `short_description.ilike.%${term}%`,
          `description.ilike.%${term}%`,
          `creator_name.ilike.%${term}%`,
        ].join(',')
      );
    }


    const sort =
      params?.sort ||
      'latest';


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
        '[StorageService] Product 목록 조회 실패:',
        error
      );

      throw error;
    }


    return Promise.all(
      (data || []).map(
        (row: any) =>
          this.mapProduct(
            row,
            false
          )
      )
    );
  }


  // ==========================================================
  // 2. Product Detail
  // ==========================================================

  static async getProductById(
    id: string
  ): Promise<Product | null> {

    if (this.useMockData()) {
      const product =
        productsStore.find(
          (item) =>
            item.id === id
        );

      return product
        ? { ...product }
        : null;
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
        '[StorageService] Product 조회 실패:',
        error
      );

      throw error;
    }


    if (!data) {
      return null;
    }


    return this.mapProduct(
      data,
      true
    );
  }


  // ==========================================================
  // 3. View Count
  // ==========================================================

  static async incrementViewCount(
    id: string
  ): Promise<number> {

    if (this.useMockData()) {
      const product =
        productsStore.find(
          (item) =>
            item.id === id
        );

      if (!product) {
        return 0;
      }

      product.viewCount += 1;

      return product.viewCount;
    }


    const supabase =
      this.getSupabaseOrThrow();


    const {
      data,
      error,
    } = await supabase.rpc(
      'increment_product_view',
      {
        prod_id: id,
      }
    );


    if (!error) {
      return Number(data) || 0;
    }


    console.warn(
      '[StorageService] View RPC 실패. 수동 증가 사용:',
      error
    );


    const {
      data: product,
      error: readError,
    } = await supabase
      .from('products')
      .select('view_count')
      .eq('id', id)
      .single();


    if (readError) {
      throw readError;
    }


    const next =
      (
        product?.view_count ||
        0
      ) + 1;


    const {
      error: updateError,
    } = await supabase
      .from('products')
      .update({
        view_count: next,
      })
      .eq('id', id);


    if (updateError) {
      throw updateError;
    }


    return next;
  }


  // ==========================================================
  // 4. Create Product (Admin)
  // ==========================================================

  static async createProduct(
    data: Partial<Product>
  ): Promise<Product> {

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!data.title?.trim()) {
      throw new Error(
        'PRODUCT_TITLE_REQUIRED'
      );
    }

    if (!data.category) {
      throw new Error(
        'PRODUCT_CATEGORY_REQUIRED'
      );
    }

    if (!data.creatorName?.trim()) {
      throw new Error(
        'CREATOR_NAME_REQUIRED'
      );
    }

    if (!data.creatorEmail?.trim()) {
      throw new Error(
        'CREATOR_EMAIL_REQUIRED'
      );
    }


    // --------------------------------------------------------
    // Mock
    // --------------------------------------------------------

    if (this.useMockData()) {
      const now =
        new Date().toISOString();

      const id =
        `mock-product-${Date.now()}`;


      const product: Product = {
        id,

        title:
          data.title,

        category:
          data.category,

        shortDescription:
          data.shortDescription ||
          '',

        description:
          data.description ||
          '',

        creatorName:
          data.creatorName,

        creatorDepartment:
          data.creatorDepartment ||
          '',

        creatorEmail:
          data.creatorEmail,

        thumbnailUrl:
          data.thumbnailUrl,

        serviceUrl:
          data.serviceUrl,

        status:
          data.status ||
          'PUBLISHED',

        viewCount: 0,

        downloadCount: 0,

        requestCount: 0,

        featured:
          data.featured ??
          false,

        createdAt: now,

        updatedAt: now,

        features:
          (data.features || [])
            .map(
              (feature, index) => ({
                id:
                  `mock-feature-${Date.now()}-${index}`,

                productId:
                  id,

                featureText:
                  feature.featureText,

                sortOrder:
                  index + 1,
              })
            ),

        previews:
          (data.previews || [])
            .map(
              (preview, index) => ({
                id:
                  `mock-preview-${Date.now()}-${index}`,

                productId:
                  id,

                type:
                  'IMAGE',

                url:
                  preview.url,

                caption:
                  preview.caption,

                sortOrder:
                  index + 1,
              })
            ),
      } as Product;


      productsStore.unshift(
        product
      );


      return product;
    }


    // --------------------------------------------------------
    // Supabase
    // --------------------------------------------------------

    const supabase =
      this.getSupabaseOrThrow();


    const {
      data: productRow,
      error: productError,
    } = await supabase
      .from('products')
      .insert({
        title:
          data.title.trim(),

        category:
          data.category,

        short_description:
          data.shortDescription ||
          '',

        description:
          data.description ||
          '',

        creator_name:
          data.creatorName.trim(),

        creator_department:
          data.creatorDepartment ||
          '',

        creator_email:
          data.creatorEmail.trim(),

        service_url:
          data.serviceUrl ||
          null,

        /**
         * Frontend의 thumbnailUrl에는
         * 실제로 Storage Path를 전달한다.
         */
        thumbnail_path:
          data.thumbnailUrl ||
          null,

        status:
          data.status ||
          'PUBLISHED',

        featured:
          data.featured ??
          false,

        view_count: 0,
        request_count: 0,
      })
      .select()
      .single();


    if (productError) {
      console.error(
        '[StorageService] Product 생성 실패:',
        productError
      );

      throw productError;
    }


    const productId =
      productRow.id;


    try {

      // ------------------------------------------------------
      // Features
      // ------------------------------------------------------

      const featureRows =
        (data.features || [])
          .filter(
            (feature) =>
              Boolean(
                feature.featureText?.trim()
              )
          )
          .map(
            (feature, index) => ({
              product_id:
                productId,

              feature_text:
                feature.featureText.trim(),

              sort_order:
                index + 1,
            })
          );


      if (
        featureRows.length > 0
      ) {
        const {
          error:
            featureError,
        } = await supabase
          .from(
            'product_features'
          )
          .insert(
            featureRows
          );


        if (featureError) {
          throw featureError;
        }
      }


      // ------------------------------------------------------
      // Previews
      // ------------------------------------------------------

      const previewRows =
        (data.previews || [])
          .filter(
            (preview) =>
              Boolean(
                preview.url
              )
          )
          .map(
            (preview, index) => ({
              product_id:
                productId,

              storage_path:
                preview.url,

              alt_text:
                preview.caption ||
                '',

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
            'product_previews'
          )
          .insert(
            previewRows
          );


        if (previewError) {
          throw previewError;
        }
      }


    } catch (error) {

      /**
       * 자식 데이터 저장 실패 시
       * 생성한 Product 제거.
       */
      await supabase
        .from('products')
        .delete()
        .eq(
          'id',
          productId
        );


      throw error;
    }


    const created =
      await this.getProductById(
        productId
      );


    if (!created) {
      throw new Error(
        'PRODUCT_CREATE_RESULT_NOT_FOUND'
      );
    }


    return created;
  }


  // ==========================================================
  // 5. Update Product (Admin)
  // ==========================================================

  static async updateProduct(
    id: string,
    updates: Partial<Product>
  ): Promise<Product | null> {

    // --------------------------------------------------------
    // Mock
    // --------------------------------------------------------

    if (this.useMockData()) {
      const index =
        productsStore.findIndex(
          (product) =>
            product.id === id
        );


      if (index === -1) {
        return null;
      }


      const existing =
        productsStore[index];


      const updated = {
        ...existing,
        ...updates,

        id,

        updatedAt:
          new Date().toISOString(),

        features:
          updates.features ??
          existing.features,

        previews:
          updates.previews ??
          existing.previews,
      } as Product;


      productsStore[index] =
        updated;


      return {
        ...updated,
      };
    }


    // --------------------------------------------------------
    // Supabase
    // --------------------------------------------------------

    const supabase =
      this.getSupabaseOrThrow();


    /**
     * undefined인 필드는 DB Update에 넣지 않는다.
     */
    const productUpdate:
      Record<string, any> = {};


    if (
      updates.title !== undefined
    ) {
      productUpdate.title =
        updates.title;
    }


    if (
      updates.category !== undefined
    ) {
      productUpdate.category =
        updates.category;
    }


    if (
      updates.shortDescription !==
      undefined
    ) {
      productUpdate.short_description =
        updates.shortDescription;
    }


    if (
      updates.description !==
      undefined
    ) {
      productUpdate.description =
        updates.description;
    }


    if (
      updates.creatorName !==
      undefined
    ) {
      productUpdate.creator_name =
        updates.creatorName;
    }


    if (
      updates.creatorDepartment !==
      undefined
    ) {
      productUpdate.creator_department =
        updates.creatorDepartment;
    }


    if (
      updates.creatorEmail !==
      undefined
    ) {
      productUpdate.creator_email =
        updates.creatorEmail;
    }


    if (
      updates.serviceUrl !==
      undefined
    ) {
      productUpdate.service_url =
        updates.serviceUrl ||
        null;
    }


    if (
      updates.thumbnailUrl !==
      undefined
    ) {
      productUpdate.thumbnail_path =
        updates.thumbnailUrl ||
        null;
    }


    if (
      updates.status !== undefined
    ) {
      productUpdate.status =
        updates.status;
    }


    if (
      updates.featured !== undefined
    ) {
      productUpdate.featured =
        updates.featured;
    }


    if (
      Object.keys(
        productUpdate
      ).length > 0
    ) {
      const {
        error,
      } = await supabase
        .from('products')
        .update(
          productUpdate
        )
        .eq('id', id);


      if (error) {
        console.error(
          '[StorageService] Product 수정 실패:',
          error
        );

        throw error;
      }
    }


    // --------------------------------------------------------
    // Features Replace
    // --------------------------------------------------------

    if (
      updates.features !==
      undefined
    ) {
      const {
        error:
          deleteFeatureError,
      } = await supabase
        .from(
          'product_features'
        )
        .delete()
        .eq(
          'product_id',
          id
        );


      if (
        deleteFeatureError
      ) {
        throw deleteFeatureError;
      }


      const featureRows =
        updates.features
          .filter(
            (feature) =>
              Boolean(
                feature.featureText?.trim()
              )
          )
          .map(
            (feature, index) => ({
              product_id: id,

              feature_text:
                feature.featureText,

              sort_order:
                index + 1,
            })
          );


      if (
        featureRows.length > 0
      ) {
        const {
          error:
            insertFeatureError,
        } = await supabase
          .from(
            'product_features'
          )
          .insert(
            featureRows
          );


        if (
          insertFeatureError
        ) {
          throw insertFeatureError;
        }
      }
    }


    // --------------------------------------------------------
    // Preview Replace
    // --------------------------------------------------------

    if (
      updates.previews !==
      undefined
    ) {
      const {
        error:
          deletePreviewError,
      } = await supabase
        .from(
          'product_previews'
        )
        .delete()
        .eq(
          'product_id',
          id
        );


      if (
        deletePreviewError
      ) {
        throw deletePreviewError;
      }


      const previewRows =
        updates.previews
          .filter(
            (preview) =>
              Boolean(
                preview.url
              )
          )
          .map(
            (preview, index) => ({
              product_id: id,

              storage_path:
                preview.url,

              alt_text:
                preview.caption ||
                '',

              sort_order:
                index + 1,
            })
          );


      if (
        previewRows.length >
        0
      ) {
        const {
          error:
            insertPreviewError,
        } = await supabase
          .from(
            'product_previews'
          )
          .insert(
            previewRows
          );


        if (
          insertPreviewError
        ) {
          throw insertPreviewError;
        }
      }
    }


    return this.getProductById(
      id
    );
  }


  // ==========================================================
  // 6. Delete Product
  // ==========================================================

  static async deleteProduct(
    id: string
  ): Promise<boolean> {

    if (this.useMockData()) {
      const oldLength =
        productsStore.length;

      productsStore =
        productsStore.filter(
          (product) =>
            product.id !== id
        );

      return (
        productsStore.length <
        oldLength
      );
    }


    const supabase =
      this.getSupabaseOrThrow();


    const {
      data,
      error,
    } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select('id');


    if (error) {
      console.error(
        '[StorageService] Product 삭제 실패:',
        error
      );

      throw error;
    }


    return Boolean(
      data &&
      data.length > 0
    );
  }


  // ==========================================================
  // 7. Mock Service Request 생성
  // ==========================================================

  /**
   * 실제 Supabase 이용 신청은
   * ProductService.createServiceRequest()가 담당.
   *
   * 이 메서드는 Mock Mode 호환용.
   */
  static async createRequest(
    data: {
      productId: string;

      productTitle: string;

      requesterName: string;
      requesterDepartment: string;
      requesterEmail: string;

      purpose: string;
      message?: string;

      requestType?:
        | 'SERVICE_ACCESS'
        | 'FILE_ACCESS';

      fileId?: string;
      fileName?: string;

      creatorName?: string;
      creatorDepartment?: string;
      creatorEmail?: string;
    }
  ): Promise<MaterialRequest> {

    if (!this.useMockData()) {
      throw new Error(
        '실제 서비스 이용 신청은 ProductService.createServiceRequest()를 사용해야 합니다.'
      );
    }


    const product =
      productsStore.find(
        (item) =>
          item.id ===
          data.productId
      );


    if (!product) {
      throw new Error(
        'PRODUCT_NOT_FOUND'
      );
    }


    const creatorEmail =
      data.creatorEmail ||
      product.creatorEmail;


    if (!creatorEmail) {
      throw new Error(
        'CREATOR_EMAIL_NOT_FOUND'
      );
    }


    const now =
      new Date();


    const request: MaterialRequest = {
      id:
        `mock-request-${Date.now()}`,

      productId:
        data.productId,

      productTitle:
        product.title,

      requestType:
        'SERVICE_ACCESS',

      requesterName:
        data.requesterName,

      requesterDepartment:
        data.requesterDepartment,

      requesterEmail:
        data.requesterEmail,

      purpose:
        data.purpose,

      message:
        data.message || '',

      creatorName:
        data.creatorName ||
        product.creatorName,

      creatorDepartment:
        data.creatorDepartment ||
        product.creatorDepartment,

      creatorEmail,

      status:
        'REQUESTED',

      requestedAt:
        now.toISOString(),
    } as MaterialRequest;


    requestsStore.unshift(
      request
    );


    product.requestCount += 1;


    return request;
  }


  // ==========================================================
  // 8. Get Service Requests (Admin)
  // ==========================================================

  static async getRequests():
    Promise<MaterialRequest[]> {

    if (this.useMockData()) {
      return [
        ...requestsStore,
      ];
    }


    const supabase =
      this.getSupabaseOrThrow();


    const {
      data,
      error,
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
      );


    if (error) {
      console.error(
        '[StorageService] 이용 신청 목록 조회 실패:',
        error
      );

      throw error;
    }


    return (
      data || []
    ).map(
      (row: any) => ({
        id:
          row.id,

        productId:
          row.product_id,

        productTitle:
          row.product_title,

        requestType:
          'SERVICE_ACCESS',

        requesterName:
          row.requester_name,

        requesterDepartment:
          row.requester_department,

        requesterEmail:
          row.requester_email,

        purpose:
          row.purpose,

        message:
          row.message ||
          '',

        creatorName:
          row.recipient_name ||
          '',

        creatorDepartment:
          row.recipient_department ||
          '',

        creatorEmail:
          row.recipient_email,

        status:
          row.status,

        requestedAt:
          row.created_at,
      })
    ) as MaterialRequest[];
  }


  // ==========================================================
  // 9. Update Service Request Status
  // ==========================================================

  static async updateRequestStatus(
    id: string,
    status: RequestStatus
  ): Promise<MaterialRequest | null> {

    const allowedStatuses: RequestStatus[] =
      [
        'REQUESTED',
        'CONTACTED',
        'APPROVED',
        'REJECTED',
        'COMPLETED',
      ] as RequestStatus[];


    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      throw new Error(
        'INVALID_REQUEST_STATUS'
      );
    }


    if (this.useMockData()) {
      const request =
        requestsStore.find(
          (item) =>
            item.id === id
        );


      if (!request) {
        return null;
      }


      request.status =
        status;


      return {
        ...request,
      };
    }


    const supabase =
      this.getSupabaseOrThrow();


    const {
      data,
      error,
    } = await supabase
      .from(
        'service_requests'
      )
      .update({
        status,
      })
      .eq('id', id)
      .select()
      .maybeSingle();


    if (error) {
      console.error(
        '[StorageService] 이용 신청 상태 변경 실패:',
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
        data.recipient_name ||
        '',

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
  // 10. Mock Submission 생성
  // ==========================================================

  /**
   * 실제 등록 신청은
   * ProductService.createSubmission()이 담당.
   */
  static async createSubmission(
    data: Partial<UserSubmission>
  ): Promise<UserSubmission> {

    if (!this.useMockData()) {
      throw new Error(
        '실제 등록 신청은 ProductService.createSubmission()을 사용해야 합니다.'
      );
    }


    const now =
      new Date().toISOString();


    const submission:
      UserSubmission = {

      id:
        `mock-submission-${Date.now()}`,

      submitterName:
        data.submitterName ||
        '',

      submitterDepartment:
        data.submitterDepartment ||
        '',

      submitterEmail:
        data.submitterEmail ||
        '',

      title:
        data.title ||
        '',

      category:
        data.category ||
        'OTHER',

      shortDescription:
        data.shortDescription ||
        '',

      description:
        data.description ||
        '',

      features:
        data.features ||
        [],

      serviceUrl:
        data.serviceUrl,

      thumbnailUrl:
        data.thumbnailUrl,

      previews:
        data.previews ||
        [],

      status:
        'REVIEW',

      submittedAt:
        now,
    } as UserSubmission;


    submissionsStore.unshift(
      submission
    );


    return {
      ...submission,
    };
  }


  // ==========================================================
  // 11. Get Submissions (Admin)
  // ==========================================================

  static async getSubmissions():
    Promise<UserSubmission[]> {

    if (this.useMockData()) {
      return [
        ...submissionsStore,
      ];
    }


    const supabase =
      this.getSupabaseOrThrow();


    const {
      data,
      error,
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
      .order(
        'submitted_at',
        {
          ascending: false,
        }
      );


    if (error) {
      console.error(
        '[StorageService] 등록 신청 목록 조회 실패:',
        error
      );

      throw error;
    }


    return Promise.all(
      (data || []).map(
        async (row: any) => {

          const thumbnailUrl =
            await this
              .createSignedImageUrl(
                row.thumbnail_path
              );


          const previewRows =
            Array.isArray(
              row.submission_previews
            )
              ? row.submission_previews
              : [];


          const previews =
            await Promise.all(
              previewRows
                .sort(
                  (
                    a: any,
                    b: any
                  ) =>
                    (
                      a.sort_order ||
                      0
                    ) -
                    (
                      b.sort_order ||
                      0
                    )
                )
                .map(
                  async (
                    preview: any
                  ) => ({
                    id:
                      preview.id,

                    url:
                      (
                        await this
                          .createSignedImageUrl(
                            preview.storage_path
                          )
                      ) || '',

                    caption:
                      '화면 미리보기',
                  })
                )
            );


          const featureRows =
            Array.isArray(
              row.submission_features
            )
              ? row.submission_features
              : [];


          return {
            id:
              row.id,

            submitterName:
              row.submitter_name,

            submitterDepartment:
              row.submitter_department,

            submitterEmail:
              row.submitter_email,

            title:
              row.title,

            category:
              row.category,

            shortDescription:
              row.short_description,

            description:
              row.description,

            features:
              featureRows
                .sort(
                  (
                    a: any,
                    b: any
                  ) =>
                    (
                      a.sort_order ||
                      0
                    ) -
                    (
                      b.sort_order ||
                      0
                    )
                )
                .map(
                  (
                    feature: any
                  ) =>
                    feature.feature_text
                ),

            serviceUrl:
              row.service_url ||
              undefined,

            thumbnailUrl,

            previews,

            status:
              row.status,

            adminComment:
              row.admin_comment ||
              undefined,

            submittedAt:
              row.submitted_at,

            reviewedAt:
              row.reviewed_at ||
              undefined,
          } as UserSubmission;
        }
      )
    );
  }


  // ==========================================================
  // 12. Mock Submission Status
  // ==========================================================

  /**
   * Supabase 모드에서는
   * ProductService.approveSubmission /
   * ProductService.rejectSubmission을 사용.
   *
   * 이 메서드는 Mock 전용이다.
   */
  static async updateSubmissionStatus(
    id: string,
    status: SubmissionStatus,
    adminComment?: string
  ): Promise<UserSubmission | null> {

    if (!this.useMockData()) {
      throw new Error(
        'Supabase 모드에서는 ProductService의 승인/반려 메서드를 사용해야 합니다.'
      );
    }


    const submission =
      submissionsStore.find(
        (item) =>
          item.id === id
      );


    if (!submission) {
      return null;
    }


    submission.status =
      status;

    submission.adminComment =
      adminComment ||
      submission.adminComment;

    submission.reviewedAt =
      new Date().toISOString();


    /**
     * Mock Mode에서 승인 시
     * Product 생성.
     */
    if (
      status === 'APPROVED'
    ) {
      const exists =
        productsStore.some(
          (product) =>
            product.title
              .trim() ===
            submission.title
              .trim()
        );


      if (!exists) {
        const productId =
          `mock-product-${Date.now()}`;

        const now =
          new Date()
            .toISOString();


        const product: Product = {
          id:
            productId,

          title:
            submission.title,

          category:
            submission.category,

          shortDescription:
            submission
              .shortDescription,

          description:
            submission.description,

          creatorName:
            submission
              .submitterName,

          creatorDepartment:
            submission
              .submitterDepartment,

          creatorEmail:
            submission
              .submitterEmail,

          thumbnailUrl:
            submission
              .thumbnailUrl,

          serviceUrl:
            submission
              .serviceUrl,

          status:
            'PUBLISHED',

          viewCount: 0,

          downloadCount: 0,

          requestCount: 0,

          featured: false,

          createdAt: now,

          updatedAt: now,

          features:
            (
              submission.features ||
              []
            ).map(
              (
                feature,
                index
              ) => ({
                id:
                  `mock-feature-${Date.now()}-${index}`,

                productId,

                featureText:
                  feature,

                sortOrder:
                  index + 1,
              })
            ),

          previews:
            (
              submission.previews ||
              []
            ).map(
              (
                preview,
                index
              ) => ({
                id:
                  `mock-preview-${Date.now()}-${index}`,

                productId,

                type:
                  'IMAGE',

                url:
                  preview.url,

                caption:
                  preview.caption ||
                  '',

                sortOrder:
                  index + 1,
              })
            ),
        } as Product;


        productsStore.unshift(
          product
        );
      }
    }


    return {
      ...submission,
    };
  }


  // ==========================================================
  // 13. Statistics
  // ==========================================================

  static async getStats():
    Promise<StoreStats> {

    // --------------------------------------------------------
    // Mock
    // --------------------------------------------------------

    if (this.useMockData()) {

      const publishedProducts =
        productsStore.filter(
          (product) =>
            product.status ===
            'PUBLISHED'
        );


      const totalProducts =
        publishedProducts.length;


      const totalViews =
        publishedProducts.reduce(
          (
            total,
            product
          ) =>
            total +
            (
              product.viewCount ||
              0
            ),
          0
        );


      const totalRequests =
        requestsStore.length;


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


      publishedProducts.forEach(
        (product) => {
          if (
            categoryCounts[
              product.category
            ] !== undefined
          ) {
            categoryCounts[
              product.category
            ] += 1;
          }
        }
      );


      const topViewed =
        [...publishedProducts]
          .sort(
            (a, b) =>
              b.viewCount -
              a.viewCount
          )
          .slice(0, 5);


      return {
        totalProducts,

        totalViews,

        totalDownloads: 0,

        totalRequests,

        categoryCounts,

        topViewed,

        topDownloaded: [],

        recentRequests: [],
      } as StoreStats;
    }


    // --------------------------------------------------------
    // Supabase
    // --------------------------------------------------------

    const supabase =
      this.getSupabaseOrThrow();


    const {
      data: productRows,
      error:
        productError,
    } = await supabase
      .from('products')
      .select(`
        id,
        category,
        view_count,
        request_count,
        status
      `)
      .eq(
        'status',
        'PUBLISHED'
      );


    if (productError) {
      throw productError;
    }


    const products =
      productRows || [];


    const totalProducts =
      products.length;


    const totalViews =
      products.reduce(
        (
          total,
          product
        ) =>
          total +
          (
            product.view_count ||
            0
          ),
        0
      );


    const {
      count:
        totalRequestsCount,
      error:
        requestError,
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


    if (requestError) {
      throw requestError;
    }


    const totalRequests =
      totalRequestsCount ||
      0;


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


    const topViewed =
      (
        await this.getProducts({
          sort: 'views',
          includeHidden: false,
        })
      ).slice(
        0,
        5
      );


    const recentRequests: MaterialRequest[] = [];


    return {
      totalProducts,

      totalViews,

      /**
       * 기존 StoreStats 타입 호환.
       * 운영 UI에서는 사용하지 않는다.
       */
      totalDownloads: 0,

      totalRequests,

      categoryCounts,

      topViewed,

      topDownloaded: [],

      recentRequests,
    } as StoreStats;
  }
}