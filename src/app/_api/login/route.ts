import { NextResponse } from 'next/server';
import { generateToken, verifyPassword } from '@/utils/auth';
import { LoginRequest, ApiResponse, Doctor } from '@/types';

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // データベースからユーザーを取得
    const response = await fetch(`${process.env.API_URL}/api/doctors?email=${email}`);
    const result = await response.json() as ApiResponse<Doctor[]>;
    const user = result.data?.[0];

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // パスワードを検証
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // JWTトークンを生成
    const token = await generateToken({
      id: user.id,
      email: user.email
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 