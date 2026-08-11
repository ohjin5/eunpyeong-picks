import {
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';


// ============================================================
// Supabase Server Client
// ============================================================

let supabaseServerInstance:
  SupabaseClient | null = null;


// ============================================================
// Environment Helpers
// ============================================================

function isMockMode(): boolean {
  return (
    process.env.USE_MOCK_DATA
      ?.trim()
      .toLowerCase() === 'true'
  );
}


/**
 * SUPABASE_URL 정규화
 *
 * 정상:
 * https://xxxx.supabase.co
 *
 * 혹시 실수로 아래가 들어와도 제거:
 * /rest/v1
 * /rest/v1/
 * /storage/v1
 *
 * 마지막 "/"도 제거한다.
 */
function getSupabaseUrl():
  string | undefined {

  const rawUrl =
    process.env.SUPABASE_URL
      ?.trim();

  if (!rawUrl) {
    return undefined;
  }

  let url = rawUrl;

  // ------------------------------------------
  // 사용자가 실수로 API Path까지 넣은 경우 제거
  // ------------------------------------------

  url = url.replace(
    /\/rest\/v1\/?$/i,
    ''
  );

  url = url.replace(
    /\/storage\/v1\/?$/i,
    ''
  );

  // ------------------------------------------
  // 마지막 슬래시 제거
  // ------------------------------------------

  url = url.replace(
    /\/+$/,
    ''
  );

  return url;
}


/**
 * 서버 전용 Secret Key
 *
 * 브라우저에 노출하면 안 됨.
 */
function getSupabaseSecretKey():
  string | undefined {

  const key =
    process.env
      .SUPABASE_SECRET_KEY
      ?.trim();

  return key || undefined;
}


// ============================================================
// URL Validation
// ============================================================

function validateSupabaseUrl(
  value: string
): boolean {

  try {

    const parsed =
      new URL(value);


    if (
      parsed.protocol !== 'https:'
    ) {

      console.error(
        '[Supabase Server] ' +
        'SUPABASE_URL은 https:// 주소여야 합니다.'
      );

      return false;
    }


    if (
      !parsed.hostname
    ) {

      console.error(
        '[Supabase Server] ' +
        'SUPABASE_URL hostname이 없습니다.'
      );

      return false;
    }


    /**
     * Supabase Cloud 프로젝트라면 일반적으로
     * *.supabase.co 형태.
     *
     * 자체 호스팅 가능성을 고려해서
     * 강제 차단은 하지 않고 Warning만 출력.
     */
    if (
      !parsed.hostname.endsWith(
        '.supabase.co'
      )
    ) {

      console.warn(
        '[Supabase Server] ' +
        'SUPABASE_URL이 일반적인 *.supabase.co 형식이 아닙니다:',
        parsed.hostname
      );
    }


    /**
     * URL에 path가 남아 있으면 안 된다.
     */
    if (
      parsed.pathname !== '/' &&
      parsed.pathname !== ''
    ) {

      console.error(
        '[Supabase Server] ' +
        'SUPABASE_URL에는 /rest/v1 등의 경로를 포함하면 안 됩니다. ' +
        `현재 pathname: ${parsed.pathname}`
      );

      return false;
    }


    return true;

  } catch (
    error
  ) {

    console.error(
      '[Supabase Server] ' +
      'SUPABASE_URL 형식이 올바르지 않습니다.',
      error
    );

    return false;
  }
}


// ============================================================
// Configuration Check
// ============================================================

export function isSupabaseConfigured():
  boolean {

  if (
    isMockMode()
  ) {
    return false;
  }


  const supabaseUrl =
    getSupabaseUrl();

  const supabaseSecretKey =
    getSupabaseSecretKey();


  if (
    !supabaseUrl ||
    !supabaseSecretKey
  ) {
    return false;
  }


  return validateSupabaseUrl(
    supabaseUrl
  );
}


// ============================================================
// Get Supabase Server Client
// ============================================================

export function getSupabaseServerClient():
  SupabaseClient | null {

  // ----------------------------------------------------------
  // Mock Mode
  // ----------------------------------------------------------

  if (
    isMockMode()
  ) {
    return null;
  }


  // ----------------------------------------------------------
  // Singleton
  // ----------------------------------------------------------

  if (
    supabaseServerInstance
  ) {
    return supabaseServerInstance;
  }


  // ----------------------------------------------------------
  // Environment
  // ----------------------------------------------------------

  const supabaseUrl =
    getSupabaseUrl();

  const supabaseSecretKey =
    getSupabaseSecretKey();


  if (
    !supabaseUrl
  ) {

    console.error(
      '[Supabase Server] ' +
      'SUPABASE_URL 환경변수가 설정되지 않았습니다.'
    );

    return null;
  }


  if (
    !supabaseSecretKey
  ) {

    console.error(
      '[Supabase Server] ' +
      'SUPABASE_SECRET_KEY 환경변수가 설정되지 않았습니다.'
    );

    return null;
  }


  // ----------------------------------------------------------
  // URL Validation
  // ----------------------------------------------------------

  if (
    !validateSupabaseUrl(
      supabaseUrl
    )
  ) {

    return null;
  }


  // ----------------------------------------------------------
  // Secret Key 기본 검증
  // ----------------------------------------------------------

  if (
    !supabaseSecretKey.startsWith(
      'sb_secret_'
    ) &&
    !supabaseSecretKey.startsWith(
      'eyJ'
    )
  ) {

    console.warn(
      '[Supabase Server] ' +
      'SUPABASE_SECRET_KEY 형식이 일반적인 Secret/service_role key와 다릅니다.'
    );
  }


  // ----------------------------------------------------------
  // Debug
  //
  // Secret 전체 값은 절대 출력하지 않는다.
  // ----------------------------------------------------------

  console.log(
    '[Supabase Server] Initializing',
    {
      mockMode:
        false,

      url:
        supabaseUrl,

      hostname:
        new URL(
          supabaseUrl
        ).hostname,

      secretKeyExists:
        true,

      secretKeyPrefix:
        supabaseSecretKey
          .slice(
            0,
            10
          ),

      secretKeyLength:
        supabaseSecretKey.length,
    }
  );


  // ----------------------------------------------------------
  // Create Client
  // ----------------------------------------------------------

  try {

    supabaseServerInstance =
      createClient(
        supabaseUrl,
        supabaseSecretKey,
        {

          auth: {
            persistSession:
              false,

            autoRefreshToken:
              false,

            detectSessionInUrl:
              false,
          },


          global: {

            headers: {

              'X-Client-Info':
                'eunpyeong-picks-server',

            },

          },

        }
      );


    return supabaseServerInstance;

  } catch (
    error
  ) {

    console.error(
      '[Supabase Server] ' +
      'Supabase Client 생성 실패:',
      error
    );

    supabaseServerInstance =
      null;

    return null;
  }
}


// ============================================================
// Required Supabase Client
// ============================================================

/**
 * Supabase가 반드시 필요한 Server 코드에서 사용.
 *
 * Client가 없을 경우 즉시 오류를 발생시켜
 * 이후 코드에서 null 체크를 반복하지 않게 한다.
 */
export function requireSupabaseServerClient():
  SupabaseClient {

  if (
    isMockMode()
  ) {

    throw new Error(
      '현재 USE_MOCK_DATA=true 상태입니다.'
    );
  }


  const client =
    getSupabaseServerClient();


  if (
    !client
  ) {

    throw new Error(
      'Supabase Server Client를 초기화할 수 없습니다. ' +
      'SUPABASE_URL 및 SUPABASE_SECRET_KEY를 확인해주세요.'
    );
  }


  return client;
}


// ============================================================
// Reset Client
// ============================================================

/**
 * 개발 중 환경변수 변경 후
 * Client를 다시 만들 필요가 있을 때 사용 가능.
 *
 * 일반 운영 중에는 사용할 필요 없음.
 */
export function resetSupabaseServerClient():
  void {

  supabaseServerInstance =
    null;
}


// ============================================================
// Config Status
// ============================================================

export function getSupabaseConfigStatus() {

  const url =
    getSupabaseUrl();

  const key =
    getSupabaseSecretKey();


  let hostname:
    string | undefined;


  if (
    url
  ) {

    try {

      hostname =
        new URL(
          url
        ).hostname;

    } catch {

      hostname =
        undefined;
    }

  }


  return {

    mockMode:
      isMockMode(),

    hasSupabaseUrl:
      Boolean(
        url
      ),

    hasSecretKey:
      Boolean(
        key
      ),

    supabaseHostname:
      hostname,

    secretKeyPrefix:
      key
        ? key.slice(
            0,
            10
          )
        : undefined,

    configured:
      isSupabaseConfigured(),

  };
}