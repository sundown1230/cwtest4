// src/app/mypage/profile/edit/page.tsx
"use client"; // クライアントコンポーネントとしてマーク

import { useState, useEffect, FormEvent } from 'react';

interface UserProfile {
  name: string;
  email: string;
  gender: 'M' | 'F' | 'O' | 'N' | ''; // '' は未選択など
  birthdate: string; // YYYY-MM-DD 形式
  license_date: string; // YYYY-MM-DD 形式
  // 必要に応じて他の医師情報も追加
  // 例: specialty_ids: number[]; // 専門分野のIDリスト
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
        const data: UserProfile = { // 仮データ（実際にはAPIから取得）
          name: "テストユーザー",
          email: "test@example.com",
          gender: "M",
          birthdate: "1985-07-15",
          license_date: "2010-04-01",
        };
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
    if (!profile) return;

    setMessage('');
    // APIにプロフィール更新情報を送信する処理
    try {
      // const response = await fetch('/api/mypage/profile', { // 仮のAPIエンドポイント
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profile),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'プロフィールの更新に失敗しました');
      // }
      // setMessage('プロフィールを更新しました');
      console.log("更新データ:", profile);
      alert('プロフィール更新処理（コンソールにデータ出力）');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'エラーが発生しました');
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (!profile) return <p>プロフィール情報を読み込めませんでした。{message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">プロフィール編集</h1>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">名前</label>
          <input type="text" name="name" id="name" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス</label>
          <input type="email" name="email" id="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div className="mb-4">
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">性別</label>
          <select name="gender" id="gender" value={profile.gender} onChange={(e) => setProfile({...profile, gender: e.target.value as UserProfile['gender']})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">選択してください</option>
            <option value="M">男性</option>
            <option value="F">女性</option>
            <option value="O">その他</option>
            <option value="N">回答しない</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">生年月日</label>
          <input type="date" name="birthdate" id="birthdate" value={profile.birthdate} onChange={(e) => setProfile({...profile, birthdate: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div className="mb-4">
          <label htmlFor="license_date" className="block text-sm font-medium text-gray-700">医師免許取得日</label>
          <input type="date" name="license_date" id="license_date" value={profile.license_date} onChange={(e) => setProfile({...profile, license_date: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">更新</button>
      </form>
    </div>
  );
}