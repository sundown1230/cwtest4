import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import type { ApiResponse, Doctor } from '@/types';

export async function GET(request: Request) {
  try {
    // Authorizationヘッダーからトークンを取得
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '認証が必要です'
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);

    // D1データベースからユーザー情報を取得
    const db = (request as any).env.DB;
    const doctor = await db.prepare(`
      SELECT d.*, GROUP_CONCAT(s.name) as specialties
      FROM doctors d
      LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
      LEFT JOIN specialties s ON ds.specialty_id = s.id
      WHERE d.id = ?
      GROUP BY d.id
    `).bind(payload.id).first();

    if (!doctor) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'ユーザーが見つかりません'
      }, { status: 404 });
    }

    // レスポンスデータの整形
    const responseData: Doctor = {
      id: doctor.id,
      name: doctor.name,
      gender: doctor.gender,
      birthdate: doctor.birthdate,
      license_date: doctor.license_date,
      email: doctor.email,
      specialties: doctor.specialties ? doctor.specialties.split(',') : [],
      created_at: doctor.created_at,
      updated_at: doctor.updated_at
    };

    return NextResponse.json<ApiResponse<Doctor>>({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'プロフィールの取得に失敗しました'
    }, { status: 500 });
  }
} 