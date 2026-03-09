import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "編集方針",
  description:
    "バイト体験談マップの編集方針。主観投稿、事前審査、個人情報除外、削除・訂正対応、企業コメント受付の運用基準をまとめています。",
};

const policyItems = [
  {
    title: "主観投稿として扱う",
    body: "口コミは『事実の断定』ではなく、投稿者の体験と感想として扱います。運営側でも、断定的な表現は主観として読める形に寄せて確認します。",
  },
  {
    title: "すべて事前審査",
    body: "勤務先、体験談、当事者コメントはすべて公開前に管理者が確認します。公開後も問題が見つかった場合は非公開や修正を行います。",
  },
  {
    title: "個人情報を掲載しない",
    body: "個人名、電話番号、SNSアカウント、顔写真、個人を特定できる細かな属性は掲載しません。必要に応じて差し戻しや編集を行います。",
  },
  {
    title: "削除・訂正に対応する",
    body: "掲載内容に問題がある場合は削除申請を受け付けます。勤務先の当事者・企業からの訂正や反論は、当事者コメントとして受付し、管理者確認後に掲載します。",
  },
  {
    title: "収益導線より安全導線を優先する",
    body: "広告や求人導線は置きますが、投稿フォーム、削除依頼、ガイドラインなど安全性に関わるページでは誤解を招く配置を避けます。",
  },
] as const;

export default function EditorialPolicyPage() {
  return (
    <main className="app-shell mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <section className="section-frame p-6 sm:p-8">
        <span className="eyebrow">Editorial Policy</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-4xl">
          編集方針
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--page-muted)]">
          労働や職場の評判は、書き方ひとつで法的リスクが大きく変わります。バイト体験談マップでは、収益化より先に、主観投稿として読めるか、安全に運営できるかを基準に公開判断を行います。
        </p>

        <div className="mt-8 space-y-4">
          {policyItems.map((item) => (
            <section key={item.title} className="glass-panel rounded-[26px] p-5">
              <h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">{item.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/guidelines" className="primary-button text-sm">
            投稿ガイドラインを見る
          </Link>
          <Link href="/about" className="secondary-button text-sm">
            サイト案内へ
          </Link>
        </div>
      </section>
    </main>
  );
}
