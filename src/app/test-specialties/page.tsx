'use client';

import { useState, useEffect } from 'react';
import { Specialty } from '@/types';

export default function TestSpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialtiesData = async () => {
      console.log("Test Page: useEffect triggered, fetching specialties...");
      try {
        const response = await fetch('/api/specialties');
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Test Page: API response not OK", response.status, errorText);
          throw new Error(`診療科情報の取得に失敗しました (ステータス: ${response.status})`);
        }
        const data: Specialty[] = await response.json();
        console.log("Test Page: Data received from API:", data);
        if (Array.isArray(data)) {
          setSpecialties(data);
        } else {
          console.error("Test Page: Data is not an array", data);
          throw new Error('診療科情報の形式が正しくありません');
        }
      } catch (err: any) {
        console.error('Test Page: Error fetching specialties:', err);
        setError(err.message || '不明なエラーが発生しました');
      } finally {
        setIsLoading(false);
        console.log("Test Page: Fetching finished, isLoading set to false");
      }
    };

    fetchSpecialtiesData();
  }, []);

  if (isLoading) {
    return <div className="p-4">診療科情報を読み込み中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">エラー: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">診療科一覧テスト</h1>
      {specialties.length > 0 ? (
        <ul>
          {specialties.map(specialty => (
            <li key={specialty.id}>{specialty.id}: {specialty.name}</li>
          ))}
        </ul>
      ) : (
        <p>診療科データが見つかりませんでした。</p>
      )}
    </div>
  );
}