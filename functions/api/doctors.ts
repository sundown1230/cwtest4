// functions/api/doctors.ts

// D1データベースバインディングを含む環境変数の型定義
interface Env {
  DB: D1Database; // Pagesプロジェクトで設定したD1バインディング名
}

// GETリクエストを処理するハンドラ
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // D1データベースから医師情報を取得
    const db = context.env.DB;
    const stmt = db.prepare("SELECT id, name, specialty FROM doctors"); // テーブル名やカラム名は実際の構成に合わせてください
    const { results } = await stmt.all();

    if (!results) {
      console.error("D1 query returned no results or failed without throwing an error.");
      return new Response(JSON.stringify({ error: "データベースから情報を取得できませんでした。", message: "No results" }), {
        status: 404, // Not Found or 500 Internal Server Error depending on expectation
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // 開発中は '*'、本番では適切なオリジンを指定
        },
      });
    }

    const doctorsData = results;
    console.log("Fetched doctors data:", doctorsData);

    return new Response(JSON.stringify(doctorsData), {
      headers: {
        'Content-Type': 'application/json',
        // CORSヘッダー: 必要に応じてオリジンを限定してください
        'Access-Control-Allow-Origin': '*', // すべてのオリジンを許可 (開発用)
        // 'Access-Control-Allow-Origin': 'https://your-pages-project.pages.dev', // 特定のオリジンのみ許可
      },
    });
  } catch (error) {
    // エラーの詳細をログに出力
    console.error("Error fetching doctors from D1:", error);
    let errorMessage = "医師情報の取得に失敗しました。";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // エラーレスポンスを返す
    return new Response(JSON.stringify({ error: "医師情報の取得に失敗しました。", message: errorMessage }), {
      status: 500, // Internal Server Error
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // エラーレスポンスにもCORSヘッダー
      },
    });
  }
};
