import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { RegisterRequest, ApiResponse } from '@/types';
import type { D1Database } from '@cloudflare/workers-types';

interface PagesFunctionContext {
  env: {
    DB: D1Database;
    JWT_SECRET: string; // 必要に応じて
    // 他の環境変数
  };
}

export async function POST(request: Request, context: PagesFunctionContext) {
  try { // 修正: try ブロックの開始位置を修正
    const DB = context.env.DB;
    if (!DB) {
      console.error('D1 Database binding (DB) not found in POST /api/register.');
      return NextResponse.json<ApiResponse>({ success: false, error: 'サーバー設定エラー', message: 'データベースに接続できませんでした。' }, { status: 500 });
    }

    const body = await request.json() as RegisterRequest;
    if (!body.email || !body.password || !body.name || !body.gender || !body.birthdate || !body.license_date || !body.specialties) {
      return NextResponse.json<ApiResponse>({ success: false, error: '必須項目が不足しています' }, { status: 400 });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(body.password, saltRounds);

    // 既存の医師をメールアドレスで検索
    const existingDoctorStmt = DB.prepare('SELECT id FROM doctors WHERE email = ?');
    const existingDoctor = await existingDoctorStmt.bind(body.email).first();

    if (existingDoctor) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'このメールアドレスは既に使用されています' }, { status: 409 });
    }

    const insertDoctorStmt = DB.prepare(
      "INSERT INTO doctors (user_type_id, name, gender, birthdate, license_date, email, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    const info = await insertDoctorStmt.bind(1, body.name, body.gender, body.birthdate, body.license_date, body.email, password_hash).run();

    if (!info.success || info.meta.last_row_id === undefined) {
        console.error('Failed to insert doctor or get last_row_id', info.meta);
        throw new Error('医師情報の保存に失敗しました。');
    }
    const doctorId = info.meta.last_row_id;

    // 診療科の登録 (specialties は name の配列と仮定)
    if (body.specialties && body.specialties.length > 0 && doctorId) {
      const insertSpecialtyStmt = DB.prepare('INSERT INTO doctor_specialties (doctor_id, specialty_id) SELECT ?, id FROM specialties WHERE name = ?');
      const batch = body.specialties.map(specialtyName => insertSpecialtyStmt.bind(doctorId, specialtyName));
      await DB.batch(batch);
    }

    return NextResponse.json<ApiResponse>({ success: true, message: 'ユーザー登録が成功しました' });

  } catch (e: any) {
    console.error('Registration error in /api/register:', e);
    return NextResponse.json<ApiResponse>({ success: false, error: '登録処理中にエラーが発生しました', message: e.message || '不明なエラー' }, { status: 500 });
  }
}