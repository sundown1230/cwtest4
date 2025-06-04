import { D1Database } from '@cloudflare/workers-types';
import bcrypt from 'bcryptjs';
import { RegisterRequest, Specialty, DoctorDbRecord } from '@/types';

interface Env {
  API_KEY: string; // APIキーが必要な場合
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

// CORSプリフライトリクエストの処理
export const OPTIONS = async () => {
  return new Response(null, { headers: corsHeaders });
};

export const POST = async (request: Request, env: Env) => {
  try {
    // APIキーの検証 (登録エンドポイントも保護する場合)
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== env.API_KEY) {
      return new Response(JSON.stringify({ success: false, error: '認証エラー' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[${request.method} ${request.url}] Request received.`);
    if (!env.DB) {
      console.error('[POST /api/register] Error: D1 Database binding (DB) is not available.');
      return new Response(JSON.stringify({ success: false, error: 'サーバー設定エラー: データベース接続が見つかりません。' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const body = await request.json() as RegisterRequest;

    if (!body.email || !body.password || !body.name || !body.gender || !body.birthdate || !body.license_date || !body.specialties) {
      return new Response(JSON.stringify({ success: false, error: '必須項目が不足しています' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(body.password, saltRounds);

    const doctorData: Omit<DoctorDbRecord, 'id'> = {
      user_type_id: 1, // デフォルトで医師
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

    if (insertedDoctorId && body.specialties && body.specialties.length > 0) {
      // 1. 提供された診療科名からIDを検索
      const specialtyPlaceholders = body.specialties.map(() => '?').join(',');
      const specialtyNamesQuery = env.DB.prepare(
        `SELECT id, name FROM specialties WHERE name IN (${specialtyPlaceholders})`
      ).bind(...body.specialties);
      const foundSpecialtiesResult = await specialtyNamesQuery.all<Specialty>();

      if (!foundSpecialtiesResult.success) {
        console.error('[POST /api/register] Failed to query specialties:', foundSpecialtiesResult.error);
        return new Response(JSON.stringify({ success: true, message: 'ユーザー登録は成功しましたが、診療科情報の検証中にエラーが発生し、診療科は未設定です。', doctorId: insertedDoctorId, details: foundSpecialtiesResult.error }), {
          status: 207, headers: { ...corsHeaders, 'Content-Type': 'application/json' } // Multi-Status
        });
      }

      const foundSpecialtiesMap = new Map(foundSpecialtiesResult.results.map(s => [s.name, s.id]));
      const specialtyIdsToInsert: number[] = [];
      const missingSpecialties: string[] = [];

      for (const reqSpecialtyName of body.specialties) {
        const specialtyId = foundSpecialtiesMap.get(reqSpecialtyName);
        if (specialtyId) {
          specialtyIdsToInsert.push(specialtyId);
        } else {
          missingSpecialties.push(reqSpecialtyName);
        }
      }

      if (missingSpecialties.length > 0) {
        return new Response(JSON.stringify({ success: true, message: `ユーザー登録は成功しましたが、以下の診療科が見つからず、診療科は部分的に未設定です: ${missingSpecialties.join(', ')}`, doctorId: insertedDoctorId }), {
          status: 207, headers: { ...corsHeaders, 'Content-Type': 'application/json' } // Multi-Status
        });
      }

      // 2. doctor_specialties テーブルにバッチ挿入
      if (specialtyIdsToInsert.length > 0) {
        const batchStmts = specialtyIdsToInsert.map(specialtyId =>
          env.DB.prepare("INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES (?, ?)").bind(insertedDoctorId, specialtyId)
        );
        const batchResults = await env.DB.batch(batchStmts);
        const allSucceeded = batchResults.every(result => result.success);

        if (!allSucceeded) {
          console.error('[POST /api/register] One or more doctor_specialties insertions failed in batch:', batchResults);
          return new Response(JSON.stringify({ success: true, message: 'ユーザー登録は成功しましたが、一部の診療科の関連付けに失敗しました。', doctorId: insertedDoctorId, details: 'doctor_specialties batch insert failed for some items' }), {
            status: 207, // Multi-Status
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'ユーザー登録が成功しました', doctorId: insertedDoctorId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e: unknown) {
    console.error('[POST /api/register] Unhandled error:', e);
    let errorDetails = '不明なサーバー内部エラー';
    if (e instanceof Error) {
      let causeMessage = ('cause' in e && e.cause instanceof Error) ? ` (Cause: ${e.cause.message})` : '';
      errorDetails = e.message + causeMessage;
    }
    return new Response(JSON.stringify({ success: false, error: '登録処理中に予期せぬエラーが発生しました', details: errorDetails }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};