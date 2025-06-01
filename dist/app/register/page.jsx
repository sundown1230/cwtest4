'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        gender: 'M',
        birthdate: '',
        license_date: '',
        specialties: [],
        email: '',
        password: '',
    });
    const [specialties, setSpecialties] = useState([]);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const res = await fetch('/api/specialties');
                const data = await res.json();
                if (!data.success) {
                    setError(data.error || '診療科の取得に失敗しました');
                    return;
                }
                if (!data.data) {
                    setError('診療科が見つかりません');
                    return;
                }
                setSpecialties(data.data);
            }
            catch (err) {
                setError('診療科の取得に失敗しました');
            }
        };
        fetchSpecialties();
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error || '登録に失敗しました');
                return;
            }
            // ログインページにリダイレクト
            router.push('/login');
        }
        catch (err) {
            setError('登録に失敗しました');
        }
    };
    const handleSpecialtyChange = (specialtyId) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(specialtyId)
                ? prev.specialties.filter(id => id !== specialtyId)
                : [...prev.specialties, specialtyId]
        }));
    };
    return (<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          新規登録
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>)}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                氏名
              </label>
              <input type="text" id="name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}/>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                性別
              </label>
              <select id="gender" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                <option value="M">男性</option>
                <option value="F">女性</option>
              </select>
            </div>

            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                生年月日
              </label>
              <input type="date" id="birthdate" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" value={formData.birthdate} onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}/>
            </div>

            <div>
              <label htmlFor="license_date" className="block text-sm font-medium text-gray-700">
                医師免許取得年月日
              </label>
              <input type="date" id="license_date" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" value={formData.license_date} onChange={(e) => setFormData({ ...formData, license_date: e.target.value })}/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">専門分野</label>
              <div className="mt-2 space-y-2">
                {specialties.map((specialty) => (<div key={specialty.id} className="flex items-center">
                    <input id={`specialty-${specialty.id}`} name="specialties" type="checkbox" value={specialty.id} checked={formData.specialties.includes(specialty.id)} onChange={() => handleSpecialtyChange(specialty.id)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                    <label htmlFor={`specialty-${specialty.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                      {specialty.name}
                    </label>
                  </div>))}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input type="email" id="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}/>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input type="password" id="password" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}/>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                登録
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  すでにアカウントをお持ちの方は
                  <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                    ログイン
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
