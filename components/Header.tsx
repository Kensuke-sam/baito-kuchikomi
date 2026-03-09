import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[rgba(247,251,248,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-lg text-white shadow-[0_14px_30px_rgba(37,99,235,0.24)]">
            📋
          </span>
          <span>
            <span className="eyebrow bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-[0.62rem]">
              Community Atlas
            </span>
            <span className="mt-1 block text-sm font-semibold tracking-[-0.03em] text-[var(--page-ink)] sm:text-base">
              バイト体験談マップ
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-3">
          <Link
            href="/guides"
            className="secondary-button px-4 py-2 text-xs sm:text-sm"
          >
            ガイド
          </Link>
          <Link
            href="/list"
            className="secondary-button px-4 py-2 text-xs sm:text-sm"
          >
            一覧
          </Link>
          <Link
            href="/submit"
            className="primary-button px-4 py-2 text-xs sm:text-sm"
          >
            体験談を投稿
          </Link>
        </nav>
      </div>
    </header>
  );
}
