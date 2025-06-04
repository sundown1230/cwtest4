import { D1Database } from '@cloudflare/workers-types';
import { Specialty, WorkerDoctor } from '@/types';

interface Env {
  API_KEY: string;
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

// CORSプリフライトリクエストの処理
export const OPTIONS = async () => {
  return new Response(null, { headers: corsHeaders });
};

export const GET = async (request: Request, env: Env) => {
  // APIキーの検証
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey !== env.API_KEY) {
    return new Response(JSON.stringify({ success: false, error: '認証エラー' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // D1データベースバインディングの確認
  if (!env.DB) {
    console.error('[GET /api/doctors] Error: D1 Database binding (DB) is not available.');
    return new Response(JSON.stringify({ success: false, error: 'サーバー設定エラー: データベース接続が見つかりません。' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // console.log(`[GET /api/doctors] Request received.`); // デバッグログは必要に応じて有効化
    const stmt = env.DB.prepare(
      `SELECT
         d.id, d.name, d.gender, d.birthdate, d.license_date, d.email,
         GROUP_CONCAT(s.id) AS specialty_ids,
         GROUP_CONCAT(s.name) AS specialty_names
       FROM doctors d
       LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
       LEFT JOIN specialties s ON ds.specialty_id = s.id
       GROUP BY d.id, d.name, d.gender, d.birthdate, d.license_date, d.email
       ORDER BY d.name`
    );
    const d1Result = await stmt.all<{ id: number; name: string; gender: 'M' | 'F' | 'O' | 'N'; birthdate: string; license_date: string; email: string; specialty_ids: string | null; specialty_names: string | null }>();

    if (!d1Result.success) {
      console.error('[GET /api/doctors] D1 query failed:', d1Result.error);
      const errorDetails = d1Result.error instanceof Error 
        ? d1Result.error.message + (('cause' in d1Result.error && d1Result.error.cause instanceof Error) ? ` (Cause: ${d1Result.error.cause.message})` : '')
        : '不明なデータベースエラー';

      return new Response(JSON.stringify({ success: false, error: 'データベースクエリエラー', details: errorDetails }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const doctorsData: WorkerDoctor[] = d1Result.results
      ? d1Result.results.map(doc => {
          let mappedSpecialties: Specialty[] = [];
          if (doc.specialty_ids && doc.specialty_names) {
            const ids = doc.specialty_ids.split(',').map(s_id => parseInt(s_id.trim(), 10));
            const names = doc.specialty_names.split(',').map(s_name => s_name.trim());
            if (ids.length === names.length) {
              mappedSpecialties = ids.map((specId, index) => ({
                id: specId,
                name: names[index],
              }));
            }
          }
          const { specialty_ids, specialty_names, ...doctorBaseInfo } = doc;
          return { ...doctorBaseInfo, specialties: mappedSpecialties };
        })
      : [];

    return new Response(JSON.stringify({ success: true, data: doctorsData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    console.error('[GET /api/doctors] Unhandled error:', e);
    const errorDetails = e instanceof Error
        ? e.message + (('cause' in e && e.cause instanceof Error) ? ` (Cause: ${e.cause.message})` : '')
        : '不明なサーバー内部エラー';

    return new Response(JSON.stringify({ success: false, error: '医師情報取得中に予期せぬサーバー内部エラーが発生しました', details: errorDetails }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};