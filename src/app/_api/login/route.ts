import { NextResponse } from 'next/server';
import { generateToken, verifyPassword } from '@/utils/auth';
import { LoginRequest, ApiResponse } from '@/types';
import { DoctorDbRecord } from '@/types'; // DoctorDbRecord をインポート

// D1Database型をインポート (Cloudflare Pages Functions環境を想定)
// 実際の環境に合わせて調整が必要な場合があります
import type { D1Database } from '@cloudflare/workers-types';
import type { NextApiRequest, NextApiResponse } from 'next'; // NextApiResponse は不要かもしれないが、コンテキストの型付けのため

// Cloudflare Pages Functions のコンテキストの型を定義（または適切な型をインポート）
interface PagesFunctionContext {
  params: Record<string, string | string[]>;
  request: Request;
  env: {
    DB: D1Database; // D1バインディング
    // 他のバインディングや環境変数があればここに追加
  };
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}

export async function POST(request: Request, context: PagesFunctionContext) { // context引数を追加
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    const DB = context.env.DB; // context.env からDBバインディングを取得
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