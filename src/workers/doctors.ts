// src/workers/doctors.ts
import { ExecutionContext, D1Database } from '@cloudflare/workers-types'; // Import D1Database
import bcrypt from 'bcryptjs';
import { RegisterRequest, ApiResponse, Specialty, DoctorDbRecord, Doctor } from '@/types'; // 型定義をインポート

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
  specialties: Specialty[]; // Consistently use Specialty[]
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

const mockDoctors: Record<string, WorkerDoctor> = { // WorkerDoctor を使用
  '1': {
    id: 1,
    name: '山田太郎',
    gender: 'M',
    birthdate: '1980-01-01',
    license_date: '2005-04-01',
    email: 'yamada@example.com',
    specialties: [ // Changed to Specialty[]
      { id: 1, name: '内科' },
      { id: 2, name: '消化器科' }
    ]
  }
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
          const body = await request.json() as RegisterRequest;

          if (!body.email || !body.password || !body.name || !body.gender || !body.birthdate || !body.license_date || !body.specialties) {
            return new Response(JSON.stringify({ success: false, error: '必須項目が不足しています' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const saltRounds = 10;
          const password_hash = await bcrypt.hash(body.password, saltRounds);

          const doctorData: Omit<DoctorDbRecord, 'id'> = { // DoctorDbRecord を使用
            // TODO: user_type_id を適切に設定するロジックを追加 (例: 登録タイプによる分岐や、常に医師(1)とするか)
            // 現在は医師(1)を仮定
            user_type_id: 1,
            // TODO: created_at, updated_at フィールドがあればDBスキーマに合わせて追加
            // created_at: new Date().toISOString(),
            // updated_at: new Date().toISOString(),
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
          
          // TODO: specialties (string[]) を doctor_specialties テーブルに保存する処理
          // 1. body.specialties (string[] の診療科名) を specialties テーブルの id (number[]) に変換する。
          //    - 例: SELECT id FROM specialties WHERE name IN (...)
          //    - 存在しない診療科名が指定された場合のハンドリングも考慮する。
          // 2. 取得した specialty_id 配列と insertedDoctorId を使って、
          //    doctor_specialties テーブルに複数のレコードを挿入する。
          //    - 例: INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES (?, ?), (?, ?), ...
          //    - D1のバッチ処理や、ループで個別INSERTを検討。トランザクションも考慮。

          return new Response(JSON.stringify({ success: true, message: 'ユーザー登録が成功しました', doctorId: insertedDoctorId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (e: unknown) { // 型を unknown に変更
          console.error('登録エラー:', e);
          let errorDetails = '不明なエラー';
          if (e instanceof Error) {
             let causeMessage = ('cause' in e && e.cause instanceof Error) ? ` (Cause: ${e.cause.message})` : '';
             errorDetails = e.message + causeMessage;
          }
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
        try {
          if (!env.DB) {
            console.error('[GET /api/doctors] Error: D1 Database binding (DB) is not available.');
            return new Response(JSON.stringify({ success: false, error: 'サーバー設定エラー: データベース接続が見つかりません。' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const stmt = env.DB.prepare(
            `SELECT id, name, gender, birthdate, license_date, email FROM doctors ORDER BY name`
          );
          // D1Result<T> を直接受け取り、successプロパティを確認
          const d1Result = await stmt.all<Omit<WorkerDoctor, 'specialties'>>();

          if (!d1Result.success) {
 console.error('[GET /api/doctors] D1 query failed:', d1Result.error);
            return new Response(JSON.stringify({ success: false, error: 'データベースクエリエラー', details: d1Result.error }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          const doctorsData: WorkerDoctor[] = d1Result.results 
 ? d1Result.results.map(doc => ({ ...doc, specialties: [] as Specialty[] })) // string[] を Specialty[] に修正
            : [];

          return new Response(JSON.stringify({ success: true, data: doctorsData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (dbError: unknown) { // 型を unknown に変更
          console.error('[GET /api/doctors] Unexpected error during D1 operation:', dbError);
          let errorDetails = '不明なデータベースエラー';
          if (dbError instanceof Error) {
             let causeMessage = ('cause' in dbError && dbError.cause instanceof Error) ? ` (Cause: ${dbError.cause.message})` : '';
             errorDetails = dbError.message + causeMessage;
          }
          return new Response(JSON.stringify({ success: false, error: '医師情報取得中に予期せぬデータベースエラーが発生しました', details: errorDetails }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // 特定医師情報取得 (/api/doctors/:id) - D1データベースから取得
      if (path.startsWith('/api/doctors/') && request.method === 'GET') {
        const id = path.split('/').pop();
        if (!id || isNaN(parseInt(id, 10))) {
           return new Response(JSON.stringify({ success: false, error: '有効な医師IDが指定されていません' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // 医師情報と関連する診療科名をJOINして取得
        const stmt = env.DB.prepare(
          `SELECT
             d.id, d.name, d.gender, d.birthdate, d.license_date, d.email,
             GROUP_CONCAT(s.name) AS specialty_names
           FROM doctors d
           LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
           LEFT JOIN specialties s ON ds.specialty_id = s.id
           WHERE d.id = ?
           GROUP BY d.id`
        ).bind(parseInt(id, 10));

        const result = await stmt.first<{ id: number; name: string; gender: 'M' | 'F' | 'O' | 'N'; birthdate: string; license_date: string; email: string; specialty_names: string | null }>();

        if (result) {
          const doctorData: WorkerDoctor = { ...result, specialties: result.specialty_names ? result.specialty_names.split(',') : [] };
          return new Response(JSON.stringify({ success: true, data: doctorData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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

    } catch (e: unknown) { // Top-level catch for any unhandled errors, 型を unknown に変更
      console.error('Unhandled error in fetch handler:', e);
      let errorDetails = '不明なサーバー内部エラー';
      if (e instanceof Error) {
         let causeMessage = ('cause' in e && e.cause instanceof Error) ? ` (Cause: ${e.cause.message})` : '';
         errorDetails = e.message + causeMessage;
      }
      return new Response(JSON.stringify({ success: false, error: 'サーバー内部エラーが発生しました', details: errorDetails }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
};

// データベース保存用の型 (password_hash を含む)
interface WorkerDoctorRecord extends Omit<WorkerDoctor, 'specialties' | 'id'> {
  user_type_id: number;
  password_hash: string;
  // created_at, updated_at など、DBに存在するが WorkerDoctor には含めないフィールドがあればここに追加
}