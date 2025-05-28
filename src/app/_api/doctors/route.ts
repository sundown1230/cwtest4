import { NextResponse } from 'next/server';
import { ApiResponse, Doctor } from '@/types';

export async function GET() {
  try {
    // TODO: データベースからの取得処理を実装
    // 現在はモックデータを返す
    const mockDoctors: Doctor[] = [
      {
        id: 1,
        name: '山田太郎',
        gender: 'M',
        birthdate: '1980-01-01',
        license_date: '2005-04-01',
        email: 'yamada@example.com',
        password: '',
        specialties: ['内科', '消化器科']
      },
      {
        id: 2,
        name: '佐藤花子',
        gender: 'F',
        birthdate: '1985-06-15',
        license_date: '2010-04-01',
        email: 'sato@example.com',
        password: '',
        specialties: ['小児科', 'アレルギー科']
      }
    ];

    return NextResponse.json({
      success: true,
      doctors: mockDoctors
    });
  } catch (error) {
    console.error('医師一覧取得エラー:', error);
    return NextResponse.json({
      success: false,
      error: '医師一覧の取得に失敗しました'
    }, { status: 500 });
  }
} 