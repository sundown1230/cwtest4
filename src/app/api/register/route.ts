import { NextResponse } from 'next/server';
import { hashPassword } from '@/utils/auth';
import type { RegisterRequest, ApiResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, gender, birthdate, license_date, specialties, email, password } = body;

    // バリデーション
    if (!name || !gender || !birthdate || !license_date || !specialties || !email || !password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '必須項目が入力されていません'
      }, { status: 400 });
    }

    // パスワードのハッシュ化
    const passwordHash = await hashPassword(password);

    // D1データベースに保存
    const db = (request as any).env.DB;
    
    // トランザクション開始
    await db.prepare('BEGIN').run();

    try {
      // 医師情報の保存
      const result = await db.prepare(`
        INSERT INTO doctors (name, gender, birthdate, license_date, email, password_hash)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(name, gender, birthdate, license_date, email, passwordHash).run();

      const doctorId = result.meta.last_row_id;

      // 診療科の保存
      for (const specialtyId of specialties) {
        await db.prepare(`
          INSERT INTO doctor_specialties (doctor_id, specialty_id)
          VALUES (?, ?)
        `).bind(doctorId, specialtyId).run();
      }

      // トランザクションのコミット
      await db.prepare('COMMIT').run();

      return NextResponse.json<ApiResponse<null>>({
        success: true,
        data: null
      });
    } catch (error) {
      // エラー時はロールバック
      await db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '登録に失敗しました'
    }, { status: 500 });
  }
} 