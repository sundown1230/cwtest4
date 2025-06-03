import { NextResponse } from 'next/server';
import { hashPassword } from '@/utils/auth'; // bcryptjs を使ったハッシュ化関数を想定
import { RegisterRequest, ApiResponse, DoctorDbRecord, Specialty } from '@/types';
import type { D1Database } from '@cloudflare/workers-types';

// Cloudflare Pages Functions のコンテキストの型を定義
interface PagesFunctionContext {
  env: {
    DB: D1Database;
    // 他のバインディングや環境変数があればここに追加
  };
  // 他のコンテキストプロパティがあればここに追加
}

export async function POST(request: Request, context: PagesFunctionContext) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, gender, birthdate, license_date, specialties, email, password } = body;

    // 簡単なバリデーション
    if (!email || !password || !name || !gender || !birthdate || !license_date || !specialties || specialties.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: '必須項目が不足しています' }, { status: 400 });
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    const DB = context.env.DB;
    if (!DB) {
      console.error('D1 Database binding (DB) not found.');
      return NextResponse.json<ApiResponse>({ success: false, error: 'サーバー設定エラー' }, { status: 500 });
    }

    // doctors テーブルへの挿入
    let insertedDoctorId: number | undefined;
    try {
      const stmt = DB.prepare(
        "INSERT INTO doctors (user_type_id, name, gender, birthdate, license_date, email, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)"
      );
      const dbResult = await stmt.bind(1, name, gender, birthdate, license_date, email, hashedPassword).run();
      // D1のrun()の結果からlastRowIdを取得する方法は環境やライブラリによる。
      // Cloudflare D1のドキュメントでは、meta.last_row_id で取得できるとされている。
      if (dbResult.meta && dbResult.meta.last_row_id) {
        insertedDoctorId = dbResult.meta.last_row_id;
      } else {
        // lastRowIdが取得できない場合のフォールバック (例: emailで再検索)
        const doctorRecord = await DB.prepare("SELECT id FROM doctors WHERE email = ?").bind(email).first<{id: number}>();
        if (doctorRecord) {
          insertedDoctorId = doctorRecord.id;
        } else {
          throw new Error('Failed to retrieve inserted doctor ID.');
        }
      }

      // doctor_specialties テーブルへの挿入
      if (insertedDoctorId && specialties.length > 0) {
        const specialtyPlaceholders = specialties.map(() => '(?, ?)').join(', ');
        const specialtyBindings: (number | string)[] = [];
        for (const specialtyName of specialties) {
          // specialtiesテーブルからIDを取得 (存在しない場合はエラーまたは無視するなどの処理が必要)
          const specialtyRecord = await DB.prepare("SELECT id FROM specialties WHERE name = ?").bind(specialtyName).first<{id: number}>();
          if (specialtyRecord) {
            specialtyBindings.push(insertedDoctorId, specialtyRecord.id);
          } else {
            console.warn(`Specialty not found: ${specialtyName}`);
            // 存在しない診療科は無視するか、エラー処理を行う
          }
        }
        if (specialtyBindings.length > 0) {
          const stmtSpecialties = DB.prepare(`INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES ${specialtyPlaceholders}`);
          await stmtSpecialties.bind(...specialtyBindings).run();
        }
      }
    } catch (dbError: any) {
      console.error('Database error during registration:', dbError);
      // emailの重複エラーなどをハンドリング
      if (dbError.message && dbError.message.includes('UNIQUE constraint failed: doctors.email')) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'このメールアドレスは既に使用されています。' }, { status: 409 });
      }
      return NextResponse.json<ApiResponse>({ success: false, error: 'データベースエラーが発生しました。' }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'ユーザー登録が成功しました。',
      data: { id: insertedDoctorId, name, email } // 登録成功時に返す情報
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 