'use client';

import { useState, useEffect, Key } from 'react';
import { useParams } from 'next/navigation'; // Specialty 型をインポート
import { Doctor, Specialty } from '@/types';
import Link from 'next/link';

// スキルマップの型定義
interface SkillMap {
  category: string;
  skills: {
    name: string;
    level: number; // 1-5
  }[];
}

export default function DoctorProfile() {
  const params = useParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [skillMap, setSkillMap] = useState<SkillMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  useEffect(() => {
    fetchDoctorProfile();
    fetchSpecialties();
  }, [params.id]);

  const fetchDoctorProfile = async () => {
    try {
      // 環境変数からAPIキーを取得
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787';
      
      // ヘッダーを明示的に設定
      const headers = new Headers({
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY || ''
      });

      // デバッグログ
      console.log('API Request:', {
        url: `${API_BASE_URL}/api/doctors/${params.id}`,
        headers: Object.fromEntries(headers.entries())
      });
      
      const response = await fetch(`${API_BASE_URL}/api/doctors/${params.id}`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '医師情報の取得に失敗しました');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setDoctor(data.data);
        // ダミーのスキルマップデータ
        setSkillMap([
          {
            category: '臨床スキル',
            skills: [
              { name: '診断能力', level: 4 },
              { name: '治療計画', level: 5 },
              { name: '手術技術', level: 3 },
            ],
          },
          {
            category: '研究・教育',
            skills: [
              { name: '論文執筆', level: 4 },
              { name: '学会発表', level: 5 },
              { name: '後輩指導', level: 4 },
            ],
          },
          {
            category: 'コミュニケーション',
            skills: [
              { name: '患者説明', level: 5 },
              { name: 'チーム連携', level: 4 },
              { name: 'カウンセリング', level: 3 },
            ],
          },
        ]);
      } else {
        throw new Error(data.error || '医師情報の取得に失敗しました');
      }
    } catch (error) {
      console.error('Failed to fetch doctor profile:', error);
      setError(error instanceof Error ? error.message : '医師情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('http://localhost:8787/specialties');
      const data = await response.json();
      setSpecialties(data);
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
            {error || '医師情報が見つかりませんでした'}
          </div>
          <div className="mt-4">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              ← トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            ← トップページに戻る
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="aspect-square bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-4xl text-blue-600">
                  {doctor.name.charAt(0)}
                </span>
              </div>
            </div>
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold text-blue-900 mb-4">
                {doctor.name}
              </h1>
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">基本情報</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">性別</p>
                      <p className="text-gray-900">{
                        doctor.gender === 'M' ? '男性' :
                        doctor.gender === 'F' ? '女性' :
                        doctor.gender === 'O' ? 'その他' :
                        doctor.gender === 'N' ? '回答しない' : '不明'
                      }</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">生年月日</p>
                      <p className="text-gray-900">{new Date(doctor.birthdate).toLocaleDateString('ja-JP')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">医師免許取得日</p>
                      <p className="text-gray-900">{new Date(doctor.license_date).toLocaleDateString('ja-JP')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">メールアドレス</p>
                      <p className="text-gray-900">{doctor.email}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">専門分野</h2>
                  <div className="flex flex-wrap gap-2">
                       {(doctor.specialties ?? []).map((specialtyItem) => {
                         const key: Key = typeof specialtyItem === 'string' ? specialtyItem : specialtyItem.id;
                         const displayName = typeof specialtyItem === 'string' ? specialtyItem : specialtyItem.name;
                         return (
                           <span
                            key={key}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                           >
                            {displayName}
                           </span>
                         );
                       })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">スキルマップ</h2>
          <div className="space-y-8">
            {skillMap.map((category) => (
              <div key={category.category}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700">{skill.name}</span>
                        <span className="text-sm text-gray-500">
                          {skill.level}/5
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 