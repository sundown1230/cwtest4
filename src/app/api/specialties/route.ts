import { NextResponse } from 'next/server';
import { ApiResponse, Specialty } from '@/types';
import { D1Database, D1Result } from '@cloudflare/workers-types'; // D1の型をインポート

export async function GET() {
  try {
    // D1バインディングの取得と型ガード
    const env = process.env as unknown as { DB?: D1Database }; // 環境変数をより安全に型付け
    const DB = env.DB;

    if (!DB) {
      console.error('D1 Database binding (DB) not found in GET /api/specialties.');
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'サーバー設定エラー', 
        message: 'データベースに接続できませんでした。' 
      }, { status: 500 });
    }

    console.log('[GET /api/specialties] D1 Database binding found. Preparing query...');

    const stmt = DB.prepare('SELECT id, name FROM specialties ORDER BY id');
    
    console.log('[GET /api/specialties] Executing query...');
    // D1Result<T> 型を使用して、success/error プロパティを確認できるようにする
    const d1Result: D1Result<Specialty> = await stmt.all();

    // D1Result.success はクエリが成功したかどうかを示す (通常は true、エラー時は例外がスローされることが多い) - Pages Functions環境では常にtrueになる傾向
    // D1Result.error は詳細なエラーメッセージを含むことがある - Pages Functions環境では通常undefined
    // エラーは通常 try...catch で捕捉される
    console.log('[GET /api/specialties] Query executed. Success:', d1Result.success, 'Results count:', d1Result.results?.length);
    if (d1Result.error) console.error('[GET /api/specialties] D1 Result contained error:', d1Result.error); // D1Resultにerrorが含まれる場合のみログ出力

    const results = d1Result.results ?? []; // results が undefined の場合は空配列にフォールバック

    console.log('[GET /api/specialties] Query successful. Found', results ? results.length : 0, 'specialties.');

    // ApiResponse でラップして返す
    return NextResponse.json<ApiResponse<Specialty[]>>({ success: true, data: results ?? [] }, {
      headers: {
        'Cache-Control': 'no-store', // キャッシュしない
        // CORS headers are usually handled by Pages Functions automatically
      }
    });

  } catch (error: unknown) { // 予期せぬエラーを捕捉、型を unknown に変更
    console.error('[GET /api/specialties] Unexpected error:', error);
    let errorMessage = '診療科情報の取得中に予期せぬエラーが発生しました';
    let errorDetails: any = error; // デフォルトでエラーオブジェクト全体を詳細に含める

    if (error instanceof Error) {
      errorMessage = error.message; // エラーメッセージを更新
      // 詳細にはメッセージと原因を含める
      errorDetails = {
        message: error.message,
        cause: ('cause' in error && error.cause instanceof Error) ? error.cause.message : undefined
      }
      // 詳細オブジェクトが空または意味がない場合は、エラーメッセージ自体を詳細とする
      if (Object.values(errorDetails).every(val => val === undefined || val === '')) errorDetails = error.message;

    } else if (typeof error === 'string') {
       // エラーが文字列の場合
       errorDetails = error;
       errorMessage = `診療科情報の取得中にエラーが発生しました: ${error}`;
    }

    return NextResponse.json<ApiResponse>({ 
      success: false, 
      error: '予期せぬエラー', 
      message: generalErrorMessage, // より具体的なエラーメッセージ
      details: errorDetails // 詳細なエラー情報を details に設定
    }, { status: 500 });
  }
}