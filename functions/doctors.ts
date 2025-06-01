// 例: functions/doctors.ts
export const onRequestGet: PagesFunction = async (context) => {
  try {
    console.log("医師情報取得APIが呼び出されました。");
    console.log("リクエストURL:", context.request.url);
    // ... 実際の処理 ...
    const doctors = [{ id: 1, name: "山田太郎" }]; // 仮のデータ
    console.log("取得データ:", doctors);
    return new Response(JSON.stringify(doctors), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // 開発中は '*'、本番では適切なオリジンを指定
      },
    });
  } catch (e) {
    console.error("医師情報取得APIでエラーが発生しました:", e);
    return new Response(JSON.stringify({ error: "医師情報の取得に失敗しました。", details: e.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // エラーレスポンスにもCORSヘッダー
      },
    });
  }
};
