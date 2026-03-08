import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-gray-800 hover:text-gray-600">
          📋 バイト体験談マップ
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/list" className="text-gray-600 hover:text-gray-900">一覧</Link>
          <Link href="/submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium">
            体験談を投稿
          </Link>
        </nav>
      </div>
    </header>
  );
}
