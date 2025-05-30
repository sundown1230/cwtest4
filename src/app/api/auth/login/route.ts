import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

// ダミーユーザーデータ
const mockUsers = [
  // 開発用アカウント
  {
    id: 1,
    email: 'yamada@example.com',
    password: 'password123',
    name: '山田太郎',
    role: 'doctor'
  },
  {
    id: 2,
    email: 'sato@example.com',
    password: 'password123',
    name: '佐藤花子',
    role: 'doctor'
  },
  {
    id: 3,
    email: 'suzuki@example.com',
    password: 'password123',
    name: '鈴木一郎',
    role: 'doctor'
  },
  {
    id: 4,
    email: 'tanaka@example.com',
    password: 'password123',
    name: '田中優子',
    role: 'doctor'
  },
  // 本番環境用テストアカウント
  {
    id: 5,
    email: 'test1@example.com',
    password: 'Test123!',
    name: 'テストユーザー1',
    role: 'doctor'
  },
  {
    id: 6,
    email: 'test2@example.com',
    password: 'Test123!',
    name: 'テストユーザー2',
    role: 'doctor'
  }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'メールアドレスとパスワードを入力してください'
      }, { status: 400 });
    }

    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません'
      }, { status: 401 });
    }

    // 実際のアプリケーションでは、ここでJWTトークンを生成します
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: userWithoutPassword,
        token: 'dummy-token-' + Date.now() // ダミートークン
      }
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'ログインに失敗しました'
    }, { status: 500 });
  }
} 