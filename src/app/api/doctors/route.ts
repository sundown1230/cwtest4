import { NextResponse } from 'next/server';
import { ApiResponse, Doctor, Specialty } from '@/types'; // Doctor と Specialty をインポート
import { D1Database, D1Result } from '@cloudflare/workers-types'; // D1の型をインポート

interface DoctorQueryResult {
  id: number;
  name: string;
  gender: 'M' | 'F' | 'O' | 'N';
  birthdate: string;
  license_date: string;
  email: string;
  // specialties は JOIN していないため含まれない
}

export async function GET() {
  try {
    // Cloudflare Pages Functions では D1 バインディングはグローバルな env オブジェクトからアクセスします
    const env = process.env as unknown as { DB?: D1Database }; // 環境変数をより安全に型付け
    const DB = env.DB;
    if (!DB) {
      console.error('D1 Database binding (DB) not found in GET /api/doctors.');
      return NextResponse.json<ApiResponse>({ success: false, error: 'サーバー設定エラー', message: 'データベースに接続できませんでした。' }, { status: 500 });
    }

    // 医師情報を取得するクエリ (例: user_type_id=1 で医師に限定し、必要なカラムを取得)
    // 必要であれば、doctor_specialties と specialties テーブルをJOINして診療科名も取得する
    const query = `
      SELECT
        d.id,
        d.name,
        d.email,
        d.gender,
        d.birthdate,
        d.license_date
        -- GROUP_CONCAT(s.name) AS specialties -- SQLiteで診療科をカンマ区切り文字列として取得する場合の例
      FROM doctors d
      WHERE d.user_type_id = 1 -- 医師のみを取得
      -- LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
      -- LEFT JOIN specialties s ON ds.specialty_id = s.id
      -- GROUP BY d.id
      ORDER BY d.name
      LIMIT 100`; // 必要に応じて LIMIT を調整
    
    console.log('[GET /api/doctors] Executing query:', query);
    const stmt = DB.prepare(query);
    const d1Result: D1Result<DoctorQueryResult> = await stmt.all(); // D1Result型を使用

    if (d1Result.error) { // D1Result に error プロパティがあるか確認 (通常は例外がスローされる)
      console.error('D1 query error in GET /api/doctors:', d1Result.error);
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'データベースクエリエラー', 
        message: '医師情報の取得に失敗しました。',
        details: d1Result.error 
      }, { status: 500 });
    }

    const doctors: Doctor[] = (d1Result.results || []).map(doc => ({
      ...doc,
      specialties: [] // 現状では診療科情報を取得していないため空配列
    }));

    return NextResponse.json<ApiResponse<Doctor[]>>({ success: true, data: doctors });

  } catch (error: unknown) {
    console.error('Error fetching doctors list:', error);
    let errorDetails: any = '不明なエラー';
    if (error instanceof Error) {
      errorDetails = { message: error.message, cause: error.cause };
    }
    return NextResponse.json<ApiResponse>({ 
      success: false, 
      error: '医師リストの取得に失敗しました', 
      message: error instanceof Error ? error.message : 'サーバー内部でエラーが発生しました。',
      details: errorDetails
    }, { status: 500 });
  }
}