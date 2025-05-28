'use client';

import Link from 'next/link'

export default function Home() {
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
      </div>
    </div>
  )
} 