'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function MyPage() {
    const [doctor, setDoctor] = useState(null);
    const [error, setError] = useState('');
    const router = useRouter();
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }
                const res = await fetch('/api/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (!data.success) {
                    setError(data.error || 'プロフィールの取得に失敗しました');
                    return;
                }
                if (!data.data) {
                    setError('プロフィールが見つかりません');
                    return;
                }
                setDoctor(data.data);
            }
            catch (err) {
                setError('プロフィールの取得に失敗しました');
            }
        };
        fetchProfile();
    }, [router]);
    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };
    if (error) {
        return (<div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        </div>
      </div>);
    }
    if (!doctor) {
        return (<div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">読み込み中...</div>
          </div>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              プロフィール
            </h3>
            <div className="mt-5 border-t border-gray-200">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">お名前</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {doctor.name}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">性別</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {doctor.gender === 'M' ? '男性' : '女性'}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">生年月日</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(doctor.birthdate).toLocaleDateString('ja-JP')}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">医師免許取得日</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(doctor.license_date).toLocaleDateString('ja-JP')}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {doctor.email}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">専門分野</dt>
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
