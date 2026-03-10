"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/guides", label: "ガイド" },
  { href: "/jobs", label: "職種" },
  { href: "/areas", label: "地域" },
  { href: "/apps", label: "アプリ比較" },
  { href: "/list", label: "口コミ一覧" },
] as const;

type AdminAccess = {
  isAdmin: true;
  role: "admin" | "super_admin";
  canManageAdmins: boolean;
};

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminAccess, setAdminAccess] = useState<AdminAccess | null>(null);
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAdminAccess() {
      try {
        const response = await fetch("/api/admin/access", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          setAdminAccess(null);
          return;
        }

        const data = await response.json();
        if (data?.isAdmin) {
          setAdminAccess({
            isAdmin: true,
            role: data.role,
            canManageAdmins: Boolean(data.canManageAdmins),
          });
          return;
        }

        setAdminAccess(null);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setAdminAccess(null);
        }
      }
    }

    loadAdminAccess();
    return () => controller.abort();
  }, []);

  const adminLink = adminAccess ? (
    <Link
      href="/admin/admins"
      className={`inline-flex items-center gap-2 rounded-[16px] border px-4 py-2 text-xs font-semibold transition ${
        isAdminPage
          ? "border-[rgba(45,100,40,0.4)] bg-[linear-gradient(180deg,#6ead63,#2d6428)] text-[#fff7cf] shadow-[0_12px_24px_rgba(45,100,40,0.22)]"
          : "border-[rgba(45,100,40,0.24)] bg-[linear-gradient(180deg,#4f9648,#2d6428)] text-[#fff7cf] shadow-[0_12px_24px_rgba(45,100,40,0.18)] hover:-translate-y-[1px]"
      }`}
    >
      <span className="rounded-full bg-[rgba(255,247,207,0.16)] px-2 py-0.5 text-[10px] tracking-[0.14em] text-[#fff3b3]">
        ADMIN ONLY
      </span>
      <span>管理者権限</span>
    </Link>
  ) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line-strong)] bg-[rgba(248,243,223,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[rgba(30,26,16,0.18)] bg-[linear-gradient(180deg,#4b8b42,#2d6428)] text-[#fff2b0] shadow-[0_12px_24px_rgba(45,100,40,0.18)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[1.375rem] w-[1.375rem] translate-y-[-1px]"
            >
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <path d="M9 8h6" />
              <path d="M9 12h4" />
            </svg>
          </span>
          <span>
            <span className="eyebrow bg-[rgba(33,31,24,0.94)] px-2.5 py-1 text-[0.62rem] text-[#fff2b0]">
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
          {adminLink}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--line-strong)] bg-[rgba(255,252,243,0.92)] md:hidden"
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
          className="border-t border-[var(--line)] bg-[rgba(248,243,223,0.96)] px-4 pb-4 pt-3 backdrop-blur-xl md:hidden"
          aria-label="モバイルナビゲーション"
        >
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[14px] border border-[var(--line)] bg-[rgba(255,252,243,0.92)] px-4 py-3 text-sm font-medium text-[var(--page-ink)] transition hover:border-[rgba(75,139,66,0.28)]"
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
            {adminAccess && (
              <Link
                href="/admin/admins"
                className="mt-1 rounded-[16px] border border-[rgba(45,100,40,0.24)] bg-[linear-gradient(180deg,#4f9648,#2d6428)] px-4 py-3 text-sm font-semibold text-[#fff7cf] shadow-[0_12px_24px_rgba(45,100,40,0.18)]"
                onClick={() => setMenuOpen(false)}
              >
                <span className="mr-2 rounded-full bg-[rgba(255,247,207,0.16)] px-2 py-0.5 text-[10px] tracking-[0.14em] text-[#fff3b3]">
                  ADMIN ONLY
                </span>
                管理者権限
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
