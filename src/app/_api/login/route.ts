import { NextResponse } from 'next/server';
import { generateToken, verifyPassword } from '@/utils/auth';
import { LoginRequest, ApiResponse } from '@/types';
import { DoctorDbRecord } from '@/types'; // DoctorDbRecord をインポート

// D1Database型をインポート (Cloudflare Pages Functions環境を想定)
// 実際の環境に合わせて調整が必要な場合があります
import type { D1Database } from '@cloudflare/workers-types';



export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // D1データベースのバインディングを取得 (環境変数経由などを想定)
    // これはCloudflare Pages Functionsの環境での典型的な方法です。
    // process.env.DB の型アサーションは、環境でDBがD1Databaseとして提供されることを前提としています。
    const DB = process.env.DB as D1Database;
    if (!DB) {
      console.error('D1 Database binding (DB) not found.');
      return NextResponse.json<ApiResponse>({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    // データベースからユーザーを取得 (password_hash を含む)
    const stmt = DB.prepare('SELECT * FROM doctors WHERE email = ?');
    const userResult = await stmt.bind(email).first<DoctorDbRecord>();

    // D1の .first<T>() は結果がない場合 null を返す
    const user = userResult;

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // パスワードを検証
    const isValid = await verifyPassword(password, user.password_hash);
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