// src/app/_api/specialties/route.ts
import { NextResponse } from 'next/server';

// D1データベースの型をインポート（またはグローバルで利用可能であれば不要）
// import type { D1Database } from '@cloudflare/workers-types';

// 環境変数の型定義 (任意ですが推奨)
interface Env {
  DB: D1Database; // Pagesプロジェクトで設定したD1バインディング名
}

export async function GET() {
  try {
    // Cloudflare Pagesの環境変数からD1データベースインスタンスを取得
    // process.env はNode.js環境の型を持つため、D1Database型へキャストが必要な場合があります。
    const DB = (process.env as any as Env).DB;

    if (!DB) {
      throw new Error("D1データベースのバインディングが見つかりません。");
    }

    const stmt = DB.prepare("SELECT id, name FROM specialties");
    const { results } = await stmt.all();

    if (!results) {
      // results が undefined や null の場合 (通常は空配列 [] が返るはずですが念のため)
      return NextResponse.json({ error: '診療科情報が見つかりませんでした。' }, { status: 404 });
    }

    const specialties = results;

    return NextResponse.json(specialties);
  } catch (error) {
    console.error("診療科情報取得APIエラー:", error);
    return NextResponse.json(
      { error: '診療科情報の取得に失敗しました', message: error instanceof Error ? error.message : '不明なエラー' },
      { status: 500 }
    );
  }
}