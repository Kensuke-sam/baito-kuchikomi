import Link from "next/link";

const footerLinks = [
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
    <footer className="mt-10 border-t border-white/60 bg-[rgba(247,251,248,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className="eyebrow bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-[0.62rem]">
            Trust & Safety
          </span>
          <h2 className="mt-4 text-lg font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
            主観レビューを、安全寄りの運用で扱うためのページです。
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
            投稿は管理者確認後に掲載し、断定や個人特定につながる表現は掲載しません。問題がある場合は通報、削除申請、当事者コメントの窓口からご連絡ください。
          </p>
        </div>

        <nav className="grid gap-2 text-sm text-[var(--page-muted)] sm:min-w-[240px]">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[18px] border border-[var(--line)] bg-white/74 px-4 py-3 font-medium transition hover:border-[rgba(37,99,235,0.18)] hover:text-[var(--page-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
