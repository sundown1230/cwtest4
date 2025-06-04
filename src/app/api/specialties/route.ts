import { NextResponse } from 'next/server';
import { ApiResponse, Specialty } from '@/types';
import { D1Database, D1Result } from '@cloudflare/workers-types'; // D1の型をインポート

export async function GET() {
  try {
    // Cloudflare Pages Functions では D1 バインディングはグローバルな env オブジェクトからアクセスします
    // process.env は any として扱う必要がある
    const DB = (process.env as any).DB as D1Database; // D1Database型に明示的にキャスト

    if (!DB) {
      console.error('D1 Database binding (DB) not found in GET /api/specialties.');
      return NextResponse.json<ApiResponse>({ success: false, error: 'サーバー設定エラー', message: 'データベースに接続できませんでした。' }, { status: 500 });
    }

    console.log('[GET /api/specialties] D1 Database binding found. Preparing query...');

    const stmt = DB.prepare('SELECT id, name FROM specialties ORDER BY id');
    
    console.log('[GET /api/specialties] Executing query...');
    // D1Result<T> 型を使用して、success/error プロパティを確認できるようにする
    const d1Result: D1Result<Specialty> = await stmt.all();

    console.log('[GET /api/specialties] Query executed. Result:', JSON.stringify(d1Result));

    if (!d1Result.success) {
        console.error('[GET /api/specialties] D1 query failed:', d1Result.error);
        return NextResponse.json<ApiResponse>({ success: false, error: 'データベースクエリエラー', details: d1Result.error }, { status: 500 });
    }

    const results = d1Result.results;

    console.log('[GET /api/specialties] Query successful. Found', results ? results.length : 0, 'specialties.');

    // ApiResponse でラップして返す
    return NextResponse.json<ApiResponse<Specialty[]>>({ success: true, data: results ?? [] }, {
      headers: {
        'Cache-Control': 'no-store', // キャッシュしない
        // CORS headers are usually handled by Pages Functions automatically
      }
    });

  } catch (error: any) { // 予期せぬエラーを捕捉
    console.error('[GET /api/specialties] Unexpected error:', error);
    // より詳細なエラー情報をレスポンスに含める
    const errorDetails = error.message + (error.cause ? ` (Cause: ${(error.cause as Error).message})` : '');
    return NextResponse.json<ApiResponse>({ success: false, error: '診療科情報の取得中に予期せぬエラーが発生しました', details: errorDetails }, { status: 500 });
  }
}