import { NextResponse } from 'next/server';
import { ApiResponse, Doctor } from '@/types';
import type { D1Database } from '@cloudflare/workers-types';

// Cloudflare Pages Functions のコンテキストの型を定義
interface PagesFunctionContext {
  env: {
    DB: D1Database; // D1バインディング
    // 他のバインディングや環境変数があればここに追加
  };
  params: { // Next.js App Router の動的セグメント
    id: string;
  };
}

// WorkerにあったモックデータをPages Functionに移す (D1から取得するロジックに置き換える必要があります)
const mockDoctors: Record<string, Omit<Doctor, 'password_hash' | 'created_at' | 'updated_at'>> = {
  '1': {
    id: 1,
    user_type_id: 1,
    name: '山田太郎',
    gender: 'M',
    birthdate: '1980-01-01',
    license_date: '2005-04-01',
    email: 'yamada@example.com',
    // specialties は中間テーブルからJOINして取得する必要があります
  }
};

export async function GET(request: Request, context: PagesFunctionContext) {
  try {
    const doctorId = context.params.id;

    // TODO: D1データベースから実際に医師情報を取得するロジックに置き換える
    const doctor = mockDoctors[doctorId]; // 現在はモックデータを使用

    if (!doctor) {
      return NextResponse.json<ApiResponse>({ success: false, error: '医師情報が見つかりませんでした' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({ success: true, data: doctor });

  } catch (error: any) {
    console.error('Error fetching doctor:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: '医師情報の取得に失敗しました', message: error.message || '不明なエラー' }, { status: 500 });
  }
}