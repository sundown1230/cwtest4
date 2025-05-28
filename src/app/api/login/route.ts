import { NextResponse } from 'next/server';
import { generateToken, verifyPassword } from '@/utils/auth';
import type { LoginRequest, ApiResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // バリデーション
    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'メールアドレスとパスワードを入力してください'
      }, { status: 400 });
    }

    // D1データベースからユーザー情報を取得
    const db = (request as any).env.DB;
    const doctor = await db.prepare(`
      SELECT id, email, password_hash
      FROM doctors
      WHERE email = ?
    `).bind(email).first();

    if (!doctor) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません'
      }, { status: 401 });
    }

    // パスワードの検証
    const isValid = await verifyPassword(password, doctor.password_hash);
    if (!isValid) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません'
      }, { status: 401 });
    }

    // JWTトークンの生成
    const token = await generateToken({
      id: doctor.id,
      email: doctor.email,
      userType: 'doctor'
    });

    return NextResponse.json<ApiResponse<{ token: string }>>({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'ログインに失敗しました'
    }, { status: 500 });
  }
} 