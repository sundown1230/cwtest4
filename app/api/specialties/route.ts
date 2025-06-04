import { D1Database } from '@cloudflare/workers-types';
import { Specialty } from '@/types';

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
  try {
    // APIキーの検証
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== env.API_KEY) {
      return new Response(JSON.stringify({ success: false, error: '認証エラー' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[GET /api/specialties] Request received.`);
    if (!env.DB) {
      console.error('[GET /api/specialties] Error: D1 Database binding (DB) is not available.');
      return new Response(JSON.stringify({ success: false, error: 'サーバー設定エラー: データベース接続が見つかりません。' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stmt = env.DB.prepare(
      `SELECT id, name FROM specialties ORDER BY id`
    );
    const d1Result = await stmt.all<Specialty>();

    if (!d1Result.success) {
      console.error('[GET /api/specialties] D1 query failed:', d1Result.error);
      let errorDetails = '不明なデータベースエラー';
      // d1Result.error is a string or undefined, not an Error object.
      // Use the string directly if it exists.
      errorDetails = d1Result.error ? d1Result.error : '不明なデータベースエラー';

      return new Response(JSON.stringify({ success: false, error: 'データベースクエリエラー', details: errorDetails }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: d1Result.results || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    console.error('[GET /api/specialties] Unhandled error:', e);
    let errorDetails = '不明なサーバー内部エラー';
    if (e instanceof Error) {
      let causeMessage = ('cause' in e && e.cause instanceof Error) ? ` (Cause: ${e.cause.message})` : '';
      errorDetails = e.message + causeMessage;
    }
    return new Response(JSON.stringify({ success: false, error: '診療科情報取得中に予期せぬエラーが発生しました', details: errorDetails }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};