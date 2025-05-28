'use client';

import { useState, useEffect } from 'react';
import { Doctor } from '@/types';
import Link from 'next/link'

export default function Home() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/_api/doctors');
      if (!response.ok) {
        throw new Error('医師情報の取得に失敗しました');
      }
      const data = await response.json();
      if (data.success && data.doctors) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      setError('医師情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/_api/specialties');
      if (!response.ok) {
        throw new Error('診療科情報の取得に失敗しました');
      }
      const data = await response.json();
      if (data.success && data.specialties) {
        setSpecialties(data.specialties);
      }
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
            医師と病院のマッチングサービス
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            あなたのキャリアに最適な病院を見つけましょう。
            経験豊富な医師と、理想的な職場環境をマッチングします。
          </p>
          <div className="space-x-4">
            <Link
              href="/register"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              新規登録
            </Link>
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              ログイン
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">簡単な登録</h3>
            <p>数分で登録完了。あなたの経歴と希望条件を入力するだけです。</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">最適なマッチング</h3>
            <p>AIを活用したマッチングシステムで、あなたに最適な病院をご提案します。</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">安心のサポート</h3>
            <p>転職のプロがあなたのキャリアをサポート。条件交渉もお任せください。</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="医師名で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-full sm:w-64">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">全ての診療科</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">読み込み中...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">該当する医師が見つかりませんでした</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-medium text-gray-900">{doctor.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      性別: {doctor.gender === 'M' ? '男性' : '女性'}
                    </p>
                    <p className="text-sm text-gray-600">
                      生年月日: {new Date(doctor.birthdate).toLocaleDateString('ja-JP')}
                    </p>
                    <p className="text-sm text-gray-600">
                      医師免許取得日: {new Date(doctor.license_date).toLocaleDateString('ja-JP')}
                    </p>
                    <p className="text-sm text-gray-600">
                      診療科: {doctor.specialties.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 