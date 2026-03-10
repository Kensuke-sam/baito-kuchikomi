"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/guides", label: "ガイド" },
  { href: "/jobs", label: "職種" },
  { href: "/areas", label: "地域" },
  { href: "/apps", label: "アプリ比較" },
  { href: "/list", label: "口コミ一覧" },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[rgba(247,251,248,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-lg text-white shadow-[0_14px_30px_rgba(37,99,235,0.24)]">
            📋
          </span>
          <span>
            <span className="eyebrow bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-[0.62rem]">
              バイト体験談
            </span>
            <span className="mt-1 block text-sm font-semibold tracking-[-0.03em] text-[var(--page-ink)] sm:text-base">
              バイト体験談マップ
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 text-sm md:flex" aria-label="メインナビゲーション">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="secondary-button px-3 py-2 text-xs"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/submit"
            className="primary-button px-4 py-2 text-xs"
          >
            体験談を投稿
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white/72 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={menuOpen}
        >
          <span className="sr-only">{menuOpen ? "閉じる" : "メニュー"}</span>
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="border-t border-[var(--line)] bg-[rgba(247,251,248,0.95)] px-4 pb-4 pt-3 backdrop-blur-xl md:hidden"
          aria-label="モバイルナビゲーション"
        >
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[18px] border border-[var(--line)] bg-white/74 px-4 py-3 text-sm font-medium text-[var(--page-ink)] transition hover:border-[rgba(37,99,235,0.18)]"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/submit"
              className="primary-button mt-1 text-sm"
              onClick={() => setMenuOpen(false)}
            >
              体験談を投稿
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
