// src/app/mypage/page.tsx
"use client"; 
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // useRouterをインポート

// ユーザー情報の型定義（実際のAPIレスポンスに合わせて調整してください）
interface User {
  name: string;
  email: string;
  // 他のユーザー情報があれば追加
}

export default function MyPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // useRouterフックを使用

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        // 仮のセッション確認・ユーザー情報取得APIエンドポイント
        // 実際のエンドポイントに置き換えてください
        const response = await fetch('/api/auth/session'); // 例: セッション情報を返すAPI
        if (!response.ok) {
          // 未認証またはエラーの場合はログインページへリダイレクト
          router.push('/login');
          return;
        }
        const userData: User = await response.json(); // APIが返すユーザー情報の型に合わせる
        setCurrentUser(userData);
      } catch (error) {
        console.error("セッション情報の取得に失敗しました:", error);
        router.push('/login'); // エラー時もログインページへ
      } finally {
        setLoading(false);
      }
    };

    fetchUserSession();
  }, [router]); // routerを依存配列に追加

  if (loading) {
    return <p className="text-center mt-8">読み込み中...</p>;
  }

  if (!currentUser) {
    // currentUserがnullの場合（リダイレクト処理中など）は何も表示しないか、
    // または別のローディング表示をしても良い
    return null; 
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">マイページ</h1>
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">ようこそ、{currentUser.name} さん</h2>
        <p>メールアドレス: {currentUser.email}</p>
      </div>
      <nav>
        <ul className="space-y-2">
          <li><Link href="/mypage/profile/edit" className="text-blue-500 hover:underline">プロフィール編集</Link></li>
          <li><Link href="/mypage/skills/edit" className="text-blue-500 hover:underline">スキル編集</Link></li>
          {/* 他のマイページメニュー項目 */}
        </ul>
      </nav>
    </div>
  );
}