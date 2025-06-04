'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterRequest, ApiResponse, Specialty } from '@/types'; // Specialty 型をインポート

export default function Register() {
  const router = useRouter();
  const [specialties, setSpecialties] = useState<Specialty[]>([]); // 型を Specialty[] に変更
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    gender: 'M',
    birthdate: '',
    license_date: '',
    specialties: [],
    email: '',
    password: ''
  });

  useEffect(() => {
    console.log("Register Page: useEffect triggered"); // ★追加: useEffectが実行されているか
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    console.log("Register Page: fetchSpecialties function called"); // ★追加: fetchSpecialtiesが呼び出されているか
    try {
      setIsLoading(true);
      const response = await fetch('/api/specialties');
      if (!response.ok) {
        throw new Error('診療科情報の取得に失敗しました');
      }
      console.log('Response from /api/specialties:', response);
      // APIは診療科の配列を直接返すため、そのように処理する
      const data: Specialty[] = await response.json(); // 型を Specialty[] に変更
      console.log('Data from /api/specialties after json():', data);
      if (Array.isArray(data)) {
        setSpecialties(data);
        console.log('Specialties state updated:', data); // ステート更新後の内容を確認
      } else {
        // APIが予期せず配列でないデータを返した場合の処理
        const errorData = data as any; // 一時的にany型としてアクセス
        const errorMessage = errorData.error || errorData.message || '診療科情報の形式が正しくありません';
        console.error('Invalid data format for specialties:', errorData); // 詳細なエラー情報をログに出力
        setError(errorMessage); // 画面にエラーメッセージを設定
        setSpecialties([]); // 診療科リストを空にすることを明示
      }

    } catch (error) {
      console.error('Failed to fetch specialties:', error);
      setError('診療科情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', { // APIルートのパスを修正
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json() as ApiResponse;

      if (response.ok && data.success) { // data.success も確認
        router.push('/login');
      } else {
        setError(data.error || '登録に失敗しました');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('登録中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">新規会員登録</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            >
              <option value="M">男性</option>
              <option value="F">女性</option>
              <option value="O">その他</option>
              <option value="N">回答しない</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">医師免許取得日</label>
            <input
              type="date"
              name="license_date"
              value={formData.license_date}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">診療科</label>
            <select
              name="specialties"
              value={formData.specialties[0] || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, specialties: value ? [value] : [] }));
              }}
              className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            >
              {/* {console.log("Register Page: Rendering specialties select. Current specialties:", specialties)} */} {/* ★追加: レンダリング時のステート確認 */}
              <option value="">選択してください</option>
              {specialties.map((specialty) => ( // specialty オブジェクトの name プロパティを使用
                <option key={specialty.id} value={specialty.name}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? '登録中...' : '登録'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700">
            すでにアカウントをお持ちの方はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}