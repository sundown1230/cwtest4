import Link from 'next/link';
export default function Home() {
    return (<div className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">MedMatch</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              ログイン
            </Link>
            <Link href="/signup" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
              新規登録
            </Link>
          </div>
        </nav>
      </header>

      {/* メインビジュアル */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              医師と病院の新しい出会い
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              あなたのキャリアに最適な病院を見つけましょう。
              または、理想の医師を探しましょう。
            </p>
            <div className="mt-10">
              <Link href="/search" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                探してみる
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 特徴セクション */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">簡単な検索</h3>
              <p className="mt-2 text-gray-500">
                条件に合わせて最適なマッチングを見つけられます
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">詳細なプロフィール</h3>
              <p className="mt-2 text-gray-500">
                医師と病院の詳細な情報を確認できます
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">スムーズな連絡</h3>
              <p className="mt-2 text-gray-500">
                マッチング後のコミュニケーションをサポート
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
