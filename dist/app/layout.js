import { Inter } from 'next/font/google';
import './globals.css';
const inter = Inter({ subsets: ['latin'] });
export const metadata = {
    title: '医師と病院のマッチングサービス',
    description: '医師と病院を効率的にマッチングするプラットフォーム',
};
export default function RootLayout({ children, }) {
    return (<html lang="ja">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>);
}
