// functions/api/specialties.ts

import type { D1Database, PagesFunction } from '@cloudflare/workers-types';

// 環境変数の型定義 (D1バインディングを含む)
interface Env {
  DB: D1Database; // Pagesプロジェクトで設定したD1バインディング名
}

// 診療科の型定義 (フロントエンドの型定義と合わせる)
interface Specialty {
  id: number;
  name: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;

    if (!db) {
      return new Response(JSON.stringify({ error: "D1データベースのバインディングが見つかりません。" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const stmt = db.prepare("SELECT id, name FROM specialties");
    const { results } = await stmt.all<Specialty>();

    if (!results) {
      return new Response(JSON.stringify({ error: '診療科情報が見つかりませんでした。' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify(results), { // 診療科の配列を直接返す
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error("診療科情報取得 (Pages Function) エラー:", error);
    return new Response(JSON.stringify({ error: '診療科情報の取得に失敗しました', message: error instanceof Error ? error.message : '不明なエラー' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};