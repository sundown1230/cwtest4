import { NextResponse } from 'next/server';
import { ApiResponse, Specialty } from '@/types';

export async function GET() {
  try {
    // Cloudflare Pages Functions では D1 バインディングはグローバルな env オブジェクトからアクセスします
    const DB = (process.env as any).DB;
    if (!DB) {
      console.error('D1 Database binding (DB) not found in GET /api/specialties.');
      return NextResponse.json<ApiResponse>({ success: false, error: 'サーバー設定エラー', message: 'データベースに接続できませんでした。' }, { status: 500 });
    }

    const stmt = DB.prepare('SELECT id, name FROM specialties ORDER BY id');
    const { results } = await stmt.all<Specialty>();

    // フロントエンドは Specialty[] を直接期待しているため、ApiResponse でラップせずに返す
    return NextResponse.json(results ?? [], {
      headers: {
        'Cache-Control': 'no-store', // キャッシュしないように設定
      }
    });

  } catch (error: any) {
    console.error('Error fetching specialties:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: '診療科情報の取得に失敗しました', message: error.message || '不明なエラー' }, { status: 500 });
  }
}