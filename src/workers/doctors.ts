// src/workers/doctors.ts
import { ExecutionContext } from '@cloudflare/workers-types';

interface Env {
  JWT_SECRET: string;
  API_KEY: string;
  DB: D1Database; // D1データベースのバインディング
}

interface WorkerDoctor { // このWorkerが返す医師情報の型
  id: number;
  name: string;
  gender: 'M' | 'F' | 'O' | 'N';
  birthdate: string;
  license_date: string;
  email: string;
  specialties: string[];
}

const mockDoctors: Record<string, WorkerDoctor> = { // WorkerDoctor を使用
  '1': {
    id: 1,
    name: '山田太郎',
    gender: 'M',
    birthdate: '1980-01-01',
    license_date: '2005-04-01',
    email: 'yamada@example.com',
    specialties: ['内科', '消化器科']
  }
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
    const path = url.pathname;

    // CORSプリフライトリクエストの処理
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // APIキーの検証 (登録エンドポイントにも適用する場合)
    // const apiKey = request.headers.get('X-API-Key');
    // if (apiKey !== env.API_KEY) {
    //   return new Response(JSON.stringify({ success: false, error: '認証エラー' }), {
    //     status: 401,
    //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //   });
    // }

    // OPTIONSリクエストの処理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    
    // API_KEYの検証
    const apiKey = request.headers.get('X-API-Key');
    console.log('Received API Key:', apiKey);
    console.log('Expected API Key:', env.API_KEY);
    
    if (apiKey !== env.API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '認証エラー'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    
    // 既存の医師情報取得ロジック (例: /api/doctors/:id)
    const id = path.split('/').pop();

    if (!id || !mockDoctors[id]) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '医師情報が見つかりませんでした'
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: mockDoctors[id]
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
};