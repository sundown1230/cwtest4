// functions/api/doctors.ts

// 環境変数を扱う場合の型定義 (任意)
// interface Env {
//   YOUR_API_KEY: string;
//   DB: D1Database;
// }

// GETリクエストを処理するハンドラ
// export const onRequestGet: PagesFunction<Env> = async (context) => {
export const onRequestGet: PagesFunction = async (context) => {
  // context.env から環境変数にアクセス可能
  // const apiKey = context.env.YOUR_API_KEY;
  // const db = context.env.DB;

  try {
    // ここで医師情報を取得するロジックを実装します
    // 例: 外部APIから取得、D1データベースから取得など
    // const response = await fetch('https://api.example.com/doctors', {
    //   headers: { 'Authorization': `Bearer ${apiKey}` }
    // });
    // if (!response.ok) {
    //   throw new Error(`API error: ${response.statusText}`);
    // }
    // const data = await response.json();

    // ダミーデータ
    const doctorsData = [
      { id: 1, name: "田中 一郎", specialty: "内科" },
      { id: 2, name: "佐藤 花子", specialty: "小児科" },
    ];

    return new Response(JSON.stringify(doctorsData), {
      headers: {
        'Content-Type': 'application/json',
        // CORSヘッダー: 必要に応じてオリジンを限定してください
        'Access-Control-Allow-Origin': '*', // すべてのオリジンを許可 (開発用)
        // 'Access-Control-Allow-Origin': 'https://your-pages-project.pages.dev', // 特定のオリジンのみ許可
      },
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    // エラーレスポンスを返す
    return new Response(JSON.stringify({ error: "医師情報の取得に失敗しました。", message: error.message }), {
      status: 500, // Internal Server Error
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // エラーレスポンスにもCORSヘッダー
      },
    });
  }
};

// POST, PUT, DELETEなどの他のメソッドも同様に定義できます
// export const onRequestPost: PagesFunction = async (context) => { /* ... */ };
