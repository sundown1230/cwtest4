import { NextResponse } from 'next/server';
import { ApiResponse, Doctor } from '@/types';
import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

interface DoctorQueryResult {
  id: number;
  name: string;
  email: string;
  gender: string;
  birthdate: string;
  license_date: string;
  specialties: string | null;
}

export async function GET(request: Request, { env }: { env: Env }) {
  try {
    const DB = env.DB;

    if (!DB) {
      console.error('D1 Database binding (DB) not found in GET /api/doctors.');
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'サーバー設定エラー', 
        message: 'データベースに接続できませんでした。' 
      }, { status: 500 });
    }

    // 医師情報を取得するクエリ
    const query = `
      SELECT
        d.id,
        d.name,
        d.email,
        d.gender,
        d.birthdate,
        d.license_date,
        GROUP_CONCAT(s.name) AS specialties
      FROM doctors d
      LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
      LEFT JOIN specialties s ON ds.specialty_id = s.id
      WHERE d.user_type_id = 1
      GROUP BY d.id, d.name, d.email, d.gender, d.birthdate, d.license_date
      ORDER BY d.name
      LIMIT 100`;

    console.log('[GET /api/doctors] Executing query:', query);
    const stmt = DB.prepare(query);
    const result = await stmt.all<DoctorQueryResult>();

    if (!result.success) {
      console.error('[GET /api/doctors] D1 query failed:', result.error);
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'データベースクエリエラー',
        message: result.error || '不明なデータベースエラー'
      }, { status: 500 });
    }

    // 診療科を配列に変換
    const doctors = result.results.map((doctor: DoctorQueryResult) => ({
      ...doctor,
      specialties: doctor.specialties ? doctor.specialties.split(',') : []
    }));

    return NextResponse.json<ApiResponse>({ 
      success: true, 
      data: doctors 
    });

  } catch (error) {
    console.error('[GET /api/doctors] Unhandled error:', error);
    return NextResponse.json<ApiResponse>({ 
      success: false, 
      error: '医師情報の取得に失敗しました',
      message: error instanceof Error ? error.message : '不明なエラー'
    }, { status: 500 });
  }
}