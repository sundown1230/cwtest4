'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            病院を探す
          </h1>
          
          <div className="bg-white/90 rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <input
                type="text"
                placeholder="病院名、地域、診療科などで検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">内科</h3>
                <p className="text-gray-600 mb-4">東京都内の内科診療所</p>
                <Link
                  href="/hospitals/1"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  詳細を見る →
                </Link>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">外科</h3>
                <p className="text-gray-600 mb-4">神奈川県の外科病院</p>
                <Link
                  href="/hospitals/2"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  詳細を見る →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 