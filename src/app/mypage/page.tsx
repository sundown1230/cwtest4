// src/app/mypage/page.tsx
import Link from 'next/link';

// 仮のユーザー情報（実際には認証状態から取得）
const user = {
  name: 'ログインユーザー',
  email: 'user@example.com',
};

export default function MyPage() {
  // ここで認証状態を確認し、未認証ならログインページへリダイレクトする処理を追加

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">マイページ</h1>
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">ようこそ、{user.name} さん</h2>
        <p>メールアドレス: {user.email}</p>
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