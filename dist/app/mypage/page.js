'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function MyPage() {
    const router = useRouter();
    const [doctor, setDoctor] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            try {
                const response = await fetch('/api/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (!data.success) {
                    setError(data.error || 'プロフィールの取得に失敗しました');
                    return;
                }
                setDoctor(data.data);
            }
            catch (error) {
                setError('プロフィールの取得に失敗しました');
            }
        };
        fetchProfile();
    }, [router]);
    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };
    if (!doctor) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {error ? (<div className="text-red-600">{error}</div>) : (<div className="text-gray-600">読み込み中...</div>)}
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  プロフィール
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  医師情報の詳細
                </p>
              </div>
              <button onClick={handleLogout} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                ログアウト
              </button>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">氏名</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {doctor.name}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">性別</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {doctor.gender === 'M' ? '男性' : '女性'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">生年月日</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(doctor.birthdate).toLocaleDateString()}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">医師免許取得年月日</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(doctor.license_date).toLocaleDateString()}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {doctor.email}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">診療科</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {doctor.specialties.join(', ')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
