import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

interface DoctorRegistrationRequest {
  name: string;
  gender: string;
  birthdate: string;
  licenseDate: string;
  specialties: number[];
  email: string;
  password: string;
}

// 医師登録エンドポイント
export async function POST(request: Request) {
  try {
    const body = await request.json() as DoctorRegistrationRequest;
    const {
      name,
      gender,
      birthdate,
      licenseDate,
      specialties,
      email,
      password
    } = body;

    // パスワードのハッシュ化
    const passwordHash = await hash(password, 10);

    // TODO: データベースへの保存処理を実装
    // 現在はモックレスポンスを返す
    return NextResponse.json({
      success: true,
      message: '医師登録が完了しました',
      doctorId: 1
    });

  } catch (error) {
    console.error('医師登録エラー:', error);
    return NextResponse.json({
      success: false,
      message: '医師登録に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, { status: 500 });
  }
}

// 医師一覧取得エンドポイント
export async function GET() {
  try {
    // TODO: データベースからの取得処理を実装
    // 現在はモックデータを返す
    const mockDoctors = [
      {
        id: 1,
        name: '山田太郎',
        gender: '男性',
        birthdate: '1980-01-01',
        licenseDate: '2005-04-01',
        email: 'yamada@example.com',
        specialties: ['内科', '消化器科']
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
      message: '医師一覧の取得に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, { status: 500 });
  }
} 