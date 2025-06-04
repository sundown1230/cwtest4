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

    // D1Result.success はクエリが成功したかどうかを示す (通常は true、エラー時は例外がスローされることが多い)
    // D1Result.error は詳細なエラーメッセージを含むことがある
    console.log('[GET /api/specialties] Query executed. Success:', d1Result.success, 'Error (if any):', d1Result.error, 'Results count:', d1Result.results?.length);

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
    let generalErrorMessage = '診療科情報の取得中に予期せぬエラーが発生しました';
    let errorDetails: any = '不明なエラー'; 

    if (error instanceof Error) {
      generalErrorMessage = error.message; // エラーメッセージを更新
      let causeMessage = '';
      // 'cause' プロパティが存在し、かつそれが Error インスタンスであるかチェック
      if ('cause' in error && error.cause instanceof Error) {
         causeMessage = ` (Cause: ${error.cause.message})`;
      }
      // エラーメッセージと原因を詳細として含める
      const detailsObject = {
        message: error.message,
        cause: causeMessage.trim() !== '' ? causeMessage.substring(8) : undefined // " (Cause: " を削除
      };
      // 詳細オブジェクトが空の場合は、エラーメッセージ自体を詳細とする
      if (Object.values(detailsObject).every(val => val === undefined || val === '')) {
        errorDetails = error.message;
      } else {
        errorDetails = detailsObject;
      }
    }
    return NextResponse.json<ApiResponse>({ 
      success: false, 
      error: '予期せぬエラー', 
      message: generalErrorMessage, // より具体的なエラーメッセージ
      details: errorDetails // 詳細なエラー情報を details に設定
    }, { status: 500 });
  }
}