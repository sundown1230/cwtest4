// src/workers/doctors.ts
import { ExecutionContext, D1Database } from '@cloudflare/workers-types'; // Import D1Database
// import { ApiResponse, Doctor, Specialty } from '@/types'; // 共有型をインポート (必要に応じて残す)

interface Env {
  JWT_SECRET: string;
  API_KEY: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

// src/workers/doctors.ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    // const path = url.pathname; // パスによるルーティングはPages Functionsに移行

    // CORSプリフライトリクエストの処理
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // TODO: Pages Functions に移行したAPIロジックを削除しました。
    // このWorkerが他の目的で必要ない場合は、ファイル自体を削除するか、
    // Pages Functions で処理できない特定のロジックのみをここに残してください。
    // This worker's API logic has been migrated. Returning a deprecated message.
    return new Response(
      JSON.stringify({
        success: false,
        error: 'This Worker endpoint is deprecated. Functionality has been moved to Pages Functions.'
      }),
      {
        status: 410, // HTTP 410 Gone
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders // Apply all defined CORS headers
        }
      }
    );
  }
};