// src/workers/doctors.ts
import { ExecutionContext } from '@cloudflare/workers-types';
import bcrypt from 'bcryptjs'; // bcryptjsをインポート
import { RegisterRequest, ApiResponse } from '@/types'; // 型定義をインポート

interface Env {
  JWT_SECRET: string;
  API_KEY: string;
  DB: D1Database; // D1データベースのバインディング
}

interface WorkerDoctor { // ローカル型名の変更を推奨 (例: WorkerDoctor)
  id: number;
  name: string;
  gender: 'M' | 'F' | 'O' | 'N'; // 修正: D1スキーマとRegisterRequestに合わせる
  birthdate: string;
  license_date: string;
  email: string;
  specialties: string[];
}

// データベース保存用の型 (password_hash を含む)
interface WorkerDoctorRecord extends Omit<WorkerDoctor, 'specialties' | 'id'> { // WorkerDoctor を使用
  user_type_id: number;
  password_hash: string;
  // specialties は doctor_specialties テーブルで管理
  // id は自動インクリメント
  // created_at, updated_at はDBのデフォルト値
  // gender, birthdate, license_date は RegisterRequest から取得
  // gender は WorkerDoctor で修正済み
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

    // ユーザー登録処理 (/api/register)
    if (path === '/api/register' && request.method === 'POST') {
      try {
        const body = await request.json<RegisterRequest>();

        // 簡単なバリデーション (より堅牢なバリデーションライブラリの使用を推奨)
        if (!body.email || !body.password || !body.name || !body.gender || !body.birthdate || !body.license_date || !body.specialties) {
          return new Response(JSON.stringify({ success: false, error: '必須項目が不足しています' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // パスワードのハッシュ化
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(body.password, saltRounds);

        // D1データベースに医師情報を挿入
        const doctorData: Omit<WorkerDoctorRecord, 'id'> = { // WorkerDoctorRecord を使用
          user_type_id: 1, // デフォルトで医師
          name: body.name,
          gender: body.gender, // body.gender は 'M' | 'F' | 'O' | 'N' であり、修正後の WorkerDoctorRecord と一致
          birthdate: body.birthdate,
          license_date: body.license_date,
          email: body.email,
          password_hash: password_hash,
        };

        const { results } = await env.DB.prepare(
          "INSERT INTO doctors (user_type_id, name, gender, birthdate, license_date, email, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(doctorData.user_type_id, doctorData.name, doctorData.gender, doctorData.birthdate, doctorData.license_date, doctorData.email, doctorData.password_hash)
        .run();
        
        // TODO: specialties を doctor_specialties テーブルに保存する処理を追加
        // const insertedDoctorId = results.lastRowId; (SQLiteの場合、lastRowIdで取得できるか確認)
        // body.specialties をループして、insertedDoctorId と共に doctor_specialties に挿入

        return new Response(JSON.stringify({ success: true, message: 'ユーザー登録が成功しました' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (e: any) {
        console.error('登録エラー:', e);
        return new Response(JSON.stringify({ success: false, error: '登録処理中にエラーが発生しました', details: e.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

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