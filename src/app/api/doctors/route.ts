import { NextResponse } from 'next/server';
import { ApiResponse, Doctor } from '@/types'; // 適切な型をインポート

export async function GET() {
  try {
    // Cloudflare Pages Functions では D1 バインディングはグローバルな env オブジェクトからアクセスします
    const DB = (process.env as any).DB;
    if (!DB) {
      console.error('D1 Database binding (DB) not found in GET /api/doctors.');
      return NextResponse.json<ApiResponse>({ success: false, error: 'サーバー設定エラー', message: 'データベースに接続できませんでした。' }, { status: 500 });
    }

    // 医師情報を取得するクエリ (例: user_type_id=1 で医師に限定し、必要なカラムを取得)
    // 必要であれば、doctor_specialties と specialties テーブルをJOINして診療科名も取得する
    const stmt = DB.prepare(`
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
      LIMIT 100
    `);
    const { results, success: querySuccess, error: queryError } = await stmt.all<Doctor>(); // Doctor型全体、または必要なプロパティを持つ型を指定

    if (!querySuccess) {
      console.error('D1 query error in GET /api/doctors:', queryError);
      throw new Error('データベースクエリエラー');
    }

    return NextResponse.json<ApiResponse>({ success: true, data: results || [] }); // results が null の場合も考慮

  } catch (error: any) {
    console.error('Error fetching doctors list:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: '医師リストの取得に失敗しました', message: error.message || '不明なエラー' }, { status: 500 });
  }
}