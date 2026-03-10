import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "サイトについて",
  description:
    "バイト体験談マップの目的、公開基準、対応窓口をまとめたサイト案内ページです。",
};

const sections = [
  {
    title: "このサイトの役割",
    body: "バイト体験談マップは、アルバイト先を選ぶときに『求人票だけでは分からない働き方の傾向』を主観レビューとして読めるようにするためのサービスです。ブラックバイトやきつすぎる職場を避けたい人が、次の候補を比較しやすくすることを目的にしています。",
  },
  {
    title: "公開基準",
    body: "掲載するのは、運営が確認した主観ベースの体験談です。事実の断定や個人特定につながる表現は避け、日本国内の勤務先であること、対応窓口を案内できることを前提に公開します。",
  },
  {
    title: "対応窓口",
    body: "掲載内容に問題がある場合は通報フォームと削除申請フォームを案内し、勤務先の当事者・企業からの訂正や反論は当事者コメントの導線から受け付けます。個別の法務相談や労務相談を受けるページではありません。",
  },
  {
    title: "収益化と編集の考え方",
    body: "検索流入からガイド、口コミ、求人比較へつなぐ構成ですが、収益導線より先に安全運用の導線を置いています。PR を含むページでは表記を行い、削除・訂正の窓口を残します。",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="app-shell mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <section className="section-frame p-6 sm:p-8">
        <span className="eyebrow">このサイトについて</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-4xl">
          サイトについて
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--page-muted)]">
          ここでは、運営主体のプロフィールではなく、このサイトが何を目的にし、どの基準で掲載し、問題がある場合にどこから連絡できるかをまとめています。労働・生活に関わる情報を扱うため、安全運用の前提を先に明示しています。
        </p>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="glass-panel rounded-[26px] p-5">
              <h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Link href="/report" className="glass-panel rounded-[24px] p-4 text-sm font-semibold text-[var(--page-ink)]">
            通報フォーム
          </Link>
          <Link href="/takedown" className="glass-panel rounded-[24px] p-4 text-sm font-semibold text-[var(--page-ink)]">
            削除申請フォーム
          </Link>
          <Link href="/official-response" className="glass-panel rounded-[24px] p-4 text-sm font-semibold text-[var(--page-ink)]">
            当事者コメント
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/editorial-policy" className="primary-button text-sm">
            編集方針を見る
          </Link>
          <Link href="/guidelines" className="secondary-button text-sm">
            投稿ガイドラインへ
          </Link>
        </div>
      </section>
    </main>
  );
}
