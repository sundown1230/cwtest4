import { NextResponse } from 'next/server';
import type { ApiResponse, Doctor } from '@/types';

// フロントエンド用の医師情報型
type DoctorResponse = Omit<Doctor, 'password'>;

// ダミーデータ
const mockDoctors: Record<number, DoctorResponse> = {
  1: {
    id: 1,
    name: '山田太郎',
    gender: 'M',
    birthdate: '1980-01-01',
    license_date: '2005-04-01',
    email: 'yamada@example.com',
    specialties: ['内科', '消化器科']
  },
  2: {
    id: 2,
    name: '佐藤花子',
    gender: 'F',
    birthdate: '1985-06-15',
    license_date: '2010-04-01',
    email: 'sato@example.com',
    specialties: ['小児科', 'アレルギー科']
  },
  3: {
    id: 3,
    name: '鈴木一郎',
    gender: 'M',
    birthdate: '1975-03-20',
    license_date: '2000-04-01',
    email: 'suzuki@example.com',
    specialties: ['外科', '整形外科']
  },
  4: {
    id: 4,
    name: '田中優子',
    gender: 'F',
    birthdate: '1988-12-05',
    license_date: '2013-04-01',
    email: 'tanaka@example.com',
    specialties: ['産婦人科', '婦人科']
  }
};

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = parseInt(params.id);
    const doctor = mockDoctors[doctorId];

    if (!doctor) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '医師情報が見つかりませんでした'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<DoctorResponse>>({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('医師情報取得エラー:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '医師情報の取得に失敗しました'
    }, { status: 500 });
  }
} 