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
      // APIキーの検証 (登録処理を含むすべての保護ルートに適用)
      // /api/register も保護対象とするため、この位置に移動
      if (path.startsWith('/api/') && path !== '/api/public-route') { // 例: '/api/public-route' のような公開APIがあれば除外
        const apiKey = request.headers.get('X-API-Key');
        if (apiKey !== env.API_KEY) {
          return new Response(JSON.stringify({ success: false, error: '認証エラー' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
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

      // 診療科一覧取得 (/api/specialties)
      if (path === '/api/specialties' && request.method === 'GET') {
        try {
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
            return new Response(JSON.stringify({ success: false, error: 'データベースクエリエラー', details: d1Result.error }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ success: true, data: d1Result.results || [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (dbError: unknown) {
          console.error('[GET /api/specialties] Unexpected error during D1 operation:', dbError);
          let errorDetails = '不明なデータベースエラー';
          if (dbError instanceof Error) {
             let causeMessage = ('cause' in dbError && dbError.cause instanceof Error) ? ` (Cause: ${dbError.cause.message})` : '';
             errorDetails = dbError.message + causeMessage;
          }
          return new Response(JSON.stringify({ success: false, error: '診療科情報取得中に予期せぬデータベースエラーが発生しました', details: errorDetails }), 
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
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

        if (!env.DB) {
          console.error(`[GET /api/doctors/${id}] Error: D1 Database binding (DB) is not available.`);
          return new Response(JSON.stringify({ success: false, error: 'サーバー設定エラー: データベース接続が見つかりません。' }), {
            status: 500,
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

        try {
          const result = await stmt.first<{ id: number; name: string; gender: 'M' | 'F' | 'O' | 'N'; birthdate: string; license_date: string; email: string; specialty_names: string | null }>();

          if (result) {
            // Split comma-separated names and trim whitespace, results in string[]
            const specialtyNameStrings = result.specialty_names ? result.specialty_names.split(',').map(s => s.trim()) : [];
            // Map string names to Specialty objects.
            // For a more complete solution, specialty IDs should also be fetched and mapped.
            // This current mapping assumes we only have names from GROUP_CONCAT.
            const mappedSpecialties: Specialty[] = specialtyNameStrings.map((name, index) => ({
              // Placeholder ID. Ideally, fetch specialty IDs from DB.
              // If specialty IDs were fetched as `specialty_ids` (e.g., GROUP_CONCAT(s.id)),
              // you would parse that and use the actual IDs.
              id: index + 1, // Example placeholder ID logic
              name: name,
            }));
            const doctorData: WorkerDoctor = { ...result, specialties: mappedSpecialties };
            return new Response(JSON.stringify({ success: true, data: doctorData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          return new Response(JSON.stringify({ success: false, error: '医師情報が見つかりませんでした' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (dbError: unknown) {
          console.error(`[GET /api/doctors/${id}] D1 query failed:`, dbError);
          let errorDetails = '不明なデータベースエラー';
          if (dbError instanceof Error) {
            errorDetails = dbError.message + (('cause' in dbError && dbError.cause instanceof Error) ? ` (Cause: ${dbError.cause.message})` : '');
          }
          return new Response(JSON.stringify({ success: false, error: 'データベースクエリエラー', details: errorDetails }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        }
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