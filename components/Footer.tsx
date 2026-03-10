import Link from "next/link";

const contentLinks = [
  { href: "/guides", label: "悩み別ガイド" },
  { href: "/jobs", label: "職種から探す" },
  { href: "/areas", label: "地域から探す" },
  { href: "/apps", label: "アプリ・サービス比較" },
  { href: "/list", label: "口コミ一覧" },
  { href: "/submit", label: "体験談を投稿" },
] as const;

const safetyLinks = [
  { href: "/about", label: "サイトについて" },
  { href: "/editorial-policy", label: "編集方針" },
  { href: "/guidelines", label: "投稿ガイドライン" },
  { href: "/terms", label: "利用規約" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/report", label: "通報" },
  { href: "/takedown", label: "削除申請" },
  { href: "/official-response", label: "当事者コメント" },
] as const;

export function Footer() {
  return (
    <footer className="mt-10 border-t border-[var(--line-strong)] bg-[rgba(248,243,223,0.88)] backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
          {/* ブランド・説明 */}
          <div className="max-w-md">
            <span className="eyebrow bg-[rgba(33,31,24,0.94)] px-2.5 py-1 text-[0.62rem] text-[#fff2b0]">
              バイト体験談マップ
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
              主観レビューを、安全寄りの運用で扱うサイトです。
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
              投稿は管理者確認後に掲載し、断定や個人特定につながる表現は掲載しません。問題がある場合は通報・削除申請・当事者コメントの窓口からご連絡ください。
            </p>
          </div>

          {/* コンテンツ導線 */}
          <nav aria-label="コンテンツ">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--page-muted)]">
              コンテンツ
            </p>
            <div className="grid gap-1.5">
              {contentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[var(--page-muted)] transition-colors hover:text-[var(--page-ink)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* 運営・安全 */}
          <nav aria-label="運営・安全">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--page-muted)]">
              運営・安全
            </p>
            <div className="grid gap-1.5">
              {safetyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[var(--page-muted)] transition-colors hover:text-[var(--page-ink)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* コピーライト */}
        <div className="mt-8 border-t border-[var(--line)] pt-6 text-center text-xs text-[var(--page-muted)]">
          © {new Date().getFullYear()} バイト体験談マップ
        </div>
      </div>
    </footer>
  );
}
