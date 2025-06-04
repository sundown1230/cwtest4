// src/workers/doctors.ts
import { ExecutionContext, D1Database } from '@cloudflare/workers-types'; // Import D1Database
import bcrypt from 'bcryptjs';
import { RegisterRequest } from '@/types'; // Assuming RegisterRequest is defined in @/types

interface Env {
  JWT_SECRET: string;
  API_KEY: string;
  DB: D1Database; // Add D1Database binding
};

interface WorkerDoctor {
  id: number;
  name: string;
  gender: 'M' | 'F' | 'O' | 'N';
  birthdate: string;
  license_date: string;
  email: string;
  specialties: string[];
}

interface WorkerDoctorRecord extends Omit<WorkerDoctor, 'specialties' | 'id'> {
  user_type_id: number;
  password_hash: string;
}

const mockDoctors: Record<string, WorkerDoctor> = { // Used for /api/doctors/:id
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

    try {
      // ユーザー登録処理 (/api/register)
      if (path === '/api/register' && request.method === 'POST') {
        try {
          const body = await request.json<RegisterRequest>();

          if (!body.email || !body.password || !body.name || !body.gender || !body.birthdate || !body.license_date || !body.specialties) {
            return new Response(JSON.stringify({ success: false, error: '必須項目が不足しています' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const saltRounds = 10;
          const password_hash = await bcrypt.hash(body.password, saltRounds);

          const doctorData: Omit<WorkerDoctorRecord, 'id'> = {
            user_type_id: 1, // Default to doctor
            name: body.name,
            gender: body.gender,
            birthdate: body.birthdate,
            license_date: body.license_date,
            email: body.email,
            password_hash: password_hash,
          };

          const insertStmt = env.DB.prepare(
            "INSERT INTO doctors (user_type_id, name, gender, birthdate, license_date, email, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)"
          ).bind(doctorData.user_type_id, doctorData.name, doctorData.gender, doctorData.birthdate, doctorData.license_date, doctorData.email, doctorData.password_hash);
          const { meta } = await insertStmt.run();
          const insertedDoctorId = meta.last_row_id;
          
          // TODO: Save specialties to doctor_specialties table using insertedDoctorId and body.specialties

          return new Response(JSON.stringify({ success: true, message: 'ユーザー登録が成功しました', doctorId: insertedDoctorId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (e: any) {
          console.error('登録エラー:', e);
          const errorDetails = e.message + (e.cause ? ` (Cause: ${(e.cause as Error).message})` : '');
          return new Response(JSON.stringify({ success: false, error: '登録処理中にエラーが発生しました', details: errorDetails }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // APIキーの検証 (登録以外のルートに適用)
      const apiKey = request.headers.get('X-API-Key');
      if (apiKey !== env.API_KEY) {
        return new Response(JSON.stringify({ success: false, error: '認証エラー' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 全医師情報取得 (/api/doctors)
      if (path === '/api/doctors' && request.method === 'GET') {
        const stmt = env.DB.prepare(
          `SELECT id, name, gender, birthdate, license_date, email FROM doctors ORDER BY name`
        );
        const { results } = await stmt.all<Omit<WorkerDoctor, 'specialties'>>();
        
        const doctorsData: WorkerDoctor[] = results 
          ? results.map(doc => ({ ...doc, specialties: [] as string[] })) // Add empty specialties for now
          : [];

        return new Response(JSON.stringify({ success: true, data: doctorsData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 特定医師情報取得 (/api/doctors/:id) - mockDoctorsを使用
      if (path.startsWith('/api/doctors/') && request.method === 'GET') {
        const id = path.split('/').pop();
        if (id && mockDoctors[id]) {
          return new Response(JSON.stringify({ success: true, data: mockDoctors[id] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: false, error: '医師情報が見つかりませんでした' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fallback for unhandled paths under API key protection
      return new Response(JSON.stringify({ success: false, error: 'ルートが見つかりません' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (e: any) { // Top-level catch for any unhandled errors
      console.error('Unhandled error in fetch handler:', e);
      const errorDetails = e.message + (e.cause ? ` (Cause: ${(e.cause as Error).message})` : '');
      return new Response(JSON.stringify({ success: false, error: 'サーバー内部エラーが発生しました', details: errorDetails }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
};