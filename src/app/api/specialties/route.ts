import { NextResponse } from 'next/server';
import { ApiResponse, Specialty } from '@/types';
import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export async function GET(request: Request) {
  try {
    // Cloudflare Pages Functions では D1 バインディングはグローバルな env オブジェクトからアクセスします
    const env = process.env as unknown as Env;
    const DB = env.DB;

    if (!DB) {
      console.error('D1 Database binding (DB) not found in GET /api/specialties.');
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'サーバー設定エラー', 
        message: 'データベースに接続できませんでした。' 
      }, { status: 500 });
    }

    // 診療科情報を取得するクエリ
    const query = `
      SELECT id, name
      FROM specialties
      ORDER BY name`;

    console.log('[GET /api/specialties] Executing query:', query);
    const stmt = DB.prepare(query);
    const result = await stmt.all<Specialty>();

    if (!result.success) {
      console.error('[GET /api/specialties] D1 query failed:', result.error);
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'データベースクエリエラー',
        message: result.error || '不明なデータベースエラー'
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({ 
      success: true, 
      data: result.results 
    });

  } catch (error) {
    console.error('[GET /api/specialties] Unhandled error:', error);
    return NextResponse.json<ApiResponse>({ 
      success: false, 
      error: '診療科情報の取得に失敗しました',
      message: error instanceof Error ? error.message : '不明なエラー'
    }, { status: 500 });
  }
}