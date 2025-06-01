// src/app/mypage/profile/edit/page.tsx
"use client"; // クライアントコンポーネントとしてマーク

import { useState, useEffect, FormEvent } from 'react';

interface UserProfile {
  name: string;
  email: string;
  // 他のプロフィール項目
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // APIから現在のプロフィール情報を取得する処理
    const fetchProfile = async () => {
      try {
        // const response = await fetch('/api/mypage/profile'); // 仮のAPIエンドポイント
        // if (!response.ok) throw new Error('プロフィールの取得に失敗しました');
        // const data = await response.json();
        const data: UserProfile = { name: "テストユーザー", email: "test@example.com" }; // 仮データ
        setProfile(data);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    // APIにプロフィール更新情報を送信する処理
    // try {
    //   const response = await fetch('/api/mypage/profile', { method: 'PUT', body: JSON.stringify(profile) });
    //   if (!response.ok) throw new Error('プロフィールの更新に失敗しました');
    //   setMessage('プロフィールを更新しました');
    // } catch (error) {
    //   setMessage(error instanceof Error ? error.message : 'エラーが発生しました');
    // }
    alert('プロフィール更新処理（未実装）');
  };

  if (loading) return <p>読み込み中...</p>;
  if (!profile) return <p>プロフィール情報を読み込めませんでした。{message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">プロフィール編集</h1>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit}>
        {/* ここにフォーム要素（名前、メールアドレスなど）を配置 */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">名前</label>
          <input type="text" name="name" id="name" defaultValue={profile.name} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">更新</button>
      </form>
    </div>
  );
}