'use client';

import { useState, useEffect } from 'react';
import { Doctor, Specialty } from '@/types'; // Specialty 型をインポート（必要に応じて型定義ファイルで定義）
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [specialties, setSpecialties] = useState<Specialty[]>([]); // 型を Specialty[] に変更
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error('医師情報の取得に失敗しました');
      }
      
      const data = await response.json();
      console.log('API Response:', data); // デバッグログを追加

      if (Array.isArray(data)) {
        setDoctors(data);
        setError('');
      } else if (data.success && data.data) {
        setDoctors(data.data);
        setError('');
      } else {
        throw new Error(data.error || '医師情報の取得に失敗しました');
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
      const response = await fetch('/api/specialties');
      const data = await response.json();
      if (data.success && data.data) {
        setSpecialties(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || 
      (doctor.specialties && doctor.specialties.some(s => 
        typeof s === 'string' ? s === selectedSpecialty : s.name === selectedSpecialty
      ));
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ヒーローセクション */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            医師と病院のマッチングサービス
          </h1>
            <p className="text-xl text-blue-50 mb-8">
            あなたのキャリアに最適な病院を見つけましょう。
            経験豊富な医師と、理想的な職場環境をマッチングします。
          </p>
          <div className="space-x-4">
            <Link
              href="/register"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors border border-blue-200"
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
          </div>
        </div>

      {/* 特徴セクション */}
      <div className="container mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-16">
          サービスの特徴
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-blue-900">簡単な登録</h3>
            <p className="text-gray-600">数分で登録完了。あなたの経歴と希望条件を入力するだけです。</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-blue-900">最適なマッチング</h3>
            <p className="text-gray-600">AIを活用したマッチングシステムで、あなたに最適な病院をご提案します。</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-blue-900">安心のサポート</h3>
            <p className="text-gray-600">転職のプロがあなたのキャリアをサポート。条件交渉もお任せください。</p>
          </div>
          </div>
        </div>

      {/* 医師一覧セクション */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-16">
            登録医師一覧
          </h2>
          <div className="space-y-4">
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
                  <option key={specialty.id} value={specialty.name}>
                    {specialty.name}
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
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-blue-100"
                >
                    <Link
                      href={`/doctors/${doctor.id}`}
                      className="block hover:opacity-80"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xl font-medium text-blue-600">
                            {doctor.name.charAt(0)}
                          </span>
                        </div>
                  <h3 className="text-lg font-medium text-blue-900">{doctor.name}</h3>
                      </div>
                      <div className="space-y-2">
                    <p className="text-sm text-gray-600">性別: {
                        doctor.gender === 'M' ? '男性' :
                        doctor.gender === 'F' ? '女性' :
                        doctor.gender === 'O' ? 'その他' :
                        doctor.gender === 'N' ? '回答しない' : '不明'
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      生年月日: {new Date(doctor.birthdate).toLocaleDateString('ja-JP')}
                    </p>
                    <p className="text-sm text-gray-600">
                      医師免許取得日: {new Date(doctor.license_date).toLocaleDateString('ja-JP')}
                    </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {doctor.specialties && doctor.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                              {typeof specialty === 'string' ? specialty : specialty.name}
                            </span>
                          ))}
                        </div>
                  </div>
                    </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
} 