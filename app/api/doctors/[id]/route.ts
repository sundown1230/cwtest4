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

// Next.js dynamic route handler receives params
export const GET = async (request: Request, { params }: { params: { id: string } }, env: Env) => {
  const idSegment = params.id;
  console.log(`[GET /api/doctors/:id] Request received for idSegment: '${idSegment}'.`);

  try {
    // APIキーの検証
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== env.API_KEY) {
      return new Response(JSON.stringify({ success: false, error: '認証エラー' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!idSegment || isNaN(parseInt(idSegment, 10))) {
      return new Response(JSON.stringify({ success: false, error: '有効な医師IDが指定されていません' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!env.DB) {
      console.error(`[GET /api/doctors/${idSegment}] Error: D1 Database binding (DB) is not available.`);
      return new Response(JSON.stringify({ success: false, error: 'サーバー設定エラー: データベース接続が見つかりません。' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const doctorId = parseInt(idSegment, 10);

    // 医師情報と関連する診療科名をJOINして取得
    const stmt = env.DB.prepare(
      `SELECT
         d.id, d.name, d.gender, d.birthdate, d.license_date, d.email,
         GROUP_CONCAT(s.id) AS specialty_ids,
         GROUP_CONCAT(s.name) AS specialty_names
       FROM doctors d
       LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
       LEFT JOIN specialties s ON ds.specialty_id = s.id
       WHERE d.id = ?
       GROUP BY d.id`
    ).bind(doctorId);

    const result = await stmt.first<{ id: number; name: string; gender: 'M' | 'F' | 'O' | 'N'; birthdate: string; license_date: string; email: string; specialty_ids: string | null; specialty_names: string | null }>();

    if (result) {
      let mappedSpecialties: Specialty[] = [];
      if (result.specialty_ids && result.specialty_names) {
        const ids = result.specialty_ids.split(',').map(s_id => parseInt(s_id.trim(), 10));
        const names = result.specialty_names.split(',').map(s_name => s_name.trim());
        if (ids.length === names.length) {
          mappedSpecialties = ids.map((specId, index) => ({
            id: specId,
            name: names[index],
          }));
        }
      }
      const { specialty_ids, specialty_names, ...doctorBaseInfo } = result;
      const doctorData: WorkerDoctor = { ...doctorBaseInfo, specialties: mappedSpecialties };
      return new Response(JSON.stringify({ success: true, data: doctorData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: false, error: '医師情報が見つかりませんでした' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    console.error(`[GET /api/doctors/${idSegment}] Unhandled error:`, e);
    let errorDetails = '不明なサーバー内部エラー';
    if (e instanceof Error) {
      let causeMessage = ('cause' in e && e.cause instanceof Error) ? ` (Cause: ${e.cause.message})` : '';
      errorDetails = e.message + causeMessage;
    }
    return new Response(JSON.stringify({ success: false, error: '医師情報取得中に予期せぬエラーが発生しました', details: errorDetails }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};