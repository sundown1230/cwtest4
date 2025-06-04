import { NextResponse } from 'next/server';
import { ApiResponse, Doctor } from '@/types';

// ダミーデータ
const mockDoctors: Doctor[] = [
  {
    id: 1,
    user_type_id: 1,
    name: '山田太郎',
    gender: 'M',
    birthdate: '1980-01-01',
    license_date: '2005-04-01',
    email: 'yamada@example.com', // specialties を Specialty[] に修正
    specialties: [
      { id: 1, name: '内科' }, // 例: 適切なIDを設定
      { id: 2, name: '消化器科' } // 例: 適切なIDを設定
    ]
  },
  {
    id: 2,
    user_type_id: 1,
    name: '佐藤花子',
    gender: 'F',
    birthdate: '1985-06-15',
    license_date: '2010-04-01',
    email: 'sato@example.com', // specialties を Specialty[] に修正
    specialties: [
      { id: 3, name: '小児科' }, // 例: 適切なIDを設定
      { id: 4, name: 'アレルギー科' } // 例: 適切なIDを設定
    ]
  },
  {
    id: 3,
    user_type_id: 1,
    name: '鈴木一郎',
    gender: 'M',
    birthdate: '1975-03-20',
    license_date: '2000-04-01',
    email: 'suzuki@example.com', // specialties を Specialty[] に修正
    specialties: [
      { id: 5, name: '外科' }, // 例: 適切なIDを設定
      { id: 6, name: '整形外科' } // 例: 適切なIDを設定
    ]
  },
  {
    id: 4,
    user_type_id: 1,
    name: '田中優子',
    gender: 'F',
    birthdate: '1988-12-05',
    license_date: '2013-04-01',
    email: 'tanaka@example.com', // specialties を Specialty[] に修正
    specialties: [
      { id: 7, name: '産婦人科' }, // 例: 適切なIDを設定
      { id: 8, name: '婦人科' } // 例: 適切なIDを設定
    ]
  }
];

export async function GET() {
  try {
    return NextResponse.json<ApiResponse<Doctor[]>>({
      success: true,
      data: mockDoctors
    });
  } catch (error) {
    console.error('医師一覧取得エラー:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '医師一覧の取得に失敗しました'
    }, { status: 500 });
  }
} 